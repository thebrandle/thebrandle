#!/usr/bin/env python3
"""Builds the site: src/layout.html + src/partials/*.html + every page in src/pages/ -> HTML files at the site root.
Run it after any change under src/, styles.css, main.js, css/ or js/:   python3 build.py
To rebuild only some pages while others are being worked on:              python3 build.py about blog
(names match a file in src/pages/ or src/ext/ by its name without the extension; sitemap.xml is left alone).

A page is src/pages/<anything>.html: a few "key: value" lines between two --- lines, then the page body.
  path         required. The address, for example / or /about/ (written to about/index.html)
  title        required. The <title>
  description  required. The meta description
  css, js      optional. Space-separated files (from the site root) loaded only on this page
  body_class   optional. Extra class on <body>
  head_extra   optional. Extra tags for <head>
  og_image     optional. Share image, a path from the site root (default /assets/og.jpg); og_type (default website); og_title
  canonical    optional. Full address for the canonical tag and the sitemap, when it differs from the path
               (the live site's /about, /contact, /projects, /blog and /faq have no closing slash)
  robots       optional. The robots meta (default: index, follow and large previews). A page with "noindex" in it gets
               no canonical and no share tags and stays out of the sitemap (the 404 page)
  lastmod      optional. YYYY-MM-DD for the sitemap. Default: the day the page's file in src/pages/ last changed,
               or today for pages made by an ext file (blog posts pass their own date here)
  sitemap      optional. "no" keeps an indexable page out of the sitemap (privacy, terms)
  schema, crumb  optional. schema is the page's schema.org type (WebPage, AboutPage, ContactPage, CollectionPage) and
               crumb its breadcrumb name: together they add the standard page + breadcrumb JSON-LD. Pages that need
               more write their own through head_extra with api.jsonld().
  og_image_alt, og_image_width, og_image_height   optional. Sizes default to 1200 x 630 for the default share image
               and are left out for any other image unless given.
The home page (path /) always gets the studio + website + page + FAQ JSON-LD: the FAQ is read from its .fitem blocks.
In a page body or a partial:  {{> name}} pulls in src/partials/name.html (or a partial made by an ext file),
{{v:file.css}} writes the file's address with a version tag, {{key}} writes a value from the page's own lines.

Pages and partials made from data (project cards, case studies, blog posts) come from src/ext/*.py. A file there may define
  partials(api) -> {name: html}    made before any page is built, used with {{> name}}
  build(api)                       calls api.page(meta, body_html) once per page; the body is written as given
  finish(api)                      runs after every page is written (src/ext/site.py makes rss.xml, llms.txt, vercel.json)
Helpers on api for ext files:  api.jsonld(obj) -> the <script type="application/ld+json"> tag (a list becomes one @graph),
api.org() -> the studio's schema.org node with every confirmed fact (use on about and contact), api.org(compact=True) ->
the short node (type, id, name, url, logo) for every other page that mentions the studio, api.crumbs(canonical, names)
-> a BreadcrumbList node, api.built -> the pages written so far as (path, file, canonical, meta).
sitemap.xml lists every indexable page that was built (full builds only).
"""
import hashlib, html, importlib.util, json, re, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'src'
SITE = 'https://www.thebrandle.com'
built = []          # (path, file, canonical address, meta) of every page written
made = {}           # partials made by ext files


def ver(f):
    """file?v=<hash of its content>: a changed file is always refetched, an unchanged one stays cached."""
    f = f.lstrip('/')
    return f'{f}?v={hashlib.sha1((ROOT / f).read_bytes()).hexdigest()[:8]}'


def partial(name):
    return made[name] if name in made else (SRC / 'partials' / f'{name}.html').read_text()


def render(tpl, ctx):
    tpl = re.sub(r'\{\{> (\w+)\}\}', lambda m: render(partial(m.group(1)), ctx), tpl)
    tpl = re.sub(r'\{\{v:([^}]+)\}\}', lambda m: ver(m.group(1)), tpl)
    return re.sub(r'\{\{(\w+)\}\}', lambda m: str(ctx.get(m.group(1), '')), tpl)


ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
ORG_ID, WEB_ID = SITE + '/#organization', SITE + '/#website'
FOUNDERS = [('Muteeb Mehraj', 'Founder / Chief of Design', 'muteebmrj'),
            ('Raheem Dzhairkhanov', 'Co-Founder / Chief of Media', 'rakhimdzhairkhanov'),
            ('Ubaid Wani', 'Co-Founder / Chief of UI/UX & Product Design', 'ubaid-wani')]


def jsonld(obj):
    """The JSON-LD script tag for a node, or for a list of nodes as one @graph."""
    obj = {'@context': 'https://schema.org', '@graph': obj} if isinstance(obj, list) else {'@context': 'https://schema.org', **obj}
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + '</script>'


