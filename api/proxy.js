const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).send('Bad Request: Missing target URL');
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      },
    });
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
};
