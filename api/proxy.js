module.exports = async (req, res) => {
  const nightscoutUrl = process.env.NIGHTSCOUT_URL;
  const nightscoutToken = process.env.NIGHTSCOUT_TOKEN;

  if (!nightscoutUrl || !nightscoutToken) {
    return res.status(500).json({ error: 'NIGHTSCOUT_URL and NIGHTSCOUT_TOKEN env vars are required' });
  }

  // Normalize: strip trailing slash
  const base = nightscoutUrl.replace(/\/$/, '');

  // Extract the raw query string from the request URL, preserving bracket syntax
  const rawQuery = req.url.includes('?') ? req.url.split('?')[1] : '';

  // Append token to the query string (template literal to avoid bracket encoding issues)
  const upstreamUrl = `${base}/api/v1/entries?${rawQuery}&token=${nightscoutToken}`;

  try {
    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
    }
    const data = await upstream.json();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
