"""The price builder on /pricing/ (partial: pricebuilder), from src/data/pricing.json.

Tabs pick a service; each service lists what can be added. One receipt collects everything ticked across all the
services, grouped by service, with a one-off total and a monthly total (dollars and dirhams). js/pricing.js does the
adding up; without the script the page is still a readable price list.
"""
import json
from html import escape as e

ARR = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 8.5l7-7M2.5 1.5h6v6"/></svg>'


def money(p, unit='once'):
    if p is None:
        return 'Quoted'
    return f'${p:,}' + ('<small>/mo</small>' if unit == 'mo' else '')


def item(cat, it):
    unit = it.get('unit', 'once')
    attrs = (f'data-cat="{cat["key"]}" data-key="{it["key"]}" data-label="{e(it["label"])}" data-unit="{unit}" '
             f'data-price="{"" if it["price"] is None else it["price"]}"' + (' data-base' if it.get('base') else '') + (' data-alone' if it.get('alone') else ''))
    text = f'<span class="bopt__t"><b>{e(it["label"])}</b><small>{e(it["note"])}</small></span>'
    if it.get('qty'):
        return (f'<div class="bopt bopt--qty" {attrs}>{text}<span class="step"><button type="button" class="step__b" data-step="-1" '
                f'aria-label="{e(it["label"])}: one fewer">&minus;</button><output class="step__n" aria-live="polite">0</output>'
                f'<button type="button" class="step__b" data-step="1" aria-label="{e(it["label"])}: one more">+</button></span></div>')
    on = ' checked' if it.get('on') else ''
    return (f'<label class="bopt{" bopt--base" if it.get("base") else ""}" {attrs}><input type="checkbox"{on}>'
            f'<span class="bopt__box" aria-hidden="true"></span>{text}<span class="bopt__p">{money(it["price"], unit)}</span></label>')


def partials(api):
    d = json.loads((api.SRC / 'data' / 'pricing.json').read_text())
    cats = d['categories']
    tabs = ''.join(f'<button type="button" class="btab{" is-on" if i == 0 else ""}" role="tab" aria-selected="{str(i == 0).lower()}" '
                   f'aria-controls="bcat-{c["key"]}" id="btab-{c["key"]}" data-cat="{c["key"]}">{e(c["name"])}<i class="btab__n" aria-hidden="true"></i></button>'
                   for i, c in enumerate(cats))
    panels = ''.join(f'<div class="bcat" id="bcat-{c["key"]}" role="tabpanel" aria-labelledby="btab-{c["key"]}"{"" if i == 0 else " hidden"}>'
                     + ''.join(item(c, it) for it in c['items']) + '</div>' for i, c in enumerate(cats))
    names = json.dumps({c['key']: c['name'] for c in cats})
    return {'pricebuilder': f'''  <!-- PRICE BUILDER: pick a service, tick what you need, the receipt prints as you go -->
  <section class="pr-plans" id="plans" aria-labelledby="plans-h">
    <div class="pr-panel">
      <h2 class="pr-panel__h" id="plans-h">Build your price. Watch the receipt.</h2>
      <p class="pr-panel__sub">Pick a service, tick what you need, and the total adds up as you go. Mix services on one receipt. Every price is fixed in writing before any work starts.</p>
      <form class="bld" data-aed="{d["aed"]}" data-names='{names}' onsubmit="return false">
        <div class="bld__left">
          <div class="btabs" role="tablist" aria-label="Services">{tabs}</div>
          <div class="bld__opts">{panels}</div>
        </div>
        <div class="bld__cart" id="bld-cart">
          <div class="bcart">
            <h3 class="bcart__h">Your receipt</h3>
            <p class="bcart__sub">The Brandle, Dubai</p>
            <div class="bcart__rows" aria-live="polite"></div>
            <p class="bcart__empty">Nothing yet. Tick something on the left.</p>
            <p class="bcart__total"><span>One-off</span><b class="bcart__usd">$0</b></p>
            <p class="bcart__total bcart__total--mo" hidden><span>Monthly</span><b class="bcart__mo">$0</b></p>
            <p class="bcart__aed">About AED <span>0</span>. Fixed, in writing.</p>
            <button class="cta bcart__go" type="button"><span class="cta__fill"></span><span class="cta__t">Send me this quote</span><span class="cta__arrow">{ARR}</span></button>
          </div>
        </div>
      </form>
      <p class="pr-panel__foot">Not sure what you need? <a href="/contact">Book a free consultation</a> and we will build the receipt with you.</p>
    </div>
  </section>
'''}


def build(api):
    pass
