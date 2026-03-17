export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { prenom, email } = req.body || {};
  if (!prenom || !email) return res.status(400).json({ error: 'Champs manquants' });

  try {
    const r = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': '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'
      },
      body: JSON.stringify({
        email,
        attributes: {
          PRENOM: prenom,
          SOURCE: 'Popup Guide Schneider Legrand',
          DATE_INSCRIPTION: new Date().toISOString().split('T')[0]
        },
        listIds: [6],
        updateEnabled: true
      })
    });

    const text = await r.text();
    console.log('Brevo:', r.status, text);
    return res.status(200).json({ ok: true, status: r.status });

  } catch(err) {
    console.error('Brevo error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
