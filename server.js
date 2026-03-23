const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(ROOT, urlPath);

  const tryServe = (fp) => {
    try {
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) {
        // Try index.html in the directory
        const indexPath = path.join(fp, 'index.html');
        if (fs.existsSync(indexPath)) return tryServe(indexPath);
        return false;
      }
      const ext = path.extname(fp).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(fp).pipe(res);
      console.log(`200 ${req.url}`);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Try serving the exact file first
  if (tryServe(filePath)) return;

  // For SPA routes: detect if this is a "page" route (no extension) under the site folder
  const ext = path.extname(urlPath);
  if (!ext || ext === '') {
    // Try to find the site's index.html by going up to find the nearest one
    // Pattern: /thebrandle.framer.website/about -> serve /thebrandle.framer.website/index.html
    const parts = urlPath.split('/').filter(Boolean);
    for (let i = parts.length; i >= 1; i--) {
      const siteDir = path.join(ROOT, ...parts.slice(0, i));
      const indexPath = path.join(siteDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexPath).pipe(res);
        console.log(`200 (SPA fallback) ${req.url} -> ${indexPath}`);
        return;
      }
    }
  }

  // 404
  console.log(`404 ${req.url}`);
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Root: ${ROOT}`);
});
