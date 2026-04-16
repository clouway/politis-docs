#!/usr/bin/env node
/**
 * Convert raw `<img src="./foo.png" alt="bar" />` tags to markdown image
 * syntax `![bar](./foo.png)` so that Docusaurus' MDX image transformer
 * picks them up (it only rewrites markdown-syntax images to hashed
 * asset URLs — raw HTML tags are left as-is, which causes 404s).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, '../docs');
const I18N_DIR = path.resolve(__dirname, '../i18n');

function extractAttrs(tag) {
  const attrs = {};
  const regex = /(\w+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = regex.exec(tag)) !== null) attrs[m[1]] = m[2];
  return attrs;
}

function convertImgTags(content) {
  // Match `<img ... />` and `<img ...></img>` single-line or multi-line.
  const imgRegex = /<img\b([^>]*?)\/?>(?:\s*<\/img>)?/gs;
  return content.replace(imgRegex, (full, inner) => {
    const attrs = extractAttrs(`<img ${inner}>`);
    if (!attrs.src) return full;
    const alt = attrs.alt ?? '';
    const title = attrs.title ? ` "${attrs.title}"` : '';
    return `![${alt}](${attrs.src}${title})`;
  });
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(md|mdx)$/.test(e.name)) out.push(p);
  }
  return out;
}

async function main() {
  const files = [...(await walk(DOCS_DIR)), ...(await walk(I18N_DIR))];
  let changed = 0;
  for (const f of files) {
    const before = await fs.readFile(f, 'utf8');
    const after = convertImgTags(before);
    if (before !== after) {
      await fs.writeFile(f, after, 'utf8');
      changed++;
      console.log(`  rewrote ${path.relative(process.cwd(), f)}`);
    }
  }
  console.log(`\n${changed} files updated.`);
}

main();
