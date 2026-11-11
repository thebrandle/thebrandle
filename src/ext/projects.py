"""Project cards, the Work index (/projects/) and one page per project (/projects/<slug>/).
Data: src/data/projects.json (the list, in display order: what a card needs) and src/data/projects/<slug>.json
(what a project page needs: copy, cover, media blocks and a "sources" list that traces every claim on the page).
partials: cards_home = the featured projects, in file order, for the home page's Selected Works.

A card shows its project one of two ways (project["card"]["type"]):
  mock   a display mockup scene (assets/mock/<scene>.webp) with the project's pages flashing on its screen
         (assets/work/<slug>-w0.webp is the frame it rests on, -w1 ... the burst); where the screen sits comes from
         assets/mock/rects.json and covers.json
  video  one looping video that fills the card (assets/work/<file>.mp4 with <file>.webp as its poster)
On hover every card reveals assets/work/<slug>-tablet.webp. Every card links to the project's own page.

A project page is: a full-height cover (a 16:9 scene assets/mock/cover-<cover>.webp, the portrait scene on tablets and
phones, with the site's pages on the screen), two text blocks, tags, a button to the live site, then media blocks:
  full   one 16:9 still             assets/work/<slug>-<img>.webp
  duo    two phone screens side by side; a cell is {"img": ...} or {"video": <file>} (a looping video with a poster)
  video  one 16:9 looping video     assets/work/<file>.mp4 + .webp
  mock   a wide display scene with the project's pages flashing on its screen (the card's frames again)
then the next project and three more. The media files are made by the scripts noted in src/data/projects/README.md.
"""
import html
import json

ON = ' class="is-on"'
ARROW_SVG = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 8.5l7-7M2.5 1.5h6v6"/></svg>'
ARROW = f'<span class="parrow">{ARROW_SVG}</span>'
SITE = 'https://www.thebrandle.com'
TYPE = {'own': 'Own product', 'template': 'Our template', 'client': 'Client work'}
e = html.escape


def kind_line(p):
    """The card's second line on the Work index says whose project it is."""
    return f'Our {p["kind"]}' if p['type'] == 'template' else p['kind']


def flash(slug, n, alt, v, eager=False):
    """The project's pages as a stack of frames: the first shows, the script cuts through the rest."""
    first = ' fetchpriority="high"' if eager else ''
    return ''.join(f'<img {"src" if k == 0 else "data-src"}="/{v(f"assets/work/{slug}-w{k}.webp")}" alt=""{(ON + first) if k == 0 else ""}>' for k in range(n))


def rect(r, s=''):
    return ';'.join(f'--{k}{s}:{r[k]}%' for k in 'xywh')


def media(p, rects, v):
    c = p['card']
    if c['type'] == 'video':
        f = c['file']
        return (f'<video class="pcard__video" muted loop playsinline preload="none" poster="/{v(f"assets/work/{f}.webp")}" aria-label="{e(p["alt"])}">'
                f'<source src="/{v(f"assets/work/{f}.mp4")}" type="video/mp4"></video>')
    return (f'<div class="mock" style="{rect(rects[c["scene"] + ".webp"])}">'
            f'<img class="mock__scene" src="/{v(f"assets/mock/{c["scene"]}.webp")}" alt="">'
            f'<div class="mock__screen">{screen(p, v, c)}</div></div>')


def screen(p, v, c):
    """What plays on a display mockup: the site's own scroll recording when there is one, else the flash of its pages."""
    slug = p['slug']
    if (ROOT / 'assets' / 'work' / f'{slug}-card.mp4').exists():   # a small cut of the desktop recording: cards are small, and several play at once
        return (f'<video class="pcard__video pcard__video--screen" muted loop playsinline preload="none" poster="/{v(f"assets/work/{slug}-w0.webp")}" aria-label="{e(p["alt"])}">'
                f'<source src="/{v(f"assets/work/{slug}-card.mp4")}" type="video/mp4"></video>')
    return f'<div class="pflash" role="img" aria-label="{e(p["alt"])}">{flash(slug, c["frames"], p["alt"], v)}</div>'


