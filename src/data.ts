import { Student, Teacher, AttendanceRecord, JurnalRecord, RppRecord, StudentGrade } from './types';

// Static Data Presets for SDN 2 Sarigadung (v2.6.2-stable) By Bu Mei
export const PRESET_TEACHERS: Teacher[] = [
  { id: 'T001', nama: 'Bu Mei, S.Pd.', nip: '19870512 201001 2 003', foto_url: '', mapel: 'Guru Kelas / Wali Kelas IV' },
  { id: 'T002', nama: 'Pak Ahmad, S.Pd.', nip: '19840321 200804 1 002', foto_url: '', mapel: 'Pendidikan Jasmani (PJOK)' },
  { id: 'T003', nama: 'Bu Rahma, S.Pd.I', nip: '19901115 201503 2 011', foto_url: '', mapel: 'Pendidikan Agama Islam' },
  { id: 'T004', nama: 'Bu Sri, M.Pd.', nip: '19821204 200501 2 001', foto_url: '', mapel: 'Guru Kelas / Wali Kelas I' },
  { id: 'T005', nama: 'Pak Budi, S.Si', nip: '19890818 201201 1 005', foto_url: '', mapel: 'Matematika & IPA Kelas Atas' }
];

export const PRESET_STUDENTS: Student[] = [
  // Kelas IV A
  { nis: '4001', nama: 'Adrian Maulana', tempat: 'Tanah Bumbu', tgl: '2016-04-12', kelas: 'IV A', jk: 'Laki-laki' },
  { nis: '4002', nama: 'Siti Nurhaliza', tempat: 'Tanah Bumbu', tgl: '2016-08-25', kelas: 'IV A', jk: 'Perempuan' },
  { nis: '4003', nama: 'Ahmad Rafli', tempat: 'Banjarmasin', tgl: '2016-01-09', kelas: 'IV A', jk: 'Laki-laki' },
  { nis: '4004', nama: 'Zahra Amelia', tempat: 'Tanah Bumbu', tgl: '2016-11-14', kelas: 'IV A', jk: 'Perempuan' },
  { nis: '4005', nama: 'Daffa Firdaus', tempat: 'Kandangan', tgl: '2016-05-30', kelas: 'IV A', jk: 'Laki-laki' },
  { nis: '4006', nama: 'Salsabila Putri', tempat: 'Tanah Bumbu', tgl: '2016-09-02', kelas: 'IV A', jk: 'Perempuan' },
  { nis: '4007', nama: 'Rian Prasetyo', tempat: 'Kotabaru', tgl: '2016-03-21', kelas: 'IV A', jk: 'Laki-laki' },
  { nis: '4008', nama: 'Nabila Az-Zahra', tempat: 'Tanah Bumbu', tgl: '2016-07-18', kelas: 'IV A', jk: 'Perempuan' },
  // Kelas I A
  { nis: '1001', nama: 'Budi Santoso', tempat: 'Tanah Bumbu', tgl: '2019-02-15', kelas: 'I A', jk: 'Laki-laki' },
  { nis: '1002', nama: 'Lani Astuti', tempat: 'Tanah Bumbu', tgl: '2019-06-20', kelas: 'I A', jk: 'Perempuan' },
  { nis: '1003', nama: 'Fajar Nugraha', tempat: 'Batulicin', tgl: '2019-10-05', kelas: 'I A', jk: 'Laki-laki' },
  // Kelas II A
  { nis: '2001', nama: 'Dimas Aditya', tempat: 'Tanah Bumbu', tgl: '2018-05-11', kelas: 'II A', jk: 'Laki-laki' },
  { nis: '2002', nama: 'Dewi Sartika', tempat: 'Kandangan', tgl: '2018-09-17', kelas: 'II A', jk: 'Perempuan' },
  // Kelas III A
  { nis: '3001', nama: 'Galih Wicaksono', tempat: 'Banjarmasin', tgl: '2017-03-24', kelas: 'III A', jk: 'Laki-laki' },
  { nis: '3002', nama: 'Intan Permata', tempat: 'Tanah Bumbu', tgl: '2017-12-05', kelas: 'III A', jk: 'Perempuan' },
  // Kelas V A
  { nis: '5001', nama: 'Eka Wahyuni', tempat: 'Tanah Bumbu', tgl: '2015-01-30', kelas: 'V A', jk: 'Perempuan' },
  { nis: '5002', nama: 'Doni Saputra', tempat: 'Kotabaru', tgl: '2015-06-14', kelas: 'V A', jk: 'Laki-laki' },
  // Kelas VI A
  { nis: '6001', nama: 'Guntur Saputra', tempat: 'Banjarmasin', tgl: '2014-04-10', kelas: 'VI A', jk: 'Laki-laki' },
  { nis: '6002', nama: 'Mega Utami', tempat: 'Tanah Bumbu', tgl: '2014-11-22', kelas: 'VI A', jk: 'Perempuan' }
];

