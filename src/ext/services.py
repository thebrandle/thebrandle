"""The services hub (/services/) and the service pages (/services/<slug>/), made from src/data/services/.

  src/data/services/<slug>.json   one page: head values, hero, what you get, fit, steps, price, tools, FAQ, closing, links
  src/data/services/_shared.json  groups for the hub, brand names, the proof cards, the films, the shared commitments
  src/data/services/_icons.json   our own icons (inner SVG, 64 x 64 box) used for stickers and the "what you get" list
  assets/logos/<brand>.svg        one-colour platform marks, inlined in ink. A brand without a file is written as text.

Text fields may hold links as [words](/address). Apostrophes are typed plain and come out curly.
The build stops when a page breaks a house rule: a dash, a banned word, a title or description of the wrong length,
a link to a service that does not exist.
"""
import html, json, re

BANNED = re.compile(r'[–—]|\b(elevate|seamless|stunning|unlock|world-class)\b', re.I)
LINK = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
ON = ' class="is-on"'
ARROW = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 8.5l7-7M2.5 1.5h6v6"/></svg>'
ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" focusable="false">{}</svg>'
PATH_L = '<svg class="hero__path hero__path--l" viewBox="0 0 229 599" aria-hidden="true"><path d="M-50 20C90 40 200 130 170 250S40 400 20 310S90 190 160 280S190 500 -40 580"/></svg>'
PATH_R = '<svg class="hero__path hero__path--r" viewBox="0 0 354 487" aria-hidden="true"><path d="M400 30C260 10 100 120 130 250S280 420 330 320S250 150 180 220S110 420 420 470"/></svg>'


def t(s):
    """Copy to HTML: escaped, curly apostrophes, [words](/address) becomes a link."""
    s = html.escape(s, quote=False).replace("'", '&rsquo;')
    return LINK.sub(r'<a class="sv-a" href="\2">\1</a>', s)


def plain(s):
    return LINK.sub(r'\1', s).replace("'", '’')


def cta(text, href, talk=False):
    return (f'<a class="cta" href="{href}"{" data-talk" if talk else ""}><span class="cta__fill"></span><span class="cta__t">{t(text)}</span>'
            f'<span class="cta__arrow">{ARROW}</span></a>')