def card(p, rects, v, kind=None, tag='h3'):
    return f'''
      <a class="pitem" style="--flood:{p["colour"]}" href="/projects/{p["slug"]}/" data-title="{e(p["title"])}">
        <div class="pcard"><div class="pcard__clip">{media(p, rects, v)}<img class="pcard__hover" src="/{v('assets/work/' + p['slug'] + '-tablet.webp')}" alt="" loading="lazy"></div></div>
        <div class="pdetail"><span class="plogo" style="--c:{p["colour"]}">{p["title"][0]}</span><div class="pdetail__h"><{tag}>{e(p["title"])}</{tag}><p>{e(kind or p["kind"])}</p></div>{ARROW}</div>
      </a>'''


def load(api):
    projects = json.loads((api.SRC / 'data' / 'projects.json').read_text())
    for p in projects:
        p['page'] = json.loads((api.SRC / 'data' / 'projects' / f'{p["slug"]}.json').read_text())
    global ROOT
    ROOT = api.ROOT
    mock = api.ROOT / 'assets' / 'mock'
    rects = {**json.loads((mock / 'rects.json').read_text()), **json.loads((mock / 'covers.json').read_text())}
    return projects, rects


def partials(api):
    projects, rects = load(api)
    return {'cards_home': ''.join(card(p, rects, api.ver, kind_line(p)) for p in projects if p.get('featured')) + '\n'}


WORK = ('Work', SITE + '/projects')


# ---------- Work index ----------

# Films by our media team (from raheemcreates.com): (slug, title, kind, length, YouTube id, shape)
FILMS = [('beincrypto', 'BeInCrypto', 'Roundtable', '0:39', '2CchbQdESco', 'wide'),
         ('white-sunday', 'White Sunday', 'Event film', '0:20', 'ul5GEKFK0Kk', 'tall'),
         ('dat-summit', 'DAT Summit', 'Teaser', '0:06', None, 'tall'),
         ('lavo', 'Lavo', 'Event film', '1:06', '60H5TW-L4oI', 'wide'),
         ('blockstreet', 'Blockstreet', 'News edit', '1:35', 'WC7X097ixNw', 'wide')]


def film(i, f, v):
    slug, title, kind, length, yt, shape = f
    play = (f'<button class="film__play" type="button" data-yt="{yt}" aria-label="Watch {title} with sound">'
            f'<span class="pill pill--orange"><span>Watch with sound</span></span></button>') if yt else ''
    return (f'<article class="film film--{shape}"><div class="film__media">'
            f'<video muted loop playsinline preload="none" poster="/{v(f"assets/work/films/{slug}-poster.webp")}" data-src="/{v(f"assets/work/films/{slug}-loop.mp4")}" aria-hidden="true"></video>{play}</div>'
            f'<p class="film__meta"><span>{i + 1:02d}</span><strong>{title}</strong><span>{kind} / {length}</span></p></article>')

INDEX_TITLE = 'Our Work: Websites, Stores, Apps and Templates | The Brandle'


