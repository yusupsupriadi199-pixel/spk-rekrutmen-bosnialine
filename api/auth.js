/**
 * POST /api/auth/login   → login dengan username + password
 * POST /api/auth/quick   → quickLogin berdasarkan role (demo)
 * GET  /api/auth/users   → daftar semua user (admin)
 * POST /api/auth/users   → tambah user baru
 * PUT  /api/auth/users   → update user
 * DELETE /api/auth/users → hapus user
 */
const { readDB, writeDB, sendJSON, parseBody } = require('./_db');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const db  = readDB();
  // Ambil sub-path dari query: /api/auth?action=login | quick | users
  const action = req.query.action || '';

  // --- LOGIN ---
  if (req.method === 'POST' && action === 'login') {
    const { username, password } = await parseBody(req);
    const user = db.users.find(
      u => u.username.toLowerCase() === (username || '').toLowerCase() && u.password === password
    );
    if (!user) {
      return sendJSON(res, 401, { success: false, message: 'Username atau password salah!' });
    }
    // Jangan kirim password ke client
    const { password: _pw, ...safeUser } = user;
    return sendJSON(res, 200, { success: true, data: safeUser });
  }

  // --- QUICK LOGIN (demo role switcher) ---
  if (req.method === 'POST' && action === 'quick') {
    const { role } = await parseBody(req);
    const user = db.users.find(u => u.role === role);
    if (!user) {
      return sendJSON(res, 404, { success: false, message: `Akun role ${role} tidak ditemukan.` });
    }
    const { password: _pw, ...safeUser } = user;
    return sendJSON(res, 200, { success: true, data: safeUser });
  }

  // --- GET ALL USERS ---
  if (req.method === 'GET' && action === 'users') {
    const safeUsers = db.users.map(({ password: _pw, ...u }) => u);
    return sendJSON(res, 200, { success: true, data: safeUsers });
  }

  // --- ADD USER ---
  if (req.method === 'POST' && action === 'users') {
    const body = await parseBody(req);
    if (!body.username || !body.password || !body.role) {
      return sendJSON(res, 400, { success: false, message: 'username, password, dan role wajib diisi.' });
    }
    const exists = db.users.find(u => u.username.toLowerCase() === body.username.toLowerCase());
    if (exists) {
      return sendJSON(res, 409, { success: false, message: 'Username sudah digunakan.' });
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      username: body.username,
      password: body.password,
      name: body.name || body.username,
      email: body.email || '',
      role: body.role,
      avatar: body.avatar || ''
    };
    db.users.push(newUser);
    writeDB(db);
    const { password: _pw, ...safeUser } = newUser;
    return sendJSON(res, 201, { success: true, data: safeUser });
  }

  // --- UPDATE USER ---
  if (req.method === 'PUT' && action === 'users') {
    const body = await parseBody(req);
    const idx  = db.users.findIndex(u => u.id === body.id);
    if (idx === -1) {
      return sendJSON(res, 404, { success: false, message: 'User tidak ditemukan.' });
    }
    db.users[idx] = { ...db.users[idx], ...body };
    writeDB(db);
    const { password: _pw, ...safeUser } = db.users[idx];
    return sendJSON(res, 200, { success: true, data: safeUser });
  }

  // --- DELETE USER ---
  if (req.method === 'DELETE' && action === 'users') {
    const { id } = await parseBody(req);
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) {
      return sendJSON(res, 404, { success: false, message: 'User tidak ditemukan.' });
    }
    db.users.splice(idx, 1);
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'User dihapus.' });
  }

  return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
};
