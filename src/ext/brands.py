"""The "brands we've worked with" wall (partial: brands), from src/data/brands.json and the logos in assets/brands/.
Logos come from muteeb.com, Ubaid's logo folder and the brands in Raheem's films; all are white on transparent."""
import json
from html import escape as e

ART = ('ear-l', 'head', 'jaw', 'ear-r', 'lid')  # the contact camel's parts, back to front, all on one viewBox


def partials(api):
    brands = json.loads((api.SRC / 'data' / 'brands.json').read_text())
    v = api.ver
    tilt = [-3, 2, -1.5, 3, -2.5, 1.5, -1, 2.5]
    tile = lambda i, b: (f'<span class="btile" style="--r:{tilt[i % len(tilt)]}deg"><img src="/{v("assets/brands/" + b["slug"] + ".webp")}" '
                         f'width="{b["w"]}" height="{b["h"]}" alt="" loading="lazy" decoding="async"></span>')
    k = -(-len(brands) // 3)
    rows = [brands[:k], brands[k:2 * k], brands[2 * k:]]  # three arcs; main.js lays the tiles along them
    camel = ''.join(f'<img class="bcamel__{p}" src="/{v("assets/art/contact-camel-" + p + ".svg")}" alt="">' for p in ART)
    return {'brands': f'''
  <!-- BRANDS -->
  <section class="brands" aria-labelledby="brands-h">
    <div class="bcamel" aria-hidden="true">{camel}<span class="pill bcamel__say"><span>I&rsquo;ve met them all</span></span></div>
    <div class="brands__wall">
      <div class="brands__head">
        <p class="label label--static">Name-dropping</p>
        <h2 class="sheading brands__h" id="brands-h">Brands that let us near their logo</h2>
        <p class="brands__p">Startups, summits, a prayer app, a loan company and a gym that lifts things. We designed for them, built for them or filmed them. Sometimes all three.</p>
      </div>
      <div class="brands__rows" aria-hidden="true">
        {''.join(f'<div class="brands__row brands__row--{k}">{"".join(tile(i + k * 3, b) for i, b in enumerate(r))}</div>' for k, r in enumerate(rows))}
      </div>
      <ul class="vh">{''.join(f'<li>{e(b["name"])}</li>' for b in brands)}</ul>
      <span class="pill brands__pill brands__pill--a"><span>{len(brands)} and counting</span></span>
      <span class="pill pill--orange brands__pill brands__pill--b"><span>Hover to make them blush</span></span>
    </div>
  </section>
'''}
