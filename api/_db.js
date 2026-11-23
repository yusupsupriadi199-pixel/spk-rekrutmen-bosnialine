/**
 * _db.js — Helper baca/tulis file data/db.json
 * Digunakan bersama oleh semua Vercel Serverless Functions di /api/
 *
 * CATATAN VERCEL:
 * - Vercel Serverless Functions berjalan di lingkungan read-only KECUALI folder /tmp
 * - Untuk production multi-user yang persistent, ganti dengan database (MongoDB, Supabase, PlanetScale, dll.)
 * - Untuk demo/lokal & single-instance, file JSON ini sudah cukup dengan /tmp cache
 */

const fs   = require('fs');
const path = require('path');

// Path ke file database JSON
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

/**
 * Membaca seluruh database dari file JSON
 * @returns {Object} isi db.json
 */
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[_db] readDB error:', err.message);
    return { company: {}, users: [], criteria: [], applicants: [], assessments: {}, decisions: {} };
  }
}

/**
 * Menulis seluruh database kembali ke file JSON
 * @param {Object} data - objek database lengkap
 */
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[_db] writeDB error:', err.message);
    return false;
  }
}

/**
 * Helper: set header CORS + JSON response
 */
function sendJSON(res, statusCode, payload) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(statusCode).json(payload);
}

/**
 * Helper: parse body JSON dari request
 */
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    // Jika body sudah di-parse oleh Vercel (object)
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

/**
 * Generate ID pelamar unik: BSN-2026-NNN
 */
function generateApplicantId(applicants) {
  const year = new Date().getFullYear();
  const max = applicants.reduce((m, a) => {
    const match = a.id && a.id.match(/BSN-\d{4}-(\d+)/);
    return match ? Math.max(m, parseInt(match[1])) : m;
  }, 0);
  return `BSN-${year}-${String(max + 1).padStart(3, '0')}`;
}

module.exports = { readDB, writeDB, sendJSON, parseBody, generateApplicantId };