// Presensi Harian Seeding
export const PRESET_ATTENDANCE: AttendanceRecord[] = [
  { id: 'ATT-001', date: '2026-05-25', kelas: 'IV A', studentNis: '4001', studentNama: 'Adrian Maulana', status: 'Hadir' },
  { id: 'ATT-002', date: '2026-05-25', kelas: 'IV A', studentNis: '4002', studentNama: 'Siti Nurhaliza', status: 'Hadir' },
  { id: 'ATT-003', date: '2026-05-25', kelas: 'IV A', studentNis: '4003', studentNama: 'Ahmad Rafli', status: 'Hadir' },
  { id: 'ATT-004', date: '2026-05-25', kelas: 'IV A', studentNis: '4004', studentNama: 'Zahra Amelia', status: 'Sakit', keterangan: 'Demam tinggi' },
  { id: 'ATT-005', date: '2026-05-25', kelas: 'IV A', studentNis: '4005', studentNama: 'Daffa Firdaus', status: 'Hadir' },
  { id: 'ATT-006', date: '2026-05-25', kelas: 'IV A', studentNis: '4006', studentNama: 'Salsabila Putri', status: 'Hadir' },
  { id: 'ATT-007', date: '2026-05-25', kelas: 'IV A', studentNis: '4007', studentNama: 'Rian Prasetyo', status: 'Izin', keterangan: 'Acara keluarga' },
  { id: 'ATT-008', date: '2026-05-25', kelas: 'IV A', studentNis: '4008', studentNama: 'Nabila Az-Zahra', status: 'Hadir' }
];

// Jurnal Mengajar Seeding
export const PRESET_JURANAL: JurnalRecord[] = [
  { id: 'JUR-001', date: '2026-05-25', kelas: 'IV A', guruNama: 'Bu Mei, S.Pd.', materi: 'Pecahan Senilai', deskripsi: 'Menjelaskan konsep pecahan menggunakan peraga potongan pizza kertas. Murid aktif bertanya dan mencoba mewarnai bagian pecahan.', status: 'Tercatat' },
  { id: 'JUR-002', date: '2026-05-25', kelas: 'IV A', guruNama: 'Pak Ahmad, S.Pd.', materi: 'Kebugaran Jasmani', deskripsi: 'Melakukan latihan kelenturan tubuh dan pemanasan lari memutari lapangan sekolah. Semua murid memakai seragam olahraga lengkap.', status: 'Tercatat' },
  { id: 'JUR-003', date: '2026-05-26', kelas: 'IV A', guruNama: 'Bu Mei, S.Pd.', materi: 'Puisi Pendek Nusantara', deskripsi: 'Memperkenalkan struktur puisi, diksi, dan makna kiasan sederhana. Siswa diminta menulis satu bait bertema alam lingkungan sekitar.', status: 'Draf' }
];

// RPP Seeding
export const PRESET_RPP: RppRecord[] = [
  { id: 'RPP-001', judul: 'Modul Ajar Matematika - Fase B Kelas IV A', mapel: 'Matematika', kelas: 'IV A', guruNama: 'Bu Mei, S.Pd.', materi: 'Konsep Pecahan Senilai', deskripsi: 'Membimbing peserta didik memahami pecahan senilai dengan gambar, benda konkret, serta mengubah pecahan biasa menjadi desimal sederhana.', status: 'Aktif' },
  { id: 'RPP-002', judul: 'Modul Ajar Bahasa Indonesia - Fase B Kelas IV A', mapel: 'Bahasa Indonesia', kelas: 'IV A', guruNama: 'Bu Mei, S.Pd.', materi: 'Menulis Ide Pokok Paragraf', deskripsi: 'Melatih kemampuan membaca intensif untuk menarik kesimpulan kalimat utama dan gagasan pendukung dari sebuah teks naratif.', status: 'Aktif' },
  { id: 'RPP-003', judul: 'RPP PJOK - Atletik Lompat Jauh Kelas IV A', mapel: 'PJOK', kelas: 'IV A', guruNama: 'Pak Ahmad, S.Pd.', materi: 'Teknik Dasar Lompat Jauh', deskripsi: 'Menjelaskan fase awalan, tolakan, sikap melayang di udara, dan mendarat yang aman di bak pasir sekolah.', status: 'Arsip' }
];

