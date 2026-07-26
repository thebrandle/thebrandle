/**
 * Opinly SDK API client + content renderer.
 *
 * The API returns post bodies as a ProseMirror/TipTap node tree, not HTML,
 * so renderContent() walks that tree and emits semantic markup.
 *
 * Env: OPINLY_API_KEY (required for any fetch)
 */
const API_BASE = 'https://sdk.opinly.ai/v1';
// Namespace is workspace-specific and changes if the Opinly project is re-created.
// Override with OPINLY_CDN_BASE rather than editing this line.
const CDN_BASE = process.env.OPINLY_CDN_BASE || 'https://cdn.opinly.ai/GGupSvPhtQvtAHSbg6jFL/';

/* ------------------------------------------------------------------ utils */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// site copy convention: plain hyphens, never em dashes
const copy = (s) => String(s == null ? '' : s).replace(/\s*—\s*/g, ' - ');
const escCopy = (s) => esc(copy(s));

/** Build a CDN URL from an API fileKey. Absolute URLs pass through. */
function imageUrl(fileKey) {
  if (!fileKey) return null;
  if (/^https?:\/\//i.test(fileKey)) return fileKey;
  return CDN_BASE + String(fileKey).replace(/^\/+/, '');
}

/* ------------------------------------------------------------------ fetch */
function apiKey() {
  const k = process.env.OPINLY_API_KEY;
  if (!k) throw new Error('OPINLY_API_KEY is not set');
  return k;
}

async function api(path, params = {}) {
  const url = new URL(API_BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey()}`, Accept: 'application/json' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Opinly ${res.status} ${res.statusText} for ${url.pathname}`);
  return res.json();
}

/** Walk every page of /content/posts via next_cursor. */
async function fetchAllPosts({ limit = 50, category, author, tag, sort = 'newest', max = 1000 } = {}) {
  const out = [];
  let cursor = '';
  for (let guard = 0; guard < 100; guard++) {
    const page = await api('/content/posts', { limit, cursor, category, author, tag, sort });
    if (!page || !Array.isArray(page.data)) break;
    out.push(...page.data);
    if (!page.has_more || !page.next_cursor || out.length >= max) break;
    cursor = page.next_cursor;
  }
  return out;
}

const fetchPost = (slug) => api('/content/post', { slug });
const fetchRoutes = () => api('/content/routes');
const fetchCategories = () => api('/content/categories');
const fetchAuthors = () => api('/content/authors');
const fetchAuthor = (slug) => api(`/content/authors/${encodeURIComponent(slug)}`);
const fetchRss = (limit = 20) => api('/content/rss', { limit });

/* --------------------------------------------------- ProseMirror renderer */
const MARK_TAGS = {
  bold: ['<strong>', '</strong>'], strong: ['<strong>', '</strong>'],
  italic: ['<em>', '</em>'], em: ['<em>', '</em>'],
  underline: ['<u>', '</u>'],
  strike: ['<s>', '</s>'], strikethrough: ['<s>', '</s>'],
  code: ['<code>', '</code>'],
  superscript: ['<sup>', '</sup>'], subscript: ['<sub>', '</sub>'],
};

function applyMarks(text, marks) {
  let html = escCopy(text);
  for (const mark of marks || []) {
    const type = mark && mark.type;
    if (type === 'link') {
      const a = (mark.attrs || {});
      const href = a.href || '#';
      const external = /^https?:\/\//i.test(href) && !href.includes('thebrandle.com');
      const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      html = `<a href="${esc(href)}"${a.title ? ` title="${esc(a.title)}"` : ''}${rel}>${html}</a>`;
    } else if (MARK_TAGS[type]) {
      html = MARK_TAGS[type][0] + html + MARK_TAGS[type][1];
    }
  }
  return html;
}

/**
 * Render an Opinly content node (or array of nodes) to HTML.
 * Unknown node types fall through to their children so nothing is lost.
 */
function renderContent(node) {
  if (!node) return '';
  if (Array.isArray(node)) return node.map(renderContent).join('');

  const kids = () => renderContent(node.content || []);
  const attrs = node.attrs || {};

  switch (node.type) {
    case 'doc': return kids();
    case 'text': return applyMarks(node.text, node.marks);
    case 'paragraph': {
      const inner = kids();
      return inner.trim() ? `<p>${inner}</p>` : '';
    }
    case 'heading': {
      // demote to h2+ so the page keeps a single h1
      const lvl = Math.min(Math.max(parseInt(attrs.level, 10) || 2, 1) + 1, 6);
      return `<h${lvl}>${kids()}</h${lvl}>`;
    }
    case 'bulletList': case 'bullet_list': return `<ul>${kids()}</ul>`;
    case 'orderedList': case 'ordered_list':
      return `<ol${attrs.start && attrs.start !== 1 ? ` start="${parseInt(attrs.start, 10)}"` : ''}>${kids()}</ol>`;
    case 'listItem': case 'list_item': return `<li>${kids()}</li>`;
    case 'blockquote': return `<blockquote>${kids()}</blockquote>`;
    case 'codeBlock': case 'code_block':
      return `<pre><code>${escCopy(flattenText(node))}</code></pre>`;
    case 'horizontalRule': case 'horizontal_rule': return '<hr>';
    case 'hardBreak': case 'hard_break': return '<br>';
    case 'image': {
      const src = imageUrl(attrs.fileKey || attrs.src);
      if (!src) return '';
      const cap = attrs.caption ? `<figcaption>${escCopy(attrs.caption)}</figcaption>` : '';
      return `<figure><img src="${esc(src)}" alt="${escCopy(attrs.altText || attrs.alt || '')}"${attrs.title ? ` title="${escCopy(attrs.title)}"` : ''} loading="lazy" decoding="async">${cap}</figure>`;
    }
    case 'table': return `<div class="post-table-wrap"><table>${kids()}</table></div>`;
    case 'tableRow': case 'table_row': return `<tr>${kids()}</tr>`;
    case 'tableHeader': case 'table_header': return `<th>${kids()}</th>`;
    case 'tableCell': case 'table_cell': return `<td>${kids()}</td>`;
    default: return kids();
  }
}

/** Concatenate all text in a node tree (for code blocks, excerpts, word counts). */
function flattenText(node) {
  if (!node) return '';
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (node.type === 'text') return node.text || '';
  return flattenText(node.content || []);
}

const readingMinutes = (node) =>
  Math.max(1, Math.round(flattenText(node).trim().split(/\s+/).filter(Boolean).length / 225));

module.exports = {
  API_BASE, CDN_BASE,
  esc, copy, escCopy, imageUrl,
  api, fetchAllPosts, fetchPost, fetchRoutes, fetchCategories, fetchAuthors, fetchAuthor, fetchRss,
  renderContent, flattenText, readingMinutes,
};
