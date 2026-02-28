import fs from 'node:fs/promises';
import {
  PDFDocument,
  PDFDict,
  PDFName,
  PDFString,
  PDFArray,
  PDFRef,
  PDFNumber,
} from 'pdf-lib';
import { fetchBookmarkTree } from './api-client.js';
import { getToken } from './token-manager.js';
import { logger } from '../shared/logger.js';
import type { BookmarkNode } from '../shared/types/material.js';

/**
 * 为 PDF 文件注入章节书签
 */
export async function injectBookmarks(
  pdfPath: string,
  ebookId: string,
): Promise<void> {
  const token = await getToken();
  const bookmarks = await fetchBookmarkTree(ebookId, token);

  if (bookmarks.length === 0) {
    logger.warn(`未找到书签数据: ${ebookId}`);
    return;
  }

  const pdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  buildOutlineTree(pdfDoc, bookmarks);

  const modifiedBytes = await pdfDoc.save();
  await fs.writeFile(pdfPath, modifiedBytes);

  logger.info(`书签注入完成: ${pdfPath} (${countNodes(bookmarks)} 个书签)`);
}

/** 构建 PDF Outline 树（支持多级嵌套） */
function buildOutlineTree(doc: PDFDocument, nodes: BookmarkNode[]): void {
  const context = doc.context;
  const pages = doc.getPages();

  // 创建 Outline 根字典
  const outlineDict = context.obj({});
  const outlineRef = context.register(outlineDict);
  outlineDict.set(PDFName.of('Type'), PDFName.of('Outlines'));

  // 递归构建子节点并挂载到根
  const totalCount = buildChildren(context, pages, outlineRef, nodes);
  outlineDict.set(PDFName.of('Count'), PDFNumber.of(totalCount));

  // 将 Outline 挂载到 Catalog
  doc.catalog.set(PDFName.of('Outlines'), outlineRef);
}

interface OutlineItem {
  dict: PDFDict;
  ref: PDFRef;
}

/**
 * 递归构建某一层的子节点，设置 Parent/First/Last/Prev/Next/Count
 * 返回该层（含所有后代）的总节点数
 */
function buildChildren(
  context: PDFDocument['context'],
  pages: ReturnType<PDFDocument['getPages']>,
  parentRef: PDFRef,
  nodes: BookmarkNode[],
): number {
  if (nodes.length === 0) return 0;

  const items: OutlineItem[] = nodes.map((node) => {
    const pageIndex = Math.max(0, Math.min(node.page_num, pages.length - 1));
    const pageRef = pages[pageIndex].ref;

    const dict = context.obj({});
    const ref = context.register(dict);

    dict.set(PDFName.of('Title'), PDFString.of(node.title));
    dict.set(PDFName.of('Parent'), parentRef);

    // 目标页面（Fit 模式）
    const dest = PDFArray.withContext(context);
    dest.push(pageRef);
    dest.push(PDFName.of('Fit'));
    dict.set(PDFName.of('Dest'), dest);

    return { dict, ref };
  });

  // 设置 Prev/Next 兄弟链
  for (let i = 0; i < items.length; i++) {
    if (i > 0) items[i].dict.set(PDFName.of('Prev'), items[i - 1].ref);
    if (i < items.length - 1) items[i].dict.set(PDFName.of('Next'), items[i + 1].ref);
  }

  // 设置 parent 的 First/Last
  const parentDict = context.lookup(parentRef) as PDFDict;
  parentDict.set(PDFName.of('First'), items[0].ref);
  parentDict.set(PDFName.of('Last'), items[items.length - 1].ref);

  // 递归处理子节点
  let totalCount = items.length;
  for (let i = 0; i < nodes.length; i++) {
    const children = nodes[i].children;
    if (children && children.length > 0) {
      const childCount = buildChildren(context, pages, items[i].ref, children);
      items[i].dict.set(PDFName.of('Count'), PDFNumber.of(childCount));
      totalCount += childCount;
    }
  }

  return totalCount;
}

function countNodes(nodes: BookmarkNode[]): number {
  return nodes.reduce(
    (sum, n) => sum + 1 + (n.children ? countNodes(n.children) : 0),
    0,
  );
}
