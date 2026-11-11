"""Turns a drafted blog post into the site's data files, so a person or the blog routine never edits index.json by hand.

usage: python3 src/new_post.py <slug>
reads  src/data/blog/drafts/<slug>.json   {"title": page title without the brand, 50 to 60 characters with " | The Brandle"
                                            when it fits, "h1", "description" (140 to 160 characters), "blurb" (one line
                                            for the /blog card, 60 to 90 characters), "group" (Platforms | Planning |
                                            SEO and performance | Pricing | Industry), "category" (a short tag),
                                            "faq": [{"q", "a"}] (3 or 4), "services": [{"label", "href"}] (2 or 3),
                                            "card": {"lines": [2 or 3 short lines], "ground": cream|orange|black,
                                            "stickers": [platform logo names or icon names], "quip": "a short pill"}}
       src/data/blog/drafts/<slug>.html   the article body: <p>, <h2>, <h3>, <ul>/<ol>, <a href="/...">. No <h1>.
writes src/data/blog/<slug>.json and <slug>.html, adds the post to index.json (newest first) and its card to cards.json,
       then deletes the drafts. If the slug is already published, it is an update: the publish date stays, the
       modified date becomes today, and the post keeps its place in the list.
Then: node src/og/blog-card.mjs <slug>   (draws its art)   and   python3 build.py   (builds the site).
"""
import html, json, re, sys
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

SRC = Path(__file__).resolve().parent
D = SRC / 'data' / 'blog'
SITE = 'https://www.thebrandle.com'
GROUPS = ['Platforms', 'Planning', 'SEO and performance', 'Pricing', 'Industry']
today = datetime.now(timezone(timedelta(hours=4))).date().isoformat()   # Dubai


def fail(msg):
    sys.exit(f'new_post: {msg}')


slug = sys.argv[1] if len(sys.argv) > 1 else fail('give the slug')
dj, dh = D / 'drafts' / f'{slug}.json', D / 'drafts' / f'{slug}.html'
if not dj.exists() or not dh.exists():
    fail(f'missing {dj} or {dh}')
d, body = json.loads(dj.read_text()), dh.read_text().strip()

# ---- house rules, checked before anything is written
words = lambda s: len(re.sub(r'<[^>]+>', ' ', html.unescape(s)).split())
everything = json.dumps(d, ensure_ascii=False) + body
if re.search('[–—]', everything):
    fail('an en or em dash: the site uses plain hyphens')
if re.search(r'<h1|<script|<style|<img', body, re.I):
    fail('the body may hold only p, h2, h3, lists and links')
for k in ('title', 'h1', 'description', 'blurb', 'group', 'category', 'faq', 'services', 'card'):
    if not d.get(k):
        fail(f'the draft has no "{k}"')
if d['group'] not in GROUPS:
    fail(f'group must be one of {GROUPS}')
if not 120 <= len(d['description']) <= 165:
    fail(f'description is {len(d["description"])} characters, keep it 140 to 160')
if len(d['title']) > 60:
    fail(f'title is {len(d["title"])} characters, keep it to 60')
if not 3 <= len(d['faq']) <= 5:
    fail('3 or 4 FAQs')
ROOT = SRC.parent
for href in re.findall(r'href="(/[^"#?]*)', body) + [s['href'] for s in d['services']]:
    p = href.rstrip('/')
    if not (ROOT / p.lstrip('/') / 'index.html').exists() and not (ROOT / (p.lstrip('/') + '.html')).exists() and p != '':
        fail(f'link to {href}: no such page on the site')

# ---- the files
esc = lambda s: html.escape(s, quote=False)
ids = {}
def hid(text):
    base = re.sub(r'[^a-z0-9]+', '-', html.unescape(re.sub(r'<[^>]+>', '', text)).lower()).strip('-')
    ids[base] = ids.get(base, 0) + 1
    return base if ids[base] == 1 else f'{base}-{ids[base]}'
headings = [{'level': int(l), 'text': html.unescape(re.sub(r'<[^>]+>', '', t)), 'id': hid(t)} for l, t in re.findall(r'<h([23])>(.*?)</h\1>', body, re.S)]
faq_html = '\n'.join(f'<details>\n<summary>{esc(f["q"])}</summary>\n<p>{esc(f["a"])}</p>\n</details>' for f in d['faq'])
svc_html = '\n'.join(f'<li><a href="{s["href"]}">{esc(s["label"])}</a></li>' for s in d['services'])
raw = f'{body}\n<!-- faq -->\n{faq_html}\n<!-- /faq -->\n<!-- related-services -->\n<h3>Related services</h3>\n<ul>\n{svc_html}\n</ul>\n<!-- /related-services -->\n'
wc, wf = words(body), sum(words(f['q'] + ' ' + f['a']) for f in d['faq'])
minutes = max(1, round((wc + wf) / 225))

index = json.loads((D / 'index.json').read_text())
posts = index['posts']
old = next((p for p in posts if p['slug'] == slug), None)
published = old['date'] if old else today
url = f'{SITE}/blog/{slug}/'
post = {
    'slug': slug, 'url': url, 'path': f'/blog/{slug}/', 'canonical': url, 'lang': 'en', 'source': 'src/new_post.py',
    'title': f'{d["title"]} | The Brandle', 'titleWithoutBrand': d['title'], 'description': d['description'], 'h1': d['h1'],
    'headline': d['title'], 'datePublished': published, 'dateModified': today, 'category': d['category'], 'tags': [d['category']],
    'suggestedGroup': d['group'], 'readingMinutes': minutes, 'wordCount': wc, 'wordCountFaq': wf, 'excerpt': d['description'],
    'faq': d['faq'], 'relatedServices': d['services'], 'headings': headings,
}
entry = {
    'slug': slug, 'url': url, 'path': f'/blog/{slug}/', 'title': post['title'], 'titleWithoutBrand': d['title'], 'h1': d['h1'],
    'description': d['description'], 'blurb': d['blurb'], 'date': published, 'dateModified': today,
    'image': f'/assets/blog/{slug}.jpg', 'imageAlt': d['h1'], 'cover': f'/assets/blog/covers/{slug}.jpg', 'coverAlt': d['h1'],
    'category': d['category'], 'suggestedGroup': d['group'], 'words': wc, 'readingMinutes': minutes, 'hasFaq': True, 'source': 'src/new_post.py',
}
if old:
    posts[posts.index(old)] = entry
else:
    posts.insert(0, entry)
index['count'] = len(posts)
(D / f'{slug}.json').write_text(json.dumps(post, indent=1, ensure_ascii=False) + '\n')
(D / f'{slug}.html').write_text(raw)
(D / 'index.json').write_text(json.dumps(index, indent=2, ensure_ascii=False) + '\n')
cards = json.loads((D / 'cards.json').read_text())
cards[slug] = d['card']
(D / 'cards.json').write_text(json.dumps(cards, indent=1, ensure_ascii=False) + '\n')
dj.unlink(); dh.unlink()
print(f'{"updated" if old else "added"} {slug}: {wc} words, {len(headings)} headings, {len(d["faq"])} FAQs, {minutes} min read')
print(f'next: node src/og/blog-card.mjs {slug} && python3 build.py')
