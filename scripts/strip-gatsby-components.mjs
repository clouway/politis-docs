#!/usr/bin/env node
/**
 * Strip Gatsby-specific components that the migrated markdown still contains
 * and that Docusaurus doesn't understand:
 *
 *   <split-panel><panel>...</panel><panel>...</panel></split-panel>
 *     → unwrap to flat content (images now render instead of being
 *       swallowed by the unknown custom element).
 *   <link to="..." name="...">label</link>
 *     → [label](to)  (markdown link)
 *   <bullet>text</bullet>
 *     → - text  (markdown list item)
 *
 * Safe HTML tags (a, b, i, br) are preserved.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, '../docs');
const I18N_DIR = path.resolve(__dirname, '../i18n');

function transform(src) {
  let out = src;

  // <split-panel>…</split-panel>  →  remove opening + closing tags only.
  out = out.replace(/<\/?split-panel\b[^>]*>/g, '');
  out = out.replace(/<\/?panel\b[^>]*>/g, '');

  // Dedent image/link markdown that was indented inside <panel>: CommonMark
  // treats 4+ leading spaces as a code block, which would hide the image.
  out = out.replace(/^[ \t]+(!\[|\[)/gm, '$1');

  // <link to="URL" name="...">label</link>  →  [label](URL) or [name](URL).
  out = out.replace(
    /<link\b([^>]*)>([\s\S]*?)<\/link>/g,
    (_, attrs, inner) => {
      const toMatch = attrs.match(/\bto\s*=\s*"([^"]*)"/);
      const nameMatch = attrs.match(/\bname\s*=\s*"([^"]*)"/);
      const url = toMatch ? toMatch[1] : '';
      const label = inner.trim() || (nameMatch ? nameMatch[1] : url);
      return `[${label}](${url})`;
    },
  );

  // <bullet>text</bullet>  →  markdown list item.
  out = out.replace(
    /<bullet\b[^>]*>([\s\S]*?)<\/bullet>/g,
    (_, inner) => `- ${inner.trim()}`,
  );

  return out;
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
    const after = transform(before);
    if (before !== after) {
      await fs.writeFile(f, after, 'utf8');
      changed++;
      console.log(`  rewrote ${path.relative(process.cwd(), f)}`);
    }
  }
  console.log(`\n${changed} files updated.`);
}

main();
