"""Tells Bing (and the other IndexNow engines) which pages changed, so they recrawl now instead of in weeks.

usage: python3 src/indexnow.py                 every URL in the live sitemap
       python3 src/indexnow.py /blog/<slug>/    just these paths
The key file sits at the site root (KEY.txt below); it must stay deployed or the pings are ignored.
"""
import json, re, sys, urllib.request

KEY = '5f2a9c71d04e4b8ab6e3c19f7d82e046'
HOST = 'www.thebrandle.com'
urls = [f'https://{HOST}{p}' for p in sys.argv[1:]] or re.findall(
    r'<loc>([^<]+)</loc>', urllib.request.urlopen(f'https://{HOST}/sitemap.xml').read().decode())
body = json.dumps({'host': HOST, 'key': KEY, 'keyLocation': f'https://{HOST}/{KEY}.txt', 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', body, {'Content-Type': 'application/json; charset=utf-8'})
with urllib.request.urlopen(req) as r:
    print(f'indexnow: {r.status} for {len(urls)} URLs')   # 200 or 202 means accepted
