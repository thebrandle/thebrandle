"""Copies the built site into a deploy folder: every page and file the site serves, and from assets/ only the files a
page, stylesheet or script refers to (assets/ also holds drafts, logo options and old captures that never ship).
usage: python3 src/export.py <target dir>   (the target's own files outside these paths are left alone)"""
import glob, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
out = sys.argv[1]
SKIP = {'assets', '.DS_Store', '__pycache__'}

texts = [f for f in glob.glob('**/*', recursive=True) if os.path.isfile(f) and not f.startswith(('src/', 'assets/'))
         and f.endswith(('.html', '.css', '.js', '.txt', '.xml', '.json'))]
texts += [f for f in glob.glob('assets/**/*.json', recursive=True)]
refs = set()
for f in texts:
    refs.update(m.rstrip('.') for m in re.findall(r'assets/[A-Za-z0-9_./-]+', open(f, errors='ignore').read()))
dirs = tuple(r for r in refs if r.endswith('/'))   # a folder named in code, e.g. the camel's frame sequence

# what the build itself reads (data files, logo marks, the art the pages inline, the blog card stickers): the live
# repo is where the site is built from now, by hand and by the blog routine, so these ship too
BUILD = ('assets/logos/', 'assets/blog/logos/', 'assets/mock/', 'assets/art/', 'assets/logo-sticker.svg')

def ships(f):
    return f in refs or f.startswith(dirs) or f.endswith('.json') or (f.startswith(BUILD) and f.endswith(('.json', '.svg')))

n = 0
for top in os.listdir('.'):
    if top in SKIP or top.startswith('.'):
        continue
    dst = os.path.join(out, top)
    if os.path.isdir(top):
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(top, dst)
    else:
        shutil.copy2(top, dst)
for f in glob.glob('assets/**/*', recursive=True):
    if os.path.isfile(f) and ships(f):
        os.makedirs(os.path.dirname(os.path.join(out, f)), exist_ok=True)
        shutil.copy2(f, os.path.join(out, f)); n += 1
missing = sorted(r for r in refs if not r.endswith('/') and not os.path.exists(r) and '.' in r.rsplit('/', 1)[-1])
print(f'copied the site and {n} asset files to {out}')
if missing:
    print('referenced but missing:', *missing[:20], sep='\n  ')