def index(api, projects, rects):
    v = api.ver
    cards = ''.join(card(p, rects, v, kind_line(p)) for p in projects)
    body = f'''<main id="top" class="work">

  <section class="whero">
    <div class="whero__text">
      <h1 class="heading whero__h" data-lines>Things we made<br>all on purpose</h1>
      <span class="pill whero__pill whero__pill--a"><span>No lorem ipsum</span></span>
      <span class="pill whero__pill whero__pill--b"><span>Every link is live</span></span>
    </div>
    <svg class="whero__path" viewBox="0 0 230 575" aria-hidden="true"><path d="M176 566C62 524 8 392 16 284C24 176 92 124 140 150C194 180 198 286 172 312C138 346 88 252 102 138C112 58 150 22 176 10"/></svg>
    <div class="whero__btm">
      <img class="whero__art" src="/assets/art/work-hero.svg" width="1400" height="800" alt="The two designers hang a framed screen on the wall while a camel helps by holding the wrong end.">
      <p class="whero__para lm"><span>Stores, apps, price comparison sites and templates. A couple for clients, most for ourselves, because the fastest way to learn what works is to pay for the mistakes.</span></p>
    </div>
  </section>

  <section class="projects projects--index" aria-labelledby="all-work">
    <h2 class="sr" id="all-work">All projects</h2>
    <div class="plist">{cards}
    </div>
  </section>

  <section class="films" id="films" aria-labelledby="films-h">
    <div class="shead">
      <p class="label">Behind the camera</p>
      <h2 class="sheading" id="films-h" data-magnetic>Films</h2>
    </div>
    <p class="films__lede">We point cameras at things too. Launches, roundtables and the odd very good party, filmed for brands, PR agencies and media in Dubai. Tap one for sound, or keep it a silent movie.</p>
    <div class="films__grid">{''.join(film(i, f, v) for i, f in enumerate(FILMS))}</div>
  </section>
  <section class="edits" id="edits" aria-labelledby="edits-h">
    <div class="shead">
      <p class="label">Edit and motion</p>
      <h2 class="sheading" id="edits-h" data-magnetic>Edits</h2>
    </div>
    <p class="edits__lede">Motion titles, colour, concert promos and nature films, cut in-house. Muted here, because the music is better with the real thing.</p>
    <ul class="edits__row" aria-label="Six short edits, playing without sound"><li class="edits__item"><video class="edits__v" muted loop playsinline preload="none" poster="/assets/team/ziyavdi/zv1.webp"><source src="/assets/team/ziyavdi/zv1.mp4" type="video/mp4"></video></li><li class="edits__item"><video class="edits__v" muted loop playsinline preload="none" poster="/assets/team/ziyavdi/zv2.webp"><source src="/assets/team/ziyavdi/zv2.mp4" type="video/mp4"></video></li><li class="edits__item"><video class="edits__v" muted loop playsinline preload="none" poster="/assets/team/ziyavdi/zv3.webp"><source src="/assets/team/ziyavdi/zv3.mp4" type="video/mp4"></video></li><li class="edits__item"><video class="edits__v" muted loop playsinline preload="none" poster="/assets/team/ziyavdi/zv4.webp"><source src="/assets/team/ziyavdi/zv4.mp4" type="video/mp4"></video></li><li class="edits__item"><video class="edits__v" muted loop playsinline preload="none" poster="/assets/team/ziyavdi/zv5.webp"><source src="/assets/team/ziyavdi/zv5.mp4" type="video/mp4"></video></li><li class="edits__item"><video class="edits__v" muted loop playsinline preload="none" poster="/assets/team/ziyavdi/zv6.webp"><source src="/assets/team/ziyavdi/zv6.mp4" type="video/mp4"></video></li></ul>
  </section>
{api.render('{{> brands}}', {})}
  <div class="pfollow" aria-hidden="true"><span class="pill pfollow__name"><span></span></span><span class="pill pill--orange pfollow__go"><span>View project</span></span></div>
</main>'''
    url = SITE + '/projects'
    nodes = [
        {'@type': 'CollectionPage', '@id': url + '#webpage', 'url': url, 'name': INDEX_TITLE, 'isPartOf': {'@id': SITE + '/#website'},
         'breadcrumb': {'@id': url + '#breadcrumb'},
         'mainEntity': {'@type': 'ItemList', 'itemListElement': [
             {'@type': 'ListItem', 'position': i + 1, 'name': p['title'], 'url': f'{SITE}/projects/{p["slug"]}/'} for i, p in enumerate(projects)]}},
        api.crumbs(url, [WORK]), api.org(compact=True)]
    api.page({
        'path': '/projects/', 'canonical': url, 'title': INDEX_TITLE,
        'description': 'Selected work by The Brandle: a Shopify store, websites, iOS and Mac apps, and Framer and Webflow templates. Designed and built in-house in Dubai.',
        'css': 'css/work.css', 'js': 'js/work.js', 'body_class': 'is-work', 'head_extra': api.jsonld(nodes)}, body)


# ---------- project page ----------
def phone(c, slug, v):
    if 'video' in c:
        f = c['video']
        inner = (f'<video class="pvid" muted loop playsinline preload="none" poster="/{v(f"assets/work/{f}.webp")}" aria-label="{e(c["alt"])}">'
                 f'<source src="/{v(f"assets/work/{f}.mp4")}" type="video/mp4"></video>')
        return f'<div class="pduo__cell pduo__cell--video">{inner}</div>'
    return (f'<div class="pduo__cell"><div class="pphone"><img src="/{v(f"assets/work/{slug}-{c["img"]}.webp")}" width="585" height="1266" loading="lazy" decoding="async" alt="{e(c["alt"])}"></div></div>')


