/**
 * Opinly content webhook (Svix-signed).
 *
 * Payload: { type: "content.paths-invalidated", data: { paths: ["/blog/x", ...] } }
 *
 * This site is pre-rendered static HTML with no ISR/route cache, so there is
 * nothing to revalidatePath() against. The equivalent invalidation is a
 * redeploy: Vercel rebuilds, scripts/gen-opinly-blog.js re-fetches from Opinly,
 * and the affected pages are regenerated.
 *
 * Env:
 *   SVIX_WEBHOOK_SECRET      required - signing secret from the Opinly portal
 *   VERCEL_DEPLOY_HOOK_URL   optional - Vercel Deploy Hook; without it the
 *                            request is verified and logged but no rebuild fires
 */
const { Webhook } = require('svix');

/** Collect the raw request body - Svix must verify the exact bytes sent. */
function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.SVIX_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[opinly-webhook] SVIX_WEBHOOK_SECRET is not set');
    // fail closed: never accept unverified webhooks
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let body;
  try {
    body = await rawBody(req);
  } catch (err) {
    console.error('[opinly-webhook] could not read body:', err.message);
    return res.status(400).json({ error: 'Invalid body' });
  }

  let event;
  try {
    event = new Webhook(secret).verify(body, {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });
  } catch (err) {
    console.error('[opinly-webhook] signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const paths = (event && event.data && Array.isArray(event.data.paths)) ? event.data.paths : [];
  console.log(`[opinly-webhook] ${event && event.type} - ${paths.length} path(s): ${paths.join(', ') || '(none)'}`);

  // Static site: invalidation == regenerate + redeploy.
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    console.warn('[opinly-webhook] VERCEL_DEPLOY_HOOK_URL not set - verified but no rebuild triggered');
    return res.status(200).json({ ok: true, paths, rebuild: 'skipped (no deploy hook configured)' });
  }

  try {
    const r = await fetch(hook, { method: 'POST' });
    if (!r.ok) throw new Error(`deploy hook responded ${r.status}`);
    console.log('[opinly-webhook] rebuild triggered');
    return res.status(200).json({ ok: true, paths, rebuild: 'triggered' });
  } catch (err) {
    // 200 on purpose: the event was valid and accepted. Returning non-2xx
    // would make Svix retry a webhook we have already processed.
    console.error('[opinly-webhook] deploy hook failed:', err.message);
    return res.status(200).json({ ok: true, paths, rebuild: 'failed', detail: err.message });
  }
}

// Raw body required for signature verification
handler.config = { api: { bodyParser: false } };

module.exports = handler;
