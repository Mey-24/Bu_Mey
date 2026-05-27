// Data Murid
export interface Student {
  nis: string;
  nama: string;
  tempat: string;
  tgl: string;
  kelas: string;
  jk: string;
}

// Data Pendidik (Guru)
export interface Teacher {
  id: string;
  nama: string;
  nip: string;
  foto_url?: string;
  mapel?: string;
}

// Log Presensi Harian Siswa
export interface AttendanceRecord {
  id: string;
  date: string;
  kelas: string;
  studentNis: string;
  studentNama: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  keterangan?: string;
}

// Jurnal Harian Guru
export interface JurnalRecord {
  id: string;
  date: string;
  kelas: string;
  guruNama: string;
  materi: string;
  deskripsi: string;
  status: 'Tercatat' | 'Draf';
}

// Modul Ajar / RPP
export interface RppRecord {
  id: string;
  judul: string;
  mapel: string;
  kelas: string;
  guruNama: string;
  materi: string;
  deskripsi: string;
  status: 'Aktif' | 'Arsip';
}

// Format Nilai E-Raport Siswa (10 Mata Pelajaran)
export interface StudentGrade {
  studentNis: string;
  studentNama: string;
  kelas: string;
  nilai: {
    agama: number;      // Agama
    pPancasila: number;  // Pendidikan Pancasila
    bIndonesia: number;  // Bahasa Indonesia
    matematika: number;  // Matematika
    sMusik: number;      // Seni Musik
    bta: number;         // Baca Tulis Al-Qur'an (BTA)
    sRupa: number;       // Seni Rupa
    pjok: number;        // PJOK
    inggris: number;     // Bahasa Inggris
    bBanjar: number;     // Bahasa Banjar
  };
}
