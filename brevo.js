// api/brevo.js — Vercel Serverless Function
// Cette fonction tourne côté SERVEUR — la clé API n'est jamais exposée au navigateur

export default async function handler(req, res) {
  // CORS — autoriser les requêtes depuis le site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pré-requête OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prenom, email } = req.body;

  if (!prenom || !email) {
    return res.status(400).json({ error: 'Prénom et email requis' });
  }

  const BREVO_API_KEY = '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';
  const BREVO_LIST_ID = 6;
  const TEMPLATE_ID   = 1; // ← à mettre à jour quand le template Brevo est créé

  try {
    // ── 1. Créer / mettre à jour le contact ────────────────────────
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: {
          PRENOM: prenom,
          SOURCE: 'Popup Guide Schneider Legrand',
          SITE: 'sitejj.vercel.app',
          DATE_INSCRIPTION: new Date().toISOString().split('T')[0],
        },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    const contactData = await contactRes.json().catch(() => ({}));
    console.log('Brevo contact:', contactRes.status, contactData);

    // ── 2. Envoyer l'email de bienvenue (template) ─────────────────
    if (contactRes.ok || contactRes.status === 204) {
      const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
          to: [{ email, name: prenom }],
          templateId: TEMPLATE_ID,
          params: {
            PRENOM: prenom,
            GUIDE_URL: 'https://sitejj.vercel.app/guide-schneider-legrand.pdf',
          },
        }),
      }).catch(() => null);

      if (emailRes) {
        const emailData = await emailRes.json().catch(() => ({}));
        console.log('Brevo email:', emailRes.status, emailData);
      }
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Brevo error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
