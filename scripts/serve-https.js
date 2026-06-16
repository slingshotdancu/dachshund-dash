const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.resolve(__dirname, '..');
const certDir = path.join(root, '.cert');
const port = Number(process.env.PORT || 8443);
const host = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function send(res, code, body, headers = {}) {
  res.writeHead(code, { 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}

function resolvePath(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const requested = clean === '/' ? '/index.html' : clean;
  const filePath = path.normalize(path.join(root, requested));
  if (!filePath.startsWith(root)) return null;
  return filePath;
}

const server = https.createServer(
  {
    key: fs.readFileSync(path.join(certDir, 'key.pem')),
    cert: fs.readFileSync(path.join(certDir, 'cert.pem')),
  },
  (req, res) => {
    const filePath = resolvePath(req.url);
    if (!filePath) return send(res, 403, 'Forbidden');

    let finalPath = filePath;
    if (fs.existsSync(finalPath) && fs.statSync(finalPath).isDirectory()) {
      finalPath = path.join(finalPath, 'index.html');
    }
    if (!fs.existsSync(finalPath)) {
      return send(res, 404, 'Not found');
    }

    const ext = path.extname(finalPath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(finalPath).pipe(res);
  }
);

server.listen(port, host, () => {
  console.log(`Dachshund Dash HTTPS server running at https://localhost:${port}`);
});