// E-Raport (10 Subject Grades) Seeding untuk Kelas IV A
export const PRESET_GRADES: StudentGrade[] = [
  {
    studentNis: '4001', studentNama: 'Adrian Maulana', kelas: 'IV A',
    nilai: { agama: 85, pPancasila: 78, bIndonesia: 82, matematika: 75, sMusik: 80, bta: 88, sRupa: 84, pjok: 80, inggris: 72, bBanjar: 85 }
  },
  {
    studentNis: '4002', studentNama: 'Siti Nurhaliza', kelas: 'IV A',
    nilai: { agama: 90, pPancasila: 88, bIndonesia: 92, matematika: 85, sMusik: 85, bta: 94, sRupa: 80, pjok: 78, inggris: 88, bBanjar: 90 }
  },
  {
    studentNis: '4003', studentNama: 'Ahmad Rafli', kelas: 'IV A',
    nilai: { agama: 80, pPancasila: 80, bIndonesia: 78, matematika: 82, sMusik: 75, bta: 82, sRupa: 88, pjok: 85, inggris: 70, bBanjar: 82 }
  },
  {
    studentNis: '4004', studentNama: 'Zahra Amelia', kelas: 'IV A',
    nilai: { agama: 92, pPancasila: 85, bIndonesia: 88, matematika: 80, sMusik: 90, bta: 90, sRupa: 82, pjok: 75, inggris: 85, bBanjar: 88 }
  },
  {
    studentNis: '4005', studentNama: 'Daffa Firdaus', kelas: 'IV A',
    nilai: { agama: 78, pPancasila: 75, bIndonesia: 80, matematika: 72, sMusik: 82, bta: 80, sRupa: 86, pjok: 88, inggris: 68, bBanjar: 80 }
  },
  {
    studentNis: '4006', studentNama: 'Salsabila Putri', kelas: 'IV A',
    nilai: { agama: 88, pPancasila: 84, bIndonesia: 90, matematika: 88, sMusik: 88, bta: 86, sRupa: 80, pjok: 80, inggris: 84, bBanjar: 86 }
  },
  {
    studentNis: '4007', studentNama: 'Rian Prasetyo', kelas: 'IV A',
    nilai: { agama: 75, pPancasila: 72, bIndonesia: 75, matematika: 68, sMusik: 78, bta: 75, sRupa: 80, pjok: 90, inggris: 65, bBanjar: 78 }
  },
  {
    studentNis: '4008', studentNama: 'Nabila Az-Zahra', kelas: 'IV A',
    nilai: { agama: 94, pPancasila: 90, bIndonesia: 92, matematika: 90, sMusik: 86, bta: 96, sRupa: 85, pjok: 82, inggris: 90, bBanjar: 92 }
  }
];

