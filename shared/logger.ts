import fsAsync from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';

let logPath = '';

/** 初始化日志（由主进程调用，传入日志目录） */
export async function initLogger(logDir: string): Promise<void> {
  await fsAsync.mkdir(logDir, { recursive: true });
  const timestamp = new Date().toISOString().slice(0, 10);
  logPath = path.join(logDir, `smartedu-${timestamp}.log`);
}

function formatMessage(level: string, message: string): string {
  const time = new Date().toISOString();
  return `[${time}] [${level}] ${message}\n`;
}

function write(level: string, message: string): void {
  const formatted = formatMessage(level, message);
  console.log(formatted.trim());
  if (logPath) {
    try {
      fs.appendFileSync(logPath, formatted);
    } catch {
      // 日志写入失败不应影响主流程
    }
  }
}

export const logger = {
  info: (msg: string) => write('INFO', msg),
  warn: (msg: string) => write('WARN', msg),
  error: (msg: string) => write('ERROR', msg),
  debug: (msg: string) => write('DEBUG', msg),
};