def block(b, p, rects, v):
    slug, t = p['slug'], b['t']
    if t == 'full':
        return f'<figure class="pmedia" data-reveal><img src="/{v(f"assets/work/{slug}-{b["img"]}.webp")}" width="1440" height="810" loading="lazy" decoding="async" alt="{e(b["alt"])}"></figure>'
    if t == 'video':
        f = b['file']
        return (f'<div class="pmedia" data-reveal><video class="pvid" muted loop playsinline preload="none" poster="/{v(f"assets/work/{f}.webp")}" width="1280" height="720" aria-label="{e(b["alt"])}">'
                f'<source src="/{v(f"assets/work/{f}.mp4")}" type="video/mp4"></video></div>')
    if t == 'mock':
        f = f'cover-{b["scene"]}.webp'
        return (f'<div class="pmedia pmedia--mock" data-reveal><div class="mock" style="{rect(rects[f])}">'
                f'<img class="mock__scene" src="/{v("assets/mock/" + f)}" width="1920" height="1080" loading="lazy" decoding="async" alt="">'
                f'<div class="mock__screen"><div class="pflash" role="img" aria-label="{e(b["alt"])}">{flash(slug, p["page"]["screens"], b["alt"], v)}</div></div></div></div>')
    if t == 'duo':
        return f'<div class="pduo" data-reveal>{phone(b["a"], slug, v)}{phone(b["b"], slug, v)}</div>'
    raise ValueError(f'unknown block type {t} in {slug}')


def slides(p, v):
    """The big frame: the project's wide stills, cutting from one to the next on their own, slowly."""
    shots = [b for b in p['page']['blocks'] if b['t'] == 'full']
    imgs = ''.join(f'<img {"src" if k == 0 else "data-src"}="/{v(f"assets/work/{p["slug"]}-{b["img"]}.webp")}" width="1440" height="810" alt="{e(b["alt"])}"'
                   f'{ON if k == 0 else ""} loading="lazy" decoding="async">' for k, b in enumerate(shots))
    return f'<figure class="pmedia pslides" data-reveal>{imgs}</figure>'


def phones(p, v):
    """Two phones, each playing the site scrolling on a phone (Pawsword's first phone plays the app itself)."""
    slug, t = p['slug'], p['title']
    def cell(f, poster, alt, framed=True):
        if not (ROOT / 'assets' / 'work' / f'{f}.mp4').exists():   # until the recording is made, the phone shows its still
            return f'<div class="pduo__cell"><div class="pphone"><img src="/{v(f"assets/work/{poster}.webp")}" loading="lazy" decoding="async" alt="{e(alt)}"></div></div>'
        vid = (f'<video class="pvid" muted loop playsinline preload="none" poster="/{v(f"assets/work/{poster}.webp")}" aria-label="{e(alt)}">'
               f'<source src="/{v(f"assets/work/{f}.mp4")}" type="video/mp4"></video>')
        return f'<div class="pduo__cell"><div class="pphone">{vid}</div></div>' if framed else f'<div class="pduo__cell pduo__cell--video">{vid}</div>'
    if slug == 'pawsword':
        a = cell('pawsword-phone', 'pawsword-phone', 'The Pawsword app on an iPhone: a bear says hello, then Face ID opens the password list', False)
        b = cell(f'{slug}-pa', f'{slug}-p1', f'The {t} site scrolling on a phone')
    else:
        a = cell(f'{slug}-pa', f'{slug}-p1', f'The {t} home page scrolling on a phone')
        b = cell(f'{slug}-pb', f'{slug}-p2', f'Another {t} page scrolling on a phone')
    return f'<div class="pduo" data-reveal>{a}{b}</div>'


def text(part, extra=''):
    paras = ''.join(f'<p>{e(x)}</p>' for x in part['paras'])
    return (f'<div class="ptext"><p class="ptext__label">{e(part["label"])}</p>'
            f'<div class="ptext__col"><h2>{e(part["heading"])}</h2><div class="ptext__body">{paras}</div>{extra}</div></div>')


