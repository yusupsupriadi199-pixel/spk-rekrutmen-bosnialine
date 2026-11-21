/**
 * STORAGE MANAGER
 * Mengelola penyimpanan data lokal (localStorage) dengan sinkronisasi otomatis
 */

const STORAGE_KEYS = {
  COMPANY: "bosnialine_company",
  USERS: "bosnialine_users",
  CURRENT_USER: "bosnialine_current_user",
  CRITERIA: "bosnialine_criteria",
  APPLICANTS: "bosnialine_applicants",
  ASSESSMENTS: "bosnialine_assessments",
  DECISIONS: "bosnialine_decisions"
};

const StorageManager = {
  // Inisialisasi storage jika belum ada
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.COMPANY)) {
      this.saveCompany(DEFAULT_COMPANY);
    } else {
      // Sinkronkan leaderName & leaderTitle agar selalu up-to-date
      const storedCompany = this.getCompany();
      let companyChanged = false;
      if (storedCompany.leaderName !== DEFAULT_COMPANY.leaderName) {
        storedCompany.leaderName = DEFAULT_COMPANY.leaderName;
        companyChanged = true;
      }
      if (storedCompany.leaderTitle !== DEFAULT_COMPANY.leaderTitle) {
        storedCompany.leaderTitle = DEFAULT_COMPANY.leaderTitle;
        companyChanged = true;
      }
      if (companyChanged) this.saveCompany(storedCompany);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.saveUsers(DEFAULT_USERS);
    } else {
      // Sinkronkan nama & email akun bawaan agar selalu up-to-date
      const stored = this.getUsers();
      let changed = false;
      DEFAULT_USERS.forEach(defUser => {
        const idx = stored.findIndex(u => u.id === defUser.id);
        if (idx !== -1) {
          if (stored[idx].name !== defUser.name || stored[idx].email !== defUser.email) {
            stored[idx].name  = defUser.name;
            stored[idx].email = defUser.email;
            changed = true;
          }
        }
      });
      if (changed) {
        this.saveUsers(stored);
        // Perbarui sesi aktif jika sedang login dengan akun yang berubah
        const cur = this.getCurrentUser();
        if (cur) {
          const updated = stored.find(u => u.id === cur.id);
          if (updated) this.setCurrentUser(updated);
        }
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.CRITERIA)) {
      this.saveCriteria(DEFAULT_CRITERIA);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPLICANTS)) {
      this.saveApplicants(DEFAULT_APPLICANTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) {
      this.saveAssessments(DEFAULT_ASSESSMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DECISIONS)) {
      this.saveDecisions({});
    }
    // Set default user jika belum ada sesi
    if (!this.getCurrentUser()) {
      this.setCurrentUser(DEFAULT_USERS[0]); // default admin
    }
  },

  // Company Profile
  getCompany() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY);
      return data ? JSON.parse(data) : DEFAULT_COMPANY;
    } catch (e) {
      return DEFAULT_COMPANY;
    }
  },
  saveCompany(companyData) {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(companyData));
  },

  // Users & Auth
  getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  },
  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Kriteria
  getCriteria() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CRITERIA);
      return data ? JSON.parse(data) : DEFAULT_CRITERIA;
    } catch (e) {
      return DEFAULT_CRITERIA;
    }
  },
  saveCriteria(criteria) {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
  },

  // Pelamar
  getApplicants() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICANTS);
      return data ? JSON.parse(data) : DEFAULT_APPLICANTS;
    } catch (e) {
      return DEFAULT_APPLICANTS;
    }
  },
  saveApplicants(applicants) {
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
  },
  getApplicantById(id) {
    const list = this.getApplicants();
    return list.find(a => a.id === id) || null;
  },
  addApplicant(applicant) {
    const list = this.getApplicants();
    // Generate new unique ID
    if (!applicant.id) {
      const count = list.length + 1;
      const numStr = String(count).padStart(3, '0');
      applicant.id = `BSN-2026-${numStr}`;
    }
    applicant.applyDate = applicant.applyDate || new Date().toISOString().split('T')[0];
    applicant.status = applicant.status || 'Terverifikasi';
    list.unshift(applicant);
    this.saveApplicants(list);
    return applicant;
  },
  updateApplicant(id, updatedFields) {
    const list = this.getApplicants();
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.saveApplicants(list);
      return list[index];
    }
    return null;
  },
  deleteApplicant(id) {
    let list = this.getApplicants();
    list = list.filter(a => a.id !== id);
    this.saveApplicants(list);

    // Hapus juga penilaian pelamar ini
    const assessments = this.getAssessments();
    if (assessments[id]) {
      delete assessments[id];
      this.saveAssessments(assessments);
    }
    return true;
  },

  // Penilaian
  getAssessments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
      return data ? JSON.parse(data) : DEFAULT_ASSESSMENTS;
    } catch (e) {
      return DEFAULT_ASSESSMENTS;
    }
  },
  saveAssessments(assessments) {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  },
  getApplicantAssessment(applicantId) {
    const all = this.getAssessments();
    return all[applicantId] || null;
  },
  saveApplicantAssessment(applicantId, scoresObj, notes = "") {
    const all = this.getAssessments();
    all[applicantId] = {
      ...scoresObj,
      notes: notes || (all[applicantId] && all[applicantId].notes) || ""
    };
    this.saveAssessments(all);
    return all[applicantId];
  },

  // Keputusan & Catatan Lolos
  getDecisions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DECISIONS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },
  saveDecisions(decisions) {
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
  },
  setDecision(applicantId, status, notes = "") {
    const decs = this.getDecisions();
    decs[applicantId] = {
      status, // 'Lolos', 'Cadangan', 'Tidak Lolos', 'Auto'
      notes,
      updatedAt: new Date().toISOString()
    };
    this.saveDecisions(decs);
  },

  // Backup & Reset
  resetToDefault() {
    this.saveCompany(DEFAULT_COMPANY);
    this.saveUsers(DEFAULT_USERS);
    this.saveCriteria(DEFAULT_CRITERIA);
    this.saveApplicants(DEFAULT_APPLICANTS);
    this.saveAssessments(DEFAULT_ASSESSMENTS);
    this.saveDecisions({});
    this.setCurrentUser(DEFAULT_USERS[0]);
    return true;
  },
  exportDatabaseJSON() {
    const fullDb = {
      company: this.getCompany(),
      users: this.getUsers(),
      criteria: this.getCriteria(),
      applicants: this.getApplicants(),
      assessments: this.getAssessments(),
      decisions: this.getDecisions(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullDb, null, 2);
  },
  importDatabaseJSON(jsonStr) {
    try {
      const db = JSON.parse(jsonStr);
      if (db.company) this.saveCompany(db.company);
      if (db.users) this.saveUsers(db.users);
      if (db.criteria) this.saveCriteria(db.criteria);
      if (db.applicants) this.saveApplicants(db.applicants);
      if (db.assessments) this.saveAssessments(db.assessments);
      if (db.decisions) this.saveDecisions(db.decisions);
      return true;
    } catch (e) {
      console.error("Invalid database JSON", e);
      return false;
    }
  }
};
