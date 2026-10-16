#!/usr/bin/env node
/**
 * Pixel widths of a page title and meta description, the way Seobility (and
 * Google's snippet) measures them: title in 20px Arial, description in 14px
 * Arial. Limits: title <= 580px, description <= 1000px.
 *
 * Widths are Arial advance widths measured in Chrome at 100px (2026-10-16), so
 * this needs no browser and runs anywhere Node does. Summing per character
 * ignores kerning, which makes it a few px conservative: the homepage title
 * reads 460px here and 461px in Seobility, its description 893px here and
 * 885px there. Treat anything within ~10px of a limit as borderline.
 *
 *   node scripts/seo-length.js "Title | TheBrandle" "Meta description..."
 *
 * Also used by gen-blog.js, which warns when a post goes over.
 */
const W = {"0":55.62,"1":55.62,"2":55.62,"3":55.62,"4":55.62,"5":55.62,"6":55.62,"7":55.62,"8":55.62,"9":55.62," ":27.78,"!":27.78,"\"":35.5,"#":55.62,"$":55.62,"%":88.92,"&":66.7,"'":19.09,"(":33.3,")":33.3,"*":38.92,"+":58.4,",":27.78,"-":33.3,".":27.78,"/":27.78,":":27.78,";":27.78,"<":58.4,"=":58.4,">":58.4,"?":55.62,"@":101.51,"A":66.7,"B":66.7,"C":72.22,"D":72.22,"E":66.7,"F":61.08,"G":77.78,"H":72.22,"I":27.78,"J":50,"K":66.7,"L":55.62,"M":83.3,"N":72.22,"O":77.78,"P":66.7,"Q":77.78,"R":72.22,"S":66.7,"T":61.08,"U":72.22,"V":66.7,"W":94.38,"X":66.7,"Y":66.7,"Z":61.08,"[":27.78,"\\":27.78,"]":27.78,"^":46.92,"_":55.62,"`":33.3,"a":55.62,"b":55.62,"c":50,"d":55.62,"e":55.62,"f":27.78,"g":55.62,"h":55.62,"i":22.22,"j":22.22,"k":50,"l":22.22,"m":83.3,"n":55.62,"o":55.62,"p":55.62,"q":55.62,"r":33.3,"s":50,"t":27.78,"u":55.62,"v":50,"w":72.22,"x":50,"y":50,"z":50,"{":33.4,"|":25.98,"}":33.4,"~":58.4,"’":22.22,"‘":22.22,"“":33.3,"”":33.3,"–":55.62,"—":100,"…":100,"é":55.62,"è":55.62,"ü":55.62,"ö":55.62,"ä":55.62,"×":58.4,"€":55.62,"£":55.62,"→":100};
const AVG = 55.62; // unknown characters count as a digit-width glyph

const px = (text, size) => [...String(text)].reduce((s, ch) => s + (W[ch] ?? AVG), 0) * size / 100;
const TITLE_MAX = 580;
const DESC_MAX = 1000;
const titlePx = (t) => Math.round(px(t, 20));
const descPx = (d) => Math.round(px(d, 14));

function check(title, desc) {
  const out = [];
  if (title != null) { const w = titlePx(title); out.push({ what: 'title', px: w, max: TITLE_MAX, ok: w <= TITLE_MAX }); }
  if (desc != null) { const w = descPx(desc); out.push({ what: 'description', px: w, max: DESC_MAX, ok: w <= DESC_MAX }); }
  return out;
}

module.exports = { px, titlePx, descPx, check, TITLE_MAX, DESC_MAX };

if (require.main === module) {
  const [title, desc] = process.argv.slice(2);
  if (title == null) { console.error('usage: node scripts/seo-length.js "<title>" ["<description>"]'); process.exit(2); }
  const res = check(title, desc);
  for (const r of res) console.log(`${r.ok ? 'ok  ' : 'OVER'} ${r.what}: ${r.px}px (max ${r.max})`);
  process.exit(res.every((r) => r.ok) ? 0 : 1);
}
