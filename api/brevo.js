export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { prenom, email } = req.body || {};
  if (!prenom || !email) return res.status(400).json({ error: 'Champs manquants' });

  // La clé est lue depuis les variables d'environnement Vercel
  // Elle n'apparaît JAMAIS dans le code
  const API_KEY = process.env.BREVO_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'Clé API manquante' });

  try {
    const r = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': API_KEY
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
    return res.status(500).json({ error: err.message });
  }
}
