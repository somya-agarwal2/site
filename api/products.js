import fs from 'fs';
import path from 'path';

let inMemoryStore = null;

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const filePath = path.join(process.cwd(), 'data', 'products.json');

  if (req.method === 'GET') {
    if (inMemoryStore) {
      return res.status(200).json(inMemoryStore);
    }
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
        try {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) {
          // Fallback to in-memory in serverless read-only environment
        }
        return res.status(200).json({ status: 'ok', count: data.length });
      }
      return res.status(400).json({ error: 'Body must be an array of products' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
