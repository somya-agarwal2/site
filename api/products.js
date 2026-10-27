import fs from 'fs';
import path from 'path';

let inMemoryStore = null;

function isOldSample(item) {
  if (!item || !item.id) return false;
  const id = String(item.id).toUpperCase().trim();
  const prefixes = ['AJ-E50-', 'AJ-E60-', 'AJ-E100-', 'AJ-E120-', 'AJ-P120-', 'AJ-B120-', 'AJ-R120-', 'AJ-S50-'];
  if (prefixes.some(p => id.startsWith(p)) || id === 'AJ-ADM-01' || id === 'AJ-ROYAL-01' || id === 'AJ-NEW-01') {
    return true;
  }
  return false;
}

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
      return res.status(200).json(inMemoryStore.filter(p => !isOldSample(p)));
    }
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        inMemoryStore = Array.isArray(data) ? data.filter(p => !isOldSample(p)) : [];
        return res.status(200).json(inMemoryStore);
      } catch (e) {}
    }
    return res.status(200).json([]);
  }

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (Array.isArray(data)) {
        const cleanData = data.filter(p => !isOldSample(p));
        inMemoryStore = cleanData;
        try {
          fs.writeFileSync(filePath, JSON.stringify(cleanData, null, 2), 'utf8');
        } catch (e) {
          // Fallback to in-memory in serverless read-only environment
        }
        return res.status(200).json({ status: 'ok', count: cleanData.length });
      }
      return res.status(400).json({ error: 'Body must be an array of products' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
