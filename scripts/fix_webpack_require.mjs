// 修复 webpack 5.109 ESM 输出缺陷：产物中出现裸 `__webpack_require__.cjs` 赋值但无
// `var __webpack_require__` 声明时（ReferenceError: __webpack_require__ is not defined），
// 在 `<script type="module">` 后插入声明。仅对含未声明 __webpack_require__ 的产物生效。
import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(import.meta.dirname, '..', 'dist');
let fixed = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) fixHtml(full);
  }
}

function fixHtml(file) {
  let html = fs.readFileSync(file, 'utf-8');
  if (!html.includes('__webpack_require__')) return;
  if (html.includes('var __webpack_require__') || html.includes('const __webpack_require__')) return;

  const marker = '<script type="module">';
  if (!html.includes(marker)) {
    console.warn(`[fix_webpack_require] 跳过（无 module script）: ${file}`);
    return;
  }
  html = html.replace(marker, marker + 'var __webpack_require__ = {};');
  fs.writeFileSync(file, html, 'utf-8');
  fixed++;
  console.log(`[fix_webpack_require] 已修复: ${path.relative(process.cwd(), file)}`);
}

walk(dist);
console.log(`[fix_webpack_require] 完成，修复 ${fixed} 个产物`);
