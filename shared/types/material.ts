/** 教材分类标签节点 */
export interface CatalogTag {
  tag_id: string;
  tag_name: string;
  tag_dimension_id: string;
  tag_description?: string;
  hierarchy_name?: string;
  hierarchies?: CatalogTag[];
  children?: CatalogTag[];
  ext?: {
    tag_dimension_id?: string;
    [key: string]: unknown;
  };
}

/** 分类标签响应（实际是嵌套树结构） */
export interface CatalogTagResponse {
  tag_path: string;
  hierarchies: CatalogTag[];
  ext?: Record<string, unknown>;
  tenant_id?: string;
}

/** 教材标签项 */
export interface TagItem {
  tag_id: string;
  tag_name: string;
  tag_dimension_id: string;
}

/** 教材内容项（ti_items 中的每一项） */
export interface TiItem {
  ti_md5: string;
  ti_size: string;
  ti_storage: string;
  /** 完整的 CDN 下载 URL 列表 */
  ti_storages: string[];
  ti_file_flag: string;
  ti_format: string;
  ti_is_source_file: boolean;
  lc_ti_format?: string;
  language?: string;
  custom_properties?: Record<string, unknown>;
}

/** 教材详情 */
export interface MaterialDetail {
  id: string;
  title: string;
  description?: string;
  tag_list: TagItem[];
  /** 教材内容项列表（PDF、图片、缩略图等） */
  ti_items: TiItem[];
  custom_properties?: Record<string, string>;
  resource_structure?: {
    chapter_tree?: unknown;
  };
}

/** 教材列表项（浏览用） */
export interface MaterialItem {
  id: string;
  title: string;
  thumbnail?: string;
  tags: TagItem[];
}

/** 章节书签节点 */
export interface BookmarkNode {
  title: string;
  page_num: number;
  level: number;
  children?: BookmarkNode[];
}

/** 扁平化的分类选项（级联选择器用） */
export interface CatalogOption {
  id: string;
  name: string;
}

/** 学段级联配置 */
export interface StageLayout {
  labels: string[];
}
