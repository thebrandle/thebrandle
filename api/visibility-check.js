const { audit } = require('./_lib/ai-visibility');

/**
 * GET /api/visibility-check?domain=example.com
 *
 * Wraps api/_lib/ai-visibility.js. The audit does four outbound fetches against
 * a domain the caller names, so this endpoint is rate limited and refuses
 * anything that is not a public hostname - otherwise it is an open proxy for
 * probing private networks.
 */

// Per-instance, best effort. Vercel spreads traffic across instances so this is
// a brake on one abusive client, not a global quota. Good enough for a free tool.
const HITS = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

function limited(ip) {
  const now = Date.now();
  const hits = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  HITS.set(ip, hits);
  if (HITS.size > 5000) for (const [k, v] of HITS) if (!v.some((t) => now - t < WINDOW_MS)) HITS.delete(k);
  return hits.length > MAX_PER_WINDOW;
}

const BLOCKED_HOST = /^(localhost$|.*\.local$|.*\.internal$|\d+\.\d+\.\d+\.\d+$|\[)/i;

function normalise(raw) {
  let d = String(raw || '').trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
  if (!d) throw new Error('Enter a domain, for example yourcompany.com');
  if (BLOCKED_HOST.test(d)) throw new Error('That is not a public domain.');
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(d)) {
    throw new Error('That does not look like a domain. Try yourcompany.com');
  }
  if (d.length > 253) throw new Error('That domain is too long.');
  return d;
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Use GET.' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (limited(ip)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(429).json({ error: 'Too many checks. Wait a minute and try again.' });
  }

  let domain;
  try {
    const q = req.query?.domain ?? new URL(req.url, 'https://x').searchParams.get('domain');
    domain = normalise(q);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).json({ error: e.message });
  }

  try {
    const result = await audit(domain);
    return res.status(200).json(result);
  } catch (e) {
    console.error('visibility-check failed for', domain, e);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Could not reach that domain. Check the spelling and try again.' });
  }
}

module.exports = handler;
