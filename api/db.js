/**
 * GET  /api/db          → export full database JSON (backup)
 * POST /api/db          → import/restore database dari JSON
 * DELETE /api/db        → reset database ke data default
 */
const fs   = require('fs');
const path = require('path');
const { readDB, writeDB, sendJSON, parseBody } = require('./_db');

// Default seed — sama dengan data/db.json awal
// Ini digunakan saat reset agar tidak perlu baca file default terpisah
const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'db.json');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  // Export database
  if (req.method === 'GET') {
    const db = readDB();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Backup_SPK_BOSNIALine_${new Date().toISOString().split('T')[0]}.json"`
    );
    return res.status(200).send(JSON.stringify(db, null, 2));
  }

  // Import/restore database
  if (req.method === 'POST') {
    const body = await parseBody(req);
    // Validasi struktur minimal
    if (!body.company || !body.applicants || !body.criteria) {
      return sendJSON(res, 400, { success: false, message: 'Format file backup tidak valid. Wajib ada company, applicants, criteria.' });
    }
    writeDB(body);
    return sendJSON(res, 200, { success: true, message: 'Database berhasil dipulihkan dari backup.' });
  }

  // Reset ke default
  if (req.method === 'DELETE') {
    try {
      // Baca file default yang disimpan sebagai db-default.json
      const defPath = path.join(process.cwd(), 'data', 'db-default.json');
      const defRaw  = fs.readFileSync(defPath, 'utf-8');
      const defData = JSON.parse(defRaw);
      writeDB(defData);
      return sendJSON(res, 200, { success: true, message: 'Database di-reset ke setelan default.' });
    } catch (err) {
      return sendJSON(res, 500, { success: false, message: 'File default tidak ditemukan: ' + err.message });
    }
  }

  return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
};
