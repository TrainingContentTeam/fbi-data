// scripts/fetch-fbi.js
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BASE = 'https://api.usa.gov/crime/fbi/cde';
const NIBRS_TYPE = 522;
const FROM = process.env.FROM || '01-2022';
const TO = process.env.TO || '01-2026';
const API_KEY = process.env.FBI_API_KEY;

const OUT_DIR = path.join(__dirname, '..', 'docs');
const OUT_FILE = path.join(OUT_DIR, 'fbi-wmd.json');
const OUT_ERR = path.join(OUT_DIR, 'fbi-wmd-error.json');

if (!API_KEY) {
  console.error('FBI_API_KEY not set');
  process.exit(1);
}

(async () => {
  try {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    const url = `${BASE}/nibrs/national/${NIBRS_TYPE}?type=counts&from=${FROM}&to=${TO}&API_KEY=${API_KEY}`;
    const r = await fetch(url);
    const ct = (r.headers.get('content-type') || '').toLowerCase();

    if (!r.ok || !ct.includes('application/json')) {
      const txt = await r.text();
      fs.writeFileSync(OUT_ERR, JSON.stringify({ status: r.status, body: txt.slice(0,2000) }, null, 2));
      process.exit(2);
    }

    const json = await r.json();
    fs.writeFileSync(OUT_FILE, JSON.stringify(json, null, 2));
    if (fs.existsSync(OUT_ERR)) fs.unlinkSync(OUT_ERR);
  } catch (e) {
    fs.writeFileSync(OUT_ERR, JSON.stringify({ error: String(e) }, null, 2));
    process.exit(3);
  }
})();