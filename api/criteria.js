/**
 * GET  /api/criteria          → ambil semua kriteria SAW
 * PUT  /api/criteria           → update satu kriteria (by code di body)
 * POST /api/criteria           → tambah kriteria baru
 * DELETE /api/criteria         → hapus kriteria (by code di body)
 */
const { readDB, writeDB, sendJSON, parseBody } = require('./_db');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const db = readDB();

  if (req.method === 'GET') {
    return sendJSON(res, 200, { success: true, data: db.criteria });
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const idx  = db.criteria.findIndex(c => c.code === body.code);
    if (idx === -1) {
      return sendJSON(res, 404, { success: false, message: 'Kriteria tidak ditemukan.' });
    }
    db.criteria[idx] = { ...db.criteria[idx], ...body };
    writeDB(db);
    return sendJSON(res, 200, { success: true, data: db.criteria[idx] });
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.code || !body.name || !body.type) {
      return sendJSON(res, 400, { success: false, message: 'code, name, dan type wajib diisi.' });
    }
    const exists = db.criteria.find(c => c.code === body.code);
    if (exists) {
      return sendJSON(res, 409, { success: false, message: 'Kode kriteria sudah ada.' });
    }
    const newCriteria = {
      id: body.code,
      code: body.code,
      name: body.name,
      type: body.type,
      weight: parseFloat(body.weight) || 0,
      description: body.description || '',
      subCriteria: body.subCriteria || []
    };
    db.criteria.push(newCriteria);
    writeDB(db);
    return sendJSON(res, 201, { success: true, data: newCriteria });
  }

  if (req.method === 'DELETE') {
    const { code } = await parseBody(req);
    const idx = db.criteria.findIndex(c => c.code === code);
    if (idx === -1) {
      return sendJSON(res, 404, { success: false, message: 'Kriteria tidak ditemukan.' });
    }
    db.criteria.splice(idx, 1);
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Kriteria dihapus.' });
  }

  return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
};
