'use strict';
// Syntax-check every JS file and verify index.html only references files that exist.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
function walk(dir, out) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', '.git', '.vercel'].includes(f.name)) continue;
        const p = path.join(dir, f.name);
        if (f.isDirectory()) walk(p, out); else if (f.name.endsWith('.js')) out.push(p);
    }
    return out;
}
let bad = 0;
for (const f of walk(ROOT, [])) {
    const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    if (r.status !== 0) { bad++; console.error('SYNTAX ERROR in ' + path.relative(ROOT, f) + '\n' + r.stderr); }
}
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const m of html.matchAll(/<script[^>]+src="(?!https?:)([^"]+)"/g)) {
    if (!fs.existsSync(path.join(ROOT, m[1]))) { bad++; console.error('index.html references a missing file: ' + m[1]); }
}
console.log(bad ? bad + ' problem(s) found' : 'All JS files OK');
process.exit(bad ? 1 : 0);