def org(compact=False):
    """The studio as a schema.org node. Published, confirmed facts only: no rating, review, award, founding date,
    head count, street address or opening hours, and no phone until the owner confirms it is shown on /contact."""
    node = {'@type': 'ProfessionalService', '@id': ORG_ID, 'name': 'The Brandle', 'url': SITE + '/',
            'logo': {'@type': 'ImageObject', 'url': SITE + '/assets/logo-icon.png', 'width': 512, 'height': 512}}
    if compact:
        return node
    return {**node, 'alternateName': 'TheBrandle', 'image': SITE + '/assets/og.jpg',
            'description': 'The Brandle is a design and development studio in Dubai. It designs and builds websites, online stores, brand identities and apps in-house, on a fixed quote, and hands over the code.',
            'email': 'hello@thebrandle.com',
            'address': {'@type': 'PostalAddress', 'addressLocality': 'Dubai', 'addressCountry': 'AE'},
            'areaServed': [{'@type': 'Country', 'name': 'United Arab Emirates'}, {'@type': 'Country', 'name': 'Saudi Arabia'}],
            'priceRange': '$799 - $3,799',
            'knowsAbout': ['Web design', 'Brand identity design', 'UI/UX design', 'Ecommerce website design', 'Web application development', 'Search engine optimisation', 'Video production'],
            'founder': [{'@type': 'Person', 'name': n, 'jobTitle': t, 'sameAs': ['https://www.linkedin.com/in/' + l]} for n, t, l in FOUNDERS],
            'sameAs': ['https://www.instagram.com/thebrandlestudio', 'https://www.linkedin.com/company/thebrandle/', 'https://www.facebook.com/profile.php?id=61596184447358']}


