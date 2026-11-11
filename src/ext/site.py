"""Site-wide files that are made from data, written after every page of a build:  python3 build.py site
  vercel.json   from src/data/redirects.json (every rule permanent) plus the cache and noindex headers. Checked on every
                build: a redirect never lands on another redirect, never hides a real file, and every built page answers
                on its canonical address while its other slash form redirects there.
  rss.xml       every blog post, newest first, from src/data/blog/*.json when the blog's data is there
                (else from the research copy, else an empty feed)
  llms.txt      the plain-text summary for AI agents. Links only pages that exist in the built site.
partials: notfound_art = the 404 page's picture: assets/art/notfound.svg once the art exists, the napping camel until then.
robots.txt is a plain file at the site root, kept by hand. sitemap.xml is written by build.py on a full build.
"""
import json, re
from datetime import datetime, timezone
from email.utils import format_datetime
from html import escape
from pathlib import Path

RESEARCH = Path('/private/tmp/claude-501/-Users-muteebmehraj-friday/17715871-5201-4613-a10e-c7f626b2e328/scratchpad/research/brandle-blog/index.json')
BLOG_DESC = 'Plain guides on website costs, platforms, redesigns, ecommerce and branding from The Brandle, a Dubai design and development studio.'
HEADERS = [('/fonts/(.*)', 'Cache-Control', 'public, max-age=31536000, immutable'),
           ('/assets/(.*)', 'Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400'),      # a week: files here are replaced in place
           ('/404.html', 'X-Robots-Tag', 'noindex'), ('/api/(.*)', 'X-Robots-Tag', 'noindex')]
SERVICES = [('shopify-website-design', 'Shopify design'), ('ecommerce-website-design', 'Ecommerce design'), ('webflow-website-design', 'Webflow design'),
            ('framer-website-design', 'Framer design'), ('wordpress-website-design', 'WordPress design'), ('wix-website-design', 'Wix design'),
            ('squarespace-website-design', 'Squarespace design'), ('ui-ux-design', 'UI/UX design'), ('brand-identity-design', 'Brand identity design'),
            ('website-maintenance', 'Website maintenance'), ('seo-services', 'SEO services'), ('woocommerce-website-design', 'WooCommerce design'),
            ('digital-marketing', 'Digital marketing'), ('social-media-marketing', 'Social media marketing'), ('mobile-app-development', 'Mobile app development'),
            ('web-application-development', 'Web application development'), ('b2b-b2c-portal-development', 'B2B and B2C portals'),
            ('payment-gateway-integration', 'Payment and API integration'), ('web-design-dubai', 'Web design in Dubai'),
            ('web-design-abu-dhabi', 'Web design in Abu Dhabi'), ('web-design-riyadh', 'Web design in Riyadh'), ('video-production', 'Video production')]


def partials(api):
    art = api.ROOT / 'assets' / 'art' / 'notfound.svg'
    if art.is_file():
        img = f'<img class="nf__art" src="/{api.ver("assets/art/notfound.svg")}" width="800" height="800" alt="A white spotted camel reading a map upside down">'
    else:
        img = f'<img class="nf__art nf__art--nap" src="/{api.ver("assets/nap-light.webp")}" width="1300" height="807" alt="A camel asleep on its back with a large arrow pointing at its belly">'
    return {'notfound_art': img}


# ---------- redirects ----------
def rx(source):
    """A Vercel redirect source as a regular expression: :name, :name(pattern) and :name* are its only special parts."""
    out = ''
    for part in re.split(r'(:\w+\*|:\w+\([^)]*\)|:\w+)', source):
        m = re.fullmatch(r':(\w+)(\*|\((.*)\))?', part)
        out += f'(?P<{m[1]}>{".*" if m[2] == "*" else m[3] or "[^/]+"})' if m else re.escape(part)
    return re.compile(out)


def resolve(rules, path):
    """Where the first matching rule sends a path, or None when no rule matches (rules tied to another host are skipped)."""
    for r in rules:
        m = None if r.get('has') else rx(r['source']).fullmatch(path)
        if m:
            return re.sub(r':(\w+)\*?', lambda g: m[g[1]], r['destination'])
    return None


def hides_file(root, source):
    if ':' not in source:
        return (root / source.lstrip('/')).is_file()
    folder = root / source[:source.index(':')].lstrip('/')
    return folder.is_dir() and any(f.is_file() and rx(source).fullmatch('/' + f.relative_to(root).as_posix()) for f in folder.iterdir())


