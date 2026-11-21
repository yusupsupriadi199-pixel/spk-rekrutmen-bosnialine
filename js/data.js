/**
 * DATA DEFAULT & SEED DATABASE
 * Toko Komputer BOSNIALine Tenjolaya - Sistem Pendukung Keputusan Rekrutmen Karyawan (Metode SAW)
 */

const DEFAULT_COMPANY = {
  name: "Toko Komputer BOSNIALine",
  tagline: "Pusat Penjualan Komputer, Laptop, Sparepart & Servis Terpercaya",
  branch: "Cabang Utama Tenjolaya - Bogor",
  address: "Jl.Abd Fatah Kp.Cibitung, 08/05 Kec. Tenjolaya, Kabupaten Bogor, Jawa Barat - 16370",
  phone: "085716444966",
  whatsapp: "6285712345678",
  email: "rekrutmen@bosnialine-computer.com",
  leaderName: "Yusup Supriadi",
  leaderTitle: "Pimpinan & Pemilik Usaha",
  hrdName: "Yusran, S.Kom.",
  hrdTitle: "Kepala Tim Rekrutmen & HRD",
  logoUrl: "assets/logo.jpg",
  bannerUrl: "assets/store-banner.jpg",
  quotaSettings: {
    "Teknisi Komputer & Laptop": 2,
    "Kasir & Front Office": 1,
    "Marketing Digital & Admin Toko": 1,
    "Gudang & Logistik Sparepart": 1
  },
  generalQuota: 3,
  minimumPassingScore: 0.70
};

const DEFAULT_USERS = [
  {
    id: "usr-admin",
    username: "admin",
    password: "admin123",
    name: "Administrator Utama",
    email: "admin@bosnialine-computer.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-hrd",
    username: "hrd",
    password: "hrd123",
    name: "Yusup Maulana (HRD)",
    email: "hrd@bosnialine-computer.com",
    role: "hrd",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-pimpinan",
    username: "pimpinan",
    password: "pimpinan123",
    name: "Yusup Supriadi",
    email: "yusup@bosnialine-computer.com",
    role: "pimpinan",
    avatar: "https://ibb.co.com/Cs1tfWpG"
  },
  {
    id: "usr-pelamar",
    username: "pelamar",
    password: "pelamar123",
    name: "Ahmad Fauzi (Pelamar)",
    email: "ahmad.fauzi@gmail.com",
    role: "pelamar",
    applicantId: "BSN-2026-001",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  }
];

