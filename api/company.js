/**
 * GET  /api/company      → ambil profil perusahaan
 * PUT  /api/company      → simpan profil perusahaan (admin only)
 */
const { readDB, writeDB, sendJSON, parseBody } = require('./_db');

module.exports = async (req, res) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const db = readDB();

  if (req.method === 'GET') {
    return sendJSON(res, 200, { success: true, data: db.company });
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);
    db.company = { ...db.company, ...body };
    writeDB(db);
    return sendJSON(res, 200, { success: true, data: db.company });
  }

  return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
};
