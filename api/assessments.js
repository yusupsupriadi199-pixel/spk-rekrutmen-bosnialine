/**
 * GET  /api/assessments               → semua nilai matriks
 * GET  /api/assessments?id=BSN-xxx    → nilai satu pelamar
 * PUT  /api/assessments               → simpan/update nilai pelamar (applicantId di body)
 * DELETE /api/assessments             → hapus nilai satu pelamar (applicantId di body)
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

  // GET nilai satu pelamar
  if (req.method === 'GET' && req.query.id) {
    const scores = db.assessments[req.query.id];
    if (!scores) return sendJSON(res, 404, { success: false, message: 'Nilai pelamar belum ada.' });
    return sendJSON(res, 200, { success: true, data: scores });
  }

  // GET semua nilai
  if (req.method === 'GET') {
    return sendJSON(res, 200, { success: true, data: db.assessments });
  }

  // PUT: simpan/update nilai
  if (req.method === 'PUT') {
    const body           = await parseBody(req);
    const { applicantId, scores, notes } = body;
    if (!applicantId) {
      return sendJSON(res, 400, { success: false, message: 'applicantId wajib diisi.' });
    }
    db.assessments[applicantId] = { ...(scores || {}), notes: notes || '' };
    writeDB(db);
    return sendJSON(res, 200, { success: true, data: db.assessments[applicantId] });
  }

  // DELETE: hapus nilai satu pelamar
  if (req.method === 'DELETE') {
    const { applicantId } = await parseBody(req);
    if (!applicantId || !db.assessments[applicantId]) {
      return sendJSON(res, 404, { success: false, message: 'Nilai pelamar tidak ditemukan.' });
    }
    delete db.assessments[applicantId];
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Nilai dihapus.' });
  }

  return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
};