// Google Apps Script source code that will be displayed in the instructions
export const GAS_CODE_TEMPLATE = `/**
 * ==========================================
 * GOOGLE APPS SCRIPT WEB APP - SDN 2 SARIGADUNG
 * API Sinkronisasi Nilai, Presensi, Jurnal, RPP
 * ==========================================
 * Deployment Note:
 * 1. Simpan script ini di Ekstensi > Apps Script di Google Sheets Anda.
 * 2. Deploy sebagai Web App:
 *    - Project Version: New Version
 *    - Execute As: Me (your-account@gmail.com)
 *    - Who has access: Anyone (Sangat Penting bagi kelancaran REST API)
 * 3. Copy Web App URL yang Anda dapatkan untuk ditempel di Aplikasi Guru.
 */

function doGet(e) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(10000)) {
      return createJsonResponse({ status: "error", message: "Timeout securing spreadsheet lock." });
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheets(ss);
    
    // Parameter aksi: 'pull' atau kosong
    var action = e && e.parameter && e.parameter.action ? e.parameter.action : "pull";
    
    if (action === "pull") {
      var students = getSheetDataAsJson(ss.getSheetByName("Students"));
      var teachers = getSheetDataAsJson(ss.getSheetByName("Teachers"));
      var attendance = getSheetDataAsJson(ss.getSheetByName("Attendance"));
      var journals = getSheetDataAsJson(ss.getSheetByName("Journals"));
      var rpp = getSheetDataAsJson(ss.getSheetByName("RPP"));
      var grades = getSheetDataAsJson(ss.getSheetByName("Grades"));
      
      // Khusus untuk grades, kita ubah kembali formatnya menjadi objek nilai bertingkat jika diinginkan
      var structuredGrades = grades.map(function(item) {
        return {
          studentNis: item.studentNis,
          studentNama: item.studentNama,
          kelas: item.kelas,
          nilai: {
            agama: Number(item.agama || 0),
            pPancasila: Number(item.pPancasila || 0),
            bIndonesia: Number(item.bIndonesia || 0),
            matematika: Number(item.matematika || 0),
            sMusik: Number(item.sMusik || 0),
            bta: Number(item.bta || 0),
            sRupa: Number(item.sRupa || 0),
            pjok: Number(item.pjok || 0),
            inggris: Number(item.inggris || 0),
            bBanjar: Number(item.bBanjar || 0)
          }
        };
      });

      return createJsonResponse({
        status: "success",
        data: {
          students: students,
          teachers: teachers,
          attendance: attendance,
          journals: journals,
          rpp: rpp,
          grades: structuredGrades
        }
      });
    }
    
    return createJsonResponse({ status: "error", message: "Aksi tidak dikenal" });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) {
      return createJsonResponse({ status: "error", message: "Timeout securing spreadsheet lock." });
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheets(ss);
    
    var requestBody = JSON.parse(e.postData.contents);
    var action = requestBody.action;
    var payload = requestBody.payload;
    
    if (action === "push") {
      if (payload.students) {
        writeItemsToSheet(ss.getSheetByName("Students"), payload.students, ["nis", "nama", "tempat", "tgl", "kelas", "jk"]);
      }
      if (payload.teachers) {
        writeItemsToSheet(ss.getSheetByName("Teachers"), payload.teachers, ["id", "nama", "nip", "foto_url", "mapel"]);
      }
      if (payload.attendance) {
        writeItemsToSheet(ss.getSheetByName("Attendance"), payload.attendance, ["id", "date", "kelas", "studentNis", "studentNama", "status", "keterangan"]);
        // Distribusi otomatis data presensi ke sheet per kelas (misal: "Kelas I A", "Kelas II A", dll)
        writeAttendanceByClass(ss, payload.attendance);
      }
      if (payload.journals) {
        writeItemsToSheet(ss.getSheetByName("Journals"), payload.journals, ["id", "date", "kelas", "guruNama", "materi", "deskripsi", "status"]);
      }
      if (payload.rpp) {
        writeItemsToSheet(ss.getSheetByName("RPP"), payload.rpp, ["id", "judul", "mapel", "kelas", "guruNama", "materi", "deskripsi", "status"]);
      }
      if (payload.grades) {
        // Flatten grades data for Sheet writing
        var flatGrades = payload.grades.map(function(g) {
          return {
            studentNis: g.studentNis,
            studentNama: g.studentNama,
            kelas: g.kelas,
            agama: g.nilai.agama,
            pPancasila: g.nilai.pPancasila,
            bIndonesia: g.nilai.bIndonesia,
            matematika: g.nilai.matematika,
            sMusik: g.nilai.sMusik,
            bta: g.nilai.bta,
            sRupa: g.nilai.sRupa,
            pjok: g.nilai.pjok,
            inggris: g.nilai.inggris,
            bBanjar: g.nilai.bBanjar
          };
        });
        writeItemsToSheet(ss.getSheetByName("Grades"), flatGrades, [
          "studentNis", "studentNama", "kelas", "agama", "pPancasila", 
          "bIndonesia", "matematika", "sMusik", "bta", "sRupa", "pjok", "inggris", "bBanjar"
        ]);
      }
      
      return createJsonResponse({
        status: "success",
        message: "Data SDN 2 Sarigadung berhasil disinkronkan ke Google Sheets."
      });
    }
    
    return createJsonResponse({ status: "error", message: "Aksi push tidak dikenal" });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// Helper untuk membuat response JSON
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Inisialisasi Tab Sheet jika belum tersedia
function initializeSheets(ss) {
  var requiredSheets = ["Students", "Teachers", "Attendance", "Journals", "RPP", "Grades"];
  var defaultHeaders = {
    "Students": ["nis", "nama", "tempat", "tgl", "kelas", "jk"],
    "Teachers": ["id", "nama", "nip", "foto_url", "mapel"],
    "Attendance": ["id", "date", "kelas", "studentNis", "studentNama", "status", "keterangan"],
    "Journals": ["id", "date", "kelas", "guruNama", "materi", "deskripsi", "status"],
    "RPP": ["id", "judul", "mapel", "kelas", "guruNama", "materi", "deskripsi", "status"],
    "Grades": ["studentNis", "studentNama", "kelas", "agama", "pPancasila", "bIndonesia", "matematika", "sMusik", "bta", "sRupa", "pjok", "inggris", "bBanjar"]
  };
  
  for (var i = 0; i < requiredSheets.length; i++) {
    var sheetName = requiredSheets[i];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(defaultHeaders[sheetName]);
      // Format header
      var headerRange = sheet.getRange(1, 1, 1, defaultHeaders[sheetName].length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#10b981"); // Emerald color
      headerRange.setFontColor("#ffffff");
    }
  }
}

// Membaca Sheet menjadi array JSON
function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  if (lastRow <= 1) return [];
  
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var dataValues = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  
  var result = [];
  for (var r = 0; r < dataValues.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var cellVal = dataValues[r][c];
      // Jika bertipe Date, ubah ke String ISO agar aman
      if (cellVal instanceof Date) {
        obj[headers[c]] = cellVal.toISOString().split("T")[0];
      } else {
        obj[headers[c]] = cellVal;
      }
    }
    result.push(obj);
  }
  return result;
}

// Menulis Data dengan menimpa data lama untuk konsistensi id (Unique Key)
function writeItemsToSheet(sheet, items, keys) {
  if (!sheet) return;
  
  // Hapus semua data di bawah baris header
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  if (items.length === 0) return;
  
  var rowsToWrite = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var row = [];
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      row.push(item[key] !== undefined ? item[key] : "");
    }
    rowsToWrite.push(row);
  }
  
  sheet.getRange(2, 1, rowsToWrite.length, keys.length).setValues(rowsToWrite);
}

// Distribusikan data presensi harian secara otomatis ke 1 Spreadsheet, dipisahkan per Tab Kelas masing-masing
function writeAttendanceByClass(ss, items) {
  if (!items || items.length === 0) return;
  
  // Mengelompokkan item presensi berdasarkan masing-masing kelas siswa
  var grouped = {};
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var cls = item.kelas;
    if (!cls) continue;
    
    // Normalisasi nama sheet, contoh: "Kelas I A", "Kelas IV B"
    var sheetName = "Kelas " + cls;
    if (!grouped[sheetName]) {
      grouped[sheetName] = [];
    }
    grouped[sheetName].push(item);
  }
  
  // Kolom header untuk sheet kelas
  var keys = ["id", "date", "kelas", "studentNis", "studentNama", "status", "keterangan"];
  
  // Tulis masing-masing kelompok ke sheet kelasnya
  for (var sheetName in grouped) {
    var classItems = grouped[sheetName];
    var sheet = ss.getSheetByName(sheetName);
    
    // Jika sheet belum ada, buat baru dan kasih warna aksen hijau tua / abu-abu yang teratur
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(keys);
      
      // Styling header kolom pertama kali dibuat
      var headerRange = sheet.getRange(1, 1, 1, keys.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f766e"); // Teal dark accent
      headerRange.setFontColor("#ffffff");
    }
    
    // Tulis kumpulan data presensi khusus kelas ini
    writeItemsToSheet(sheet, classItems, keys);
  }
}
`;
