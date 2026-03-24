const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  // Allow CORS for Framer fetch requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Support both Framer field names (Title Case) and our own (camelCase)
  const name = body['Name'] || body['name'] || '';
  const email = body['E-mail'] || body['email'] || body['Email'] || '';
  const phone = body['Phone'] || body['phone'] || '';
  const message = body['Message'] || body['message'] || '';
  const plan = body['Plan'] || body['plan'] || '';

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields: Name and E-mail are required' });
  }

  try {
    await resend.emails.send({
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

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
