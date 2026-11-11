"""The blog: the listing at /blog/ and one page per post at /blog/<slug>/.

Data, one pair of files per post in src/data/blog/:
  <slug>.html   the article exactly as published: body, then <!-- faq --> ... <!-- /faq -->, then <!-- related-services --> ...
  <slug>.json   title, description, h1, dates, reading time, group, headings with anchor ids, faq pairs
  index.json    all posts, newest first (the order of the listing)        cards.json   what each post's art says
Templates: src/blog/listing.html and src/blog/post.html. Styles css/blog.css, script js/blog.js.
Art: node src/og/blog-card.mjs draws every post's card, share image and hero into assets/blog/.

To add a post: add its two files, add it to index.json and cards.json, run the art script, then python3 build.py blog.
The article text is never edited here: the only change made to a body is an id on each h2 and h3 (checked below).
"""
import html, json, re
from datetime import date

GROUPS = ['Platforms', 'Planning', 'SEO and performance', 'Pricing', 'Industry']
LONG = 3000          # words; longer posts get a table of contents
ARROW = '<span class="parrow"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 8.5l7-7M2.5 1.5h6v6"/></svg></span>'
esc = lambda s: html.escape(s, quote=True)
gid = lambda g: g.lower().replace(' ', '-')
human = lambda d: f'{int(d[8:10])} {date.fromisoformat(d[:10]).strftime("%B %Y")}'      # 22 July 2026


def related(posts):
    """Three other posts for each post: its own group first, then whichever posts have the fewest links so far."""
    out, inbound = {}, {p['slug']: 0 for p in posts}
    for p in posts:
        mates = [q for q in posts if q['suggestedGroup'] == p['suggestedGroup']]
        i = mates.index(p)
        out[p['slug']] = [q['slug'] for q in (mates[i + 1:] + mates[:i])[:3]]
        for s in out[p['slug']]: inbound[s] += 1
    for p in posts:
        pick = out[p['slug']]
        while len(pick) < 3:
            s = min((q['slug'] for q in posts if q['slug'] != p['slug'] and q['slug'] not in pick), key=lambda s: inbound[s])
            pick.append(s); inbound[s] += 1
    assert all(inbound.values()), 'a post has no link from any other post'
    return out


def card(p, v, h='h3'):
    s = p['slug']
    return f'''
      <a class="pitem bcard" href="/blog/{s}/" data-g="{gid(p['suggestedGroup'])}">
        <div class="pcard"><div class="pcard__clip"><img src="/{v(f'assets/blog/{s}-list.jpg')}" width="960" height="540" alt="" loading="lazy"><img class="pcard__hover" src="/{v(f'assets/blog/{s}-hover.jpg')}" width="960" height="540" alt="" loading="lazy"></div></div>
        <div class="pdetail"><div class="pdetail__h"><{h}>{esc(p['h1'])}</{h}><p>{esc(p['suggestedGroup'])} &middot; {p['readingMinutes']} min read</p></div>{ARROW}</div>
        <p class="bcard__blurb">{esc(p['blurb'])}</p>
      </a>'''


def featured(p, v):
    s = p['slug']
    return f'''    <a class="pitem bfeat" href="/blog/{s}/" data-g="{gid(p['suggestedGroup'])}">
      <div class="pcard"><div class="pcard__clip"><img src="/{v(f'assets/blog/{s}.jpg')}" width="1600" height="900" alt=""><img class="pcard__hover" src="/{v(f'assets/blog/{s}-hover.jpg')}" width="960" height="540" alt="" loading="lazy"></div></div>
      <div class="bfeat__text">
        <span class="pill pill--orange bfeat__pill"><span>Fresh off the keyboard</span></span>
        <h3>{esc(p['h1'])}</h3>
        <p class="bfeat__blurb">{esc(p['blurb'])}</p>
        <p class="bfeat__meta">{esc(p['suggestedGroup'])} &middot; <time datetime="{p['date']}">{human(p['date'])}</time> &middot; {p['readingMinutes']} min read</p>
        {ARROW}
      </div>
    </a>'''


