/**
 * GET    /api/applicants           → ambil semua pelamar
 * GET    /api/applicants?id=xxx    → ambil satu pelamar by ID
 * POST   /api/applicants           → tambah pelamar baru
 * PUT    /api/applicants           → update pelamar (id di body)
 * DELETE /api/applicants           → hapus pelamar (id di body)
 */
const { readDB, writeDB, sendJSON, parseBody, generateApplicantId } = require('./_db');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const db = readDB();

  // GET satu pelamar by ?id=
  if (req.method === 'GET' && req.query.id) {
    const app = db.applicants.find(a => a.id === req.query.id);
    if (!app) return sendJSON(res, 404, { success: false, message: 'Pelamar tidak ditemukan.' });
    return sendJSON(res, 200, { success: true, data: app });
  }

  // GET semua pelamar
  if (req.method === 'GET') {
    return sendJSON(res, 200, { success: true, data: db.applicants });
  }

  // POST: tambah pelamar baru
  if (req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.name || !body.nik || !body.position) {
      return sendJSON(res, 400, { success: false, message: 'name, nik, dan position wajib diisi.' });
    }
    const newApp = {
      id:               generateApplicantId(db.applicants),
      name:             body.name.trim(),
      nik:              body.nik.trim(),
      gender:           body.gender || 'Laki-laki',
      birthPlace:       body.birthPlace || '',
      birthDate:        body.birthDate || '',
      phone:            body.phone || '',
      email:            body.email || '',
      address:          body.address || '',
      position:         body.position,
      education:        body.education || '',
      schoolName:       body.schoolName || '',
      gradYear:         parseInt(body.gradYear) || new Date().getFullYear(),
      experience:       body.experience || '',
      skills:           body.skills || '',
      salaryExpectation:parseInt(body.salaryExpectation) || 2500000,
      applyDate:        new Date().toISOString().split('T')[0],
      status:           'Terverifikasi',
      avatar: body.gender === 'Perempuan'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
    };

    db.applicants.push(newApp);

    // Auto-seed nilai awal (rata-rata 3)
    db.assessments[newApp.id] = {
      C1: 3, C2: 3, C3: 4, C4: 3, C5: 4, C6: 3,
      notes: 'Nilai awal pendaftaran baru'
    };

    writeDB(db);
    return sendJSON(res, 201, { success: true, data: newApp });
  }

  // PUT: update pelamar
  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const idx  = db.applicants.findIndex(a => a.id === body.id);
    if (idx === -1) {
      return sendJSON(res, 404, { success: false, message: 'Pelamar tidak ditemukan.' });
    }
    db.applicants[idx] = { ...db.applicants[idx], ...body };
    writeDB(db);
    return sendJSON(res, 200, { success: true, data: db.applicants[idx] });
  }

  // DELETE: hapus pelamar
  if (req.method === 'DELETE') {
    const { id } = await parseBody(req);
    const idx = db.applicants.findIndex(a => a.id === id);
    if (idx === -1) {
      return sendJSON(res, 404, { success: false, message: 'Pelamar tidak ditemukan.' });
    }
    db.applicants.splice(idx, 1);
    // Hapus juga assessments & decisions terkait
    delete db.assessments[id];
    delete db.decisions[id];
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Pelamar dihapus.' });
  }

  return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
};