const DEFAULT_CRITERIA = [
  {
    id: "C1",
    code: "C1",
    name: "Tes Praktik & Keahlian Komputer",
    type: "benefit", // benefit or cost
    weight: 0.25, // 25%
    description: "Keterampilan merakit PC, analisa kerusakan motherboard, instalasi OS/software & servis laptop",
    subCriteria: [
      { value: 5, label: "Sangat Mahir", desc: "Mampu analisa IC motherboard, solder chip, rakit PC high-end, mikrotik & OS" },
      { value: 4, label: "Mahir", desc: "Mampu rakit PC standar, perbaikan laptop umum, ganti keyboard/LCD, install dual boot" },
      { value: 3, label: "Cukup", desc: "Mampu merakit PC dasar dan instalasi OS Windows standar" },
      { value: 2, label: "Kurang", desc: "Hanya paham teori komponen komputer, belum lancar praktek" },
      { value: 1, label: "Sangat Kurang", desc: "Tidak memiliki dasar keahlian perakitan dan servis" }
    ]
  },
  {
    id: "C2",
    code: "C2",
    name: "Pengalaman Kerja Komputer / Retail",
    type: "benefit",
    weight: 0.20, // 20%
    description: "Lama pengalaman kerja di bidang toko komputer, servis elektronik atau bidang yang relevan",
    subCriteria: [
      { value: 5, label: "> 3 Tahun", desc: "Pengalaman lebih dari 3 tahun di service center atau toko komputer resmi" },
      { value: 4, label: "2 - 3 Tahun", desc: "Pengalaman 2 hingga 3 tahun di bidang servis/toko komputer" },
      { value: 3, label: "1 - 2 Tahun", desc: "Pengalaman 1 hingga 2 tahun pada posisi relevan" },
      { value: 2, label: "< 1 Tahun / Magang", desc: "Pengalaman kerja kurang dari 1 tahun atau riwayat PKL/Magang" },
      { value: 1, label: "Fresh Graduate", desc: "Belum pernah memiliki pengalaman kerja formal sama sekali" }
    ]
  },
  {
    id: "C3",
    code: "C3",
    name: "Wawancara, Attitude & Komunikasi",
    type: "benefit",
    weight: 0.20, // 20%
    description: "Etika keramahan melayani pelanggan, kejujuran, disiplin, kerja sama tim dan komunikasi",
    subCriteria: [
      { value: 5, label: "Sangat Baik (A)", desc: "Komunikasi sangat lancar, etika tinggi, jujur, percaya diri & loyal" },
      { value: 4, label: "Baik (B)", desc: "Komunikasi jelas, ramah, sopan dan memiliki etos kerja baik" },
      { value: 3, label: "Cukup (C)", desc: "Komunikasi standar, cukup sopan, perlu sedikit pembinaan keramahan" },
      { value: 2, label: "Kurang (D)", desc: "Pasif saat wawancara, respon datar, kurang berorientasi pelanggan" },
      { value: 1, label: "Buruk (E)", desc: "Sikap kurang sopan atau terindikasi tidak disiplin" }
    ]
  },
  {
    id: "C4",
    code: "C4",
    name: "Pendidikan Terakhir & Kesesuaian",
    type: "benefit",
    weight: 0.15, // 15%
    description: "Tingkat jenjang pendidikan formal dan relevansi jurusan dengan operasional toko komputer",
    subCriteria: [
      { value: 5, label: "S1 Teknik Komputer / TI / SI", desc: "Sarjana Komputer dengan relevansi keilmuan sangat tinggi" },
      { value: 4, label: "D3 Komputer / Manajemen Informatika", desc: "Diploma bidang teknologi komputer atau sejenis" },
      { value: 3, label: "SMK TKJ / RPL / Multimedia", desc: "Lulusan SMK bidang Teknologi Informasi & Komputer" },
      { value: 2, label: "SMA / SMK Jurusan Lain", desc: "Lulusan SMA Umum atau SMK non-komputer" },
      { value: 1, label: "SMP Sederajat", desc: "Pendidikan setingkat SMP" }
    ]
  },
  {
    id: "C5",
    code: "C5",
    name: "Ekspektasi Gaji (Biaya Beban)",
    type: "cost", // Kriteria COST: semakin kecil ekspektasi gaji, semakin efisien bagi operasional toko
    weight: 0.10, // 10%
    description: "Besaran ekspektasi gaji bulanan yang diajukan pelamar (Kriteria Cost: semakin rasional semakin bernilai tinggi)",
    subCriteria: [
      { value: 1, label: "> Rp 4.000.000", desc: "Ekspektasi gaji tinggi di atas plafon anggaran toko cabang" },
      { value: 2, label: "Rp 3.500.000 - Rp 4.000.000", desc: "Ekspektasi gaji mendekati batas atas plafon anggaran" },
      { value: 3, label: "Rp 3.000.000 - Rp 3.500.000", desc: "Ekspektasi gaji standar UMR / pasar retail komputer" },
      { value: 4, label: "Rp 2.500.000 - Rp 3.000.000", desc: "Ekspektasi gaji ramah anggaran operasional" },
      { value: 5, label: "< Rp 2.500.000", desc: "Ekspektasi gaji sangat hemat bagi pengeluaran toko" }
    ]
  },
  {
    id: "C6",
    code: "C6",
    name: "Tes Tertulis & Psikotes Dasar",
    type: "benefit",
    weight: 0.10, // 10%
    description: "Tes pengetahuan umum hardware, logika matematika dasar, ketelitian & tes kepribadian",
    subCriteria: [
      { value: 5, label: "Skor 86 - 100", desc: "Nilai tes tertulis luar biasa, ketelitian tinggi" },
      { value: 4, label: "Skor 76 - 85", desc: "Nilai tes tertulis baik dan memenuhi standar kerja" },
      { value: 3, label: "Skor 65 - 75", desc: "Nilai tes tertulis pas-pasan batas minimum" },
      { value: 2, label: "Skor 50 - 64", desc: "Nilai tes tertulis di bawah ekspektasi" },
      { value: 1, label: "Skor < 50", desc: "Nilai tes tertulis sangat rendah" }
    ]
  }
];

