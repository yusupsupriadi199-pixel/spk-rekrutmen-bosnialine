/**
 * AUTH & ROLE-BASED ACCESS CONTROL (RBAC)
 * Toko Komputer BOSNIALine Tenjolaya
 */

const Auth = {
  currentUser: null,

  init() {
    this.currentUser = StorageManager.getCurrentUser();
    return this.currentUser;
  },

  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = StorageManager.getCurrentUser();
    }
    return this.currentUser;
  },

  login(username, password) {
    const users = StorageManager.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      this.currentUser = user;
      StorageManager.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: "Username atau password salah!" };
  },

  quickLogin(role) {
    const users = StorageManager.getUsers();
    const user = users.find(u => u.role === role);
    if (user) {
      this.currentUser = user;
      StorageManager.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: `Akun role ${role} tidak ditemukan.` };
  },

  logout() {
    this.currentUser = null;
    StorageManager.setCurrentUser(null);
  },

  /**
   * Cek izin akses menu berdasarkan role
   * Roles: 'admin', 'hrd', 'pimpinan', 'pelamar'
   */
  canAccess(menuId) {
    if (!this.currentUser) return false;
    const role = this.currentUser.role;

    switch (menuId) {
      case "dashboard":
        return true; // semua role bisa lihat dashboard
      case "applicants":
        return ["admin", "hrd", "pimpinan"].includes(role);
      case "register-applicant":
        // Pelamar bisa mendaftarkan diri sendiri
        return ["admin", "hrd", "pimpinan", "pelamar"].includes(role);
      case "criteria":
        return ["admin", "hrd", "pimpinan"].includes(role);
      case "assessment":
        return ["admin", "hrd"].includes(role);
      case "saw-calculation":
        // Pelamar bisa melihat perhitungan SAW (read-only)
        return ["admin", "hrd", "pimpinan", "pelamar"].includes(role);
      case "results":
        // Pelamar bisa melihat hasil seleksi & ranking (read-only)
        return ["admin", "hrd", "pimpinan", "pelamar"].includes(role);
      case "reports":
        return ["admin", "hrd", "pimpinan"].includes(role);
      case "settings":
        return ["admin"].includes(role);
      case "public-portal":
      case "check-status":
        return true; // bisa diakses siapa saja
      default:
        return true;
    }
  },

  canEditCriteria() {
    return this.currentUser && ["admin"].includes(this.currentUser.role);
  },

  canInputAssessment() {
    return this.currentUser && ["admin", "hrd"].includes(this.currentUser.role);
  },

  canOverrideDecision() {
    return this.currentUser && ["admin", "pimpinan"].includes(this.currentUser.role);
  },

  canManageSettings() {
    return this.currentUser && this.currentUser.role === "admin";
  }
};