def vercel(api):
    root = api.ROOT
    rules, notes = [], []
    for r in json.loads((api.SRC / 'data' / 'redirects.json').read_text())['redirects']:
        if 'unless_page' in r and (root / r['unless_page']).is_file():
            continue
        if 'if_page' in r and not (root / r['if_page']).is_file():
            continue
        if not r.get('has') and r['source'] != '/index.html' and hides_file(root, r['source']):      # /index.html is the one file a rule is meant to hide
            notes.append(f'redirect {r["source"]} left out: a real file answers there')
            continue
        rules.append({k: v for k, v in r.items() if k in ('source', 'has', 'destination')} | {'permanent': True})

    # the rules must do what the plan says, and no redirect may land on another redirect
    want = {'/about/': '/about', '/about': None, '/blog/': '/blog', '/blog/all': '/blog', '/blog/website-cost-dubai': '/blog/website-cost-dubai/',
            '/blog/website-cost-dubai/': None, '/blog/top-web-design-trends-to-watch-in-2024/': '/blog', '/services': '/services/', '/services/': None,
            '/services/seo-services': '/services/seo-services/', '/pricing': '/pricing/', '/faq/': '/faq', '/privacy/': '/privacy', '/terms': None,
            '/projects/': '/projects', '/projects/soznikar': '/projects/soznikar/', '/projects/soznikar/': None, '/projects/dropx-website-design': '/projects',
            '/projects/oh-my-pasta-branding/': '/projects', '/projects/cyb3r-media/': '/projects', '/projects/cyb3r-media': '/projects', '/work': '/projects',
            '/index.html': '/', '/': None, '/assets/og.jpg': None, '/assets/brand/og-image.jpg': '/assets/og.jpg', '/nope': None, '/blog/nope/': None}
    for path, to in want.items():
        assert resolve(rules, path) == to, f'redirects.json: {path} goes to {resolve(rules, path)}, expected {to}'
    for r in rules:
        if '*' in r['source'] or r.get('has'):
            continue
        sample = re.sub(r':\w+(\([^)]*\))?', 'sample-page', r['source'])
        to = resolve(rules, sample)
        assert resolve(rules, to) is None, f'redirects.json: a chain. {sample} goes to {to}, which goes on to {resolve(rules, to)}'

    # every built page: its canonical address is served as is, and the other slash form redirects to it in one step
    for f in sorted(root.glob('**/index.html')):
        rel = f.parent.relative_to(root).as_posix()
        if rel == '.' or rel.startswith(('src', 'assets', 'node_modules')):
            continue
        c = re.search(r'<link rel="canonical" href="' + re.escape(api.SITE) + r'([^"]*)"', f.read_text(errors='replace'))
        if not c:
            notes.append(f'/{rel}/ has no canonical tag')
            continue
        canon = c[1]
        other = canon.rstrip('/') if canon.endswith('/') else canon + '/'
        if canon.strip('/') != rel:
            notes.append(f'/{rel}/ has the canonical {canon}, which is another address')
        elif resolve(rules, canon) is not None:
            notes.append(f'{canon} is a canonical address but redirects to {resolve(rules, canon)}')
        elif resolve(rules, other) != canon:
            notes.append(f'{other} should redirect to {canon}: add a rule to src/data/redirects.json')

    conf = {'cleanUrls': False,      # trailingSlash is left unset on purpose: each page is <path>/index.html and answers on both forms,
            'redirects': rules,      # and the rules above send the form its canonical does not use to the one it does
            'headers': [{'source': s, 'headers': [{'key': k, 'value': v}]} for s, k, v in HEADERS]}
    (root / 'vercel.json').write_text(json.dumps(conf, indent=2) + '\n')
    return len(rules), notes


# ---------- rss ----------
def posts(api):
    """Blog posts as dicts with slug, title, description, date. Reads whatever JSON the blog keeps in src/data/blog/."""
    def load(f):
        try:
            j = json.loads(f.read_text())
        except (OSError, ValueError):
            return []
        j = j.get('posts', j) if isinstance(j, dict) else j
        return [p for p in (j if isinstance(j, list) else [j]) if isinstance(p, dict) and p.get('slug') and (p.get('date') or p.get('datePublished'))]
    folder = api.SRC / 'data' / 'blog'
    files = sorted(folder.rglob('*.json')) if folder.is_dir() else []
    for group in ([f for f in files if f.name in ('index.json', 'posts.json')][:1], files, [RESEARCH]):
        got = {p['slug']: p for f in group for p in load(f)}
        if got:
            return [{'slug': p['slug'], 'title': p.get('h1') or p.get('titleWithoutBrand') or p.get('title') or p['slug'],
                     'description': p.get('description') or p.get('metaDescription') or p.get('blurb') or '',
                     'date': str(p.get('date') or p.get('datePublished'))} for p in got.values()]
    return []