def ld(nodes):
    return '<script type="application/ld+json">' + json.dumps({'@context': 'https://schema.org', '@graph': nodes}, ensure_ascii=False).replace('</', '<\\/') + '</script>'


def build(api):
    D = api.SRC / 'data' / 'blog'
    S = api.SITE
    posts = json.loads((D / 'index.json').read_text())['posts']
    cards = json.loads((D / 'cards.json').read_text())
    assert all(p['suggestedGroup'] in GROUPS for p in posts)
    rel = related(posts)
    by = {p['slug']: p for p in posts}
    org = {'@type': 'ProfessionalService', '@id': f'{S}/#organization', 'name': 'The Brandle', 'url': f'{S}/'}
    crumb = lambda *items: [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(items)]

    # ---------- the listing ----------
    art_file = api.ROOT / 'assets' / 'art' / 'blog-hero.svg'
    if art_file.exists():      # the character art; its size and alt text come from the art builder's manifest
        m = json.loads((api.ROOT / 'assets' / 'art' / 'manifest.json').read_text())['files']['blog-hero.svg']
        art = (f'<div class="bhero__art" style="aspect-ratio: {m["width"]} / {m["height"]}"><img class="bhero__img" src="/{api.ver("assets/art/blog-hero.svg")}" '
               f'width="{m["width"]}" height="{m["height"]}" alt="{esc(m["alt"])}"></div>')
    else:                      # without it: the three newest covers, fanned out
        art = '<div class="bhero__art"><div class="bfan" role="img" aria-label="Three guide covers fanned out like playing cards">' + ''.join(
            f'<img src="/{api.ver("assets/blog/" + p["slug"] + "-list.jpg")}" width="960" height="540" alt="">' for p in posts[1:4]) + '</div></div>'
    count = lambda g: sum(p['suggestedGroup'] == g for p in posts)
    filters = f'<button class="bf is-on" type="button" aria-pressed="true" data-g="all">All <sup>{len(posts)}</sup></button>' + ''.join(
        f'<button class="bf" type="button" aria-pressed="false" data-g="{gid(g)}">{g} <sup>{count(g)}</sup></button>' for g in GROUPS)
    body = api.render((api.SRC / 'blog' / 'listing.html').read_text(), {
        'count': len(posts), 'art': art, 'filters': filters,
        'featured': featured(posts[0], api.ver), 'cards': ''.join(card(p, api.ver) for p in posts[1:])})
    title = 'Web Design, Ecommerce and Branding Guides | The Brandle'
    api.page({
        'path': '/blog/', 'canonical': f'{S}/blog', 'title': title,
        'description': 'Plain guides on website costs, platforms, redesigns, ecommerce and branding from The Brandle, a Dubai design and development studio.',
        'css': 'css/blog.css', 'js': 'js/blog.js',
        'head_extra': ld([
            {'@type': 'CollectionPage', '@id': f'{S}/blog#webpage', 'url': f'{S}/blog', 'name': title, 'isPartOf': {'@id': f'{S}/#website'},
             'breadcrumb': {'@id': f'{S}/blog#breadcrumb'}, 'mainEntity': {'@id': f'{S}/blog#blog'}},
            {'@type': 'Blog', '@id': f'{S}/blog#blog', 'url': f'{S}/blog', 'name': 'The Brandle blog', 'inLanguage': 'en', 'publisher': {'@id': f'{S}/#organization'},
             'blogPost': [{'@type': 'BlogPosting', 'headline': p['h1'], 'url': p['url'], 'datePublished': p['date']} for p in posts]},
            org,
            {'@type': 'BreadcrumbList', '@id': f'{S}/blog#breadcrumb', 'itemListElement': crumb(('Home', f'{S}/'), ('Blog', f'{S}/blog'))}]),
    }, body)

    # ---------- the posts ----------
    tpl = (api.SRC / 'blog' / 'post.html').read_text()
    for p in posts:
        slug = p['slug']
        j = json.loads((D / f'{slug}.json').read_text())
        raw = (D / f'{slug}.html').read_text()
        part = lambda name: (re.search(rf'<!-- {name} -->\n(.*?)\n<!-- /{name} -->', raw, re.S) or [None, ''])[1]
        text = raw.split('<!-- faq -->')[0].split('<!-- related-services -->')[0].strip()
        ids = iter(j['headings'])
        body = re.sub(r'<h([23])>', lambda m: f'<h{m.group(1)} id="{next(ids)["id"]}">', text)
        assert next(ids, None) is None and re.sub(r' id="[^"]*"', '', body) == text, f'{slug}: headings do not match the article'
        faq, services = part('faq'), part('related-services')
        assert bool(faq) == bool(j['faq']) and faq.count('<details>') == len(j['faq']), f'{slug}: the FAQ on the page and in the data differ'

        long = p['words'] > LONG
        toc = ''
        if long:
            rows = ''.join(f'<li><a href="#{h["id"]}">{esc(h["text"])}</a></li>' for h in j['headings'] if h['level'] == 2)
            toc = f'    <nav class="ptoc" aria-label="On this page"><p class="ptoc__h">On this page</p><ol>{rows}</ol></nav>'
        pub, mod = j['datePublished'], j['dateModified']
        ctx = {
            'slug': slug, 'h1': esc(j['h1']), 'description': esc(j['description']), 'group': esc(p['suggestedGroup']), 'group_id': gid(p['suggestedGroup']),
            'published': pub, 'published_h': human(pub), 'minutes': j['readingMinutes'], 'long_class': ' post--long' if long else '',
            'updated': f'<span>Updated <time datetime="{mod}">{human(mod)}</time></span>' if mod[:10] != pub[:10] else '',
            'art_alt': esc(' '.join(cards[slug]['lines']) + ', in big letters. Cover art for this guide'),
            'toc': toc, 'body': '\0body\0', 'faq': '\0faq\0', 'services': '\0services\0',
            'related': ''.join(card(by[s], api.ver) for s in rel[slug]),
        }
        out = api.render(tpl, ctx)       # the article goes in afterwards, so nothing in it is read as a template
        out = out.replace('\0body\0', body)
        out = out.replace('\0faq\0', f'      <section class="pfaq" aria-labelledby="pfaq-h"><h2 id="pfaq-h">Questions people ask</h2>\n{faq}\n      </section>' if faq else '')
        out = out.replace('\0services\0', f'      <aside class="psvc">\n{services}\n      </aside>' if services else '')

        url = j['canonical']
        nodes = [
            {'@type': 'BlogPosting', '@id': f'{url}#article', 'headline': j['h1'], 'description': j['description'],
             'image': [f'{S}/assets/blog/{slug}.jpg', f'{S}/assets/blog/covers/{slug}.jpg'],
             'datePublished': pub, 'dateModified': mod, 'articleSection': p['suggestedGroup'], 'inLanguage': 'en',
             'mainEntityOfPage': url, 'isPartOf': {'@id': f'{S}/blog#blog'}, 'author': {'@id': f'{S}/#organization'}, 'publisher': {'@id': f'{S}/#organization'}},
            {**org, 'logo': {'@type': 'ImageObject', 'url': f'{S}/assets/brand/logo-mark.png'}},
            {'@type': 'BreadcrumbList', '@id': f'{url}#breadcrumb', 'itemListElement': crumb(('Home', f'{S}/'), ('Blog', f'{S}/blog'), (j['h1'], url))},
        ]
        if j['faq']:
            nodes.append({'@type': 'FAQPage', '@id': f'{url}#faq', 'mainEntity': [
                {'@type': 'Question', 'name': f['q'], 'acceptedAnswer': {'@type': 'Answer', 'text': f['a']}} for f in j['faq']]})
        t = j['titleWithoutBrand']
        api.page({
            'path': f'/blog/{slug}/', 'canonical': url,
            'title': esc(t + ' | The Brandle' if len(t) + 14 <= 60 else t), 'og_title': esc(t), 'description': esc(j['description']),
            'og_type': 'article', 'og_image': f'/assets/blog/{slug}-og.jpg', 'body_class': 'is-post',
            'lastmod': str(mod)[:10],
            'css': 'css/blog.css', 'js': 'js/blog.js',
            'head_extra': '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
                          f'<meta property="article:published_time" content="{pub}">\n<meta property="article:modified_time" content="{mod}">\n' + ld(nodes),
        }, out)
