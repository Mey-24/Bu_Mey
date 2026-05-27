import React, { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  FileSpreadsheet, 
  Users, 
  UserCheck, 
  Clipboard, 
  FileText, 
  Check, 
  HelpCircle,
  Cloud,
  CloudOff,
  Activity,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { Student, Teacher, AttendanceRecord, JurnalRecord, RppRecord, StudentGrade } from '../types';

interface DatabaseModuleProps {
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  jurnalRecords: JurnalRecord[];
  rppRecords: RppRecord[];
  grades: StudentGrade[];
  onResetDatabase: () => void;
  onClearDatabase: () => void;
  onResetStudents?: () => void;
  onResetTeachers?: () => void;
  onClearStudents?: () => void;
  onClearTeachers?: () => void;
  onImportDatabase: (data: {
    students?: Student[];
    teachers?: Teacher[];
    attendanceRecords?: AttendanceRecord[];
    jurnalRecords?: JurnalRecord[];
    rppRecords?: RppRecord[];
    grades?: StudentGrade[];
  }) => boolean;
  gasUrl?: string;
  lastSynced?: string;
  syncStatusMsg?: string;
}

export default function DatabaseModule({
  students,
  teachers,
  attendanceRecords,
  jurnalRecords,
  rppRecords,
  grades,
  onResetDatabase,
  onClearDatabase,
  onResetStudents,
  onResetTeachers,
  onClearStudents,
  onClearTeachers,
  onImportDatabase,
  gasUrl = '',
  lastSynced = '',
  syncStatusMsg = '',
}: DatabaseModuleProps) {
  const [importJson, setImportJson] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Persistent upload results tracking
  const [lastStudentUpload, setLastStudentUpload] = useState<{
    success: boolean;
    count: number;
    timestamp: string;
    message: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('last_student_upload_res');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lastTeacherUpload, setLastTeacherUpload] = useState<{
    success: boolean;
    count: number;
    timestamp: string;
    message: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('last_teacher_upload_res');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // States for Student & Teacher imports
  const [activeUploadTab, setActiveUploadTab] = useState<'students' | 'teachers'>('students');
  const [manualText, setManualText] = useState('');
  const [mergeOption, setMergeOption] = useState<'overwrite' | 'merge'>('merge');
  const [studentPreview, setStudentPreview] = useState<Student[]>([]);
  const [teacherPreview, setTeacherPreview] = useState<Teacher[]>([]);

  // Custom modern React state-driven confirmation dialog state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
  } | null>(null);

  const askConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDanger = false,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal'
  ) => {
    setConfirmModal({ title, message, onConfirm, isDanger, confirmText, cancelText });
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => {
      setStatusMsg(null);
    }, 6000);
  };

  const handleExport = () => {
    try {
      const fullDb = {
        students,
        teachers,
        attendanceRecords,
        jurnalRecords,
        rppRecords,
        grades,
        exportDate: new Date().toISOString(),
        version: 'v2.6',
      };
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(fullDb, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `sdn2_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showStatus('success', 'Cadangan database berhasil diunduh (JSON).');
    } catch (err) {
      showStatus('error', 'Gagal mengekspor database.');
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) {
      showStatus('error', 'Harap masukkan kode JSON backup yang valid.');
      return;
    }

    try {
      const parsed = JSON.parse(importJson);
      
      if (
        !parsed || 
        typeof parsed !== 'object' ||
        (!parsed.students && !parsed.teachers && !parsed.attendanceRecords)
      ) {
        showStatus('error', 'Struktur JSON tidak valid. Format backup tidak cocok.');
        return;
      }

      const success = onImportDatabase(parsed);
      if (success) {
        showStatus('success', 'Database berhasil diimpor dan dipulihkan!');
        setImportJson('');
      } else {
        showStatus('error', 'Gagal memproses data impor.');
      }
    } catch (err: any) {
      showStatus('error', `Kesalahan parser JSON: ${err.message || 'Format tidak dikenal'}`);
    }
  };

  // CSV parsing logic: splits the lines, filters empty rows, detects separators (, or ; or \t)
  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/);
    return lines
      .map(line => {
        let parts: string[] = [];
        if (line.includes('\t')) {
          parts = line.split('\t');
        } else if (line.includes(';')) {
          parts = line.split(';');
        } else {
          parts = line.split(',');
        }
        return parts.map(p => p.trim().replace(/^["']|["']$/g, ''));
      })
      .filter(row => row.length > 0 && row.some(cell => cell !== ''));
  };

  const tryParseJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.students)) return parsed.students;
        if (Array.isArray(parsed.teachers)) return parsed.teachers;
      }
    } catch (e) {}
    return null;
  };

  const normalizeClassName = (raw: string): string => {
    if (!raw) return 'IV A';
    let clean = raw.trim().toUpperCase();
    
    // Remove "KELAS" or "CLASS" prefixes/suffixes
    clean = clean.replace(/KELAS|CLASS/g, '').trim();
    
    // Convert Indonesian/English text numbers commonly used
    const wordsMap: { [key: string]: string } = {
      'SATU': 'I', 'DUA': 'II', 'TIGA': 'III', 'EMPAT': 'IV', 'LIMA': 'V', 'ENAM': 'VI',
      'ONE': 'I', 'TWO': 'II', 'THREE': 'III', 'FOUR': 'IV', 'FIVE': 'V', 'SIX': 'VI'
    };
    for (const [word, rom] of Object.entries(wordsMap)) {
      if (clean.startsWith(word)) {
        clean = clean.replace(word, rom);
      }
    }

    // Matches Roman class digits I to VI or numeric class digits 1 to 6 followed by letter A to D
    const match = clean.match(/([1-6]|V?I{1,3}|I[VX])\s*[\-\._ ]?\s*([A-D])/i);
    if (match) {
      let grade = match[1].toUpperCase();
      const letter = match[2].toUpperCase();
      
      // Convert Arabic to Roman
      if (grade === '1') grade = 'I';
      else if (grade === '2') grade = 'II';
      else if (grade === '3') grade = 'III';
      else if (grade === '4') grade = 'IV';
      else if (grade === '5') grade = 'V';
      else if (grade === '6') grade = 'VI';
      
      return `${grade} ${letter}`;
    }
    
    // Quick regex fallback for inputs like "IVA" -> "IV A"
    const shortMatch = clean.replace(/\s+/g, '').match(/^(I{1,3}|IV|V|VI)([A-D])$/i);
    if (shortMatch) {
      return `${shortMatch[1].toUpperCase()} ${shortMatch[2].toUpperCase()}`;
    }

    return raw.trim();
  };

  const normalizeDate = (raw: string): string => {
    if (!raw) return '2016-01-01';
    let str = raw.trim();
    if (/^\d{4}\-\d{2}\-\d{2}$/.test(str)) {
      return str;
    }
    const dmyMatch = str.match(/^(\d{1,2})[\-\/\.](\d{1,2})[\-\/\.](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    const textMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
    if (textMatch) {
      const day = textMatch[1].padStart(2, '0');
      const monthText = textMatch[2].toLowerCase();
      const year = textMatch[3];
      
      const indonesianMonths: { [key: string]: string } = {
        jan: '01', januari: '01', january: '01',
        feb: '02', februari: '02', february: '02',
        mar: '03', maret: '03', march: '03',
        apr: '04', april: '04',
        mei: '05', mei_: '05', may: '05',
        jun: '06', juni: '06', june: '06',
        jul: '07', juli: '07', july: '07',
        agu: '08', agustus: '08', august: '08', agt: '08',
        sep: '09', september: '09',
        okt: '10', oktober: '10', october: '10',
        nov: '11', november: '11',
        des: '12', desember: '12', december: '12'
      };
      const month = indonesianMonths[monthText] || '01';
      return `${year}-${month}-${day}`;
    }
    return str;
  };

  const detectStudentColumns = (rows: string[][]) => {
    let colNama = 1;
    let colNis = 2;
    let colTempat = 3;
    let colTgl = 4;
    let colKelas = 5;
    let colJk = 6;

    if (rows.length === 0) {
      return { colNama, colNis, colTempat, colTgl, colKelas, colJk };
    }

    const firstRow = rows[0].map(cell => cell.toLowerCase().trim());
    const isHeaderRow = firstRow.some(h => 
      h.includes('nama') || 
      h.includes('nis') || 
      h.includes('kelas') || 
      h.includes('tempat') || 
      h.includes('tanggal') || 
      h.includes('kelamin') || 
      h.includes('no') ||
      h.includes('photo') ||
      h.includes('foto')
    );

    if (isHeaderRow) {
      firstRow.forEach((h, idx) => {
        if (h === 'nis' || h === 'nisn' || h.includes('nomor induk') || h.includes('no induk') || h === 'id' || h === 'nip') {
          colNis = idx;
        } else if (h.includes('nama lengkap') || h === 'nama' || h.includes('nama siswa') || h.includes('lengkap')) {
          colNama = idx;
        } else if (h.includes('tempat') || h.includes('tmp')) {
          colTempat = idx;
        } else if (h.includes('tanggal') || h.includes('tgl') || (h.includes('lahir') && !h.includes('tempat'))) {
          colTgl = idx;
        } else if (h.includes('kelas') || h.includes('rombel') || h.includes('class')) {
          colKelas = idx;
        } else if (h.includes('kelamin') || h === 'jk' || h.includes('jenis kelamin') || h.includes('gender') || h === 'sex') {
          colJk = idx;
        }
      });
    } else {
      // Guessing based on data styles in columns
      const sampleSize = Math.min(rows.length, 3);
      const columnTypes = new Array(rows[0].length).fill(null).map(() => ({
        isNumeric: 0,
        isDate: 0,
        isGender: 0,
        isClass: 0,
        isLongText: 0,
        isShortText: 0
      }));

      for (let r = 0; r < sampleSize; r++) {
        const row = rows[r];
        row.forEach((cell, cIdx) => {
          const val = cell.trim();
          if (!val) return;
          if (/^\d+$/.test(val)) {
            columnTypes[cIdx].isNumeric++;
          }
          if (/^\d{4}[\-\/\.]\d{2}[\-\/\.]\d{2}$/.test(val) || /\d+[\s\-\/\.](Jan|Feb|Mar|Apr|Mei|May|Jun|Jul|Agu|Aug|Sep|Okt|Oct|Nov|Des|Dec)[\s\-\/\.]\d+/i.test(val)) {
            columnTypes[cIdx].isDate++;
          }
          const lowerVal = val.toLowerCase();
          if (lowerVal === 'laki-laki' || lowerVal === 'perempuan' || lowerVal === 'l' || lowerVal === 'p' || lowerVal === 'pria' || lowerVal === 'wanita') {
            columnTypes[cIdx].isGender++;
          }
          if (/(I{1,3}|IV|V|VI)\s*[A-D]/i.test(val) || /^[1-6][\s\-._]?[A-D]$/i.test(val) || /KELAS/i.test(val)) {
            columnTypes[cIdx].isClass++;
          }
          if (val.length > 3 && isNaN(Number(val))) {
            if (val.length > 12) columnTypes[cIdx].isLongText++;
            else columnTypes[cIdx].isShortText++;
          }
        });
      }

      let detectedNis = -1;
      let detectedNama = -1;
      let detectedTempat = -1;
      let detectedTgl = -1;
      let detectedKelas = -1;
      let detectedJk = -1;

      columnTypes.forEach((stats, cIdx) => {
        if (stats.isDate > 0) {
          detectedTgl = cIdx;
        } else if (stats.isGender > 0) {
          detectedJk = cIdx;
        } else if (stats.isClass > 0) {
          detectedKelas = cIdx;
        } else if (stats.isNumeric > 0) {
          if (cIdx !== 0 || Number(rows[0][cIdx]) > 100) {
            detectedNis = cIdx;
          }
        } else if (stats.isShortText > 0 || stats.isLongText > 0) {
          if (detectedNama === -1) {
            detectedNama = cIdx;
          } else if (detectedTempat === -1) {
            detectedTempat = cIdx;
          }
        }
      });

      if (detectedNama !== -1) colNama = detectedNama;
      if (detectedNis !== -1) colNis = detectedNis;
      if (detectedTempat !== -1) colTempat = detectedTempat;
      if (detectedTgl !== -1) colTgl = detectedTgl;
      if (detectedKelas !== -1) colKelas = detectedKelas;
      if (detectedJk !== -1) colJk = detectedJk;

      if (colNama === colNis) {
        colNama = (colNis === 1) ? 2 : 1;
      }
    }

    return { colNama, colNis, colTempat, colTgl, colKelas, colJk };
  };

  const detectTeacherColumns = (rows: string[][]) => {
    let colId = 0;
    let colNama = 1;
    let colNip = 2;

    if (rows.length === 0) return { colId, colNama, colNip };

    const firstRow = rows[0].map(cell => cell.toLowerCase().trim());
    const isHeaderRow = firstRow.some(h => 
      h.includes('nama') || 
      h.includes('nip') || 
      h.includes('no') ||
      h.includes('id') ||
      h.includes('guru')
    );

    if (isHeaderRow) {
      firstRow.forEach((h, idx) => {
        if (h === 'no' || h === 'id') {
          colId = idx;
        } else if (h.includes('nama') || h.includes('guru')) {
          colNama = idx;
        } else if (h.includes('nip') || h.includes('induk')) {
          colNip = idx;
        }
      });
    } else {
      const sampleSize = Math.min(rows.length, 3);
      const scores = new Array(rows[0].length).fill(null).map(() => ({ isNip: 0, isShortText: 0, isNumeric: 0 }));
      
      for (let r = 0; r < sampleSize; r++) {
        rows[r].forEach((cell, cIdx) => {
          const val = cell.trim();
          if (!val) return;
          if (/^\d{18}$/.test(val)) scores[cIdx].isNip++;
          else if (/^\d+$/.test(val)) scores[cIdx].isNumeric++;
          else if (val.length > 2) scores[cIdx].isShortText++;
        });
      }

      scores.forEach((stats, cIdx) => {
        if (stats.isNip > 0) {
          colNip = cIdx;
        } else if (stats.isShortText > 0) {
          colNama = cIdx;
        } else if (stats.isNumeric > 0 && cIdx === 0) {
          colId = cIdx;
        }
      });
    }

    return { colId, colNama, colNip };
  };

  const handleParseData = (text: string, type: 'students' | 'teachers') => {
    if (!text.trim()) {
      if (type === 'students') setStudentPreview([]);
      else setTeacherPreview([]);
      return;
    }

    // Try parsing as JSON first
    const jsonParsed = tryParseJSON(text);
    if (jsonParsed && Array.isArray(jsonParsed)) {
      if (type === 'students') {
        const validated = jsonParsed.map((item: any, i) => {
          let jk = 'Laki-laki';
          const jkRaw = String(item.jk || item.jenis_kelamin || 'Laki-laki').toLowerCase();
          if (jkRaw.startsWith('p') || jkRaw.includes('perempuan') || jkRaw === 'wanita') {
            jk = 'Perempuan';
          }
          return {
            nis: String(item.nis || item.id || `S-${Date.now()}-${i}`),
            nama: String(item.nama || item.name || 'Siswa Tanpa Nama'),
            tempat: String(item.tempat || item.tempat_lahir || 'Tanah Bumbu'),
            tgl: String(item.tgl || item.tanggal_lahir || '2016-01-01'),
            kelas: normalizeClassName(String(item.kelas || item.class || 'IV A')),
            jk
          };
        });
        setStudentPreview(validated);
        return;
      } else {
        const validated = jsonParsed.map((item: any, i) => ({
          id: String(item.id || item.nip || `G-${Date.now()}-${i}`),
          nama: String(item.nama || item.name || 'Guru Tanpa Nama'),
          nip: String(item.nip || '-'),
          mapel: String(item.mapel || item.mata_pelajaran || 'Tematik')
        }));
        setTeacherPreview(validated);
        return;
      }
    }

    // Parse as CSV/TSV
    const rows = parseCSV(text);
    if (rows.length === 0) {
      if (type === 'students') setStudentPreview([]);
      else setTeacherPreview([]);
      return;
    }

    let startIndex = 0;
    const firstRowSec = rows[0].join(' ').toLowerCase();

    if (type === 'students') {
      const isHeaderRow = firstRowSec.includes('no') || firstRowSec.includes('nis') || firstRowSec.includes('nama') || firstRowSec.includes('lengkap') || firstRowSec.includes('kelas') || firstRowSec.includes('kelamin') || firstRowSec.includes('photo') || firstRowSec.includes('foto');
      if (isHeaderRow) {
        startIndex = 1;
      }
      
      const map = detectStudentColumns(rows);
      const list: Student[] = [];

      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        const filledCells = row.filter(cell => cell.trim() !== '');
        if (filledCells.length < 2) continue;

        const rawNama = row[map.colNama] || '';
        if (!rawNama || rawNama.toLowerCase() === 'nama' || rawNama.toLowerCase() === 'nama lengkap' || rawNama.toLowerCase() === 'siswa') continue;

        const nama = rawNama.trim();
        const nis = (row[map.colNis] || `S-${Date.now()}-${i}`).trim();
        
        const rawPlace = row[map.colTempat] || 'Tanah Bumbu';
        let tempat = rawPlace.trim();
        let rawTgl = row[map.colTgl] || '2016-01-01';

        // Combined Place and Date split
        if (rawPlace.includes(',') && (map.colTempat === map.colTgl || !row[map.colTgl])) {
          const commaIndex = rawPlace.lastIndexOf(',');
          tempat = rawPlace.substring(0, commaIndex).trim();
          const parsedTgl = rawPlace.substring(commaIndex + 1).trim();
          if (parsedTgl) {
            rawTgl = parsedTgl;
          }
        }

        const tgl = normalizeDate(rawTgl);
        const rawKelas = row[map.colKelas] || 'IV A';
        const kelas = normalizeClassName(rawKelas);
        
        const rawJk = (row[map.colJk] || 'Laki-laki').trim().toLowerCase();
        let jk = 'Laki-laki';
        if (rawJk.startsWith('p') || rawJk.includes('perempuan') || rawJk === 'wanita' || rawJk === 'p') {
          jk = 'Perempuan';
        }

        list.push({ nis, nama, tempat, tgl, kelas, jk });
      }
      setStudentPreview(list);
    } else {
      const isHeaderRow = firstRowSec.includes('no') || firstRowSec.includes('nama') || firstRowSec.includes('nip') || firstRowSec.includes('guru') || firstRowSec.includes('staf');
      if (isHeaderRow) {
        startIndex = 1;
      }

      const map = detectTeacherColumns(rows);
      const list: Teacher[] = [];

      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        const filledCells = row.filter(cell => cell.trim() !== '');
        if (filledCells.length < 2) continue;

        const rawNama = row[map.colNama] || '';
        if (!rawNama || rawNama.toLowerCase() === 'nama' || rawNama.toLowerCase() === 'guru' || rawNama.toLowerCase() === 'staf') continue;

        const nama = rawNama.trim();
        const id = (row[map.colId] || `G-${Date.now()}-${i}`).trim();
        const nip = (row[map.colNip] || '-').trim();
        const mapel = 'Tematik';

        list.push({ id, nama, nip, mapel });
      }
      setTeacherPreview(list);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'students' | 'teachers') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setManualText(text);
      handleParseData(text, type);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, type: 'students' | 'teachers') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setManualText(text);
      handleParseData(text, type);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = (type: 'students' | 'teachers') => {
    let content = '';
    let filename = '';
    if (type === 'students') {
      content = "No,Nama Lengkap,NIS,Tempat Lahir,Tanggal Lahir,Semua Kelas,Jenis Kelamin,Pass Photo\n1,Adrian Maulana,4001,Tanah Bumbu,2016-04-12,IV A,Laki-laki,-\n2,Siti Nurhaliza,4002,Tanah Bumbu,2016-08-25,IV A,Perempuan,-\n3,Ghani Al Fatih,1012,Tanah Bumbu,2019-03-11,I A,Laki-laki,-\n4,Riri Shanti,2015,Banjarmasin,2018-09-17,II B,Perempuan,-";
      filename = 'template_siswa_sdn2_sarigadung.csv';
    } else {
      content = "No,Nama,NIP\nG01,Bu Mei, S.Pd.,198505262010122003\nG02,Pak Ahmad, S.Pd.,199203112015041001\nG03,Ibu Nurhasanah,199008242014022002";
      filename = 'template_guru_sdn2_sarigadung.csv';
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSaveUploadedData = () => {
    const timestampStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    
    if (activeUploadTab === 'students') {
      if (studentPreview.length === 0) {
        const failRes = {
          success: false,
          count: 0,
          timestamp: timestampStr,
          message: 'Gagal: Tidak ada data murid yang valid untuk diunggah.'
        };
        setLastStudentUpload(failRes);
        localStorage.setItem('last_student_upload_res', JSON.stringify(failRes));
        showStatus('error', 'Tidak ada data murid yang valid untuk disimpan. Harap periksa format input Anda.');
        return;
      }
      
      const proceedStudentSave = (overwrite: boolean) => {
        let nextStudents: Student[] = [];
        if (overwrite) {
          nextStudents = [...studentPreview];
        } else {
          // Merge: existing + new, update by NIS
          const studentMap = new Map<string, Student>();
          students.forEach(s => studentMap.set(s.nis, s));
          studentPreview.forEach(s => studentMap.set(s.nis, s));
          nextStudents = Array.from(studentMap.values());
        }

        const success = onImportDatabase({ students: nextStudents });
        if (success) {
          const successRes = {
            success: true,
            count: studentPreview.length,
            timestamp: timestampStr,
            message: `Berhasil mengunggah ${studentPreview.length} murid baru! Database sekarang memiliki total ${nextStudents.length} murid.`
          };
          setLastStudentUpload(successRes);
          localStorage.setItem('last_student_upload_res', JSON.stringify(successRes));
          showStatus('success', `Berhasil memproses! Kini database memiliki total ${nextStudents.length} siswa binaan.`);
          setManualText('');
          setStudentPreview([]);
        } else {
          const failRes = {
            success: false,
            count: 0,
            timestamp: timestampStr,
            message: 'Gagal memproses data murid ke penyimpanan lokal.'
          };
          setLastStudentUpload(failRes);
          localStorage.setItem('last_student_upload_res', JSON.stringify(failRes));
          showStatus('error', 'Gagal memproses data murid.');
        }
      };

      if (mergeOption === 'overwrite') {
        askConfirm(
          'Konfirmasi Menimpa Data Siswa',
          `Apakah Anda yakin ingin mengganti SELURUH data siswa lama (${students.length} siswa) dengan data baru ini (${studentPreview.length} siswa)?`,
          () => proceedStudentSave(true),
          true
        );
      } else {
        proceedStudentSave(false);
      }
    } else {
      if (teacherPreview.length === 0) {
        const failRes = {
          success: false,
          count: 0,
          timestamp: timestampStr,
          message: 'Gagal: Tidak ada data guru yang valid untuk diunggah.'
        };
        setLastTeacherUpload(failRes);
        localStorage.setItem('last_teacher_upload_res', JSON.stringify(failRes));
        showStatus('error', 'Tidak ada data guru yang valid untuk disimpan. Harap periksa format input Anda.');
        return;
      }

      const proceedTeacherSave = (overwrite: boolean) => {
        let nextTeachers: Teacher[] = [];
        if (overwrite) {
          nextTeachers = [...teacherPreview];
        } else {
          // Merge: existing + new, update by ID
          const teacherMap = new Map<string, Teacher>();
          teachers.forEach(t => teacherMap.set(t.id, t));
          teacherPreview.forEach(t => teacherMap.set(t.id, t));
          nextTeachers = Array.from(teacherMap.values());
        }

        const success = onImportDatabase({ teachers: nextTeachers });
        if (success) {
          const successRes = {
            success: true,
            count: teacherPreview.length,
            timestamp: timestampStr,
            message: `Berhasil mengunggah ${teacherPreview.length} guru baru! Database sekarang memiliki total ${nextTeachers.length} guru.`
          };
          setLastTeacherUpload(successRes);
          localStorage.setItem('last_teacher_upload_res', JSON.stringify(successRes));
          showStatus('success', `Berhasil memproses! Kini database memiliki total ${nextTeachers.length} guru staf.`);
          setManualText('');
          setTeacherPreview([]);
        } else {
          const failRes = {
            success: false,
            count: 0,
            timestamp: timestampStr,
            message: 'Gagal memproses data guru ke penyimpanan lokal.'
          };
          setLastTeacherUpload(failRes);
          localStorage.setItem('last_teacher_upload_res', JSON.stringify(failRes));
          showStatus('error', 'Gagal memproses data guru.');
        }
      };

      if (mergeOption === 'overwrite') {
        askConfirm(
          'Konfirmasi Menimpa Data Guru',
          `Apakah Anda yakin ingin mengganti SELURUH data staf pengajar lama (${teachers.length} guru) dengan data baru ini (${teacherPreview.length} guru)?`,
          () => proceedTeacherSave(true),
          true
        );
      } else {
        proceedTeacherSave(false);
      }
    }
  };

  const tableStats = [
    { name: 'Data Siswa Binaan', count: students.length, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { name: 'Struktur Guru Staf', count: teachers.length, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
    { name: 'Log Presensi Kelas', count: attendanceRecords.length, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
    { name: 'Jurnal Harian Mengajar', count: jurnalRecords.length, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
    { name: 'Modul Ajar RPP', count: rppRecords.length, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
    { name: 'E-Raport Nilai', count: grades.length, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
              Sistem Manajemen Database Lokal (Offline-First)
            </h2>
            <p className="text-[10px] text-slate-400">
              Kelola entri tabel, unggah Excel/CSV mandiri, backup, pembersihan, dan pemulihan data aplikasi
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono px-2 py-0.5 rounded font-bold">
          HTML5 LocalStorage
        </span>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 font-semibold ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-455' 
            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-455'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 animate-bounce" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* INDIKATOR STATUS SINKRONISASI & UNGGAHAN BENCHMARK */}
      <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/45 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-xs font-bold font-sans uppercase tracking-wider">
              Monitor Konektivitas & Unggahan Dokumen
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Real-time status</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* 1. Status Sinkronisasi Online */}
          <div className="p-3 rounded-lg border border-slate-200/40 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Sinkronisasi Cloud
              </span>
              {gasUrl ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  KONEK
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                  STANDALONE
                </span>
              )}
            </div>

            <div className="flex items-start gap-2">
              {gasUrl ? (
                <Cloud className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <CloudOff className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="text-xs font-extrabold block text-slate-700 dark:text-slate-200">
                  {gasUrl ? 'Terkoneksi Spreadsheet' : 'Penyimpanan Offline'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-normal">
                  {syncStatusMsg ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium animate-pulse">{syncStatusMsg}</span>
                  ) : gasUrl ? (
                    lastSynced ? `Terakhir sinkron: ${lastSynced}` : 'Koneksi siap. Lakukan sinkronisasi di Hub Sync'
                  ) : (
                    'Klik tab Hub Sinkron untuk integrasi web app cloud SDN 2 Sarigadung'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Status Upload Murid */}
          <div className="p-3 rounded-lg border border-slate-200/40 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Unggah Data Murid
              </span>
              {lastStudentUpload ? (
                lastStudentUpload.success ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                    BERHASIL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded-full">
                    GAGAL
                  </span>
                )
              ) : students.length > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                  TERSEDIA
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                  KOSONG
                </span>
              )}
            </div>

            <div className="flex items-start gap-2">
              {students.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="text-xs font-extrabold block text-slate-700 dark:text-slate-200">
                  {students.length > 0 ? `${students.length} Siswa Terdaftar` : 'Belum Ada Unggahan'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-normal">
                  {lastStudentUpload ? (
                    <>
                      <span>{lastStudentUpload.message}</span>
                      <span className="block mt-0.5 font-mono text-[9px] text-slate-400">{lastStudentUpload.timestamp}</span>
                    </>
                  ) : students.length > 0 ? (
                    'Database lokal memiliki entri siswa, siap disinkronkan ke cloud.'
                  ) : (
                    'Masukkan salinan atau berkas CSV murid lalu klik Simpan Database.'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Status Upload Guru */}
          <div className="p-3 rounded-lg border border-slate-200/40 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Unggah Data Guru
              </span>
              {lastTeacherUpload ? (
                lastTeacherUpload.success ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                    BERHASIL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded-full">
                    GAGAL
                  </span>
                )
              ) : teachers.length > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                  TERSEDIA
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                  KOSONG
                </span>
              )}
            </div>

            <div className="flex items-start gap-2">
              {teachers.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="text-xs font-extrabold block text-slate-700 dark:text-slate-200">
                  {teachers.length > 0 ? `${teachers.length} Guru Terdaftar` : 'Belum Ada Unggahan'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-normal">
                  {lastTeacherUpload ? (
                    <>
                      <span>{lastTeacherUpload.message}</span>
                      <span className="block mt-0.5 font-mono text-[9px] text-slate-400">{lastTeacherUpload.timestamp}</span>
                    </>
                  ) : teachers.length > 0 ? (
                    'Database memiliki data guru aktif SDN 2 Sarigadung.'
                  ) : (
                    'Tempel baris text guru atau masukkan berkas CSV untuk memuat.'
                  )}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {tableStats.map((stat, idx) => (
          <div key={idx} className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-2 bg-slate-50/20">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {stat.name}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-850 dark:text-white">
                {stat.count}
              </span>
              <span className="text-[10px] text-slate-400">Entri</span>
            </div>
          </div>
        ))}
      </div>

      {/* NEW SECTION: Drag & Drop / Upload Excel/CSV for students and teachers */}
      <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-xl bg-slate-50/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wide">
                Unggah Excel / CSV Mandiri (Wali Kelas & Guru)
              </h3>
              <p className="text-[10px] text-slate-400">
                Pilih atau seret file CSV/Excel atau tempel teks dari Google Sheets untuk mengatur basis data sekolah
              </p>
            </div>
          </div>

          {/* Tab selections */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl self-start md:self-auto border border-slate-200/20">
            <button
              id="tab-upload-students"
              type="button"
              onClick={() => {
                setActiveUploadTab('students');
                setManualText('');
                setStudentPreview([]);
                setTeacherPreview([]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeUploadTab === 'students'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Data Murid</span>
            </button>
            <button
              id="tab-upload-teachers"
              type="button"
              onClick={() => {
                setActiveUploadTab('teachers');
                setManualText('');
                setStudentPreview([]);
                setTeacherPreview([]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeUploadTab === 'teachers'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Data Guru</span>
            </button>
          </div>
        </div>

        {/* Info Layout format constraint */}
        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/30 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 space-y-2">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
               <span className="font-extrabold block">Aturan Format Dokumen CSV / Spreadsheet:</span>
              {activeUploadTab === 'students' ? (
                <p className="leading-relaxed">
                  Kolom berurutan: <code className="bg-blue-100/50 dark:bg-blue-950 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold font-mono">No, Nama Lengkap, NIS, Tempat Lahir, Tanggal Lahir, Semua Kelas, Jenis Kelamin, Pass Photo</code>
                  <br />
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                    * Format Kelas yang diakui: Kelas I-V (A-D) dan Kelas VI (A-C), contoh: <code className="font-bold">I A</code>, <code className="font-bold">IV B</code>, <code className="font-bold">VI C</code>. Jenis kelamin diakui: <code className="font-bold">Laki-laki / Perempuan</code> (atau L/P).
                  </span>
                </p>
              ) : (
                <p className="leading-relaxed">
                  Kolom berurutan: <code className="bg-blue-100/50 dark:bg-blue-950 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold font-mono">No, Nama, NIP</code>
                  <br />
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                    * Berikan baris data dengan No/ID unik, Nama lengkap berserta gelar, dan NIP guru.
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Two pane input methods: Drag & Drop left vs Paste Text right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* File input / drag area */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, activeUploadTab)}
            className="border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:border-emerald-500 transition-all cursor-pointer bg-slate-50/20 min-h-[160px] group relative"
          >
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 group-hover:scale-105 transition-all mb-2" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-350">
              Tarik & Letakkan file CSV di sini
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              Atau klik untuk menelusuri folder komputer Anda
            </span>
            
            <input 
              id="file-db-uploader"
              type="file" 
              accept=".csv,.txt,.json"
              onChange={(e) => handleFileUpload(e, activeUploadTab)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
          </div>

          {/* Paste area */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Clipboard className="w-3.5 h-3.5 text-slate-400" />
              <span>Tempel Baris Teks (dari Excel / Sheets)</span>
            </span>
            <textarea
              id="ta-paste-db-text"
              rows={6}
              value={manualText}
              onChange={(e) => {
                setManualText(e.target.value);
                handleParseData(e.target.value, activeUploadTab);
              }}
              placeholder={activeUploadTab === 'students' 
                ? "No\tNama Lengkap\tNIS\tTempat Lahir\tTanggal Lahir\tSemua Kelas\tJenis Kelamin\tPass Photo\n1\tAdrian Maulana\t4001\tTanah Bumbu\t2016-04-12\tIV A\tLaki-laki\t-\n2\tSiti Nurhaliza\t4002\tTanah Bumbu\t2016-08-25\tIV A\tPerempuan\t-"
                : "No\tNama\tNIP\n1\tBu Mei, S.Pd.\t198505262010122003\n2\tPak Ahmad, S.Pd.\t199203112015041001"
              }
              className="w-full p-2.5 border border-slate-205 dark:border-slate-800 rounded-xl bg-slate-100/10 dark:bg-slate-950/40 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Integration configuration and buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          
          {/* Merge option switches */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-450 font-bold">Aturan Penulisan:</span>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200/10">
              <button
                id="btn-merge-rule"
                type="button"
                onClick={() => setMergeOption('merge')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mergeOption === 'merge'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Gabungkan & Update
              </button>
              <button
                id="btn-overwrite-rule"
                type="button"
                onClick={() => setMergeOption('overwrite')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mergeOption === 'overwrite'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Ganti Semua (Overwrite)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-sample-template"
              type="button"
              onClick={() => handleDownloadTemplate(activeUploadTab)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Unduh Contoh CSV</span>
            </button>

            <button
              id="btn-submit-db-parsed"
              type="button"
              onClick={handleSaveUploadedData}
              className="flex items-center justify-center gap-1.5 px-5 py-2 bg-emerald-900 border border-emerald-950 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-900/10"
            >
              <Check className="w-4 h-4" />
              <span>Simpan ke Database</span>
            </button>
          </div>

        </div>

        {/* Live Preview section */}
        {((activeUploadTab === 'students' && studentPreview.length > 0) || 
          (activeUploadTab === 'teachers' && teacherPreview.length > 0)) && (
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Pratinjau Hasil Parser Terdeteksi ({activeUploadTab === 'students' ? studentPreview.length : teacherPreview.length} Baris Data)</span>
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded font-extrabold shrink-0">
                Format Terverifikasi
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200/55 dark:border-slate-800 rounded-xl font-mono text-[10px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-450 border-b border-slate-200 dark:border-slate-800">
                  {activeUploadTab === 'students' ? (
                    <tr>
                      <th className="p-2 border-r border-slate-200 dark:border-slate-800">NIS (ID)</th>
                      <th className="p-2 border-r border-slate-200 dark:border-slate-800">Nama Siswa</th>
                      <th className="p-2 border-r border-slate-200 dark:border-slate-800">Tempat Lahir</th>
                      <th className="p-2 border-r border-slate-200 dark:border-slate-800">Tanggal Lahir</th>
                      <th className="p-2 border-r border-slate-200 dark:border-slate-800">Kelas</th>
                      <th className="p-2">L/P</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="p-2 border-r border-slate-200 dark:border-slate-800">ID Guru</th>
                      <th className="p-2 border-r border-slate-200 dark:border-slate-800">Nama Lengkap</th>
                      <th className="p-2 border-r border-slate-200 dark:border-slate-800">NIP</th>
                      <th className="p-2">Mata Pelajaran Binaan</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                  {activeUploadTab === 'students' ? (
                    studentPreview.slice(0, 10).map((std, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850/40">
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-bold">{std.nis}</td>
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 max-w-[150px] truncate">{std.nama}</td>
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800">{std.tempat}</td>
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800">{std.tgl}</td>
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-bold text-amber-600">{std.kelas}</td>
                        <td className="p-2"><span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${std.jk === 'Laki-laki' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>{std.jk}</span></td>
                      </tr>
                    ))
                  ) : (
                    teacherPreview.slice(0, 10).map((tchr, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850/40">
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-bold">{tchr.id}</td>
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 max-w-[150px] truncate font-bold text-blue-600">{tchr.nama}</td>
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800">{tchr.nip}</td>
                        <td className="p-2 text-slate-500">{tchr.mapel || '-'}</td>
                      </tr>
                    ))
                  )}
                  {((activeUploadTab === 'students' ? studentPreview.length : teacherPreview.length) > 10) && (
                    <tr className="bg-slate-50/50 dark:bg-slate-950/30">
                      <td colSpan={activeUploadTab === 'students' ? 6 : 4} className="p-2 text-center text-slate-400 font-semibold italic text-[9px]">
                        * Menampilkan 10 baris pertama. Masih ada {(activeUploadTab === 'students' ? studentPreview.length : teacherPreview.length) - 10} baris data lainnya yang akan disimpan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* SECTION: Reset Kategori Khusus */}
      <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-xl bg-slate-50/10 space-y-4">
        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-emerald-650" />
          <span>Reset &amp; Bersihkan Data Spesifik (Murid / Guru)</span>
        </h3>
        <p className="text-[11px] text-slate-400">
          Urus masing-masing database secara terpisah tanpa memengaruhi tabel log presensi, jurnal, RPP, atau raport yang lain. Sangat berguna untuk mengecek apakah data perlu di-update atau diganti baru.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Box Kategori Murid */}
          <div className="p-4 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Data Murid ({students.length} Siswa)
              </span>
              <span className="text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-750 px-2 py-0.5 rounded-full">
                Siswa Binaan
              </span>
            </div>
            
            <p className="text-[11px] text-slate-450 leading-normal">
              Kembalikan daftar murid ke data preset sekolah, atau bersihkan seluruhnya agar Anda dapat mengunggah berkas Excel murni.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="btn-reset-students-only"
                type="button"
                onClick={() => {
                  askConfirm(
                    'Reset Data Murid',
                    'Apakah Anda yakin ingin mereset HANYA data murid ke contoh preset bawaan? Catatan pembelajaran lain tidak akan hilang.',
                    () => {
                      if (onResetStudents) {
                        onResetStudents();
                        showStatus('success', 'Berhasil menyetel ulang data siswa ke preset bawaan.');
                      }
                    }
                  );
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-[11px] font-bold transition-all border border-emerald-100/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Preset Siswa</span>
              </button>

              <button
                id="btn-clear-students-only"
                type="button"
                onClick={() => {
                  askConfirm(
                    'Kosongkan Data Murid',
                    'PERINGATAN: Semua data murid akan dihapus dari penyimpanan lokal browser. Lanjutkan?',
                    () => {
                      if (onClearStudents) {
                        onClearStudents();
                        showStatus('success', 'Berhasil mengosongkan data murid.');
                      }
                    },
                    true
                  );
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-455 rounded-lg text-[11px] font-bold transition-all border border-rose-100/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Murid</span>
              </button>
            </div>
          </div>

          {/* Box Kategori Guru */}
          <div className="p-4 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Data Guru ({teachers.length} Staf)
              </span>
              <span className="text-[9px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-750 px-2 py-0.5 rounded-full">
                Tenaga Pengajar
              </span>
            </div>
            
            <p className="text-[11px] text-slate-450 leading-normal">
              Pulihkan daftar staf pengajar ke konfigurasi aslinya atau kosongkan semua guru untuk memasukkan daftar staf sekolah Anda sendiri.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="btn-reset-teachers-only"
                type="button"
                onClick={() => {
                  askConfirm(
                    'Reset Data Guru',
                    'Apakah Anda yakin ingin mereset HANYA data guru ke contoh preset bawaan?',
                    () => {
                      if (onResetTeachers) {
                        onResetTeachers();
                        showStatus('success', 'Berhasil menyetel ulang data guru ke preset bawaan.');
                      }
                    }
                  );
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/40 text-blue-750 dark:text-blue-400 rounded-lg text-[11px] font-bold transition-all border border-blue-100/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Preset Guru</span>
              </button>

              <button
                id="btn-clear-teachers-only"
                type="button"
                onClick={() => {
                  askConfirm(
                    'Kosongkan Data Guru',
                    'PERINGATAN: Semua data guru akan dihapus instan dari penyimpanan lokal browser. Lanjutkan?',
                    () => {
                      if (onClearTeachers) {
                        onClearTeachers();
                        showStatus('success', 'Berhasil mengosongkan data guru.');
                      }
                    },
                    true
                  );
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 text-rose-650 dark:text-rose-455 rounded-lg text-[11px] font-bold transition-all border border-rose-100/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Guru</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Seed & System Operations */}
        <div className="border border-slate-150 dark:border-slate-800 rounded-xl p-5 space-y-4 bg-slate-50/10">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">
            Operasi Pemeliharaan Manual
          </h3>
          <p className="text-[11px] text-slate-450 leading-relaxed">
            Gunakan tombol berikut jika Anda ingin mereset data pembelajaran ke data awal (seed presets) atau membersihkan seluruh data lokal untuk memulai instansi baru dari nol.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn-db-reset-preset"
              type="button"
              onClick={() => {
                askConfirm(
                  'Reset Database Lengkap',
                  'Apakah Anda yakin ingin mengganti data saat ini dengan data preset awal? Data baru yang Anda input akan ditimpa.',
                  () => {
                    onResetDatabase();
                    showStatus('success', 'Database berhasil di-reset ke data preset awal.');
                  }
                );
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-900 border border-emerald-950 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Reset Preset</span>
            </button>

            <button
              id="btn-db-clear-all"
              type="button"
              onClick={() => {
                askConfirm(
                  'Bersihkan Semua Data',
                  'PERINGATAN: Semua data murid, guru, nilai, presensi, jurnal, dan RPP di lokal browser akan DIHAPUS PERMANEN. Teruskan?',
                  () => {
                    onClearDatabase();
                    showStatus('success', 'Database berhasil dibersihkan.');
                  },
                  true
                );
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-xl text-xs font-bold transition-all border border-rose-100/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Data</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              id="btn-db-export-json"
              type="button"
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Ekspor Backup database (JSON)</span>
            </button>
          </div>
        </div>

        {/* Restore Backup Area */}
        <div className="border border-slate-150 dark:border-slate-800 rounded-xl p-5 space-y-3 bg-slate-50/10">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide flex items-center gap-1.5">
            <span>Pulihkan dari Backup Eksternal</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" title="Gunakan file JSON cadangan lengkap" />
          </h3>
          <p className="text-[11px] text-slate-450">
            Tempelkan isi file teks cadangan JSON yang telah diekspor untuk memulihkan keadaan database lokal.
          </p>

          <form onSubmit={handleImportSubmit} className="space-y-3">
            <textarea
              id="ta-db-import-json"
              rows={4}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='{ "students": [...], "teachers": [...], "attendanceRecords": [...] }'
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white"
            />
            
            <button
              id="btn-db-import-submit"
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-750 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Impor Berkas Backup</span>
            </button>
          </form>
        </div>

      </div>

      {/* Custom Stateful Confirmation Modal Box (Perfect for Sandboxed Iframes) */}
      {confirmModal && (
        <div id="custom-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${confirmModal.isDanger ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' : 'bg-amber-50 dark:bg-amber-955/30 text-amber-500'}`}>
                <AlertTriangle className="w-5 h-5 shrink-0" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                id="btn-confirm-cancel"
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800/45 hover:bg-slate-200/50 text-slate-650 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                {confirmModal.cancelText}
              </button>
              <button
                id="btn-confirm-execute"
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className={`px-4 py-2 text-white rounded-lg text-xs font-bold shadow-xs transition ${
                  confirmModal.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