class Site:
    def __init__(self, api):
        self.api = api
        d = api.SRC / 'data' / 'services'
        self.shared = json.loads((d / '_shared.json').read_text())
        self.icons = json.loads((d / '_icons.json').read_text())
        self.pages = {f.stem: json.loads(f.read_text()) for f in sorted(d.glob('*.json')) if not f.name.startswith('_')}
        self.rects = json.loads((api.ROOT / 'assets' / 'mock' / 'rects.json').read_text())
        self.marks = {}
        for f in (api.ROOT / 'assets' / 'logos').glob('*.svg'):
            self.marks[f.stem] = re.sub(r'<svg[^>]*?(viewBox="[^"]+")[^>]*>', r'<svg \1 fill="currentColor" aria-hidden="true" focusable="false">', f.read_text().strip(), count=1)
        self.check()

    def check(self):
        order = [s for g in self.shared['groups'] for s in g['pages']]
        assert sorted(order) == sorted(self.pages), f'groups in _shared.json and the page files differ: {set(order) ^ set(self.pages)}'
        for slug, p in self.pages.items():
            blob = json.dumps(p, ensure_ascii=False)
            m = BANNED.search(blob)
            assert not m, f'{slug}: house rule broken by "{m.group(0)}" near "{blob[max(0, m.start() - 40):m.end() + 20]}"'
            assert 30 <= len(p['title']) <= 60, f'{slug}: title is {len(p["title"])} characters'
            assert 70 <= len(p['description']) <= 160, f'{slug}: description is {len(p["description"])} characters'
            assert all(r in self.pages for r in p['related']), f'{slug}: related page missing'
            assert len(p['get']['items']) == 6 and len(p['steps']['items']) == 4 and len(p['faq']) >= 4, f'{slug}: wrong number of items'
            for it in p['get']['items'] + p['hero']['stickers']:
                assert it.get('mark') in self.marks or it.get('icon') in self.icons, f'{slug}: no such icon or mark: {it}'
            for href in LINK.findall(blob):
                m = re.match(r'/services/([a-z0-9-]+)/$', href[1])
                assert not m or m.group(1) in self.pages, f'{slug}: link to a service that does not exist: {href[1]}'
        blob = json.dumps(self.shared, ensure_ascii=False)
        assert not BANNED.search(blob), '_shared.json breaks a house rule'

    # ---------- small parts ----------
    def icon(self, name):
        return ICON.format(self.icons[name])

    def sticker(self, it, cls=''):
        """A sticker tile: a platform mark in ink with its name under it, or one of our own icons."""
        if it.get('mark'):
            name = self.shared['brands'][it['mark']]
            return f'<span class="sv-stk sv-stk--mark{cls}">{self.marks[it["mark"]]}<b>{name}</b></span>'
        return f'<span class="sv-stk{cls}" aria-hidden="true">{self.icon(it["icon"])}</span>'

    def row(self, slug, n=None):
        p = self.pages[slug]
        num = f'<span class="sv-row__i">{n:02d}</span>' if n else ''
        return (f'<li><a class="sv-row" href="/services/{slug}/">{num}{self.sticker(p["hub"].get("sticker") or p["hero"]["stickers"][0], " sv-stk--row")}'
                f'<span class="sv-row__n">{t(p["hub"]["name"])}</span><span class="sv-row__p">{t(p["hub"]["line"])}</span>'
                f'<span class="parrow">{ARROW}</span></a></li>')

    def card(self, key):
        """A project card in the home page's shape: a looping video, pages flashing on a display, or one screenshot on a display."""
        c, v = self.shared['proofs'][key], self.api.ver
        if c['type'] == 'video':
            media = (f'<video class="pcard__video" muted loop playsinline preload="none" poster="/{v("assets/work/" + c["file"] + ".webp")}" aria-label="{c["alt"]}">'
                     f'<source src="/{v("assets/work/" + c["file"] + ".mp4")}" type="video/mp4"></video>')
        else:
            r = self.rects[c['scene'] + '.webp']
            if c['type'] == 'flash':
                frames = ''.join(f'<img {"src" if k == 0 else "data-src"}="/{v(f"assets/work/{key}-w{k}.webp")}" alt=""{ON if k == 0 else ""}>' for k in range(c['frames']))
                screen = f'<div class="pflash" role="img" aria-label="{c["alt"]}">{frames}</div>'
            else:
                screen = f'<img src="/{v(c["img"])}" alt="{c["alt"]}" loading="lazy" width="1600" height="1000">'
            media = (f'<div class="mock" style="--x:{r["x"]}%;--y:{r["y"]}%;--w:{r["w"]}%;--h:{r["h"]}%">'
                     f'<img class="mock__scene" src="/{v("assets/mock/" + c["scene"] + ".webp")}" alt="" loading="lazy">'
                     f'<div class="mock__screen">{screen}</div></div>')
        hover = f'<img class="pcard__hover" src="/{v("assets/work/" + key + "-tablet.webp")}" alt="" loading="lazy">' if c.get('tablet') else ''
        return (f'<a class="pitem" style="--flood:{c["colour"]}" href="{c["href"]}">'
                f'<div class="pcard"><div class="pcard__clip">{media}{hover}</div></div>'
                f'<div class="pdetail"><span class="plogo" style="--c:{c["colour"]}">{c["title"][0]}</span>'
                f'<div class="pdetail__h"><h3>{t(c["title"])}</h3><p>{t(c["label"])}</p></div><span class="parrow">{ARROW}</span></div></a>')

    def films(self):
        out = ''
        for f in self.shared['films']:
            w, h = (960, 540) if f['shape'] == 'w' else (461, 820)
            out += (f'<li class="sv-film sv-film--{f["shape"]}"><a href="https://www.youtube.com/watch?v={f["yt"]}" data-yt="{f["yt"]}" rel="noopener" aria-label="Play {f["title"]}, {f["len"]}">'
                    f'<img src="/{self.api.ver("assets/services/film-" + f["file"] + ".webp")}" alt="" width="{w}" height="{h}" loading="lazy">'
                    f'<span class="sv-film__play" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M3 1.5v7l6-3.5z"/></svg></span>'
                    f'<span class="sv-film__t">{f["title"]}<small>{f["len"]}</small></span></a></li>')
        return f'<ul class="sv-films">{out}</ul>'

    def slap_tray(self):
        """Our own stickers, cloned by the script when someone clicks the hero. Never a platform mark."""
        logo = '<img src="/assets/logo-icon.svg" alt="" width="64" height="64">'
        return ('<div class="sv-slap" aria-hidden="true" hidden>' + ''.join(f'<span class="sv-slapped">{self.icon(k)}</span>' for k in self.shared['slap'])
                + f'<span class="sv-slapped sv-slapped--logo">{logo}</span></div>')

    # ---------- one service page ----------
    def service(self, slug):
        p, api = self.pages[slug], self.api
        url = f'{api.SITE}/services/{slug}/'
        h = p['hero']
        k = min(1, 12.5 / max(len(l) for l in h['h1']))
        stickers = ''.join(self.sticker(s, f' sv-stk--{i + 1}') for i, s in enumerate(h['stickers']))
        pills = ''.join(f'<span class="pill sv-pill sv-pill--{i + 1}"><span>{t(c)}</span></span>' for i, c in enumerate(h['chips']))
        hero = f'''
  <section class="sv-hero" data-slap>
    {PATH_L}
    {PATH_R}
    <nav class="sv-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/services/">Services</a><span aria-hidden="true">/</span><span aria-current="page">{t(p["crumb"])}</span></nav>
    <div class="sv-hero__text">
      <h1 class="heading sv-h1" style="--k:{k:.3f}" data-lines>{" <br>".join(t(l) for l in h["h1"])}</h1>
      {stickers}
      <div class="sv-pills">{pills}</div>
    </div>
    <p class="sv-joke">{t(h["joke"])}</p>
    <p class="sv-intro">{t(h["intro"])}</p>
    <div class="sv-hero__cta">{cta("Start your project", "/contact", True)}<a class="sv-link" href="/pricing/">See the plans</a></div>
    <p class="sv-hint" aria-hidden="true">Click anywhere up here. Stickers are free.</p>
    {self.slap_tray()}
  </section>'''

        g = p['get']
        items = ''.join(f'<li class="sv-item"><i>{self.icon(it["icon"])}</i><div><h3>{t(it["t"])}</h3><p>{t(it["p"])}</p></div></li>' for it in g['items'])
        get = f'''
  <section class="sv-get">
    <div class="shead"><p class="label">What you get</p><h2 class="sheading sheading--wide" data-magnetic>{t(g["h2"])}</h2></div>
    <ul class="sv-list">{items}</ul>
  </section>'''

        f = p['fit']
        fit = f'''
  <section class="sv-fit">
    <div class="sv-fit__l"><p class="label label--static">The honest bit</p><h2>{t(f["h2"])}</h2><p class="sv-fit__p">{t(f["p"])}</p></div>
    <div class="sv-fit__card"><h3>Good fit if you are</h3><ul class="sv-yes">{"".join(f"<li>{t(y)}</li>" for y in f["yes"])}</ul>
      <p class="sv-no"><b>Maybe not, if</b>{t(f["no"])}</p></div>
  </section>'''

        proof = ''
        if p.get('proof'):
            pr = p['proof']
            body = self.films() if pr.get('films') else ''.join(self.card(c) for c in pr['cards'])
            proof = f'''
  <section class="sv-proof{" sv-proof--films" if pr.get("films") else ""}" id="{"films" if pr.get("films") else "proof"}">
    <div class="shead"><p class="label">{t(pr["label"])}</p><h2 class="sheading sheading--wide" data-magnetic>{t(pr["h2"])}</h2></div>
    <div class="sv-proof__row"><div class="sv-proof__txt"><p>{t(pr["p"])}</p>{"".join(f'<a class="sv-link" href="{l[1]}">{t(l[0])}</a>' for l in pr.get("links", []))}</div>{body}</div>
  </section>'''

        s = p['steps']
        stops = ''.join(f'<li class="sv-stop"><span class="sv-stop__n" aria-hidden="true">{i + 1}</span><div class="sv-stop__t"><h3>{t(it["t"])}</h3><p>{t(it["p"])}</p></div></li>' for i, it in enumerate(s['items']))
        commit = ''.join(f'<li class="pill pill--orange"><span>{t(c)}</span></li>' for c in self.shared['commit'][p.get('commit', 'build')])
        proc = f'''
  <section class="sv-proc">
    <div class="shead"><p class="label">How it goes</p><h2 class="sheading sheading--wide" data-magnetic>{t(s["h2"])}</h2></div>
    <div class="sv-proc__body">
      <svg class="sv-line" aria-hidden="true"><path class="sv-line__ghost"/><path class="sv-line__dark"/></svg>
      <ol class="sv-stops">{stops}</ol>
    </div>
    <div class="sv-commit"><p>On every project, no exceptions</p><ul>{commit}</ul></div>
  </section>'''

        pr = p['price']
        kp = min(1, 12.5 / max(len(l) for l in pr['big']))
        price = f'''
  <section class="sv-price">
    <p class="label label--static">What it costs</p>
    <h2 class="heading sv-price__big" style="--k:{kp:.3f}" data-lines>{" <br>".join(t(l) for l in pr["big"])}</h2>
    <p>{t(pr["p"])}</p>
    {cta("See the plans", "/pricing/")}
  </section>'''

        tl = p.get('tools') or {'h2': '', 'items': []}
        chips = ''
        for name in tl['items']:
            chips += (f'<li class="sv-tool">{self.marks[name]}<span>{self.shared["brands"][name]}</span></li>' if name in self.marks
                      else f'<li class="sv-tool sv-tool--text"><span>{t(name)}</span></li>')
        tools = '' if not chips else f'''
  <section class="sv-tools">
    <h2>{t(tl["h2"])}</h2>
    <ul>{chips}</ul>
    <p>{t(tl.get("note") or self.shared["tools_note"])}</p>
  </section>'''

        qa = ''.join(f'<div class="fitem{" open" if i == 0 else ""}"><h3 class="sv-fh"><button class="fq" type="button" aria-expanded="{"true" if i == 0 else "false"}">{t(q["q"])}</button></h3>'
                     f'<div class="fa"><div class="fa__block"><p>{t(q["a"])}</p></div><span class="fa__logo" aria-hidden="true">B</span></div></div>' for i, q in enumerate(p['faq']))
        faq = f'''
  <section class="faq sv-faq" id="faq">
    <div class="faq__left">
      <div class="faq__head"><p class="label label--static">Questions</p><h2 class="sheading sheading--faq" data-magnetic>{t(p["faq_h2"])}</h2></div>
      <div class="sv-more"><p>Not on the list? The big FAQ page covers money, timelines and what happens after launch.</p>
        <a class="sv-link" href="/faq">Read the full FAQ</a><a class="sv-link" href="/contact" data-talk>Or just ask us</a></div>
    </div>
    <div class="faq__right">{qa}</div>
  </section>'''

        rows = ''.join(self.row(r) for r in p['related'])
        post = ''
        if p.get('post'):
            post = (f'<li><a class="sv-row sv-row--post" href="/blog/{p["post"]["slug"]}/"><span class="sv-stk sv-stk--row" aria-hidden="true">{self.icon("doc")}</span>'
                    f'<span class="sv-row__n">From the blog</span><span class="sv-row__p">{t(p["post"]["title"])}</span><span class="parrow">{ARROW}</span></a></li>')
        rel = f'''
  <section class="sv-rel">
    <div class="shead"><p class="label">Next door</p><h2 class="sheading sheading--wide" data-magnetic>{t(p.get("rel_h2", "You might also need"))}</h2></div>
    <ul class="sv-rows">{rows}{post}</ul>
    <a class="sv-link" href="/services/">All 20 services</a>
  </section>'''

        c = p['cta']
        end = f'''
  <section class="pend sv-end">
    <div class="pend__inner">
      <h2 class="pend__para" data-lines>{" <br>".join(t(l) for l in c["lines"])}</h2>
      {"".join(f'<span class="pill ppill ppill--{i + 1}"><span>{t(x)}</span></span>' for i, x in enumerate(c["pills"]))}
      <p class="sv-end__p">{t(c["p"])}</p>
      {cta("Book a free consultation", "/contact", True)}
    </div>
  </section>'''

        ld = api.jsonld([
            {'@type': 'Service', '@id': url + '#service', 'name': p['schema_name'], 'serviceType': p['service_type'], 'url': url,
             'description': p['description'], 'provider': {'@id': f'{api.SITE}/#organization'},
             'areaServed': [{'@type': 'Country', 'name': 'United Arab Emirates'}, {'@type': 'Country', 'name': 'Saudi Arabia'}]},
            api.org(compact=True),
            api.crumbs(url, [('Services', f'{api.SITE}/services/'), (p['crumb'], url)]),
            {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [
                {'@type': 'Question', 'name': plain(q['q']), 'acceptedAnswer': {'@type': 'Answer', 'text': plain(q['a'])}} for q in p['faq']]},
        ])
        meta = {'path': f'/services/{slug}/', 'title': p['title'], 'description': p['description'], 'og_title': p['schema_name'],
                'css': 'css/services.css', 'js': 'js/services.js', 'head_extra': ld}
        order = [hero, get, fit, proof, proc, price, tools, faq, rel, end]
        if p.get('proof', {}).get('films'):
            order = [hero, proof, get, fit, proc, price, tools, faq, rel, end]
        api.page(meta, f'<main id="top" class="sv">{"".join(order)}\n</main>')

    # ---------- the hub ----------
    def hub(self):
        api, sh = self.api, self.shared
        url = f'{api.SITE}/services/'
        hb = sh['hub']
        art = api.ROOT / 'assets' / 'art' / 'services-hero.svg'
        man = api.ROOT / 'assets' / 'art' / 'manifest.json'
        info = json.loads(man.read_text())['files'].get('services-hero.svg', {}) if man.exists() else {}
        vb = info.get('viewBox') or [0, 0, 1200, 900]
        # the art builder's picture when it has landed, the home page's two designers until then
        img = (f'<img class="sv-hub__art" src="/{api.ver("assets/art/services-hero.svg")}" alt="{html.escape(info.get("alt") or "")}" width="{vb[2]}" height="{vb[3]}">' if art.exists()
               else f'<img class="sv-hub__art sv-hub__art--stand" src="/{api.ver("assets/hero-light.webp")}" alt="Two designers carrying boards, with a camel at each end" width="2400" height="1154">')
        # the hero's scroll story (js/services.js): the camel rests, a beaker of logos breaks, the camel gets up
        frames = len(list((api.ROOT / 'assets' / 'art' / 'camel-up').glob('*.webp')))   # the camel getting up, one webp per frame
        bk = api.ROOT / 'assets' / 'art' / 'services-beaker.svg'
        beaker = f'<div class="sv-beaker" aria-hidden="true">{bk.read_text()}</div>' if bk.exists() else ''
        cloud = ''.join(f'<a class="sv-cloud__a sv-cloud__a--{i + 1}" href="/services/{s}/">{self.sticker(self.pages[s]["hero"]["stickers"][0])}</a>' for i, s in enumerate(hb['cloud']))
        hero = f'''
  <section class="sv-hero sv-hub" data-slap>
    {PATH_L}
    {PATH_R}
    <nav class="sv-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Services</span></nav>
    <div class="sv-hero__text">
      <h1 class="heading sv-h1" data-lines>{" <br>".join(t(l) for l in hb["h1"])}</h1>
      <div class="sv-pills">{"".join(f'<span class="pill sv-pill sv-pill--{i + 1}"><span>{t(c)}</span></span>' for i, c in enumerate(hb["chips"]))}</div>
    </div>
    <p class="sv-joke">{t(hb["joke"])}</p>
    <p class="sv-intro">{t(hb["intro"])}</p>
    <div class="sv-hub__stage">{beaker}<div class="sv-cam" data-frames="{frames}" data-base="/assets/art/camel-up/">{img}</div><div class="sv-cloud">{cloud}</div></div>
    <p class="sv-hint" aria-hidden="true">Click anywhere up here. Stickers are free.</p>
    {self.slap_tray()}
  </section>'''
        groups, n, listed = '', 0, []
        for g in sh['groups']:
            rows = ''
            if g['key'] == 'cities':  # cities live on /locations/; the hub just says "web design"
                n += 1
                rows = (f'<li><a class="sv-row" href="/locations/"><span class="sv-row__i">{n:02d}</span>{self.sticker(self.pages["web-design-dubai"]["hero"]["stickers"][0], " sv-stk--row")}'
                        f'<span class="sv-row__n">Web design</span><span class="sv-row__p">{len(g["pages"])} cities, one studio. Pick yours.</span><span class="parrow">{ARROW}</span></a></li>')
                groups += f'''
  <section class="sv-group" id="{g["key"]}">
    <div class="sv-group__l"><p class="label label--static">Near you</p><h2 class="sheading" data-magnetic>Wherever you are</h2><p class="sv-group__p">{t(g["line"])}</p></div>
    <ul class="sv-rows">{rows}</ul>
  </section>'''
                continue
            for s in g['pages']:
                n += 1
                rows += self.row(s, n)
                listed.append(s)
            groups += f'''
  <section class="sv-group" id="{g["key"]}">
    <div class="sv-group__l"><p class="label label--static">{len(g["pages"]):02d} {"service" if len(g["pages"]) == 1 else "services"}</p><h2 class="sheading" data-magnetic>{t(g["name"])}</h2><p class="sv-group__p">{t(g["line"])}</p></div>
    <ul class="sv-rows">{rows}</ul>
  </section>'''
        c = hb['cta']
        end = f'''
  <section class="sv-price sv-hub__price">
    <p class="label label--static">What it costs</p>
    <h2 class="heading sv-price__big" style="--k:1" data-lines>$1,299 to <br>$6,499</h2>
    <p>{t(hb["price"])}</p>
    {cta("See the plans", "/pricing/")}
  </section>
  <section class="pend sv-end">
    <div class="pend__inner">
      <h2 class="pend__para" data-lines>{" <br>".join(t(l) for l in c["lines"])}</h2>
      {"".join(f'<span class="pill ppill ppill--{i + 1}"><span>{t(x)}</span></span>' for i, x in enumerate(c["pills"]))}
      <p class="sv-end__p">{t(c["p"])}</p>
      {cta("Book a free consultation", "/contact", True)}
    </div>
  </section>'''
        ld = api.jsonld([
            {'@type': 'CollectionPage', '@id': url + '#webpage', 'url': url, 'name': hb['title'], 'description': hb['description'],
             'isPartOf': {'@id': f'{api.SITE}/#website'}, 'breadcrumb': {'@id': url + '#breadcrumb'},
             'mainEntity': {'@type': 'ItemList', 'itemListElement': [
                 {'@type': 'ListItem', 'position': i + 1, 'name': self.pages[s]['schema_name'], 'url': f'{api.SITE}/services/{s}/'} for i, s in enumerate(listed)]}},
            api.org(compact=True),
            api.crumbs(url, [('Services', url)]),
        ])
        meta = {'path': '/services/', 'title': hb['title'], 'description': hb['description'], 'og_title': 'Services',
                'css': 'css/services.css', 'js': 'js/services.js', 'head_extra': ld}
        api.page(meta, f'<main id="top" class="sv sv--hub">{hero}{groups}{end}\n</main>')


    COUNTRIES = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'United Kingdom', 'United States']

    def locations(self):
        """/locations/: every city page, grouped by country."""
        api, sh = self.api, self.shared
        url = f'{api.SITE}/locations/'
        cities = next(g for g in sh['groups'] if g['key'] == 'cities')['pages']
        by = {c: [s for s in cities if self.pages[s].get('country') == c] for c in self.COUNTRIES}
        assert sum(map(len, by.values())) == len(cities), 'every city page needs a "country" from COUNTRIES'
        title = 'Web Design by City: UAE, Saudi, UK and US | The Brandle'
        desc = 'Web design in Dubai, Abu Dhabi, Riyadh, London, New York and more. One Dubai studio, local payments and languages, fixed quotes.'
        hero = f'''
  <section class="sv-hero sv-hub sv-loc">
    {PATH_L}
    {PATH_R}
    <nav class="sv-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/services/">Services</a><span aria-hidden="true">/</span><span aria-current="page">Locations</span></nav>
    <div class="sv-hero__text">
      <h1 class="heading sv-h1" data-lines>Web design, <br>wherever you are</h1>
      <div class="sv-pills"><span class="pill sv-pill sv-pill--1"><span>{len(cities)} cities</span></span><span class="pill sv-pill sv-pill--2"><span>{len([c for c in by if by[c]])} countries</span></span><span class="pill sv-pill sv-pill--3"><span>1 time zone (ours)</span></span></div>
    </div>
    <p class="sv-joke">We&rsquo;re in Dubai. Your customers are wherever they are. The website has to work for them, not for us.</p>
    <p class="sv-intro">Pick your city. Each page covers what a site there actually needs: the language, the way people pay, the tax on the receipt and when we&rsquo;re both awake for a call.</p>
  </section>'''
        groups, n = '', 0
        for c, slugs in by.items():
            if not slugs:
                continue
            rows = ''
            for s in slugs:
                n += 1
                rows += self.row(s, n)
            groups += f'''
  <section class="sv-group">
    <div class="sv-group__l"><p class="label label--static">{len(slugs):02d} {"city" if len(slugs) == 1 else "cities"}</p><h2 class="sheading" data-magnetic>{c}</h2></div>
    <ul class="sv-rows">{rows}</ul>
  </section>'''
        end = f'''
  <section class="pend sv-end">
    <div class="pend__inner">
      <h2 class="pend__para" data-lines>City not here? <br>We still answer.</h2>
      <span class="pill ppill ppill--1"><span>Video calls</span></span><span class="pill ppill ppill--2"><span>No jet lag</span></span><span class="pill ppill ppill--3"><span>Fixed quote</span></span>
      <p class="sv-end__p">We work with clients wherever the internet reaches. Tell us where your customers are and we&rsquo;ll build for them.</p>
      {cta("Book a free consultation", "/contact", True)}
    </div>
  </section>'''
        listed = [s for slugs in by.values() for s in slugs]
        ld = api.jsonld([
            {'@type': 'CollectionPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': desc,
             'isPartOf': {'@id': f'{api.SITE}/#website'}, 'breadcrumb': {'@id': url + '#breadcrumb'},
             'mainEntity': {'@type': 'ItemList', 'itemListElement': [
                 {'@type': 'ListItem', 'position': i + 1, 'name': self.pages[s]['schema_name'], 'url': f'{api.SITE}/services/{s}/'} for i, s in enumerate(listed)]}},
            api.org(compact=True),
            api.crumbs(url, [('Services', f'{api.SITE}/services/'), ('Locations', url)]),
        ])
        meta = {'path': '/locations/', 'title': title, 'description': desc, 'og_title': 'Web design by city',
                'css': 'css/services.css', 'js': 'js/services.js', 'head_extra': ld}
        api.page(meta, f'<main id="top" class="sv sv--hub">{hero}{groups}{end}\n</main>')

def build(api):
    site = Site(api)
    site.hub()
    site.locations()
    for slug in site.pages:
        site.service(slug)
