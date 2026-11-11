"""Turns the page captures into the project pages' media (assets/work, add only):
  <slug>-s1..s5.webp   16:9 stills, 1440x810            <slug>-p1..p4.webp  phone captures, 585x1266
  <slug>-w0..wN.webp   960x540 screen frames (only for projects that had none)     <slug>-tablet.webp (client cards)
  og-<slug>.jpg        1200x630 share image: the cover scene with the site on its screen
usage: python3 assets.py"""
import io, json
from pathlib import Path
from PIL import Image
S = Path('/private/tmp/claude-501/-Users-muteebmehraj-friday/17715871-5201-4613-a10e-c7f626b2e328/scratchpad')
ROOT = Path('/Users/muteebmehraj/friday/projects/brandle-two26')
OUT = ROOT / 'assets' / 'work'
covers = json.loads((ROOT / 'assets/mock/covers.json').read_text())
# slug: (folder of wide captures, stills picked, screen frames to make or None, cover tag)
JOBS = {
  'sameticket': ('shots', [1, 3, 6, 8, 10], None, 'blue'),
  'limonaia': ('shots', [1, 3, 5, 6, 9], None, 'concrete'),
  'bezier': ('shots', [2, 3, 6, 8, 9], None, 'cobalt'),
  'rotonda': ('shots', [1, 3, 5, 6, 8], None, 'red'),
  'sunwise': ('shots', [1, 3, 4, 5, 9], None, 'orange'),
  'tideline': ('shots', [1, 2, 5, 6, 9], None, 'studio-dark'),
  'soznikar': ('build/work/cap', [4, 6, 7, 8, 0], [0, 5, 6, 7, 8], 'ink'),
  'pawsword': ('build/work/cap', [1, 2, 3, 5, 6], [0, 1, 2, 3, 4, 5, 6, 7], 'honey'),
  'bellow': ('build/work/cap', [2, 3, 6, 7, 5], [0, 1, 2, 3, 4, 5, 6, 7], 'studio-dark'),
  'voice-and-data-resale': ('build/work/cap', [1, 2, 4, 5, 7], [0, 1, 2, 4, 5, 7, 8], 'teal'),
  'storage-hire': ('build/work/cap', [2, 4, 6, 7, 8], [0, 2, 4, 5, 6, 7, 8], 'indigo'),
}

def save(im, file, limit, q=80):
    """webp under the size limit: quality steps down until it fits"""
    while True:
        b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
        if b.tell() <= limit * 1024 or q <= 40: break
        q -= 6
    (OUT / file).write_bytes(b.getvalue()); return b.tell() // 1024

for slug, (folder, stills, frames, tag) in JOBS.items():
    wide = lambda k: Image.open(S / folder / f'{slug}-w{k:02d}.jpg').convert('RGB')
    sizes = [save(wide(k), f'{slug}-s{i + 1}.webp', 120) for i, k in enumerate(stills)]
    for i in range(1, 5):
        sizes.append(save(Image.open(S / 'build/work/cap2' / f'{slug}-p{i}.jpg').convert('RGB').resize((585, 1266), Image.LANCZOS), f'{slug}-p{i}.webp', 90))
    if frames:
        for i, k in enumerate(frames): save(wide(k).resize((960, 540), Image.LANCZOS), f'{slug}-w{i}.webp', 70, 78)
    t = S / 'build/work/cap2' / f'{slug}-tablet.jpg'
    if t.exists(): save(Image.open(t).convert('RGB').resize((834, 1290), Image.LANCZOS), f'{slug}-tablet.webp', 110)
    # share image
    r = covers[f'cover-{tag}.webp']
    c = Image.open(ROOT / 'assets/mock' / f'cover-{tag}.webp').convert('RGB')
    x, y, w, h = [round(v) for v in (r['x'] * 19.2, r['y'] * 10.8, r['w'] * 19.2, r['h'] * 10.8)]
    shot = Image.open(OUT / f'{slug}-w0.webp').convert('RGB')
    sw = w; sh = round(w * 9 / 16)                                  # cover the screen from the top, like the page does
    c.paste(shot.resize((sw, sh), Image.LANCZOS).crop((0, 0, w, h)) if sh >= h else shot.resize((round(h * 16 / 9), h), Image.LANCZOS).crop((0, 0, w, h)), (x, y))
    c = c.resize((1200, 675), Image.LANCZOS).crop((0, 22, 1200, 652))
    c.save(OUT / f'og-{slug}.jpg', quality=82, optimize=True)
    print(slug, sizes, 'KB')
