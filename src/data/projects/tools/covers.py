"""Cover scenes for the project pages, made from the same four display renders as assets/mock (functions taken from
the vault's mock_scenes.py): 16:9 crops for the full-height cover, and portrait scenes in new backdrop colours.
usage: python3 covers.py <renders dir> <assets/mock dir>      writes cover-*.webp, xdr-*-portrait.webp and covers.json"""
import colorsys, json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
src, out = Path(sys.argv[1]), Path(sys.argv[2])
SCREEN = {'xdr-orange': (759, 320, 3971, 2127), 'studio-dark': (1271, 1035, 3725, 2439), 'studio-white': (975, 438, 4019, 1958), 'concrete': (762, 544, 1916, 1205)}
PORTRAIT = {'xdr-orange': (518, 4218, 1150, 1400)}
TOP = {'xdr-orange': 0, 'studio-dark': 560, 'concrete': 330, 'studio-white': 250}      # first row kept in the 16:9 crop

def carry_on(a, top, bottom):
    rng = np.random.default_rng(7)
    def band(edge_rows, n, away_down):
        edge = edge_rows.astype(np.float32)
        line = np.asarray(Image.fromarray(edge.mean(0, keepdims=True).clip(0, 255).astype(np.uint8)).resize((edge.shape[1], 1)).filter(ImageFilter.GaussianBlur(40))).astype(np.float32)
        grain = float(np.std(edge - edge.mean(0, keepdims=True)))
        fall = np.linspace(1, 0.9, n, dtype=np.float32)[:, None, None]
        return np.repeat(line, n, 0) * (fall if away_down else fall[::-1]) + rng.normal(0, grain, (n, edge.shape[1], 1)).astype(np.float32)
    return np.concatenate([band(a[:24], top, False), a.astype(np.float32), band(a[-24:], bottom, True)]).clip(0, 255).astype(np.uint8)

def to_hue(a, hex_colour):
    r, g, b = [int(hex_colour[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    th, ts, tv = colorsys.rgb_to_hsv(r, g, b)
    hsv = np.asarray(Image.fromarray(a).convert('HSV')).astype(np.float32)
    k = np.clip((hsv[..., 1] / 255 - 0.30) / 0.25, 0, 1)[..., None]
    hsv[..., 0] = th * 255
    hsv[..., 1] = np.clip(hsv[..., 1] * ts / 0.75, 0, 255)
    hsv[..., 2] = np.clip(hsv[..., 2] * tv / 0.93, 0, 255)
    swapped = np.asarray(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')).astype(np.float32)
    return (a.astype(np.float32) * (1 - k) + swapped * k).clip(0, 255).astype(np.uint8)

def scene(name, shape, tint, tag):
    a = np.asarray(Image.open(src / f'{name}.jpg').convert('RGB')).copy()
    x0, y0, x1, y1 = SCREEN[name]
    a[y0:y1, x0:x1] = 0
    if name == 'studio-white': a = (a.astype(np.float32) * np.array([1.0, 0.972, 0.948])).clip(0, 255).astype(np.uint8)
    if tint: a = to_hue(a, tint)
    if shape == 'portrait':
        cx0, cx1, top, bottom = PORTRAIT[name]
        a = carry_on(a[:, cx0:cx1], top, bottom)
        x0, x1, y0, y1 = x0 - cx0, x1 - cx0, y0 + top, y1 + top
        size, file = (900, 1350), f'{tag}-portrait.webp'
    else:
        if name == 'xdr-orange':                                   # the backdrop is carried on sideways, so the whole stand shows and the floor leaves room for the title
            pad = (round(a.shape[0] * 16 / 9) - a.shape[1]) // 2
            a = carry_on(a.transpose(1, 0, 2), pad, pad).transpose(1, 0, 2); x0, x1 = x0 + pad, x1 + pad
        t = TOP[name]; hh = min(a.shape[0] - t, round(a.shape[1] * 9 / 16))
        a = a[t:t + hh]; y0, y1 = y0 - t, y1 - t
        size, file = (1920, 1080), f'cover-{tag}.webp'
    h, w = a.shape[:2]
    Image.fromarray(a).resize(size, Image.LANCZOS).save(out / file, quality=80, method=6)
    return file, {'x': round(100 * x0 / w, 3), 'y': round(100 * y0 / h, 3), 'w': round(100 * (x1 - x0) / w, 3), 'h': round(100 * (y1 - y0) / h, 3)}

TINTS = {'blue': '#1f6fb0', 'red': '#d0182f', 'orange': None, 'honey': '#e39a1b', 'cobalt': '#2f3df5', 'ink': '#3a3a3a', 'indigo': '#3d2bb0', 'teal': '#0f7a7a'}
rects = {}
for tag, tint in TINTS.items():
    f, r = scene('xdr-orange', 'wide', tint, tag); rects[f] = r
    if tag not in ('blue', 'red', 'orange'):
        f, r = scene('xdr-orange', 'portrait', tint, f'xdr-{tag}'); rects[f] = r
for name in ('studio-dark', 'concrete', 'studio-white'):
    f, r = scene(name, 'wide', None, name); rects[f] = r
(out / 'covers.json').write_text(json.dumps(rects, indent=1))
for f, r in rects.items(): print(f, r, (out / f).stat().st_size // 1024, 'KB')