const DEFAULT_APPLICANTS = [
  {
    id: "BSN-2026-001",
    name: "Ahmad Fauzi",
    nik: "3201201504990001",
    gender: "Laki-laki",
    birthPlace: "Bogor",
    birthDate: "1999-04-15",
    phone: "0812-3456-7890",
    email: "ahmad.fauzi@gmail.com",
    address: "Kp. Tenjolaya Hilir RT 03/RW 02, Kec. Tenjolaya, Kab. Bogor",
    position: "Teknisi Komputer & Laptop",
    education: "SMK TKJ (Teknik Komputer Jaringan)",
    schoolName: "SMK Negeri 1 Tenjolaya",
    gradYear: 2020,
    experience: "3 tahun teknisi perbaikan laptop dan perakitan PC di Mangga Dua & freelance Bogor",
    skills: "Solder motherboard, reflow chip, rakit PC gaming watercooling, instalasi mikrotik, flashing bios",
    salaryExpectation: 2800000,
    applyDate: "2026-10-15",
    status: "Terverifikasi",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    cvFilename: "CV_Ahmad_Fauzi_Teknisi.pdf"
  },
  {
    id: "BSN-2026-002",
    name: "Rina Anggraeni",
    nik: "3201205208010002",
    gender: "Perempuan",
    birthPlace: "Bogor",
    birthDate: "2001-08-12",
    phone: "0858-9876-5432",
    email: "rina.anggraeni@gmail.com",
    address: "Jl. Ciampea Raya No. 45, Ciampea, Kab. Bogor",
    position: "Kasir & Front Office",
    education: "D3 Manajemen Informatika",
    schoolName: "Politeknik Negeri Media Kreatif",
    gradYear: 2022,
    experience: "2 tahun sebagai kasir POS & customer care di retail elektronik",
    skills: "Software POS Kasir, Akuntansi Kas Kecil, Ms. Excel Lanjutan, Komunikasi Pelanggan Ramah",
    salaryExpectation: 2600000,
    applyDate: "2026-10-16",
    status: "Terverifikasi",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    cvFilename: "CV_Rina_Anggraeni_Kasir.pdf"
  },
  {
    id: "BSN-2026-003",
    name: "Muhammad Rizky",
    nik: "3201201902980003",
    gender: "Laki-laki",
    birthPlace: "Bogor",
    birthDate: "1998-02-19",
    phone: "0821-1122-3344",
    email: "m.rizky.pc@yahoo.com",
    address: "Jl. Raya Dramaga KM 7, Dramaga, Kab. Bogor",
    position: "Teknisi Komputer & Laptop",
    education: "S1 Teknik Informatika",
    schoolName: "Universitas Ibn Khaldun Bogor",
    gradYear: 2021,
    experience: "4 tahun technical support, instalasi server warnet, perakitan rig mining & PC editing",
    skills: "Troubleshooting hardware & software, Linux server, benchmark GPU/CPU, maintenance printer & LAN",
    salaryExpectation: 3200000,
    applyDate: "2026-10-17",
    status: "Terverifikasi",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    cvFilename: "CV_Muhammad_Rizky_IT.pdf"
  },
  {
    id: "BSN-2026-004",
    name: "Siti Nurhaliza",
    nik: "3201206509020004",
    gender: "Perempuan",
    birthPlace: "Bogor",
    birthDate: "2002-09-25",
    phone: "0877-6543-2109",
    email: "siti.nurhaliza22@gmail.com",
    address: "Desa Cinangneng, Kec. Tenjolaya, Kab. Bogor",
    position: "Marketing Digital & Admin Toko",
    education: "SMK Multimedia",
    schoolName: "SMK PGRI 2 Bogor",
    gradYear: 2021,
    experience: "1.5 tahun admin Shopee/Tokopedia toko perlengkapan gadget, copywriter media sosial",
    skills: "Canva Pro, Photoshop dasar, TikTok live selling, kelola marketplace, chat auto-responder",
    salaryExpectation: 2500000,
    applyDate: "2026-10-18",
    status: "Terverifikasi",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    cvFilename: "CV_Siti_Nurhaliza_Marketing.pdf"
  },
  {
    id: "BSN-2026-005",
    name: "Dedi Kurniawan",
    nik: "3201201111970005",
    gender: "Laki-laki",
    birthPlace: "Bogor",
    birthDate: "1997-11-11",
    phone: "0813-9988-7766",
    email: "dedi.kurnia97@gmail.com",
    address: "Jl. Gunung Salak Endah, Pamijahan, Kab. Bogor",
    position: "Teknisi Komputer & Laptop",
    education: "SMK TKJ",
    schoolName: "SMK Pelita Ciampea",
    gradYear: 2017,
    experience: "5 tahun servis laptop, ganti chipset, recovery data harddisk rusak, install CCTV",
    skills: "BGA rework station, skematik board view, mikroskop servis, crimping RJ45, fiber optic splicer",
    salaryExpectation: 3500000,
    applyDate: "2026-10-19",
    status: "Terverifikasi",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    cvFilename: "CV_Dedi_Kurniawan_SeniorTech.pdf"
  },
  {
    id: "BSN-2026-006",
    name: "Fajar Ramadhan",
    nik: "3201200305030006",
    gender: "Laki-laki",
    birthPlace: "Bogor",
    birthDate: "2003-05-03",
    phone: "0896-1234-9876",
    email: "fajar.ramadhan03@gmail.com",
    address: "Jl. Pasar Leuwiliang No. 89, Leuwiliang, Kab. Bogor",
    position: "Teknisi Komputer & Laptop",
    education: "SMA IPA",
    schoolName: "SMA Negeri 1 Leuwiliang",
    gradYear: 2022,
    experience: "Hobi merakit PC sendiri, instalasi Windows & rakit simulator game",
    skills: "Perakitan PC kabel manajemen rapi, instalasi game & software antivirus",
    salaryExpectation: 2300000,
    applyDate: "2026-10-20",
    status: "Terverifikasi",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    cvFilename: "CV_Fajar_Ramadhan_Junior.pdf"
  },
  {
    id: "BSN-2026-007",
    name: "Putri Lestari",
    nik: "3201204803000007",
    gender: "Perempuan",
    birthPlace: "Bogor",
    birthDate: "2000-03-18",
    phone: "0882-9012-3456",
    email: "putri.lestari00@gmail.com",
    address: "Kp. Babakan Cibitung, Tenjolaya, Kab. Bogor",
    position: "Kasir & Front Office",
    education: "SMK Akuntansi",
    schoolName: "SMK Bina Warga Bogor",
    gradYear: 2019,
    experience: "3 tahun kasir minimarket & toko sparepart motor, teliti hitung uang",
    skills: "Mesin kasir, EDC, stock opname, laporan buku harian, komunikasi sopan",
    salaryExpectation: 2400000,
    applyDate: "2026-10-21",
    status: "Terverifikasi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    cvFilename: "CV_Putri_Lestari_Kasir.pdf"
  },
  {
    id: "BSN-2026-008",
    name: "Bagus Prasetyo",
    nik: "3201202407010008",
    gender: "Laki-laki",
    birthPlace: "Bogor",
    birthDate: "2001-07-24",
    phone: "0857-7788-9900",
    email: "bagus.prasetyo@gmail.com",
    address: "Jl. Kapten Yusuf, Ciomas, Kab. Bogor",
    position: "Gudang & Logistik Sparepart",
    education: "SMK Otomotif",
    schoolName: "SMK Grafika Bogor",
    gradYear: 2020,
    experience: "2 tahun staf gudang distribusi logistik, packing barang elektronik tahan benturan",
    skills: "Manajemen inventaris FIFO, packing bubble wrap kayu, input barcode scanner",
    salaryExpectation: 2450000,
    applyDate: "2026-10-22",
    status: "Terverifikasi",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
    cvFilename: "CV_Bagus_Prasetyo_Gudang.pdf"
  }
];

