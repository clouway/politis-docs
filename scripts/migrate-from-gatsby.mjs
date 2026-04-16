#!/usr/bin/env node
/**
 * Migrate Politis docs from the old Gatsby site (docs.clouway.com)
 * to this Docusaurus project.
 *
 * Source: ~/workspaces/js/docs.clouway.com/src/pages/politis
 * Target: ./docs (bg default) and ./i18n/en/docusaurus-plugin-content-docs/current (en)
 *
 * What it does per source file:
 *   1. Copies *.{bg,en}.md into the right target folder, dropping the ".bg"/".en" suffix.
 *   2. Copies sibling images (.png/.jpg/.gif) alongside.
 *   3. Rewrites Gatsby frontmatter (date/root/parents/priority) to Docusaurus
 *      (id, title, sidebar_position).
 *   4. Replaces `<h1 align="center">...</h1>` with `# ...` (MDX-safe).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(os.homedir(), 'workspaces/js/docs.clouway.com/src/pages/politis');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
const I18N_EN_DIR = path.join(PROJECT_ROOT, 'i18n/en/docusaurus-plugin-content-docs/current');

// Maps the Gatsby top-level folder to Docusaurus target subdir.
const SECTION_MAP = {
  'get-started': 'get-started',
  'guide': 'backoffice',
  'mobile': 'mobile',
};

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function slugify(name) {
  return name.replace(/_/g, '-').toLowerCase();
}

function rewriteTargetPath(srcFile, lang) {
  const rel = path.relative(SRC_ROOT, srcFile); // e.g. guide/stock-control/.../name.bg.md
  const parts = rel.split(path.sep);
  const section = parts.shift();
  const mapped = SECTION_MAP[section];
  if (!mapped) return null;

  // Drop the trailing "name/name.bg.md" redundancy: Gatsby has name/name.bg.md but
  // we want just name.md in Docusaurus.
  const fileName = parts[parts.length - 1];
  const dirName = parts[parts.length - 2];
  const baseName = fileName.replace(/\.(bg|en)\.md$/, '');
  if (dirName && baseName === dirName) {
    // Collapse: drop the redundant directory level.
    parts.splice(parts.length - 2, 1);
  }

  const outName = slugify(baseName) + '.md';
  parts[parts.length - 1] = outName;

  let outRel = path.join(mapped, ...parts.map(slugify));
  outRel = outRel.replace(/\/purchase\//, '/'); // flatten `purchase/`
  const root = lang === 'en' ? I18N_EN_DIR : DOCS_DIR;
  return path.join(root, outRel);
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: content };
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const lm = line.match(/^(\w+):\s*(.*)$/);
    if (!lm) continue;
    let v = lm[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    fm[lm[1]] = v;
  }
  return { fm, body: m[2] };
}

function writeFrontmatter(fm) {
  const lines = ['---'];
  if (fm.id) lines.push(`id: ${fm.id}`);
  if (fm.title) lines.push(`title: ${JSON.stringify(fm.title)}`);
  if (fm.sidebar_position != null) lines.push(`sidebar_position: ${fm.sidebar_position}`);
  lines.push('---', '');
  return lines.join('\n');
}

function transformBody(body) {
  // Replace <h1 align="center">TITLE</h1> blocks with # TITLE.
  body = body.replace(/<h1[^>]*>\s*([\s\S]*?)\s*<\/h1>/gi, (_, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    return `# ${text}\n`;
  });
  // Tidy trailing whitespace.
  return body.replace(/[ \t]+$/gm, '');
}

async function ensureDir(p) {
  await fs.mkdir(path.dirname(p), { recursive: true });
}

async function copyImages(srcDir, destDir) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  let copied = 0;
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!/\.(png|jpe?g|gif|webp|svg)$/i.test(e.name)) continue;
    const src = path.join(srcDir, e.name);
    const dst = path.join(destDir, e.name);
    await ensureDir(dst);
    await fs.copyFile(src, dst);
    copied++;
  }
  return copied;
}

async function migrateOne(srcFile) {
  const m = srcFile.match(/\.(bg|en)\.md$/);
  if (!m) return null;
  const lang = m[1];
  const dest = rewriteTargetPath(srcFile, lang);
  if (!dest) return null;

  const raw = await fs.readFile(srcFile, 'utf8');
  const { fm, body } = parseFrontmatter(raw);

  const newFm = {
    id: path.basename(dest, '.md'),
    title: fm.title || path.basename(dest, '.md'),
  };
  if (fm.priority) newFm.sidebar_position = Number(fm.priority);

  const out = writeFrontmatter(newFm) + transformBody(body);
  await ensureDir(dest);
  await fs.writeFile(dest, out, 'utf8');

  // Copy co-located images.
  const images = await copyImages(path.dirname(srcFile), path.dirname(dest));
  return { src: srcFile, dest, lang, images };
}

async function main() {
  const all = await walk(SRC_ROOT);
  const mdFiles = all.filter(f => /\.(bg|en)\.md$/.test(f));
  console.log(`Found ${mdFiles.length} markdown files to migrate.`);

  const results = [];
  for (const f of mdFiles) {
    try {
      const r = await migrateOne(f);
      if (r) {
        results.push(r);
        console.log(`  [${r.lang}] ${path.relative(PROJECT_ROOT, r.dest)}  (+${r.images} imgs)`);
      }
    } catch (err) {
      console.error(`  ERROR on ${f}: ${err.message}`);
    }
  }
  console.log(`\nMigrated ${results.length} files.`);
}

main();
