const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Parse multipart/form-data from a raw Buffer.
 * Returns an object with field names -> values.
 */
function parseMultipart(buffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
  if (!boundaryMatch) return {};
  const boundary = boundaryMatch[1];
  const body = buffer.toString('latin1');
  const parts = body.split(`--${boundary}`);
  const fields = {};
  for (const part of parts) {
    if (!part || part === '--' || part === '--\r\n') continue;
    const [headerSection, ...valueParts] = part.split('\r\n\r\n');
    if (!headerSection) continue;
    const nameMatch = headerSection.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    // Skip file uploads
    if (headerSection.includes('filename=')) continue;
    const value = valueParts.join('\r\n\r\n').replace(/\r\n$/, '');
    fields[name] = value;
  }
  return fields;
}

/**
 * Parse URL-encoded form data string.
 */
function parseUrlEncoded(bodyStr) {
  const fields = {};
  for (const pair of bodyStr.split('&')) {
    const [k, v] = pair.split('=');
    if (k) {
      fields[decodeURIComponent(k.replace(/\+/g, ' '))] = decodeURIComponent((v || '').replace(/\+/g, ' '));
    }
  }
  return fields;
}

/**
 * Collect the raw request body as a Buffer.
 */
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function handler(req, res) {
  // CORS for Framer fetch requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contentType = req.headers['content-type'] || '';
  let fields = {};

  try {
    const rawBody = await getRawBody(req);
    if (contentType.includes('multipart/form-data')) {
      fields = parseMultipart(rawBody, contentType);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      fields = parseUrlEncoded(rawBody.toString('utf8'));
    } else if (contentType.includes('application/json')) {
      fields = JSON.parse(rawBody.toString('utf8'));
    } else {
      // Try raw body as JSON, fall back to empty
      try {
        fields = JSON.parse(rawBody.toString('utf8'));
      } catch (_) {
        fields = {};
      }
    }
  } catch (e) {
    console.error('Body parse error:', e);
    fields = {};
  }

  // Support both Framer field names (Title Case) and our own (camelCase)
  const name = fields['Name'] || fields['name'] || '';
  const email = fields['E-mail'] || fields['email'] || fields['Email'] || '';
  const phone = fields['Phone'] || fields['phone'] || '';
  const message = fields['Message'] || fields['message'] || '';
  const plan = fields['Plan'] || fields['plan'] || '';

  if (!name || !email) {
    console.error('Missing fields. Received keys:', Object.keys(fields));
    return res.status(400).json({ error: 'Missing required fields: Name and E-mail are required' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
  }

  // Resend SDK v3 returns { data, error } — does NOT throw on failure
  const result = await resend.emails.send({
    from: 'The Brandle <onboarding@resend.dev>',
    to: 'hello@thebrandle.com',
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Plan Selected:</strong> ${plan || 'Not selected'}</p>
      <p><strong>Message:</strong></p>
      <p>${message || '(no message)'}</p>
    `,
  });

  if (result.error) {
    console.error('Resend error:', JSON.stringify(result.error));
    return res.status(500).json({ error: 'Failed to send email', detail: result.error.message });
  }

  return res.status(200).json({ success: true, id: result.data?.id });
}

// Disable Vercel's auto body parsing so we can read the raw stream
handler.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = handler;