// Matriks Penilaian Awal (Evaluasi dari Tim Penilai terhadap Pelamar)
// Nilai skala 1 - 5 sesuai sub-kriteria
const DEFAULT_ASSESSMENTS = {
  "BSN-2026-001": { C1: 5, C2: 4, C3: 5, C4: 3, C5: 4, C6: 5, notes: "Keahlian solder dan perakitan laptop sangat bagus, cocok teknisi senior" },
  "BSN-2026-002": { C1: 3, C2: 4, C3: 5, C4: 4, C5: 4, C6: 4, notes: "Komunikasi sangat luwes dan menguasai software kasir pembukuan" },
  "BSN-2026-003": { C1: 4, C2: 4, C3: 4, C4: 5, C5: 3, C6: 5, notes: "Lulusan S1 Informatika, wawasan teknologi luas dan handal troubleshooting jaringan" },
  "BSN-2026-004": { C1: 3, C2: 3, C3: 4, C4: 3, C5: 4, C6: 4, notes: "Kreatif membuat video konten promosi toko di TikTok & Instagram" },
  "BSN-2026-005": { C1: 5, C2: 5, C3: 3, C4: 3, C5: 2, C6: 4, notes: "Skill teknisi sangat tinggi, jam terbang 5 tahun, ekspektasi gaji cukup tinggi" },
  "BSN-2026-006": { C1: 3, C2: 1, C3: 4, C4: 2, C5: 5, C6: 3, notes: "Fresh graduate, semangat belajar tinggi, bersedia gaji awal standar" },
  "BSN-2026-007": { C1: 2, C2: 4, C3: 5, C4: 2, C5: 5, C6: 4, notes: "Pengalaman kasir 3 tahun sangat teliti dan ramah pada konsumen" },
  "BSN-2026-008": { C1: 3, C2: 4, C3: 4, C4: 2, C5: 5, C6: 3, notes: "Fisik prima, disiplin mengelola stok sparepart masuk dan keluar" }
};
