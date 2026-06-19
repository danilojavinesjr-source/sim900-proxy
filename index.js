const http = require('http');
const https = require('https');
const url = require('url');

// ⚠️ Replace with your own Google Apps Script web app URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5pavCAqZyfHR0DCuBErV5am4r0__UlXJODiEcv4r8esACnDwGIIzxEBBqhdtti_bT/exec';

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('Forwarding POST:', body);

      const parsedUrl = url.parse(APPS_SCRIPT_URL);
      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const proxyReq = https.request(options, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', err => {
        console.error('Proxy error:', err);
        res.writeHead(502);
        res.end('Proxy error');
      });

      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Proxy listening on port', PORT));
