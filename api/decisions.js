/**
 * GET  /api/decisions           → semua keputusan manual
 * PUT  /api/decisions           → simpan/update keputusan (applicantId di body)
 * DELETE /api/decisions         → hapus keputusan satu pelamar
 */
const { readDB, writeDB, sendJSON, parseBody } = require('./_db');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const db = readDB();

  if (req.method === 'GET') {
    return sendJSON(res, 200, { success: true, data: db.decisions });
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const { applicantId, status, notes } = body;
    if (!applicantId) {
      return sendJSON(res, 400, { success: false, message: 'applicantId wajib diisi.' });
    }
    db.decisions[applicantId] = { status: status || 'Auto', notes: notes || '' };
    writeDB(db);
    return sendJSON(res, 200, { success: true, data: db.decisions[applicantId] });
  }

  if (req.method === 'DELETE') {
    const { applicantId } = await parseBody(req);
    if (!applicantId) {
      return sendJSON(res, 400, { success: false, message: 'applicantId wajib diisi.' });
    }
    delete db.decisions[applicantId];
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Keputusan dihapus.' });
  }

  return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
};
