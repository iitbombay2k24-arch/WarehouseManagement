'use strict';
// Local static server that applies the SAME security headers as production (from vercel.json),
// so CSP problems show up during development. Usage: node scripts/serve.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.argv[2] || process.env.PORT || 5173);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
// Never served (also excluded from deployment by .vercelignore).
const BLOCKED = /^\/(\.|node_modules\/|tests\/|scripts\/|package(-lock)?\.json|task\.md|vercel\.json|firestore\.rules|database\.rules\.json)/i;

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const rules = (cfg.headers || []).map(r => ({ re: new RegExp('^' + r.source.replace(/\(\.\*\)/g, '.*') + '$'), headers: r.headers }));
// Local dev is plain http, so HSTS is skipped.
function headersFor(url) { const h = {}; rules.forEach(r => { if (r.re.test(url)) r.headers.forEach(x => { if (x.key !== 'Strict-Transport-Security') h[x.key] = x.value; }); }); return h; }

http.createServer((req, res) => {
    let url;
    try { url = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end('Bad request'); }
    if (url === '/') url = '/index.html';
    const file = path.normalize(path.join(ROOT, url));
    const send = (code, body, extra) => { res.writeHead(code, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, headersFor(url), extra)); res.end(body); };
    if (!file.startsWith(ROOT + path.sep) || BLOCKED.test(url)) return send(404, 'Not found');
    fs.stat(file, (err, st) => {
        if (err || !st.isFile()) return send(404, 'Not found');
        res.writeHead(200, Object.assign({ 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }, headersFor(url)));
        fs.createReadStream(file).pipe(res);
    });
}).listen(PORT, () => console.log('Namkeen WMS running at http://localhost:' + PORT + '  (production security headers enabled)'));