def cover(p, rects, v, cls, eager):
    """A display scene that covers its box: 16:9 on desktop, the portrait scene from tablets down, the site's pages on its screen."""
    d = p['page']
    wide, tall = f'cover-{d["cover"]}.webp', f'{d["portrait"]}.webp'
    load = ' fetchpriority="high"' if eager else ' loading="lazy" decoding="async"'
    cut = 'desk' if eager else 'card'      # the cover gets the full recording, the next-project teaser the small one
    rec = ROOT / 'assets' / 'work' / f'{p["slug"]}-{cut}.mp4'
    if rec.exists():
        frames = (f'<video class="pvid pvid--hero" muted loop playsinline{" autoplay" if eager else ""} preload="{"auto" if eager else "none"}" poster="/{v(f"assets/work/{p["slug"]}-w0.webp")}">'
                  f'<source src="/{v(f"assets/work/{p["slug"]}-{cut}.mp4")}" type="video/mp4"></video>')
    else:
        frames = f'<img src="/{v(f"assets/work/{p["slug"]}-w0.webp")}" alt=""{ON + load}>'
    label = f'role="img" aria-label="{e(p["alt"] if p["card"]["type"] == "mock" else "Pages of the " + p["title"] + " site on a desktop display")}"'
    return (f'<div class="{cls}"><div class="mock" style="{rect(rects[wide], "w")};{rect(rects[tall], "p")}">'
            f'<picture><source media="(max-width: 991px)" srcset="/{v("assets/mock/" + tall)}"><img class="mock__scene" src="/{v("assets/mock/" + wide)}" alt=""{load}></picture>'
            f'<div class="mock__screen"><div class="pscrub" {label}>{frames}</div></div></div></div>')


def project(api, projects, rects, i):
    v = api.ver
    p, d = projects[i], projects[i]['page']
    slug, n = p['slug'], len(projects)
    nxt = projects[(i + 1) % n]
    url = f'{SITE}/projects/{slug}/'
    long_title = ' phero__h--long' if len(p['title']) > 12 else ''
    visit = (f'<a class="cta pvisit" href="{p["url"]}" target="_blank" rel="noopener"><span class="cta__fill"></span><span class="cta__t">{e(d["cta"])}</span>'
             f'<span class="cta__arrow">{ARROW_SVG}</span></a>')
    tags = ''.join(f'<li>{e(t)}</li>' for t in d['tags'])
    body = f'''<main id="top" class="proj" style="--pc:{p["colour"]}">

  <section class="phero">
    {cover(p, rects, v, 'phero__cover', True)}
    <div class="phero__shade"></div>
    <div class="phero__title">
      <p class="pill phero__type"><span>{e(kind_line(p))}</span></p>
      <h1 class="phero__h{long_title}" data-lines>{e(p["title"])}</h1>
    </div>
  </section>

  <section class="pbody">
    <nav class="pcrumb" aria-label="Breadcrumb"><a href="/projects">Work</a><span aria-hidden="true">/</span><span aria-current="page">{e(p["title"])}</span></nav>
    <div class="pblocks">
      {text(d["brief"])}
      {text(d["answer"], f'<ul class="ptags" aria-label="What we did">{tags}</ul>{visit}')}
      {slides(p, v)}
      {phones(p, v)}
    </div>
  </section>

  <section class="pnext">
    <a class="pnext__link" href="/projects/{nxt["slug"]}/" style="--pc:{nxt["colour"]}">
      <span class="pnext__text"><span class="pnext__label">Next project</span><span class="pnext__title" data-lines>{e(nxt["title"])}</span><span class="pnext__kind">{e(kind_line(nxt))}</span></span>
      {cover(nxt, rects, v, 'pnext__cover', False)}
      <span class="parrow pnext__arrow">{ARROW_SVG}</span>
    </a>
  </section>

</main>'''
    og = f'/assets/work/og-{slug}.jpg'
    nodes = [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': d['seo_title'], 'isPartOf': {'@id': SITE + '/#website'},
         'breadcrumb': {'@id': url + '#breadcrumb'}, 'mainEntity': {'@id': url + '#work'}},
        {'@type': 'CreativeWork', '@id': url + '#work', 'name': p['title'], 'description': d['summary'], 'genre': p['kind'], 'image': SITE + og,
         'sameAs': [p['url']], 'creator': {'@id': SITE + '/#organization'}},
        api.crumbs(url, [WORK, (p['title'], url)]), api.org(compact=True)]
    api.page({
        'path': f'/projects/{slug}/', 'title': e(d['seo_title']), 'description': e(d['description']), 'og_image': og,
        'og_image_width': 1200, 'og_image_height': 630, 'og_image_alt': e(f'The {p["title"]} site on a desktop display'),
        'css': 'css/work.css', 'js': 'js/work.js', 'body_class': 'is-project', 'head_extra': api.jsonld(nodes)}, body)


def build(api):
    projects, rects = load(api)
    for p in projects:      # a page may only claim what its sources list covers: no sources, no page
        assert p['page'].get('sources'), f'{p["slug"]}: add a "sources" list'
        assert p['type'] in TYPE, p['slug']
    index(api, projects, rects)
    for i in range(len(projects)):
        project(api, projects, rects, i)
