// 构建前清理 dist（multi-compiler 下 output.clean 有并行竞态，改为外部顺序清理）
import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(import.meta.dirname, 'dist');
try {
  fs.rmSync(dist, { recursive: true, force: true });
  console.log('[clean_dist] dist 已清理');
} catch (e) {
  console.warn('[clean_dist] 清理失败（忽略）:', e.message);
}
