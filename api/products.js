import fs from 'fs';
import path from 'path';

let inMemoryStore = null;

// Cloud KV Store Support (Vercel KV / Upstash Redis) for multi-device sync
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function getFromKV() {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/adah_master_products`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.result) {
        return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      }
    }
  } catch (e) {}
  return null;
}

async function setToKV(data) {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const res = await fetch(`${KV_URL}/set/adah_master_products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.stringify(data))
    });
    return res.ok;
  } catch (e) {}
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const filePath = path.join(process.cwd(), 'data', 'products.json');

  if (req.method === 'GET') {
    // 1. Check Cloud KV first (shared across all laptops & devices worldwide)
    const kvData = await getFromKV();
    if (Array.isArray(kvData)) {
      inMemoryStore = kvData;
      return res.status(200).json(kvData);
    }

    // 2. In-memory cache
    if (inMemoryStore) {
      return res.status(200).json(inMemoryStore);
    }

    // 3. Fallback to static data/products.json
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        inMemoryStore = Array.isArray(data) ? data : [];
        return res.status(200).json(inMemoryStore);
      } catch (e) {}
    }
    return res.status(200).json([]);
  }

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (Array.isArray(data)) {
        inMemoryStore = data;

        // Persist to Cloud KV
        await setToKV(data);

        // Attempt filesystem write (works in local dev)
        try {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) {}

        return res.status(200).json({ status: 'ok', count: data.length });
      }
      return res.status(400).json({ error: 'Body must be an array of products' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