def crumbs(canonical, names):
    """BreadcrumbList for a page: names is [(name, address), ...] after Home; the last one is the page itself."""
    items = [('Home', SITE + '/')] + list(names)
    return {'@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb',
            'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(items)]}


def text(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()


def home_schema(title, body):
    """Home: studio + website + page, and the FAQ exactly as it reads on the page (the two joke questions stay out)."""
    faq = [(text(q), text(a)) for q, a in re.findall(r'<button class="fq"[^>]*>(.*?)</button>.*?<p>(.*?)</p>', body, re.S)]
    faq = [(q, a) for q, a in faq if 'yesterday' not in q and 'camels' not in q]
    graph = [org(), {'@type': 'WebSite', '@id': WEB_ID, 'url': SITE + '/', 'name': 'The Brandle', 'alternateName': 'TheBrandle', 'inLanguage': 'en', 'publisher': {'@id': ORG_ID}},
             {'@type': 'WebPage', '@id': SITE + '/#webpage', 'url': SITE + '/', 'name': title, 'isPartOf': {'@id': WEB_ID}, 'about': {'@id': ORG_ID}, 'inLanguage': 'en'}]
    if faq:
        graph.append({'@type': 'FAQPage', '@id': SITE + '/#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]})
    return jsonld(graph)


def page(meta, body, raw=True):
    """Wrap a page body in the layout and write it to the address in meta['path'].
    raw=True writes the body as given (so text like {{this}} in an article survives)."""
    for k in ('path', 'title', 'description'):
        assert meta.get(k), f'page is missing "{k}": {meta}'
    path = meta['path']
    assert path.startswith('/') and (path.endswith('/') or path.endswith('.html')), f'path must look like /about/ or /404.html: {path}'
    ctx = dict(meta)
    esc = lambda s: html.escape(html.unescape(str(s)), quote=True)      # safe in a tag, and the same whether or not the page escaped it already
    plain = html.unescape(meta['title'])
    canonical = ctx['canonical'] = meta.get('canonical') or SITE + path
    ctx['title'], ctx['description'] = esc(meta['title']), esc(meta['description'])
    ctx['og_type'] = meta.get('og_type', 'website')
    ctx['og_title'] = esc(meta.get('og_title') or re.sub(r'\s*\|\s*The Brandle\b.*$', '', plain))      # og:site_name carries the brand
    ctx['og_image'] = SITE + (meta.get('og_image') or '/assets/og.jpg')
    ctx['robots'] = meta.get('robots') or ROBOTS
    index = 'noindex' not in ctx['robots']
    size = (meta.get('og_image_width'), meta.get('og_image_height')) if meta.get('og_image') else (meta.get('og_image_width', 1200), meta.get('og_image_height', 630))
    og = [('og:type', ctx['og_type']), ('og:site_name', 'The Brandle'), ('og:locale', 'en_GB'), ('og:title', ctx['og_title']),
          ('og:description', ctx['description']), ('og:url', canonical), ('og:image', ctx['og_image']),
          ('og:image:width', size[0]), ('og:image:height', size[1]),
          ('og:image:alt', esc(meta.get('og_image_alt') or ('The Brandle, a design and development studio in Dubai' if not meta.get('og_image') else ''))),
          ('twitter:card', 'summary_large_image'), ('twitter:title', ctx['og_title']), ('twitter:description', ctx['description']), ('twitter:image', ctx['og_image'])]
    ctx['canonical_tag'] = f'\n<link rel="canonical" href="{canonical}">' if index else ''
    ctx['og_tags'] = ''.join(f'\n<meta {"name" if k.startswith("twitter") else "property"}="{k}" content="{v}">' for k, v in og if v) if index else ''
    extra = [meta['head_extra']] if meta.get('head_extra') else []
    if path == '/':
        extra.append(home_schema(plain, body))
    elif meta.get('schema') and index:
        extra.append(jsonld([{'@type': meta['schema'], '@id': canonical + '#webpage', 'url': canonical, 'name': plain, 'isPartOf': {'@id': WEB_ID},
                              'breadcrumb': {'@id': canonical + '#breadcrumb'}, 'inLanguage': 'en'},
                             crumbs(canonical, [(meta.get('crumb') or plain, canonical)]), org(compact=True)]))
    ctx['body_class'] = ' ' + meta['body_class'] if meta.get('body_class') else ''
    ctx['head_extra'] = ''.join('\n' + e for e in extra)
    ctx['css_links'] = ''.join(f'\n<link rel="stylesheet" href="/{ver(f)}">' for f in meta.get('css', '').split())
    ctx['js_scripts'] = ''.join(f'\n<script src="/{ver(f)}"></script>' for f in meta.get('js', '').split())
    body = body.strip('\n')
    doc = render((SRC / 'layout.html').read_text(), {**ctx, 'main': '\0main\0'})
    doc = doc.replace('\0main\0', body if raw else render(body, ctx))     # put in last, so a raw body is never read as a template
    out = ROOT / (path.lstrip('/') + 'index.html' if path.endswith('/') else path.lstrip('/'))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc)
    built.append((path, out, canonical, {**meta, 'robots': ctx['robots']}))
    return out


def front(text):
    m = re.match(r'---\n(.*?)\n---\n', text, re.S)
    assert m, 'a page starts with its "key: value" lines between two --- lines'
    return dict(line.split(': ', 1) for line in m.group(1).splitlines() if ': ' in line), text[m.end():]


class api:      # what src/ext/*.py files get
    ROOT, SRC, SITE = ROOT, SRC, SITE
    page, render, ver, front = staticmethod(page), staticmethod(render), staticmethod(ver), staticmethod(front)
    jsonld, org, crumbs, built = staticmethod(jsonld), staticmethod(org), staticmethod(crumbs), built


def main():
    only = sys.argv[1:]
    want = lambda f: not only or f.stem in only
    ext = []
    for f in sorted((SRC / 'ext').glob('*.py')) if (SRC / 'ext').is_dir() else []:
        spec = importlib.util.spec_from_file_location(f.stem, f)
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        ext.append((f, mod))
        if hasattr(mod, 'partials'):          # every ext file's partials are always made: any page may use them
            made.update(mod.partials(api))
    for f in filter(want, sorted((SRC / 'pages').rglob('*.html'))):
        meta, body = front(f.read_text())
        meta.setdefault('lastmod', date.fromtimestamp(f.stat().st_mtime).isoformat())
        page(meta, body, raw=False)
    for f, mod in ext:
        if want(f) and hasattr(mod, 'build'):
            mod.build(api)
    for f, mod in ext:
        if want(f) and hasattr(mod, 'finish'):
            mod.finish(api)
    paths = [p for p, *_ in built]
    if only:
        return print(f'built {len(built)} pages (only {" ".join(only)}):', ' '.join(sorted(paths)))
    assert len(paths) == len(set(paths)), 'two pages share one address: ' + ', '.join(sorted(p for p in set(paths) if paths.count(p) > 1))
    today = date.today().isoformat()
    listed = sorted((c, m.get('lastmod') or today) for p, _, c, m in built
                    if not p.endswith('.html') and 'noindex' not in m['robots'] and m.get('sitemap') != 'no')
    urls = ''.join(f'  <url><loc>{c}</loc><lastmod>{d[:10]}</lastmod></url>\n' for c, d in listed)
    (ROOT / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    print(f'built {len(built)} pages:', ' '.join(sorted(paths)))


if __name__ == '__main__':
    sys.exit(main())
