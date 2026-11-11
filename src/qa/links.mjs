// Link and head check for the built Brandle site. Crawls every page reachable from / on the local preview and reports:
// broken internal links and files, links that use the slash form a page's canonical does not, missing canonicals,
// duplicate titles and descriptions, pages with no h1 or several, images without alt, titles outside 30 to 60 characters,
// and whether an unknown address answers with a real 404. It reads the HTML as served (no browser), so it is quick.
// usage: node src/qa/links.mjs [origin] [--json]      default origin http://localhost:4660. Exit code 1 when anything is wrong.
const args = process.argv.slice(2);
const json = args.includes('--json');
const origin = (args.find((a) => !a.startsWith('--')) || 'http://localhost:4660').replace(/\/$/, '');
const SITE = 'https://www.thebrandle.com';

const key = (p) => p.replace(/\/index\.html$/, '/').replace(/(.)\/$/, '$1');      // /about and /about/ are one page
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i')) || []).slice(2).find((v) => v !== undefined);
const local = (href, from) => {      // an address on this site as a path, or null for anything else
  if (!href || /^(mailto:|tel:|javascript:|data:|#)/i.test(href)) return null;
  const u = new URL(decode(href), origin + from);
  return u.origin === origin || u.origin === SITE ? u.pathname : null;
};

const pages = new Map();      // key -> facts about a crawled page
const status = new Map();     // path as linked -> HTTP status
const linkedFrom = new Map(); // path as linked -> Set of pages that link it
const queue = ['/'];
const seen = new Set(['/']);
const note = (path, from) => { if (!linkedFrom.has(path)) linkedFrom.set(path, new Set()); linkedFrom.get(path).add(from); };

async function crawl(path) {
  const res = await fetch(origin + path).catch(() => null);
  status.set(path, res ? res.status : 0);
  if (!res || res.status >= 400 || !(res.headers.get('content-type') || '').includes('text/html')) return;
  const here = new URL(res.url).pathname;      // after the preview server's own redirect to the folder form
  const raw = await res.text();
  const html = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  const head = html.slice(0, html.indexOf('</head>'));
  const metaTag = (n) => (head.match(new RegExp(`<meta[^>]*name="${n}"[^>]*>`, 'i')) || [''])[0];
  const title = decode((head.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1].trim());
  const canonicalTag = (head.match(/<link[^>]*rel="canonical"[^>]*>/i) || [''])[0];
  const page = {
    path, title, description: decode(attr(metaTag('description'), 'content') || ''),
    canonical: attr(canonicalTag, 'href') || null, noindex: /noindex/i.test(attr(metaTag('robots'), 'content') || ''),
    h1: (html.match(/<h1[\s>]/gi) || []).length,
    noAlt: (html.match(/<img\b[^>]*>/gi) || []).filter((t) => attr(t, 'alt') === undefined).map((t) => attr(t, 'src') || attr(t, 'data-src') || t.slice(0, 80)),
  };
  pages.set(key(path), page);
  for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
    const p = local(attr(tag, 'href'), here);
    if (!p) continue;
    note(p, path);
    if (!/\.[a-z0-9]{2,5}$/i.test(p) || p.endsWith('.html')) { if (!seen.has(key(p))) { seen.add(key(p)); queue.push(p); } } else files.add(p);
  }
  for (const tag of html.match(/<(img|source|video|script|link)\b[^>]*>/gi) || []) {
    if (/^<link/i.test(tag) && !/rel="(stylesheet|icon|apple-touch-icon|alternate|preload)"/i.test(tag)) continue;
    for (const name of ['src', 'data-src', 'poster', 'data-poster', 'href']) {
      const p = local(attr(tag, name), here);
      if (p) { note(p, path); files.add(p); }
    }
  }
}
const files = new Set();

while (queue.length) await Promise.all(queue.splice(0, 8).map(crawl));
// files (images, video, css, js, feeds): a HEAD request each
const todo = [...files].filter((f) => !status.has(f));
while (todo.length) await Promise.all(todo.splice(0, 16).map(async (f) => { const r = await fetch(origin + f, { method: 'HEAD' }).catch(() => null); status.set(f, r ? r.status : 0); }));

const all = [...pages.values()];
const indexable = all.filter((p) => !p.noindex);
const dupes = (field) => Object.entries(Object.groupBy(indexable.filter((p) => p[field]), (p) => p[field])).filter(([, g]) => g.length > 1).map(([value, g]) => ({ [field]: value, pages: g.map((p) => p.path) }));
const from = (p) => [...linkedFrom.get(p)].slice(0, 5);
const unknown = await fetch(origin + '/this-page-does-not-exist-' + Date.now()).then(async (r) => ({ status: r.status, noindex: /name="robots" content="[^"]*noindex/.test(await r.text()) }));

const report = {
  origin, pagesCrawled: all.length, filesChecked: files.size,
  brokenLinks: [...status].filter(([, s]) => s === 0 || s >= 400).map(([path, s]) => ({ path, status: s, linkedFrom: from(path) })),
  // the page's own canonical says which slash form is right; a link in the other form costs a redirect on the live host
  wrongSlashForm: [...linkedFrom.keys()].filter((p) => { const c = pages.get(key(p))?.canonical; return c && c.startsWith(SITE) && c.slice(SITE.length) !== p; })
    .map((p) => ({ link: p, canonical: pages.get(key(p)).canonical.slice(SITE.length), linkedFrom: from(p) })),
  missingCanonical: indexable.filter((p) => !p.canonical).map((p) => p.path),
  canonicalElsewhere: indexable.filter((p) => p.canonical && key(p.canonical.replace(SITE, '')) !== key(p.path)).map((p) => ({ page: p.path, canonical: p.canonical })),
  duplicateTitles: dupes('title'), duplicateDescriptions: dupes('description'),
  h1NotOne: all.filter((p) => p.h1 !== 1).map((p) => ({ page: p.path, h1: p.h1 })),
  imagesWithoutAlt: all.filter((p) => p.noAlt.length).map((p) => ({ page: p.path, count: p.noAlt.length, first: p.noAlt.slice(0, 3) })),
  titleLength: all.filter((p) => p.title.length < 30 || p.title.length > 60).map((p) => ({ page: p.path, length: p.title.length, title: p.title })),
  missingDescription: indexable.filter((p) => !p.description).map((p) => p.path),
  unknownAddress: unknown.status === 404 && unknown.noindex ? [] : [unknown],
};
const lists = Object.entries(report).filter(([, v]) => Array.isArray(v));
report.ok = lists.every(([, v]) => !v.length);

if (json) console.log(JSON.stringify(report, null, 1));
else {
  console.log(`${origin}: ${report.pagesCrawled} pages crawled from /, ${report.filesChecked} files checked`);
  for (const [name, list] of lists) {
    console.log(`${list.length ? 'FAIL' : 'ok  '} ${name}: ${list.length}`);
    for (const item of list.slice(0, 40)) console.log('       ' + (typeof item === 'string' ? item : JSON.stringify(item)));
    if (list.length > 40) console.log(`       ... and ${list.length - 40} more (run with --json for all)`);
  }
}
process.exit(report.ok ? 0 : 1);
