/* The Brandle on Cloudflare: one Worker serves the built site (static files in this repo) and the two endpoints.
   Pages are served from <path>/index.html without redirecting, like Vercel did; redirects come from vercel.json, which
   build.py writes (the file keeps its name so the build stays unchanged). Files with an extension (css, js, images,
   fonts) never reach this code: wrangler.jsonc sends them straight to the static assets. */
import config from '../vercel.json';
import { audit } from '../api/_lib/ai-visibility.js';

const WWW = 'www.thebrandle.com';
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex', ...headers } });

// vercel.json sources: ":name*" (rest of path), ":name(regex)", ":name"; optional "has" host condition
const REDIRECTS = config.redirects.map((r) => {
  const src = '^' + r.source.replace(/[.^$|\\]/g, '\\$&')   // escape literal dots; keep the (regex) parts as written
    .replace(/:(\w+)\*/g, '(?<$1>.*)')
    .replace(/:(\w+)\(([^)]+)\)/g, '(?<$1>$2)')
    .replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$';
  const host = (r.has || []).find((h) => h.type === 'host');
  return { re: new RegExp(src), to: r.destination, host: host && host.value, code: r.permanent === false ? 302 : 301 };
});

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* POST /api/contact: the site's forms. JSON {name, email, phone, plan, message}; form posts also accepted. */
async function contact(request, env) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);
  let f = {};
  try {
    const type = request.headers.get('content-type') || '';
    f = type.includes('form') ? Object.fromEntries(await request.formData()) : await request.json();
  } catch { f = {}; }
  const name = f.Name || f.name || '', email = f['E-mail'] || f.email || f.Email || '';
  const phone = f.Phone || f.phone || '', plan = f.Plan || f.plan || '', message = f.Message || f.message || '';
  if (!name || !email) return json({ error: 'Missing required fields: Name and E-mail are required' }, 400, cors);
  if (!env.RESEND_API_KEY) return json({ error: 'Server misconfiguration: missing API key' }, 500, cors);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'The Brandle <noreply@thebrandle.com>', to: 'thebrandleteam@gmail.com', reply_to: email,
      subject: `New Contact Form Submission from ${name}`,
      // everything a visitor typed is escaped: the email is HTML
      html: `<h2>New Contact Form Submission</h2><p><strong>Name:</strong> ${esc(name)}</p><p><strong>Email:</strong> ${esc(email)}</p>`
        + `<p><strong>Phone:</strong> ${esc(phone) || 'Not provided'}</p><p><strong>Plan Selected:</strong> ${esc(plan) || 'Not selected'}</p>`
        + `<p><strong>Message:</strong></p><p>${esc(message).replace(/\n/g, '<br>') || '(no message)'}</p>`,
    }),
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) { console.error('Resend error', r.status, JSON.stringify(out)); return json({ error: 'Failed to send email', detail: out.message }, 500, cors); }
  return json({ success: true, id: out.id }, 200, cors);
}

/* GET /api/visibility-check?domain=example.com: the free AI-visibility tool (tools/ai-visibility). */
const HITS = new Map();   // per isolate, best effort: a brake on one abusive client, not a global quota
const BLOCKED_HOST = /^(localhost$|.*\.local$|.*\.internal$|\d+\.\d+\.\d+\.\d+$|\[)/i;
async function visibility(request) {
  if (request.method !== 'GET') return json({ error: 'Use GET.' }, 405, { Allow: 'GET' });
  const ip = request.headers.get('cf-connecting-ip') || 'unknown', now = Date.now();
  const hits = (HITS.get(ip) || []).filter((t) => now - t < 60000); hits.push(now); HITS.set(ip, hits);
  if (hits.length > 8) return json({ error: 'Too many checks. Wait a minute and try again.' }, 429, { 'Cache-Control': 'no-store' });
  let d = String(new URL(request.url).searchParams.get('domain') || '').trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
  const bad = !d ? 'Enter a domain, for example yourcompany.com' : BLOCKED_HOST.test(d) ? 'That is not a public domain.'
    : !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(d) ? 'That does not look like a domain. Try yourcompany.com'
    : d.length > 253 ? 'That domain is too long.' : '';
  if (bad) return json({ error: bad }, 400, { 'Cache-Control': 'no-store' });
  try { return json(await audit(d), 200, { 'Cache-Control': 'public, max-age=300' }); }
  catch (e) { console.error('visibility-check failed for', d, e); return json({ error: 'Could not reach that domain. Check the spelling and try again.' }, 502, { 'Cache-Control': 'no-store' }); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'thebrandle.com') return Response.redirect(`https://${WWW}${url.pathname}${url.search}`, 301);   // one canonical host
    const path = url.pathname;
    if (path === '/api/contact') return contact(request, env);
    if (path === '/api/visibility-check') return visibility(request);
    if (path.startsWith('/api/')) return json({ error: 'Not found' }, 404);
    for (const r of REDIRECTS) {
      if (r.host && r.host !== url.hostname) continue;
      const m = r.re.exec(path);
      if (!m) continue;
      const to = r.to.replace(/:(\w+)\*?/g, (_, k) => (m.groups && m.groups[k]) || '');
      return Response.redirect(new URL(to, url).toString() + (to.includes('?') ? '' : url.search), r.code);
    }
    // a page lives at <path>/index.html; anything with an extension is a file
    const file = path.endsWith('/') ? path + 'index.html' : /\.[a-z0-9]+$/i.test(path) ? path : path + '/index.html';
    const res = await env.ASSETS.fetch(new Request(new URL(file, url), request));
    if (res.status !== 404) return res;
    const nf = await env.ASSETS.fetch(new Request(new URL('/404.html', url), request));
    return new Response(nf.body, { status: 404, headers: nf.headers });
  },
};