def when(s):
    d = datetime.fromisoformat(s.replace('Z', '+00:00'))
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def rss(api):
    items = sorted(posts(api), key=lambda p: when(p['date']), reverse=True)[:30]
    site = api.SITE
    body = ''.join(f'''  <item>
    <title>{escape(p["title"])}</title>
    <link>{site}/blog/{p["slug"]}/</link>
    <guid isPermaLink="true">{site}/blog/{p["slug"]}/</guid>
    <pubDate>{format_datetime(when(p["date"]))}</pubDate>
    <description>{escape(p["description"])}</description>
  </item>
''' for p in items)
    built = format_datetime(when(items[0]['date']) if items else datetime.now(timezone.utc))      # the newest post, so the file only changes when the blog does
    (api.ROOT / 'rss.xml').write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>The Brandle blog</title>
  <link>{site}/blog</link>
  <description>{escape(BLOG_DESC)}</description>
  <language>en</language>
  <lastBuildDate>{built}</lastBuildDate>
  <atom:link href="{site}/rss.xml" rel="self" type="application/rss+xml"/>
{body}</channel>
</rss>
''')
    return len(items)


# ---------- llms.txt ----------
def llms(api):
    site, root = api.SITE, api.ROOT
    has = lambda path: (root / path.strip('/') / 'index.html').is_file()
    link = lambda name, path, about: f'- [{name}]({site}{path}): {about}\n' if has(path) else ''
    pages = (link('Work', '/projects', 'projects we designed and built') + link('About', '/about', 'who we are and how we work')
             + link('Services', '/services/', 'every service, one page each') + link('Locations', '/locations/', 'web design by city and country') + link('Pricing', '/pricing/', 'fixed-price plans from $1,299')
             + link('FAQ', '/faq', 'pricing, timelines, revisions, ownership and support') + link('Blog', '/blog', 'guides on costs, platforms, redesigns and SEO')
             + link('Contact', '/contact', 'start a project'))
    projects = json.loads((api.SRC / 'data' / 'projects.json').read_text())
    work = ''.join(f'- [{p["title"]}]({site}/projects/{p["slug"]}/): {p["kind"]}\n' if has(f'/projects/{p["slug"]}/') else f'- [{p["title"]}]({p["url"]}): {p["kind"]}\n' for p in projects)
    services = ''.join(link(name, f'/services/{slug}/', 'service page') for slug, name in SERVICES)
    pages = '\n## Key pages\n\n' + pages if pages else ''
    services = '\n## Optional\n\n' + services if services else ''
    (root / 'llms.txt').write_text(f'''# The Brandle

> Design and development studio in Dubai. We design and build websites, online stores,
> brand identities and apps in-house, on a fixed quote, and hand over the code and the design files.
> We work with clients in the UAE, Saudi Arabia and internationally.

## What we do

- Web design and build: custom sites on Framer, Webflow, WordPress or Shopify
- Online stores: Shopify and WooCommerce
- Brand identity: logos, identity systems and guidelines
- UI/UX design for products and apps
- App development: web apps, portals and payment integrations
- SEO and marketing, done by the people who built the site
- Video production: event films, interviews and brand content, shot in Dubai

## How we work

- Fixed quote agreed before any work starts. Website plans run from $1,299 to $6,499.
- A custom website or Shopify store typically takes three to six weeks.
- Two rounds of revisions at each stage. Anything beyond that is quoted before it is started.
- Thirty days of bug fixes after launch at no cost.
- One point of contact, a weekly call and a shared WhatsApp group.
- Replies within one business day.
- The client owns the work: the repository, the design files and the brand files are handed over.

## People

- Muteeb Mehraj, founder
- Raheem Dzhairkhanov, co-founder
- Ubaid Wani, co-founder
{pages}
## Work

{work}
## Contact

Email: hello@thebrandle.com
Based in Dubai, United Arab Emirates.
{services}''')


def finish(api):
    n, notes = vercel(api)
    feed = rss(api)
    llms(api)
    print(f'site: vercel.json ({n} redirects), rss.xml ({feed} posts), llms.txt')
    for note in notes:
        print('  note:', note)
