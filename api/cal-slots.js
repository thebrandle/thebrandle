const CAL_API_BASE    = 'https://api.cal.com/v2';
const CAL_API_VERSION = '2024-09-04';

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.CAL_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'CAL_API_KEY is not configured' });

  // Forward all query params straight to Cal.com
  const upstream = new URL(`${CAL_API_BASE}/slots`);
  for (const [k, v] of Object.entries(req.query)) {
    upstream.searchParams.set(k, v);
  }

  try {
    const calRes = await fetch(upstream.toString(), {
      headers: {
        Authorization:     `Bearer ${apiKey}`,
        'cal-api-version': CAL_API_VERSION,
        'Content-Type':    'application/json',
      },
    });

    const data = await calRes.json();
    if (!calRes.ok) return res.status(calRes.status).json({ error: 'Cal.com API error', detail: data });

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (err) {
    console.error('cal-slots error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
