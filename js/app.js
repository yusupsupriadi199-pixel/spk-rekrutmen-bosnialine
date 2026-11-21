/**
 * MAIN APPLICATION CONTROLLER
 * Toko Komputer BOSNIALine Tenjolaya - SPK Rekrutmen Karyawan (Metode SAW)
 */

const App = {
  activeView: "dashboard",
  calculationCache: null,

  init() {
    // 1. Inisialisasi Storage & Auth
    StorageManager.init();
    Auth.init();

    // 2. Setup Event Listeners
    this.setupNavigation();
    this.setupThemeToggle();
    this.setupRoleSwitcher();
    this.setupModals();
    this.setupSearchAndFilters();

    // 3. Render Current Session & First View
    this.updateUserSessionUI();
    this.navigateTo("dashboard");

    console.log("SPK Rekrutmen Toko Komputer BOSNIALine Siap.");
  },

  /* ==========================================================================
     NOTIFICATION TOAST
     ========================================================================== */
  toast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toastEl = document.createElement("div");
    toastEl.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "⚠️";

    toastEl.innerHTML = `
      <span style="font-size: 1.2rem;">${icon}</span>
      <div style="flex: 1;">${message}</div>
    `;

    container.appendChild(toastEl);
    setTimeout(() => {
      toastEl.style.opacity = "0";
      toastEl.style.transform = "translateX(100%)";
      setTimeout(() => toastEl.remove(), 300);
    }, 3500);
  },

  /* ==========================================================================
     NAVIGATION & VIEW MANAGEMENT
     ========================================================================== */
  setupNavigation() {
    // Sidebar links
    document.querySelectorAll(".nav-link[data-view]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const viewId = link.getAttribute("data-view");
        this.navigateTo(viewId);

        // Tutup mobile drawer jika terbuka
        document.getElementById("sidebar").classList.remove("mobile-open");
      });
    });

    // Mobile sidebar toggle button
    const btnToggle = document.getElementById("btn-sidebar-toggle");
    if (btnToggle) {
      btnToggle.addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("mobile-open");
      });
    }

    // Logout button
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        this.showLoginModal();
      });
    }
  },

  navigateTo(viewId) {
    // Cek hak akses
    if (!Auth.canAccess(viewId)) {
      this.toast("Anda tidak memiliki hak akses untuk menu ini!", "error");
      return;
    }

    this.activeView = viewId;

    // Update active class pada navigasi
    document.querySelectorAll(".nav-link").forEach(link => {
      if (link.getAttribute("data-view") === viewId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Tampilkan container view
    document.querySelectorAll(".page-view").forEach(view => {
      view.classList.remove("active");
    });

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
      targetView.classList.add("active");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update Page Title
    this.updatePageTitle(viewId);

    // Refresh view data
    this.renderViewData(viewId);
  },

  updatePageTitle(viewId) {
    const titleMap = {
      "dashboard": { title: "Dashboard Utama", sub: "Ringkasan data pelamar & analitik rekrutmen BOSNIALine" },
      "applicants": { title: "Data Pelamar", sub: "Kelola data calon karyawan & verifikasi berkas lamaran" },
      "register-applicant": { title: "Pendaftaran Pelamar Baru", sub: "Formulir input data calon karyawan Toko Komputer BOSNIALine" },
      "criteria": { title: "Kriteria Penilaian", sub: "Konfigurasi bobot, tipe benefit/cost, dan sub-kriteria SAW" },
      "assessment": { title: "Penilaian Pelamar", sub: "Input nilai matriks alternatif pelamar terhadap kriteria" },
      "saw-calculation": { title: "Perhitungan Metode SAW", sub: "Proses matematis normalisasi dan pembobotan preferensi (Vi)" },
      "results": { title: "Hasil Seleksi & Ranking", sub: "Peringkat kelayakan pelamar berdasarkan nilai preferensi SAW" },
      "reports": { title: "Laporan Resmi Hasil Seleksi", sub: "Cetak dokumen keputusan penerimaan karyawan BOSNIALine Tenjolaya" },
      "settings": { title: "Pengaturan Sistem", sub: "Profil usaha, manajemen pengguna, dan pencadangan database" },
      "check-status": { title: "Cek Status Lamaran", sub: "Portal pengumuman mandiri bagi calon pelamar" }
    };

    const info = titleMap[viewId] || { title: "SPK BOSNIALine", sub: "Sistem Rekrutmen" };
    document.getElementById("page-title").textContent = info.title;
    document.getElementById("page-subtitle").textContent = info.sub;
  },

  renderViewData(viewId) {
    switch (viewId) {
      case "dashboard":
        this.renderDashboard();
        break;
      case "applicants":
        this.renderApplicantsTable();
        break;
      case "criteria":
        this.renderCriteria();
        break;
      case "assessment":
        this.renderAssessments();
        break;
      case "saw-calculation":
        this.renderSawCalculation();
        break;
      case "results":
        this.renderResults();
        break;
      case "reports":
        this.renderReport();
        break;
      case "settings":
        this.renderSettings();
        break;
      case "check-status":
        this.renderCheckStatus();
        break;
    }
  },

  /* ==========================================================================
     THEME & ROLE SWITCHER
     ========================================================================== */
  setupThemeToggle() {
    const btn = document.getElementById("btn-theme-toggle");
    const currentTheme = localStorage.getItem("bosnialine_theme") || "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    this.updateThemeIcon(currentTheme);

    btn.addEventListener("click", () => {
      const activeTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const newTheme = activeTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("bosnialine_theme", newTheme);
      this.updateThemeIcon(newTheme);
      this.toast(`Beralih ke mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'}`);
    });
  },

  updateThemeIcon(theme) {
    const btn = document.getElementById("btn-theme-toggle");
    if (btn) {
      btn.innerHTML = theme === "dark"
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  },

  setupRoleSwitcher() {
    const select = document.getElementById("quick-role-select");
    if (!select) return;

    // Custom dropdown logic
    const display   = document.getElementById("custom-role-display");
    const optsList  = document.getElementById("custom-role-options");
    const labelEl   = document.getElementById("custom-role-label");

    if (display && optsList) {
      // Toggle buka/tutup
      display.addEventListener("click", (e) => {
        e.stopPropagation();
        optsList.classList.toggle("open");
      });

      // Pilih opsi
      optsList.querySelectorAll(".custom-role-option").forEach(opt => {
        opt.addEventListener("click", (e) => {
          e.stopPropagation();
          const role = opt.dataset.value;
          // Update hidden select
          select.value = role;
          // Update tampilan label
          if (labelEl) labelEl.textContent = opt.textContent.trim();
          // Tandai active
          optsList.querySelectorAll(".custom-role-option").forEach(o => o.classList.remove("active"));
          opt.classList.add("active");
          // Tutup dropdown
          optsList.classList.remove("open");
          // Trigger role switch
          const res = Auth.quickLogin(role);
          if (res.success) {
            this.updateUserSessionUI();
            this.toast(`Beralih hak akses sebagai: ${res.user.name} (${role.toUpperCase()})`, "success");
            this.navigateTo("dashboard");
          }
        });
      });

      // Tutup jika klik di luar
      document.addEventListener("click", () => {
        optsList.classList.remove("open");
      });
    }

    // Tetap listen hidden select untuk kompatibilitas
    select.addEventListener("change", (e) => {
      const role = e.target.value;
      const res = Auth.quickLogin(role);
      if (res.success) {
        this.updateUserSessionUI();
        this.toast(`Beralih hak akses sebagai: ${res.user.name} (${role.toUpperCase()})`, "success");
        this.navigateTo("dashboard");
      }
    });
  },

  updateUserSessionUI() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    // Update sidebar user widget
    const nameEl    = document.getElementById("sidebar-user-name");
    const roleBadge = document.getElementById("sidebar-user-role");
    const avatarBox = document.getElementById("sidebar-user-avatar-box");
    const select    = document.getElementById("quick-role-select");

    if (nameEl) nameEl.textContent = user.name;

    // Avatar inisial — ambil 2 huruf pertama nama, warna sesuai role
    if (avatarBox) {
      const initials = user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
      const roleColors = { admin: '#00e5ff', hrd: '#10b981', pimpinan: '#a78bfa', pelamar: '#f59e0b' };
      const color = roleColors[user.role] || '#94a3b8';
      avatarBox.textContent = initials;
      avatarBox.style.background = `${color}22`;
      avatarBox.style.color = color;
      avatarBox.style.borderColor = color;
    }

    if (roleBadge) {
      roleBadge.className = `user-role-badge role-${user.role}`;
      roleBadge.textContent = user.role.toUpperCase();
    }
    if (select) {
      select.value = user.role;
      // Sinkronkan label custom dropdown
      const labelEl  = document.getElementById("custom-role-label");
      const optsList = document.getElementById("custom-role-options");
      if (labelEl && optsList) {
        const activeOpt = optsList.querySelector(`.custom-role-option[data-value="${user.role}"]`);
        if (activeOpt) {
          labelEl.textContent = activeOpt.textContent.trim();
          optsList.querySelectorAll(".custom-role-option").forEach(o => o.classList.remove("active"));
          activeOpt.classList.add("active");
        }
      }
    }

    // Sembunyikan/tampilkan menu tertentu sesuai hak akses
    document.querySelectorAll(".nav-link[data-view]").forEach(link => {
      const v = link.getAttribute("data-view");
      if (Auth.canAccess(v)) {
        link.style.display = "flex";
      } else {
        link.style.display = "none";
      }
    });

    // Perbarui tombol-tombol yang bergantung pada role
    const btnDaftarkan = document.getElementById("btn-hero-daftarkan");
    if (btnDaftarkan) {
      const user = Auth.getCurrentUser();
      const isPelamar = user && user.role === "pelamar";
      btnDaftarkan.style.display = Auth.canAccess("register-applicant") ? "" : "none";
      // Ganti label tombol sesuai role
      if (isPelamar) {
        btnDaftarkan.innerHTML = "📝 Daftarkan Diri Saya";
      } else {
        btnDaftarkan.innerHTML = "➕ Daftarkan Pelamar Baru";
      }
    }
    const btnTambahApplicant = document.getElementById("btn-applicants-add");
    if (btnTambahApplicant) {
      btnTambahApplicant.style.display = Auth.canAccess("register-applicant") ? "" : "none";
    }
  },

  /* ==========================================================================
     DASHBOARD VIEW
     ========================================================================== */
  renderDashboard() {
    const company = StorageManager.getCompany();
    const applicants = StorageManager.getApplicants();
    const criteria = StorageManager.getCriteria();
    const assessments = StorageManager.getAssessments();
    const decisions = StorageManager.getDecisions();

    // Sembunyikan/tampilkan tombol sesuai role
    const btnDaftarkan = document.getElementById("btn-hero-daftarkan");
    if (btnDaftarkan) {
      const user = Auth.getCurrentUser();
      const isPelamar = user && user.role === "pelamar";
      btnDaftarkan.style.display = Auth.canAccess("register-applicant") ? "" : "none";
      if (isPelamar) {
        btnDaftarkan.innerHTML = "📝 Daftarkan Diri Saya";
      } else {
        btnDaftarkan.innerHTML = "➕ Daftarkan Pelamar Baru";
      }
    }
    const btnTambahApplicant = document.getElementById("btn-applicants-add");
    if (btnTambahApplicant) {
      btnTambahApplicant.style.display = Auth.canAccess("register-applicant") ? "" : "none";
    }

    // Hitung SAW
    const sawResult = SAWEngine.calculate(criteria, applicants, assessments, company.generalQuota || 3, decisions);
    this.calculationCache = sawResult;

    // Update Stats Card Numbers
    document.getElementById("stat-total-applicants").textContent = applicants.length;
    
    // Jumlah pelamar yang sudah dinilai
    const evaluatedCount = sawResult.evaluatedApplicants.length;
    document.getElementById("stat-evaluated-applicants").textContent = evaluatedCount;

    // Lolos penerimaan
    const acceptedCount = sawResult.rankings.filter(r => r.finalStatus.includes("Lolos") || r.finalStatus.includes("Diterima")).length;
    document.getElementById("stat-accepted").textContent = acceptedCount;

    // Skor Tertinggi SAW
    const topScore = sawResult.rankings.length > 0 ? sawResult.rankings[0].scoreFormatted : "0.0000";
    document.getElementById("stat-top-score").textContent = topScore;

    // Render Donut Chart: Distribusi Pelamar per Posisi
    const posCounts = {};
    applicants.forEach(a => {
      posCounts[a.position] = (posCounts[a.position] || 0) + 1;
    });
    const donutData = Object.keys(posCounts).map(pos => ({
      label: pos,
      value: posCounts[pos]
    }));
    ChartEngine.renderDonut("chart-positions-donut", donutData);

    // Render Bar Chart: Skor Top Pelamar SAW
    ChartEngine.renderRankingsBar("chart-rankings-bar", sawResult.rankings);

    // Render Tabel Top 5 Pelamar
    const tableBody = document.getElementById("table-dashboard-top-body");
    if (tableBody) {
      const top5 = sawResult.rankings.slice(0, 5);
      if (top5.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 24px;">Belum ada data nilai pelamar.</td></tr>`;
      } else {
        tableBody.innerHTML = top5.map(item => {
          const app = StorageManager.getApplicantById(item.applicantId);
          return `
            <tr>
              <td>
                <span class="score-pill">#${item.rank}</span>
              </td>
              <td>
                <div class="table-avatar-cell">
                  <img src="${(app && app.avatar) || 'assets/logo.jpg'}" class="table-avatar" alt="${item.applicantName}">
                  <div class="table-avatar-info">
                    <span class="table-name">${item.applicantName}</span>
                    <span class="table-sub">${item.applicantId}</span>
                  </div>
                </div>
              </td>
              <td>${item.position}</td>
              <td>
                <span class="mono-val" style="color: var(--primary); font-weight: 700;">${item.scoreFormatted}</span>
                <span style="font-size: 0.72rem; color: var(--text-dim);"> (${item.percentage})</span>
              </td>
              <td>
                <span class="badge ${item.badgeClass}">${item.finalStatus}</span>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  },

  /* ==========================================================================
     DATA PELAMAR VIEW
     ========================================================================== */
  renderApplicantsTable() {
    const applicants = StorageManager.getApplicants();
    const tableBody = document.getElementById("table-applicants-body");
    const countBadge = document.getElementById("applicants-count-badge");
    if (countBadge) countBadge.textContent = `${applicants.length} Orang`;

    // Filter value
    const searchVal = (document.getElementById("filter-search-applicant")?.value || "").toLowerCase();
    const positionFilter = document.getElementById("filter-position-applicant")?.value || "all";
    const statusFilter = document.getElementById("filter-status-applicant")?.value || "all";

    const filtered = applicants.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchVal) ||
                            app.nik.includes(searchVal) ||
                            app.id.toLowerCase().includes(searchVal);
      const matchesPosition = positionFilter === "all" || app.position === positionFilter;
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesPosition && matchesStatus;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-dim);">Tidak ada data pelamar yang sesuai dengan filter pencarian.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(app => {
      return `
        <tr>
          <td><span class="score-pill">${app.id}</span></td>
          <td>
            <div class="table-avatar-cell">
              <img src="${app.avatar || 'assets/logo.jpg'}" class="table-avatar" alt="${app.name}">
              <div class="table-avatar-info">
                <span class="table-name">${app.name}</span>
                <span class="table-sub">NIK: ${app.nik}</span>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">${app.position}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${app.education}</div>
          </td>
          <td>
            <div>${app.phone}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${app.email}</div>
          </td>
          <td>${app.applyDate}</td>
          <td>
            <span class="badge badge-info">${app.status}</span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="App.showApplicantDetailModal('${app.id}')" title="Lihat Detail Profil">
                👁️ Detail
              </button>
              ${Auth.canInputAssessment() ? `
                <button class="btn btn-primary btn-sm" onclick="App.showAssessmentModal('${app.id}')" title="Input Nilai Kriteria">
                  ⭐ Nilai
                </button>
                <button class="btn btn-secondary btn-sm" onclick="App.showEditApplicantModal('${app.id}')" title="Edit Data Pelamar">
                  ✏️ Edit
                </button>
              ` : ''}
              ${Auth.canManageSettings() ? `
                <button class="btn btn-danger btn-sm" onclick="App.confirmDeleteApplicant('${app.id}')" title="Hapus Pelamar">
                  🗑️
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  setupSearchAndFilters() {
    const searchInput = document.getElementById("filter-search-applicant");
    const posFilter = document.getElementById("filter-position-applicant");
    const statusFilter = document.getElementById("filter-status-applicant");

    if (searchInput) searchInput.addEventListener("input", () => this.renderApplicantsTable());
    if (posFilter) posFilter.addEventListener("change", () => this.renderApplicantsTable());
    if (statusFilter) statusFilter.addEventListener("change", () => this.renderApplicantsTable());
  },

  /* ==========================================================================
     KRITERIA PENILAIAN VIEW
     ========================================================================== */
  renderCriteria() {
    const criteria = StorageManager.getCriteria();
    const tableBody = document.getElementById("table-criteria-body");
    const weightBadge = document.getElementById("criteria-total-weight-badge");

    const totalWeight = criteria.reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
    const totalPercent = (totalWeight * 100).toFixed(0);

    if (weightBadge) {
      weightBadge.textContent = `Total Bobot: ${totalPercent}% (${totalWeight.toFixed(2)})`;
      if (Math.abs(totalWeight - 1.0) < 0.01) {
        weightBadge.className = "badge badge-success";
      } else {
        weightBadge.className = "badge badge-warning";
      }
    }

    tableBody.innerHTML = criteria.map((c, idx) => {
      const typeBadge = c.type.toLowerCase() === "benefit"
        ? `<span class="badge badge-benefit">BENEFIT (+)</span>`
        : `<span class="badge badge-cost">COST (-)</span>`;

      const subListHtml = c.subCriteria && c.subCriteria.length > 0
        ? `<div style="margin-top: 8px; font-size: 0.75rem; color: var(--text-dim); display: flex; flex-direction: column; gap: 2px;">
            ${c.subCriteria.map(s => `<div><b style="color: var(--primary);">Skor ${s.value}:</b> ${s.label} <span style="opacity: 0.8;">(${s.desc})</span></div>`).join('')}
           </div>`
        : '';

      return `
        <tr>
          <td><span class="score-pill">${c.code}</span></td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">${c.name}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${c.description}</div>
            ${subListHtml}
          </td>
          <td>${typeBadge}</td>
          <td>
            <span class="mono-val" style="font-size: 1rem; color: var(--primary); font-weight: 700;">${(parseFloat(c.weight) * 100).toFixed(0)}%</span>
            <div style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-mono);">${parseFloat(c.weight).toFixed(2)}</div>
          </td>
          <td>
            ${Auth.canEditCriteria() ? `
              <button class="btn btn-secondary btn-sm" onclick="App.showEditCriteriaModal('${c.code}')">
                ✏️ Edit Bobot
              </button>
            ` : `<span style="font-size: 0.78rem; color: var(--text-dim);">Hanya Admin</span>`}
          </td>
        </tr>
      `;
    }).join('');
  },

  /* ==========================================================================
     PENILAIAN PELAMAR VIEW
     ========================================================================== */
  renderAssessments() {
    const applicants = StorageManager.getApplicants();
    const criteria = StorageManager.getCriteria();
    const assessments = StorageManager.getAssessments();

    // Render Table Header Kriteria C1..Cn
    const headerRow = document.getElementById("table-assessment-header-row");
    if (headerRow) {
      headerRow.innerHTML = `
        <th>No. Reg & Pelamar</th>
        <th>Posisi Dilamar</th>
        ${criteria.map(c => `
          <th style="text-align: center;">
            <div>${c.code}</div>
            <div style="font-size: 0.65rem; color: var(--text-dim);">(${c.type.toUpperCase()})</div>
          </th>
        `).join('')}
        <th>Catatan Evaluator</th>
        <th style="text-align: center;">Aksi</th>
      `;
    }

    const tableBody = document.getElementById("table-assessment-body");
    if (!tableBody) return;

    tableBody.innerHTML = applicants.map(app => {
      const scores = assessments[app.id] || {};
      const isComplete = criteria.every(c => scores[c.code] !== undefined && scores[c.code] !== null);

      return `
        <tr>
          <td>
            <div class="table-avatar-cell">
              <img src="${app.avatar || 'assets/logo.jpg'}" class="table-avatar" alt="${app.name}">
              <div>
                <div style="font-weight: 600;">${app.name}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">${app.id}</div>
              </div>
            </div>
          </td>
          <td>${app.position}</td>
          ${criteria.map(c => {
            const val = scores[c.code];
            const hasVal = val !== undefined && val !== null;
            return `
              <td style="text-align: center;">
                <span class="score-pill" style="${hasVal ? 'background: rgba(0, 229, 255, 0.15);' : 'background: rgba(255,255,255,0.05); color: var(--text-dim);'}">
                  ${hasVal ? val : '-'}
                </span>
              </td>
            `;
          }).join('')}
          <td style="font-size: 0.78rem; color: var(--text-muted); max-width: 200px;">
            ${scores.notes || '-'}
          </td>
          <td style="text-align: center;">
            <button class="btn btn-primary btn-sm" onclick="App.showAssessmentModal('${app.id}')">
              ⭐ ${isComplete ? 'Ubah Nilai' : 'Beri Nilai'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  /* ==========================================================================
     PERHITUNGAN METODE SAW VIEW
     ========================================================================== */
  renderSawCalculation() {
    const applicants = StorageManager.getApplicants();
    const criteria = StorageManager.getCriteria();
    const assessments = StorageManager.getAssessments();
    const company = StorageManager.getCompany();
    const decisions = StorageManager.getDecisions();

    const saw = SAWEngine.calculate(criteria, applicants, assessments, company.generalQuota || 3, decisions);
    this.calculationCache = saw;

    const container = document.getElementById("saw-calculation-container");
    if (!container) return;

    if (!saw.hasData) {
      container.innerHTML = `
        <div class="card" style="padding: 40px; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 12px;">📊</div>
          <h3>${saw.message}</h3>
          <p style="color: var(--text-muted); margin-bottom: 20px;">Silakan isi nilai calon pelamar terlebih dahulu untuk melihat kalkulasi SAW.</p>
          <button class="btn btn-primary" onclick="App.navigateTo('assessment')">Menuju Menu Penilaian</button>
        </div>
      `;
      return;
    }

    // Bangun HTML Detail untuk 4 Tahapan SAW
    container.innerHTML = `
      <!-- Penjelasan Rumus Teori SAW -->
      <div class="card">
        <div class="card-header">
          <div class="card-header-left">
            <h3>📖 Landasan Teori & Rumus Metode Simple Additive Weighting (SAW)</h3>
            <p>Metode SAW sering juga dikenal dengan istilah metode penjumlahan terbobot.</p>
          </div>
        </div>
        <div class="card-body">
          <div class="grid-2">
            <div class="step-formula-box">
              <div>
                <b style="color: #10b981;">1. Kriteria Keuntungan (Benefit):</b><br>
                <span>r<sub>ij</sub> = x<sub>ij</sub> / Max(x<sub>ij</sub>)</span><br>
                <small style="color: var(--text-muted);">Nilai terbesar (Max) adalah yang terbaik</small>
              </div>
            </div>
            <div class="step-formula-box">
              <div>
                <b style="color: #ef4444;">2. Kriteria Biaya (Cost):</b><br>
                <span>r<sub>ij</sub> = Min(x<sub>ij</sub>) / x<sub>ij</sub></span><br>
                <small style="color: var(--text-muted);">Nilai terkecil (Min) adalah yang terbaik (efisien)</small>
              </div>
            </div>
          </div>
          <div class="step-formula-box" style="margin-bottom: 0;">
            <div>
              <b style="color: #00e5ff;">3. Perhitungan Nilai Preferensi (V<sub>i</sub>):</b><br>
              <span>V<sub>i</sub> = &sum; (w<sub>j</sub> &times; r<sub>ij</sub>)</span><br>
              <small style="color: var(--text-muted);">Nilai V<sub>i</sub> yang lebih besar mengindikasikan bahwa alternatif A<sub>i</sub> lebih terpilih</small>
            </div>
          </div>
        </div>
      </div>

      <!-- TAHAP 1: MATRIKS KEPUTUSAN (X) -->
      <div class="saw-step-card">
        <div class="saw-step-header">
          <div class="saw-step-title">
            <span class="step-number">1</span>
            <div>
              <h4 style="font-size: 1rem; font-weight: 700;">Tahap 1: Matriks Keputusan (X)</h4>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Matriks data mentah hasil penilaian setiap alternatif pada tiap kriteria</p>
            </div>
          </div>
        </div>
        <div class="card-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Alternatif (Pelamar)</th>
                  ${saw.criteriaList.map(c => `<th style="text-align: center;">${c.code} (${c.name.split(' ')[0]})</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${saw.decisionMatrix.map(row => `
                  <tr>
                    <td><b>${row.applicantName}</b> <span style="font-size: 0.74rem; color: var(--text-dim);">(${row.applicantId})</span></td>
                    ${saw.criteriaList.map(c => `
                      <td style="text-align: center;"><span class="score-pill">${row.scores[c.code]}</span></td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAHAP 2: NILAI EKSTREM (MAX / MIN) TIAP KRITERIA -->
      <div class="saw-step-card">
        <div class="saw-step-header">
          <div class="saw-step-title">
            <span class="step-number">2</span>
            <div>
              <h4 style="font-size: 1rem; font-weight: 700;">Tahap 2: Menentukan Nilai Ekstrem (Max / Min)</h4>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Kriteria Benefit mencari nilai Max, kriteria Cost mencari nilai Min</p>
            </div>
          </div>
        </div>
        <div class="card-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Keterangan</th>
                  ${saw.criteriaList.map(c => `<th style="text-align: center;">${c.code}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Tipe Kriteria</b></td>
                  ${saw.criteriaList.map(c => `
                    <td style="text-align: center;">
                      <span class="badge ${c.type === 'benefit' ? 'badge-benefit' : 'badge-cost'}">${c.type.toUpperCase()}</span>
                    </td>
                  `).join('')}
                </tr>
                <tr>
                  <td><b>Bobot (W)</b></td>
                  ${saw.criteriaList.map(c => `
                    <td style="text-align: center;" class="mono-val" style="color: var(--primary);">${c.normalizedWeight.toFixed(2)}</td>
                  `).join('')}
                </tr>
                <tr>
                  <td><b>Nilai Ekstrem Rujukan</b></td>
                  ${saw.criteriaList.map(c => {
                    const ext = saw.extremes[c.code];
                    return `
                      <td style="text-align: center;">
                        <span class="mono-val" style="font-weight: 700; color: #10b981;">
                          ${ext.type === 'benefit' ? `Max = ${ext.max}` : `Min = ${ext.min}`}
                        </span>
                      </td>
                    `;
                  }).join('')}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAHAP 3: MATRIKS TERNORMALISASI (R) -->
      <div class="saw-step-card">
        <div class="saw-step-header">
          <div class="saw-step-title">
            <span class="step-number">3</span>
            <div>
              <h4 style="font-size: 1rem; font-weight: 700;">Tahap 3: Matriks Ternormalisasi (R)</h4>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Hasil transformasi nilai rating kinerja ternormalisasi (r_ij)</p>
            </div>
          </div>
        </div>
        <div class="card-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Alternatif (Pelamar)</th>
                  ${saw.criteriaList.map(c => `<th style="text-align: center;">${c.code}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${saw.normalizedMatrix.map(row => `
                  <tr>
                    <td><b>${row.applicantName}</b></td>
                    ${saw.criteriaList.map(c => `
                      <td style="text-align: center;">
                        <span class="mono-val" style="color: var(--primary);">${row.normalizedScores[c.code].toFixed(4)}</span>
                        <div style="font-size: 0.68rem; color: var(--text-dim); font-family: var(--font-mono);">${row.steps[c.code].split('=')[0]}</div>
                      </td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAHAP 4: NILAI PREFERENSI AKHIR (Vi) & PERANGKINGAN -->
      <div class="saw-step-card">
        <div class="saw-step-header">
          <div class="saw-step-title">
            <span class="step-number">4</span>
            <div>
              <h4 style="font-size: 1rem; font-weight: 700;">Tahap 4: Pembobotan & Nilai Preferensi Akhir (Vi)</h4>
              <p style="font-size: 0.75rem; color: var(--text-muted);">V_i = &sum; (w_j &times; r_ij) dan penentuan urutan peringkat</p>
            </div>
          </div>
        </div>
        <div class="card-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Alternatif (Pelamar)</th>
                  <th>Posisi Dilamar</th>
                  <th>Perkalian Bobot (&sum; W &times; R)</th>
                  <th style="text-align: center;">Nilai Akhir (Vi)</th>
                  <th style="text-align: center;">Persentase</th>
                  <th style="text-align: center;">Status Rekomendasi</th>
                  <th style="text-align: center;">Detail Rumus</th>
                </tr>
              </thead>
              <tbody>
                ${saw.rankings.map(item => `
                  <tr>
                    <td><span class="score-pill rank-gold">#${item.rank}</span></td>
                    <td><b>${item.applicantName}</b></td>
                    <td>${item.position}</td>
                    <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); max-width: 320px;">
                      ${saw.criteriaList.map(c => `(${c.normalizedWeight.toFixed(2)}&times;${item.normalizedScores[c.code].toFixed(2)})`).join(' + ')}
                    </td>
                    <td style="text-align: center;">
                      <span class="mono-val" style="font-size: 1.05rem; font-weight: 800; color: var(--primary);">${item.scoreFormatted}</span>
                    </td>
                    <td style="text-align: center;">
                      <span class="mono-val" style="font-weight: 700;">${item.percentage}</span>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge ${item.badgeClass}">${item.finalStatus}</span>
                    </td>
                    <td style="text-align: center;">
                      <button class="btn btn-secondary btn-sm" onclick="App.showApplicantCalculationModal('${item.applicantId}')">
                        🔍 Rincian
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  /* ==========================================================================
     HASIL SELEKSI VIEW
     ========================================================================== */
  renderResults() {
    const applicants = StorageManager.getApplicants();
    const criteria = StorageManager.getCriteria();
    const assessments = StorageManager.getAssessments();
    const company = StorageManager.getCompany();
    const decisions = StorageManager.getDecisions();

    const quotaInput = document.getElementById("input-results-quota");
    const currentQuota = quotaInput ? parseInt(quotaInput.value) || 3 : company.generalQuota || 3;

    const saw = SAWEngine.calculate(criteria, applicants, assessments, currentQuota, decisions);
    this.calculationCache = saw;

    const tableBody = document.getElementById("table-results-body");
    if (!tableBody) return;

    if (!saw.hasData || saw.rankings.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px;">Belum ada hasil seleksi yang dihitung.</td></tr>`;
      return;
    }

    tableBody.innerHTML = saw.rankings.map(item => {
      const app = StorageManager.getApplicantById(item.applicantId);
      const isAccepted = item.finalStatus.includes("Lolos") || item.finalStatus.includes("Diterima");

      return `
        <tr style="${isAccepted ? 'background: rgba(16, 185, 129, 0.04);' : ''}">
          <td>
            <span class="score-pill ${item.rank <= currentQuota ? 'rank-gold' : 'rank-gray'}">
              Rank #${item.rank}
            </span>
          </td>
          <td>
            <div class="table-avatar-cell">
              <img src="${(app && app.avatar) || 'assets/logo.jpg'}" class="table-avatar" alt="${item.applicantName}">
              <div>
                <div style="font-weight: 700;">${item.applicantName}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">${item.applicantId}</div>
              </div>
            </div>
          </td>
          <td>${item.position}</td>
          <td style="text-align: center;">
            <span class="mono-val" style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">${item.scoreFormatted}</span>
          </td>
          <td style="text-align: center;">
            <span class="mono-val">${item.percentage}</span>
          </td>
          <td style="text-align: center;">
            <span class="badge ${item.badgeClass}">${item.finalStatus}</span>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${item.notes || '-'}</span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="App.showApplicantCalculationModal('${item.applicantId}')" title="Lihat Rumus">
                🔍 Rumus
              </button>
              ${Auth.canOverrideDecision() ? `
                <button class="btn btn-primary btn-sm" onclick="App.showDecisionModal('${item.applicantId}', '${item.finalStatus}')" title="Ubah Keputusan">
                  ⚖️ Keputusan
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateResultsQuota() {
    const quotaInput = document.getElementById("input-results-quota");
    if (!quotaInput) return;
    const newQuota = parseInt(quotaInput.value) || 3;
    const company = StorageManager.getCompany();
    company.generalQuota = newQuota;
    StorageManager.saveCompany(company);
    this.toast(`Kuota penerimaan diperbarui menjadi ${newQuota} orang`, "success");
    this.renderResults();
  },

  /* ==========================================================================
     LAPORAN VIEW & PRINT
     ========================================================================== */
  renderReport() {
    const company = StorageManager.getCompany();
    const applicants = StorageManager.getApplicants();
    const criteria = StorageManager.getCriteria();
    const assessments = StorageManager.getAssessments();
    const decisions = StorageManager.getDecisions();

    const saw = SAWEngine.calculate(criteria, applicants, assessments, company.generalQuota || 3, decisions);

    // Update Kop Surat Information
    document.getElementById("report-company-name").textContent = company.name.toUpperCase();
    document.getElementById("report-company-tagline").textContent = company.tagline;
    document.getElementById("report-company-address").textContent = company.address;
    document.getElementById("report-company-contacts").textContent = `Telp/WA: ${company.phone} | Email: ${company.email}`;
    document.getElementById("report-date").textContent = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    document.getElementById("report-leader-name").textContent = company.leaderName;
    document.getElementById("report-leader-title").textContent = company.leaderTitle;
    document.getElementById("report-hrd-name").textContent = company.hrdName;
    document.getElementById("report-hrd-title").textContent = company.hrdTitle;

    // Render Table Rows
    const tableBody = document.getElementById("table-report-body");
    if (!tableBody) return;

    tableBody.innerHTML = saw.rankings.map(item => {
      const app = StorageManager.getApplicantById(item.applicantId);
      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${item.rank}</td>
          <td>${item.applicantId}</td>
          <td><b>${item.applicantName}</b></td>
          <td>${item.position}</td>
          <td>${(app && app.education) || '-'}</td>
          <td style="text-align: center; font-weight: bold;">${item.scoreFormatted}</td>
          <td style="text-align: center; font-weight: bold;">${item.percentage}</td>
          <td style="text-align: center;">
            <span class="badge ${item.badgeClass}">${item.finalStatus}</span>
          </td>
        </tr>
      `;
    }).join('');
  },

  printReport() {
    window.print();
  },

  exportCSV() {
    const company = StorageManager.getCompany();
    const applicants = StorageManager.getApplicants();
    const criteria = StorageManager.getCriteria();
    const assessments = StorageManager.getAssessments();
    const decisions = StorageManager.getDecisions();

    const saw = SAWEngine.calculate(criteria, applicants, assessments, company.generalQuota || 3, decisions);

    let csv = "Rank,ID Pelamar,Nama Lengkap,Posisi,Pendidikan,Nilai SAW (Vi),Persentase,Status Seleksi\n";
    saw.rankings.forEach(r => {
      const app = StorageManager.getApplicantById(r.applicantId);
      csv += `"${r.rank}","${r.applicantId}","${r.applicantName}","${r.position}","${(app && app.education) || ''}","${r.scoreFormatted}","${r.percentage}","${r.finalStatus}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Rekrutmen_BOSNIALine_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    this.toast("Laporan CSV berhasil diunduh!", "success");
  },

  /* ==========================================================================
     PENGATURAN SISTEM VIEW
     ========================================================================== */
  renderSettings() {
    const company = StorageManager.getCompany();
    const users = StorageManager.getUsers();

    // Fill Store Profile Form
    document.getElementById("set-company-name").value = company.name;
    document.getElementById("set-company-tagline").value = company.tagline;
    document.getElementById("set-company-address").value = company.address;
    document.getElementById("set-company-phone").value = company.phone;
    document.getElementById("set-company-email").value = company.email;
    document.getElementById("set-leader-name").value = company.leaderName;
    document.getElementById("set-leader-title").value = company.leaderTitle;
    document.getElementById("set-hrd-name").value = company.hrdName;
    document.getElementById("set-hrd-title").value = company.hrdTitle;
    document.getElementById("set-general-quota").value = company.generalQuota || 3;

    // Render Users Table with management actions
    const usersBody = document.getElementById("table-settings-users-body");
    if (usersBody) {
      const roleColors = { admin: '#00e5ff', hrd: '#10b981', pimpinan: '#a78bfa', pelamar: '#f59e0b' };
      usersBody.innerHTML = users.map(u => {
        const initials = u.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
        const bgColor = roleColors[u.role] || '#94a3b8';
        return `
        <tr>
          <td>
            <div class="table-avatar-cell">
              <div style="width:38px;height:38px;border-radius:50%;background:${bgColor}22;border:2px solid ${bgColor};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;color:${bgColor};flex-shrink:0;">${initials}</div>
              <div>
                <div style="font-weight: 600;">${u.name}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">${u.email}</div>
              </div>
            </div>
          </td>
          <td><span class="mono-val">${u.username}</span></td>
          <td><span class="user-role-badge role-${u.role}">${u.role.toUpperCase()}</span></td>
          <td>
            <span style="font-family: var(--font-mono); color: var(--text-dim);">••••••••</span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="App.showEditUserModal('${u.id}')" title="Edit Akun">
                ✏️ Edit
              </button>
              <button class="btn btn-danger btn-sm" onclick="App.confirmDeleteUser('${u.id}')" title="Hapus Akun" ${u.id === Auth.getCurrentUser()?.id ? 'disabled' : ''}>
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
      }).join('');
    }
  },

  saveSettingsProfile() {
    const company = StorageManager.getCompany();
    company.name = document.getElementById("set-company-name").value;
    company.tagline = document.getElementById("set-company-tagline").value;
    company.address = document.getElementById("set-company-address").value;
    company.phone = document.getElementById("set-company-phone").value;
    company.email = document.getElementById("set-company-email").value;
    company.leaderName = document.getElementById("set-leader-name").value;
    company.leaderTitle = document.getElementById("set-leader-title").value;
    company.hrdName = document.getElementById("set-hrd-name").value;
    company.hrdTitle = document.getElementById("set-hrd-title").value;
    company.generalQuota = parseInt(document.getElementById("set-general-quota").value) || 3;

    StorageManager.saveCompany(company);
    this.toast("Profil Toko Komputer BOSNIALine berhasil diperbarui!", "success");
    this.renderReport();
  },

  backupDatabase() {
    const jsonStr = StorageManager.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Backup_SPK_BOSNIALine_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    this.toast("Cadangan database JSON berhasil diekspor!", "success");
  },

  restoreDatabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const ok = StorageManager.importDatabaseJSON(e.target.result);
      if (ok) {
        this.toast("Database berhasil dipulihkan dari file JSON!", "success");
        setTimeout(() => location.reload(), 1000);
      } else {
        this.toast("Format file cadangan tidak valid!", "error");
      }
    };
    reader.readAsText(file);
  },

  resetDatabase() {
    if (confirm("Apakah Anda yakin ingin me-reset seluruh data ke setelan demo default pabrik?")) {
      StorageManager.resetToDefault();
      this.toast("Data berhasil di-reset ke nilai default!", "success");
      setTimeout(() => location.reload(), 800);
    }
  },

  /* ==========================================================================
     PORTAL PUBLIK CEK STATUS LAMARAN
     ========================================================================== */
  renderCheckStatus() {
    const resultBox = document.getElementById("check-status-result");
    if (resultBox) resultBox.innerHTML = "";
  },

  handleCheckStatus() {
    const query = (document.getElementById("input-check-query")?.value || "").trim().toLowerCase();
    const resultBox = document.getElementById("check-status-result");
    if (!query || !resultBox) return;

    const applicants = StorageManager.getApplicants();
    const found = applicants.find(a => 
      a.id.toLowerCase() === query || 
      a.nik.toLowerCase() === query ||
      a.email.toLowerCase() === query
    );

    if (!found) {
      resultBox.innerHTML = `
        <div class="card" style="border-left: 4px solid var(--danger); padding: 24px;">
          <h4 style="color: var(--danger); margin-bottom: 8px;">❌ Data Tidak Ditemukan</h4>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Tidak ditemukan pelamar dengan Nomor Registrasi / NIK / Email: <b>${query}</b>. Silakan periksa kembali ketikan Anda.</p>
        </div>
      `;
      return;
    }

    const company = StorageManager.getCompany();
    const criteria = StorageManager.getCriteria();
    const assessments = StorageManager.getAssessments();
    const decisions = StorageManager.getDecisions();
    const saw = SAWEngine.calculate(criteria, applicants, assessments, company.generalQuota || 3, decisions);

    const rankInfo = saw.rankings.find(r => r.applicantId === found.id);

    let statusHtml = "";
    if (rankInfo) {
      const isAccepted = rankInfo.finalStatus.includes("Lolos") || rankInfo.finalStatus.includes("Diterima");
      statusHtml = `
        <div class="card" style="border-left: 4px solid ${isAccepted ? 'var(--success)' : 'var(--warning)'}; padding: 28px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <span class="badge ${rankInfo.badgeClass}" style="font-size: 0.85rem; padding: 6px 14px;">${rankInfo.finalStatus}</span>
              <h3 style="margin-top: 10px; font-size: 1.3rem;">${found.name}</h3>
              <p style="color: var(--text-muted); font-size: 0.82rem;">No. Registrasi: <b style="color: var(--primary);">${found.id}</b> | NIK: ${found.nik}</p>
            </div>
            <div style="text-align: right;">
              <span class="score-pill rank-gold" style="font-size: 1rem;">Peringkat #${rankInfo.rank}</span>
              <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">Skor SAW: ${rankInfo.scoreFormatted}</div>
            </div>
          </div>
          
          <div style="background: rgba(0,0,0,0.2); padding: 14px 18px; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 16px;">
            <div><b>Posisi yang Dilamar:</b> ${found.position}</div>
            <div><b>Pendidikan:</b> ${found.education} (${found.schoolName})</div>
            <div><b>Tanggal Mendaftar:</b> ${found.applyDate}</div>
            <div><b>Catatan Panitia:</b> ${rankInfo.notes}</div>
          </div>

          <div style="font-size: 0.88rem; line-height: 1.6;">
            ${isAccepted 
              ? `<div style="color: #10b981; font-weight: 600;">🎉 Selamat! Anda dinyatakan LOLOS seleksi penerimaan karyawan di Toko Komputer BOSNIALine Tenjolaya. Silakan hadir untuk briefing pengenalan toko pada jadwal yang dihubungi oleh tim HRD melalui WhatsApp.</div>`
              : `<div style="color: var(--text-muted);">Terima kasih telah mendaftar di Toko Komputer BOSNIALine Tenjolaya. Tetap semangat, berkas Anda tersimpan dalam basis data talenta cadangan kami.</div>`
            }
          </div>
        </div>
      `;
    } else {
      statusHtml = `
        <div class="card" style="border-left: 4px solid var(--primary); padding: 24px;">
          <h4 style="color: var(--primary); margin-bottom: 8px;">⏳ Berkas Terdaftar & Dalam Tahap Verifikasi</h4>
          <p style="font-size: 0.88rem; color: var(--text-main); margin-bottom: 8px;">Halo <b>${found.name}</b> (${found.id}), lamaran Anda untuk posisi <b>${found.position}</b> telah kami terima dan saat ini sedang dalam proses evaluasi kriteria oleh Tim HRD BOSNIALine.</p>
        </div>
      `;
    }

    resultBox.innerHTML = statusHtml;
  },

  /* ==========================================================================
     INPUT / PENDAFTARAN PELAMAR BARU
     ========================================================================== */
  handleRegisterApplicant(event) {
    event.preventDefault();
    const form = event.target;

    const newApplicant = {
      name: form.name.value.trim(),
      nik: form.nik.value.trim(),
      gender: form.gender.value,
      birthPlace: form.birthPlace.value.trim(),
      birthDate: form.birthDate.value,
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      position: form.position.value,
      education: form.education.value,
      schoolName: form.schoolName.value.trim(),
      gradYear: parseInt(form.gradYear.value) || 2023,
      experience: form.experience.value.trim(),
      skills: form.skills.value.trim(),
      salaryExpectation: parseInt(form.salaryExpectation.value) || 2500000,
      avatar: form.gender.value === "Perempuan"
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      status: "Terverifikasi",
      applyDate: new Date().toISOString().split('T')[0]
    };

    const added = StorageManager.addApplicant(newApplicant);
    this.toast(`Pelamar ${added.name} berhasil didaftarkan dengan ID: ${added.id}!`, "success");

    // Auto-seed initial assessment (skor 3 rata-rata) agar langsung siap dihitung
    StorageManager.saveApplicantAssessment(added.id, {
      C1: 3, C2: 3, C3: 4, C4: 3, C5: 4, C6: 3,
      notes: "Nilai awal pendaftaran baru"
    });

    form.reset();
    this.navigateTo("applicants");
  },

  /* ==========================================================================
     MODALS SETUP & HANDLERS
     ========================================================================== */
  setupModals() {
    // Tombol close modal
    document.querySelectorAll(".btn-modal-close, .btn-close-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
      });
    });

    // Close on click outside
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
    });
  },

  showApplicantDetailModal(applicantId) {
    const app = StorageManager.getApplicantById(applicantId);
    if (!app) return;

    const modal = document.getElementById("modal-applicant-detail");
    const container = document.getElementById("modal-applicant-detail-content");

    container.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid var(--border-subtle);">
        <img src="${app.avatar || 'assets/logo.jpg'}" style="width: 80px; height: 80px; border-radius: var(--radius-full); object-fit: cover; border: 2px solid var(--primary);" alt="${app.name}">
        <div>
          <span class="score-pill">${app.id}</span>
          <h2 style="font-size: 1.35rem; font-weight: 800; margin-top: 4px;">${app.name}</h2>
          <div style="color: var(--primary); font-weight: 600; font-size: 0.9rem;">${app.position}</div>
          <div style="font-size: 0.78rem; color: var(--text-dim);">Terdaftar: ${app.applyDate} | NIK: ${app.nik}</div>
        </div>
      </div>

      <div class="grid-2">
        <div>
          <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase;">Biodata & Kontak</h4>
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><b>Tempat, Tgl Lahir:</b> ${app.birthPlace}, ${app.birthDate}</p>
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><b>Jenis Kelamin:</b> ${app.gender}</p>
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><b>No. WhatsApp:</b> <a href="https://wa.me/${app.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #10b981; text-decoration: none;">${app.phone} 💬</a></p>
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><b>Email:</b> ${app.email}</p>
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><b>Alamat:</b> ${app.address}</p>
        </div>
        <div>
          <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase;">Pendidikan & Gaji</h4>
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><b>Pendidikan:</b> ${app.education}</p>
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><b>Asal Sekolah/Kampus:</b> ${app.schoolName || '-'}</p>
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><b>Tahun Kelulusan:</b> ${app.gradYear || '-'}</p>
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><b>Ekspektasi Gaji:</b> <span class="mono-val" style="color: #10b981;">Rp ${(app.salaryExpectation || 0).toLocaleString('id-ID')}</span></p>
        </div>
      </div>

      <div style="margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--border-subtle);">
        <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">Pengalaman Kerja</h4>
        <p style="font-size: 0.88rem; color: var(--text-main); line-height: 1.5;">${app.experience || 'Belum ada pengalaman kerja'}</p>
      </div>

      <div style="margin-top: 14px;">
        <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">Keahlian Komputer & Portofolio</h4>
        <p style="font-size: 0.88rem; color: var(--text-main); line-height: 1.5;">${app.skills || 'Hardware PC, Software OS'}</p>
      </div>

      <div style="margin-top: 18px; background: rgba(0,0,0,0.2); padding: 14px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">📄</span>
          <div>
            <div style="font-weight: 600; font-size: 0.85rem;">${app.cvFilename || 'Curriculum_Vitae_Pelamar.pdf'}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">Berkas PDF Terverifikasi • 1.4 MB</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="App.downloadApplicantCV('${app.id}')">
          📄 Unduh CV
        </button>
      </div>
    `;

    modal.classList.add("active");
  },

  showAssessmentModal(applicantId) {
    const app = StorageManager.getApplicantById(applicantId);
    if (!app) return;

    const criteria = StorageManager.getCriteria();
    const assessments = StorageManager.getAssessments();
    const currentScores = assessments[applicantId] || {};

    const modal = document.getElementById("modal-assessment");
    document.getElementById("modal-assessment-applicant-name").textContent = `${app.name} (${app.id})`;
    document.getElementById("modal-assessment-applicant-id").value = applicantId;

    const fieldsContainer = document.getElementById("modal-assessment-fields");
    fieldsContainer.innerHTML = criteria.map(c => {
      const currentVal = currentScores[c.code] !== undefined ? currentScores[c.code] : 3;

      let optionsHtml = "";
      if (c.subCriteria && c.subCriteria.length > 0) {
        optionsHtml = c.subCriteria.map(s => `
          <option value="${s.value}" ${s.value == currentVal ? 'selected' : ''}>
            Skor ${s.value} - ${s.label} (${s.desc})
          </option>
        `).join('');
      } else {
        optionsHtml = [1, 2, 3, 4, 5].map(n => `
          <option value="${n}" ${n == currentVal ? 'selected' : ''}>Skor ${n}</option>
        `).join('');
      }

      return `
        <div class="form-group">
          <label class="form-label" style="display: flex; justify-content: space-between;">
            <span><b>[${c.code}] ${c.name}</b> (${c.type.toUpperCase()})</span>
            <span style="color: var(--primary); font-family: var(--font-mono);">Bobot: ${(parseFloat(c.weight)*100).toFixed(0)}%</span>
          </label>
          <select class="form-control" name="score_${c.code}" id="input_score_${c.code}">
            ${optionsHtml}
          </select>
          <div class="input-help">${c.description}</div>
        </div>
      `;
    }).join('');

    document.getElementById("modal-assessment-notes").value = currentScores.notes || "";
    modal.classList.add("active");
  },

  saveAssessmentForm(event) {
    event.preventDefault();
    const applicantId = document.getElementById("modal-assessment-applicant-id").value;
    const criteria = StorageManager.getCriteria();

    const scoresObj = {};
    criteria.forEach(c => {
      const input = document.getElementById(`input_score_${c.code}`);
      if (input) {
        scoresObj[c.code] = parseFloat(input.value);
      }
    });

    const notes = document.getElementById("modal-assessment-notes").value.trim();

    StorageManager.saveApplicantAssessment(applicantId, scoresObj, notes);
    this.toast("Penilaian berhasil disimpan ke database!", "success");

    document.getElementById("modal-assessment").classList.remove("active");
    this.renderAssessments();
    this.renderDashboard();
  },

  autoFillSampleAssessments() {
    const applicants = StorageManager.getApplicants();
    const criteria = StorageManager.getCriteria();

    applicants.forEach((app, idx) => {
      const scores = {};
      criteria.forEach(c => {
        // Berikan nilai realistis 2 - 5
        const rand = 3 + (idx % 3);
        scores[c.code] = Math.min(5, Math.max(1, rand));
      });
      StorageManager.saveApplicantAssessment(app.id, scores, "Penilaian otomatis simulasi demo");
    });

    this.toast("Nilai simulasi otomatis untuk seluruh pelamar berhasil diisi!", "success");
    this.renderAssessments();
    this.renderSawCalculation();
  },

  showApplicantCalculationModal(applicantId) {
    if (!this.calculationCache || !this.calculationCache.hasData) {
      // Auto-hitung jika cache kosong
      const applicants = StorageManager.getApplicants();
      const criteria = StorageManager.getCriteria();
      const assessments = StorageManager.getAssessments();
      const company = StorageManager.getCompany();
      const decisions = StorageManager.getDecisions();
      this.calculationCache = SAWEngine.calculate(criteria, applicants, assessments, company.generalQuota || 3, decisions);
    }

    if (!this.calculationCache || !this.calculationCache.hasData) {
      this.toast("Belum ada data penilaian yang bisa ditampilkan. Silakan isi nilai pelamar terlebih dahulu.", "error");
      return;
    }

    const explanation = SAWEngine.generateApplicantExplanation(applicantId, this.calculationCache);
    if (!explanation) return;

    const modal = document.getElementById("modal-calculation-detail");
    const container = document.getElementById("modal-calculation-detail-content");

    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <span class="score-pill rank-gold">Rank #${explanation.rankingInfo.rank}</span>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-top: 6px;">${explanation.applicant.name}</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted);">Posisi: ${explanation.applicant.position} | Nilai Preferensi SAW (Vi): <b style="color: var(--primary); font-family: var(--font-mono); font-size: 1rem;">${explanation.totalScore} (${explanation.percentage})</b></p>
      </div>

      <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; margin-bottom: 12px;">Rincian Perhitungan Per Kriteria:</div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${explanation.steps.map(s => `
          <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div>
                <b>[${s.criterion.code}] ${s.criterion.name}</b>
                <span class="badge ${s.criterion.type === 'benefit' ? 'badge-benefit' : 'badge-cost'}" style="margin-left: 6px;">${s.criterion.type.toUpperCase()}</span>
              </div>
              <div class="mono-val" style="color: var(--primary);">Bobot W = ${s.weightFormatted}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem; font-family: var(--font-mono); background: rgba(0,229,255,0.04); padding: 8px 12px; border-radius: var(--radius-sm);">
              <div>
                <span style="color: var(--text-muted);">Normalisasi (R):</span><br>
                <span>${s.formula}</span>
              </div>
              <div>
                <span style="color: var(--text-muted);">Kontribusi Terbobot (W &times; R):</span><br>
                <span style="color: #10b981;">${s.weightedFormula}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 18px; padding: 14px; background: rgba(0,229,255,0.08); border: 1px solid rgba(0,229,255,0.3); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.85rem;">
        <b>Total Nilai Preferensi (Vi):</b><br>
        <span>Vi = &sum; (w_j &times; r_ij) = ${explanation.steps.map(s => s.weightedFormatted).join(' + ')} = <b style="color: var(--primary); font-size: 1.05rem;">${explanation.totalScore}</b></span>
      </div>
    `;

    modal.classList.add("active");
  },

  showDecisionModal(applicantId, currentStatus) {
    const app = StorageManager.getApplicantById(applicantId);
    if (!app) return;

    const decisions = StorageManager.getDecisions();
    const currentDec = decisions[applicantId] || {};

    const modal = document.getElementById("modal-decision");
    document.getElementById("modal-decision-applicant-id").value = applicantId;
    document.getElementById("modal-decision-applicant-name").textContent = `${app.name} (${app.id})`;
    document.getElementById("modal-decision-status").value = currentDec.status || (currentStatus.includes("Lolos") ? "Lolos / Diterima" : currentStatus);
    document.getElementById("modal-decision-notes").value = currentDec.notes || "";

    modal.classList.add("active");
  },

  saveDecisionForm(event) {
    event.preventDefault();
    const applicantId = document.getElementById("modal-decision-applicant-id").value;
    const status = document.getElementById("modal-decision-status").value;
    const notes = document.getElementById("modal-decision-notes").value.trim();

    StorageManager.setDecision(applicantId, status, notes);
    this.toast("Status keputusan pelamar berhasil diperbarui!", "success");

    document.getElementById("modal-decision").classList.remove("active");
    this.renderResults();
    this.renderDashboard();
  },

  showEditCriteriaModal(criterionCode) {
    const criteria = StorageManager.getCriteria();
    const crit = criteria.find(c => c.code === criterionCode);
    if (!crit) return;

    const modal = document.getElementById("modal-criteria");
    document.getElementById("modal-criteria-code").value = crit.code;
    document.getElementById("modal-criteria-name").value = crit.name;
    document.getElementById("modal-criteria-type").value = crit.type;
    document.getElementById("modal-criteria-weight").value = crit.weight;
    document.getElementById("modal-criteria-desc").value = crit.description;

    modal.classList.add("active");
  },

  saveCriteriaForm(event) {
    event.preventDefault();
    const code = document.getElementById("modal-criteria-code").value;
    const name = document.getElementById("modal-criteria-name").value.trim();
    const type = document.getElementById("modal-criteria-type").value;
    const weight = parseFloat(document.getElementById("modal-criteria-weight").value) || 0;
    const desc = document.getElementById("modal-criteria-desc").value.trim();

    const criteria = StorageManager.getCriteria();
    const idx = criteria.findIndex(c => c.code === code);
    if (idx !== -1) {
      criteria[idx] = {
        ...criteria[idx],
        name,
        type,
        weight,
        description: desc
      };
      StorageManager.saveCriteria(criteria);
      this.toast(`Kriteria ${code} berhasil diperbarui!`, "success");
    }

    document.getElementById("modal-criteria").classList.remove("active");
    this.renderCriteria();
    this.renderDashboard();
  },

  showLoginModal() {
    const modal = document.getElementById("modal-login");
    if (modal) modal.classList.add("active");
  },

  handleLoginForm(event) {
    event.preventDefault();
    const username = event.target.username.value.trim();
    const password = event.target.password.value;

    const res = Auth.login(username, password);
    if (res.success) {
      this.updateUserSessionUI();
      this.toast(`Selamat datang kembali, ${res.user.name}!`, "success");
      document.getElementById("modal-login").classList.remove("active");
      this.navigateTo("dashboard");
    } else {
      this.toast(res.message, "error");
    }
  },

  confirmDeleteApplicant(applicantId) {
    const app = StorageManager.getApplicantById(applicantId);
    if (!app) return;

    if (confirm(`Apakah Anda yakin ingin menghapus data pelamar: ${app.name} (${app.id})?`)) {
      StorageManager.deleteApplicant(applicantId);
      this.toast(`Data pelamar ${app.name} telah dihapus.`, "info");
      this.renderApplicantsTable();
      this.renderDashboard();
    }
  },

  /* ==========================================================================
     EDIT DATA PELAMAR
     ========================================================================== */
  showEditApplicantModal(applicantId) {
    const app = StorageManager.getApplicantById(applicantId);
    if (!app) return;

    // Isi semua field form dengan data saat ini
    document.getElementById("modal-edit-applicant-id").value = app.id;
    document.getElementById("modal-edit-applicant-subtitle").textContent =
      `ID: ${app.id} — Terdaftar: ${app.applyDate}`;

    document.getElementById("edit-name").value       = app.name || "";
    document.getElementById("edit-nik").value        = app.nik || "";
    document.getElementById("edit-gender").value     = app.gender || "Laki-laki";
    document.getElementById("edit-birthplace").value = app.birthPlace || "";
    document.getElementById("edit-birthdate").value  = app.birthDate || "";
    document.getElementById("edit-phone").value      = app.phone || "";
    document.getElementById("edit-email").value      = app.email || "";
    document.getElementById("edit-address").value    = app.address || "";
    document.getElementById("edit-position").value   = app.position || "";
    document.getElementById("edit-education").value  = app.education || "";
    document.getElementById("edit-school").value     = app.schoolName || "";
    document.getElementById("edit-gradyear").value   = app.gradYear || 2022;
    document.getElementById("edit-experience").value = app.experience || "";
    document.getElementById("edit-skills").value     = app.skills || "";
    document.getElementById("edit-salary").value     = app.salaryExpectation || 2600000;
    document.getElementById("edit-status").value     = app.status || "Terverifikasi";

    document.getElementById("modal-edit-applicant").classList.add("active");
  },

  handleEditApplicant(event) {
    event.preventDefault();
    const applicantId = document.getElementById("modal-edit-applicant-id").value;
    const gender = document.getElementById("edit-gender").value;

    const updatedFields = {
      name:               document.getElementById("edit-name").value.trim(),
      nik:                document.getElementById("edit-nik").value.trim(),
      gender:             gender,
      birthPlace:         document.getElementById("edit-birthplace").value.trim(),
      birthDate:          document.getElementById("edit-birthdate").value,
      phone:              document.getElementById("edit-phone").value.trim(),
      email:              document.getElementById("edit-email").value.trim(),
      address:            document.getElementById("edit-address").value.trim(),
      position:           document.getElementById("edit-position").value,
      education:          document.getElementById("edit-education").value,
      schoolName:         document.getElementById("edit-school").value.trim(),
      gradYear:           parseInt(document.getElementById("edit-gradyear").value) || 2022,
      experience:         document.getElementById("edit-experience").value.trim(),
      skills:             document.getElementById("edit-skills").value.trim(),
      salaryExpectation:  parseInt(document.getElementById("edit-salary").value) || 2600000,
      status:             document.getElementById("edit-status").value,
      // Update avatar sesuai gender terbaru
      avatar: gender === "Perempuan"
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    };

    const result = StorageManager.updateApplicant(applicantId, updatedFields);
    if (result) {
      this.toast(`Data pelamar ${result.name} berhasil diperbarui!`, "success");
      document.getElementById("modal-edit-applicant").classList.remove("active");
      this.renderApplicantsTable();
      this.renderDashboard();
    } else {
      this.toast("Gagal menyimpan perubahan. Pelamar tidak ditemukan.", "error");
    }
  },

  /* ==========================================================================
     DOWNLOAD CV PELAMAR
     ========================================================================== */
  downloadApplicantCV(applicantId) {
    const app = StorageManager.getApplicantById(applicantId);
    if (!app) return;

    // Buat konten CV teks sebagai file PDF-simulasi (file .txt terformat)
    const cvContent = `
====================================================
  CURRICULUM VITAE - CALON PELAMAR
  TOKO KOMPUTER BOSNIALINE TENJOLAYA
====================================================

No. Registrasi  : ${app.id}
Tanggal Cetak   : ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}

----------------------------------------------------
  A. DATA PRIBADI
----------------------------------------------------
Nama Lengkap    : ${app.name}
NIK KTP         : ${app.nik}
Jenis Kelamin   : ${app.gender}
Tempat Lahir    : ${app.birthPlace}
Tanggal Lahir   : ${app.birthDate}
Alamat          : ${app.address}

----------------------------------------------------
  B. KONTAK
----------------------------------------------------
No. WhatsApp    : ${app.phone}
Email           : ${app.email}

----------------------------------------------------
  C. PENDIDIKAN TERAKHIR
----------------------------------------------------
Jenjang         : ${app.education}
Nama Sekolah    : ${app.schoolName || '-'}
Tahun Lulus     : ${app.gradYear || '-'}

----------------------------------------------------
  D. POSISI & GAJI
----------------------------------------------------
Posisi Dilamar  : ${app.position}
Exp. Gaji (Rp)  : Rp ${(app.salaryExpectation || 0).toLocaleString('id-ID')}
Tgl Pendaftaran : ${app.applyDate}

----------------------------------------------------
  E. PENGALAMAN KERJA
----------------------------------------------------
${app.experience || 'Belum ada pengalaman kerja yang dicantumkan.'}

----------------------------------------------------
  F. KEAHLIAN KHUSUS
----------------------------------------------------
${app.skills || 'Hardware PC, Software OS'}

====================================================
  Dicetak dari: SPK Rekrutmen BOSNIALine Tenjolaya
====================================================
`.trim();

    const blob = new Blob([cvContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CV_${app.name.replace(/\s+/g, '_')}_${app.id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    this.toast(`CV ${app.name} berhasil diunduh!`, "success");
  },

  /* ==========================================================================
     MANAJEMEN AKUN PENGGUNA (SETTINGS)
     ========================================================================== */
  showAddUserModal() {
    const modal = document.getElementById("modal-user");
    if (!modal) return;

    // Reset form untuk mode tambah baru
    document.getElementById("modal-user-id").value = "";
    document.getElementById("modal-user-name").value = "";
    document.getElementById("modal-user-username").value = "";
    document.getElementById("modal-user-email").value = "";
    document.getElementById("modal-user-role").value = "hrd";
    document.getElementById("modal-user-password").value = "";
    document.getElementById("modal-user-password").required = true;
    document.getElementById("modal-user-password-help").textContent = "Wajib diisi untuk akun baru.";
    document.getElementById("modal-user-title").textContent = "Tambah Akun Pengguna Baru";

    modal.classList.add("active");
  },

  showEditUserModal(userId) {
    const users = StorageManager.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById("modal-user");
    if (!modal) return;

    document.getElementById("modal-user-id").value = user.id;
    document.getElementById("modal-user-name").value = user.name;
    document.getElementById("modal-user-username").value = user.username;
    document.getElementById("modal-user-email").value = user.email;
    document.getElementById("modal-user-role").value = user.role;
    document.getElementById("modal-user-password").value = "";
    document.getElementById("modal-user-password").required = false;
    document.getElementById("modal-user-password-help").textContent = "Kosongkan jika tidak ingin mengubah kata sandi.";
    document.getElementById("modal-user-title").textContent = `Edit Akun: ${user.name}`;

    modal.classList.add("active");
  },

  saveUserForm(event) {
    event.preventDefault();
    const userId = document.getElementById("modal-user-id").value.trim();
    const name = document.getElementById("modal-user-name").value.trim();
    const username = document.getElementById("modal-user-username").value.trim();
    const email = document.getElementById("modal-user-email").value.trim();
    const role = document.getElementById("modal-user-role").value;
    const password = document.getElementById("modal-user-password").value;

    const users = StorageManager.getUsers();

    // Cek duplikat username
    const duplicateUsername = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== userId);
    if (duplicateUsername) {
      this.toast("Username sudah digunakan oleh akun lain!", "error");
      return;
    }

    if (userId) {
      // Mode Edit
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        users[idx].name = name;
        users[idx].username = username;
        users[idx].email = email;
        users[idx].role = role;
        if (password) users[idx].password = password;
        StorageManager.saveUsers(users);
        this.toast(`Akun ${name} berhasil diperbarui!`, "success");

        // Update current user session jika yang diedit adalah user aktif
        const currentUser = Auth.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          Auth.currentUser = users[idx];
          StorageManager.setCurrentUser(users[idx]);
          this.updateUserSessionUI();
        }
      }
    } else {
      // Mode Tambah Baru
      if (!password) {
        this.toast("Kata sandi wajib diisi untuk akun baru!", "error");
        return;
      }
      const count = users.length + 1;
      const newUser = {
        id: `usr-${username.toLowerCase().replace(/\s+/g, '-')}-${count}`,
        username,
        password,
        name,
        email,
        role,
        avatar: role === "pelamar"
          ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
      };
      users.push(newUser);
      StorageManager.saveUsers(users);
      this.toast(`Akun baru ${name} (${role.toUpperCase()}) berhasil ditambahkan!`, "success");
    }

    document.getElementById("modal-user").classList.remove("active");
    this.renderSettings();
  },

  confirmDeleteUser(userId) {
    const users = StorageManager.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const currentUser = Auth.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.toast("Tidak dapat menghapus akun yang sedang aktif!", "error");
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun: ${user.name} (${user.username})?`)) {
      const updated = users.filter(u => u.id !== userId);
      StorageManager.saveUsers(updated);
      this.toast(`Akun ${user.name} telah dihapus.`, "info");
      this.renderSettings();
    }
  }
};

// Auto boot on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
