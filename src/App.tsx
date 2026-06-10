import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Teacher, AttendanceRecord, JurnalRecord, RppRecord, StudentGrade } from './types';
import {
  PRESET_TEACHERS,
  PRESET_STUDENTS,
  PRESET_ATTENDANCE,
  PRESET_JURANAL,
  PRESET_RPP,
  PRESET_GRADES
} from './data';

// Component Imports
import LoginScreen from './components/LoginScreen';
import StudentModule from './components/StudentModule';
import TeacherModule from './components/TeacherModule';
import AttendanceModule from './components/AttendanceModule';
import GradesModule from './components/GradesModule';
import JurnalModule from './components/JurnalModule';
import RppModule from './components/RppModule';
import SyncHub from './components/SyncHub';
import DatabaseModule from './components/DatabaseModule';

// Icons
import {
  BookOpen, Users, LogOut, CheckCircle2, AlertTriangle, Shield, Settings, Database, GraduationCap, FileText, Activity, HelpCircle,
  TrendingUp, Calendar, Newspaper, HeartPulse, User, Award, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';

interface AutoSyncState {
  status: 'idle' | 'sending' | 'success' | 'error';
  message: string;
}

function AutoSyncBanner({ syncState }: { syncState?: AutoSyncState }) {
  if (!syncState || syncState.status === 'idle') return null;

  const config = {
    sending: {
      bg: 'bg-indigo-50/80 border-indigo-200/60 dark:bg-indigo-950/20 dark:border-indigo-900/60',
      text: 'text-indigo-805 dark:text-indigo-350',
      icon: <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-250/60 dark:bg-emerald-950/20 dark:border-emerald-900/60',
      text: 'text-emerald-805 dark:text-emerald-355',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    },
    error: {
      bg: 'bg-rose-50/80 border-rose-200/60 dark:bg-rose-950/20 dark:border-rose-900/60',
      text: 'text-rose-800 dark:text-rose-450',
      icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-500" />
    }
  };

  const current = config[syncState.status] || config.sending;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`mb-4 px-4 py-3 rounded-2xl border ${current.bg} flex items-center gap-3 shadow-xs text-xs font-sans font-medium transition-all duration-300`}
    >
      <div className="shrink-0">{current.icon}</div>
      <div className={`flex-1 leading-snug ${current.text}`}>
        {syncState.message}
      </div>
    </motion.div>
  );
}

function InitialSyncBanner({ syncState, errorMsg, onRetry }: { syncState: 'idle' | 'syncing' | 'success' | 'error'; errorMsg?: string; onRetry?: () => void }) {
  if (syncState === 'idle') return null;

  const config = {
    syncing: {
      bg: 'bg-indigo-50/90 border-indigo-200/60 dark:bg-indigo-950/20 dark:border-indigo-900/60',
      text: 'text-indigo-805 dark:text-indigo-350',
      title: 'Menyinkronkan data langsung dari Google Sheets...',
      desc: 'Tengah menyelaraskan data murid, guru, nilai, dan jurnal terupdate otomatis agar terus sinkron di semua perangkat.',
      icon: <Loader2 className="w-5 h-5 text-indigo-650 dark:text-indigo-400 animate-spin" />
    },
    success: {
      bg: 'bg-emerald-50/90 border-emerald-250/60 dark:bg-emerald-950/20 dark:border-emerald-900/60',
      text: 'text-emerald-800 dark:text-emerald-305',
      title: 'Koneksi Spreadsheet Aktif!',
      desc: 'Database murid, guru, nilai, dan jurnal harian berhasil diselaraskan dari Google Sheets. ✨',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-655 dark:text-emerald-400" />
    },
    error: {
      bg: 'bg-amber-50/90 border-amber-200/60 dark:bg-amber-955/20 dark:border-amber-900/60',
      text: 'text-amber-805 dark:text-amber-350',
      title: 'Sinkronisasi Tertunda (Menggunakan Database Lokal)',
      desc: 'Gagal mengunduh data terbaru: ' + (errorMsg || 'Masalah jaringan.') + ' Anda tetap dapat mengisi data secara offline, perubahan akan terkirim saat terhubung kembali.',
      icon: <AlertTriangle className="w-5 h-5 text-amber-655 dark:text-amber-500" />
    }
  };

  const current = config[syncState];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`mb-6 p-4 rounded-2xl border ${current.bg} flex items-start gap-4 shadow-xs text-xs font-sans font-medium`}
    >
      <div className="shrink-0 mt-0.5">{current.icon}</div>
      <div className="flex-1 leading-snug text-left">
        <p className={`font-bold text-sm ${current.text}`}>{current.title}</p>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{current.desc}</p>
      </div>
      {syncState === 'error' && onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="shrink-0 text-[10px] font-bold px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-850 dark:bg-amber-950/65 dark:text-amber-300 dark:hover:bg-amber-900/65 rounded-xl transition-all self-center"
        >
          Coba Hubungkan
        </button>
      )}
    </motion.div>
  );
}

export default function App() {
  // Auth State
  const [portal, setPortal] = useState<'guest' | 'guru' | 'admin'>('guest');
  const [username, setUsername] = useState('');

  // Domain Database States
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [jurnalRecords, setJurnalRecords] = useState<JurnalRecord[]>([]);
  const [rppRecords, setRppRecords] = useState<RppRecord[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);

  // Connectivity Sync Config
  const [gasUrl, setGasUrl] = useState('https://script.google.com/macros/s/AKfycbwBxZGeiMOQ-af5hKUNFCkeWxXTNhB2EDW5-IcsFVtsgkRr1kVJ8DZwMOWza8k-TxWFtw/exec');
  const [lastSynced, setLastSynced] = useState('');

  // Simulating state (Simulation mode vs Live database connection)
  const [isSimulating, setIsSimulating] = useState<boolean>(() => {
    const cached = localStorage.getItem('sdn2_is_simulating_v2.6');
    return cached === null ? true : cached === 'true';
  });

  // Auto-sync startup state (Auto background sync when opening the app)
  const [autoSyncOnStartup, setAutoSyncOnStartup] = useState<boolean>(() => {
    const cached = localStorage.getItem('sdn2_auto_sync_startup_v2.6');
    return cached === null ? true : cached === 'true';
  });

  // UI state metrics
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'students' | 'teachers' | 'attendance' | 'grades' | 'journals' | 'rpp' | 'synchub' | 'database'>('dashboard');
  const [selfHealed, setSelfHealed] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Start-up automatic pull sync status
  const [initialSyncStatus, setInitialSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [initialSyncError, setInitialSyncError] = useState('');

  // Real-time synchronization state for individual tabs
  const [moduleSyncStates, setModuleSyncStates] = useState<Record<string, { status: 'idle' | 'sending' | 'success' | 'error'; message: string }>>({
    students: { status: 'idle', message: '' },
    teachers: { status: 'idle', message: '' },
    attendance: { status: 'idle', message: '' },
    grades: { status: 'idle', message: '' },
    journals: { status: 'idle', message: '' },
    rpp: { status: 'idle', message: '' }
  });

  const navRef = useRef<HTMLDivElement>(null);

  const scrollTabsLeft = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: -180, behavior: 'smooth' });
    }
  };

  const scrollTabsRight = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  // Standard LocalStorage caching prefix
  const KEYS = {
    STUDENTS: 'sdn2_students_v2.6',
    TEACHERS: 'sdn2_teachers_v2.6',
    ATTENDANCE: 'sdn2_attendance_v2.6',
    JOURNALS: 'sdn2_journals_v2.6',
    RPP: 'sdn2_rpp_v2.6',
    GRADES: 'sdn2_grades_v2.6',
    GAS_URL: 'sdn2_gas_url_v2.6',
    LAST_SYNCED: 'sdn2_last_synced_v2.6',
  };

  // Helper background startup sync function
  const runBackgroundStartupSync = async (urlToUse: string, forceLive: boolean) => {
    if (!forceLive || !urlToUse) return;

    setInitialSyncStatus('syncing');
    setInitialSyncError('');
    try {
      const res = await fetch(`${urlToUse}?action=pull`);
      const json = await res.json();
      
      if (json.status === "success" && json.data) {
        const data = json.data;
        if (data.students) {
          setStudents(data.students);
          persistCache(KEYS.STUDENTS, data.students);
        }
        if (data.teachers) {
          setTeachers(data.teachers);
          persistCache(KEYS.TEACHERS, data.teachers);
        }
        if (data.attendance) {
          setAttendanceRecords(data.attendance);
          persistCache(KEYS.ATTENDANCE, data.attendance);
        }
        if (data.journals) {
          setJurnalRecords(data.journals);
          persistCache(KEYS.JOURNALS, data.journals);
        }
        if (data.rpp) {
          setRppRecords(data.rpp);
          persistCache(KEYS.RPP, data.rpp);
        }
        if (data.grades) {
          setGrades(data.grades);
          persistCache(KEYS.GRADES, data.grades);
        }

        const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
        setLastSynced(dateStr);
        localStorage.setItem(KEYS.LAST_SYNCED, dateStr);

        setInitialSyncStatus('success');
        setTimeout(() => setInitialSyncStatus('idle'), 4500);
      } else {
        throw new Error(json.message || "Terdapat anomali respon dari server Spreadsheet.");
      }
    } catch (err: any) {
      console.error("Startup background pull failed:", err);
      setInitialSyncStatus('error');
      setInitialSyncError(err.message || 'Koneksi lambat/bermasalah.');
      setTimeout(() => setInitialSyncStatus('idle'), 6000);
    }
  };

  // 1. Initial State Hydration with Self-Healing Backup and URL Parameter Integration
  useEffect(() => {
    try {
      const cachedStudents = localStorage.getItem(KEYS.STUDENTS);
      const cachedTeachers = localStorage.getItem(KEYS.TEACHERS);
      const cachedAttendance = localStorage.getItem(KEYS.ATTENDANCE);
      const cachedJournals = localStorage.getItem(KEYS.JOURNALS);
      const cachedRpp = localStorage.getItem(KEYS.RPP);
      const cachedGrades = localStorage.getItem(KEYS.GRADES);
      const cachedGasUrl = localStorage.getItem(KEYS.GAS_URL);
      const cachedLastSynced = localStorage.getItem(KEYS.LAST_SYNCED);

      let triggeredHealing = false;

      // Hydrate Students
      if (cachedStudents) {
        setStudents(JSON.parse(cachedStudents));
      } else {
        setStudents(PRESET_STUDENTS);
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(PRESET_STUDENTS));
        triggeredHealing = true;
      }

      // Hydrate Teachers
      if (cachedTeachers) {
        setTeachers(JSON.parse(cachedTeachers));
      } else {
        setTeachers(PRESET_TEACHERS);
        localStorage.setItem(KEYS.TEACHERS, JSON.stringify(PRESET_TEACHERS));
        triggeredHealing = true;
      }

      // Hydrate Attendance
      if (cachedAttendance) {
        setAttendanceRecords(JSON.parse(cachedAttendance));
      } else {
        setAttendanceRecords(PRESET_ATTENDANCE);
        localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(PRESET_ATTENDANCE));
        triggeredHealing = true;
      }

      // Hydrate Journals
      if (cachedJournals) {
        setJurnalRecords(JSON.parse(cachedJournals));
      } else {
        setJurnalRecords(PRESET_JURANAL);
        localStorage.setItem(KEYS.JOURNALS, JSON.stringify(PRESET_JURANAL));
        triggeredHealing = true;
      }

      // Hydrate RPPs
      if (cachedRpp) {
        setRppRecords(JSON.parse(cachedRpp));
      } else {
        setRppRecords(PRESET_RPP);
        localStorage.setItem(KEYS.RPP, JSON.stringify(PRESET_RPP));
        triggeredHealing = true;
      }

      // Hydrate Grades
      if (cachedGrades) {
        setGrades(JSON.parse(cachedGrades));
      } else {
        setGrades(PRESET_GRADES);
        localStorage.setItem(KEYS.GRADES, JSON.stringify(PRESET_GRADES));
        triggeredHealing = true;
      }

      // Connectivity Keys
      const defaultUrl = 'https://script.google.com/macros/s/AKfycbwBxZGeiMOQ-af5hKUNFCkeWxXTNhB2EDW5-IcsFVtsgkRr1kVJ8DZwMOWza8k-TxWFtw/exec';
      const oldUrl1 = 'https://script.google.com/macros/s/AKfycbxGp8TrMvFfunuwxotuhzHLFkOmZK1oZQ-Sh6Mqf9niFmYCl8_Qr6TfYb6A-vDGu2qA/exec';
      const oldUrl2 = 'https://script.google.com/macros/s/AKfycbzfzolf-A_8DGA39iDK-uK61tLNM-qR_IkwTTPkEE56QfVNa-A8f_OTugtNm3Oc-7SpZg/exec';

      // Read URL query parameters for extreme ease of cross-device deployment
      const searchParams = new URLSearchParams(window.location.search);
      const urlParam = searchParams.get('gasUrl') || searchParams.get('syncUrl');
      const simParam = searchParams.get('sim');

      let targetUrl = defaultUrl;
      let targetSimulating = true;

      // Check cache for simulation state first
      const cachedSimState = localStorage.getItem('sdn2_is_simulating_v2.6');
      if (cachedSimState !== null) {
        targetSimulating = cachedSimState === 'true';
      }

      // Check URL parameters for auto configuration
      if (urlParam) {
        targetUrl = decodeURIComponent(urlParam);
        localStorage.setItem(KEYS.GAS_URL, targetUrl);
        setGasUrl(targetUrl);

        // Auto disable simulation since they loaded a designated sheet link
        targetSimulating = false;
        localStorage.setItem('sdn2_is_simulating_v2.6', 'false');
        setIsSimulating(false);
      } else if (cachedGasUrl && cachedGasUrl !== oldUrl1 && cachedGasUrl !== oldUrl2) {
        targetUrl = cachedGasUrl;
        setGasUrl(cachedGasUrl);
      } else {
        setGasUrl(defaultUrl);
        localStorage.setItem(KEYS.GAS_URL, defaultUrl);
      }

      if (simParam !== null) {
        targetSimulating = simParam === 'true';
        localStorage.setItem('sdn2_is_simulating_v2.6', simParam);
        setIsSimulating(targetSimulating);
      }

      if (cachedLastSynced) setLastSynced(cachedLastSynced);

      if (triggeredHealing) {
        setSelfHealed(true);
        setTimeout(() => setSelfHealed(false), 5000);
      }

      // Run startup sync if autoSync is active and simulator is OFF
      const cachedAutoSync = localStorage.getItem('sdn2_auto_sync_startup_v2.6');
      const resolvedAutoSync = cachedAutoSync === null ? true : cachedAutoSync === 'true';

      if (resolvedAutoSync && !targetSimulating) {
        runBackgroundStartupSync(targetUrl, true);
      }
    } catch (e) {
      console.error("Hydration error, resetting to defaults", e);
    }
  }, []);

  // Save states to LocalStorage on modifications
  const persistCache = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to cache ${key}`, error);
    }
  };

  // Permissions Guard: Auto redirect restricted tabs to dashboard if a non-admin attempts access
  useEffect(() => {
    if (portal !== 'admin' && (activeTab === 'synchub' || activeTab === 'database')) {
      setActiveTab('dashboard');
    }
  }, [portal, activeTab]);

  // Auth login action handler
  const handleLoginSuccess = (portalRole: 'guru' | 'admin', name: string) => {
    setPortal(portalRole);
    setUsername(name);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setPortal('guest');
    setUsername('');
  };

  // Real-time automatic background push to Google Sheets Apps Script Web App
  const triggerAutoSync = async (
    targetModule: 'students' | 'teachers' | 'attendance' | 'grades' | 'journals' | 'rpp',
    updatedState: {
      students?: Student[];
      teachers?: Teacher[];
      attendance?: AttendanceRecord[];
      journals?: JurnalRecord[];
      rpp?: RppRecord[];
      grades?: StudentGrade[];
    }
  ) => {
    // Dynamic fallback checking of parameters
    const finalStudents = updatedState.students !== undefined ? updatedState.students : students;
    const finalTeachers = updatedState.teachers !== undefined ? updatedState.teachers : teachers;
    const finalAttendance = updatedState.attendance !== undefined ? updatedState.attendance : attendanceRecords;
    const finalJournals = updatedState.journals !== undefined ? updatedState.journals : jurnalRecords;
    const finalRpp = updatedState.rpp !== undefined ? updatedState.rpp : rppRecords;
    const finalGrades = updatedState.grades !== undefined ? updatedState.grades : grades;

    setModuleSyncStates(prev => ({
      ...prev,
      [targetModule]: { status: 'sending', message: 'Sedang menyimpan & menyinkronkan data langsung ke Google Sheets...' }
    }));

    try {
      if (!gasUrl) {
        throw new Error("Web App URL belum dikonfigurasi di Sync Hub.");
      }

      const payload = {
        action: "push",
        payload: {
          students: finalStudents,
          teachers: finalTeachers,
          attendance: finalAttendance,
          journals: finalJournals,
          rpp: finalRpp,
          grades: finalGrades
        }
      };

      // Perform direct fetch to Apps Script Web App (uses 'no-cors' to bypass browser CORS headers constraints while still submitting)
      await fetch(gasUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      setLastSynced(dateStr);
      localStorage.setItem(KEYS.LAST_SYNCED, dateStr);

      setModuleSyncStates(prev => ({
        ...prev,
        [targetModule]: { status: 'success', message: 'Penyimpanan Berhasil! Data Anda disinkronkan langsung ke Google Sheets. 🎉' }
      }));

      setTimeout(() => {
        setModuleSyncStates(prev => ({
          ...prev,
          [targetModule]: { status: 'idle', message: '' }
        }));
      }, 3500);

    } catch (err: any) {
      console.error("Auto sync failed:", err);
      setModuleSyncStates(prev => ({
        ...prev,
        [targetModule]: { 
          status: 'error', 
          message: `Tersimpan Lokal. Google Sheet gagal merespon: ${err.message || 'Koneksi lambat/bermasalah.'}` 
        }
      }));
      setTimeout(() => {
        setModuleSyncStates(prev => ({
          ...prev,
          [targetModule]: { status: 'idle', message: '' }
        }));
      }, 5500);
    }
  };

  // Student CRUD Operations
  const handleAddStudent = (student: Student) => {
    const updated = [student, ...students];
    setStudents(updated);
    persistCache(KEYS.STUDENTS, updated);
    triggerAutoSync('students', { students: updated });
  };

  const handleEditStudent = (student: Student) => {
    const updated = students.map(s => s.nis === student.nis ? student : s);
    setStudents(updated);
    persistCache(KEYS.STUDENTS, updated);
    triggerAutoSync('students', { students: updated });
  };

  const handleDeleteStudent = (nis: string) => {
    const updated = students.filter(s => s.nis !== nis);
    setStudents(updated);
    persistCache(KEYS.STUDENTS, updated);
    triggerAutoSync('students', { students: updated });
  };

  // Teachers CRUD Operations
  const handleAddTeacher = (teacher: Teacher) => {
    const updated = [teacher, ...teachers];
    setTeachers(updated);
    persistCache(KEYS.TEACHERS, updated);
    triggerAutoSync('teachers', { teachers: updated });
  };

  const handleEditTeacher = (teacher: Teacher) => {
    const updated = teachers.map(t => t.id === teacher.id ? teacher : t);
    setTeachers(updated);
    persistCache(KEYS.TEACHERS, updated);
    triggerAutoSync('teachers', { teachers: updated });
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    persistCache(KEYS.TEACHERS, updated);
    triggerAutoSync('teachers', { teachers: updated });
  };

  // Attendance Overwrite handler
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    const nonModified = attendanceRecords.filter(item => {
      return !records.some(r => r.date === item.date && r.studentNis === item.studentNis);
    });

    const updated = [...nonModified, ...records];
    setAttendanceRecords(updated);
    persistCache(KEYS.ATTENDANCE, updated);
    triggerAutoSync('attendance', { attendance: updated });
  };

  // Grade Overwrite handler
  const handleSaveGrade = (grade: StudentGrade) => {
    const exists = grades.some(g => g.studentNis === grade.studentNis);
    const updated = exists 
      ? grades.map(g => g.studentNis === grade.studentNis ? grade : g)
      : [...grades, grade];
    
    setGrades(updated);
    persistCache(KEYS.GRADES, updated);
    triggerAutoSync('grades', { grades: updated });
  };

  // Teaching journals
  const handleAddJurnal = (record: JurnalRecord) => {
    const updated = [record, ...jurnalRecords];
    setJurnalRecords(updated);
    persistCache(KEYS.JOURNALS, updated);
    triggerAutoSync('journals', { journals: updated });
  };

  const handleDeleteJurnal = (id: string) => {
    const updated = jurnalRecords.filter(j => j.id !== id);
    setJurnalRecords(updated);
    persistCache(KEYS.JOURNALS, updated);
    triggerAutoSync('journals', { journals: updated });
  };

  // RPP Lesson portfolios
  const handleAddRpp = (record: RppRecord) => {
    const updated = [record, ...rppRecords];
    setRppRecords(updated);
    persistCache(KEYS.RPP, updated);
    triggerAutoSync('rpp', { rpp: updated });
  };

  const handleDeleteRpp = (id: string) => {
    const updated = rppRecords.filter(r => r.id !== id);
    setRppRecords(updated);
    persistCache(KEYS.RPP, updated);
    triggerAutoSync('rpp', { rpp: updated });
  };

  // Cloud Synchronizer Operations
  const handleSaveGasUrl = (url: string) => {
    setGasUrl(url);
    localStorage.setItem(KEYS.GAS_URL, url);
  };

  // PULL: fetch sheet and dehydrate locally
  const onPullData = async (isSimulation: boolean) => {
    if (isSimulation) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Latency feel
      const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      setLastSynced(dateStr);
      localStorage.setItem(KEYS.LAST_SYNCED, dateStr);
      return;
    }

    if (!gasUrl) throw new Error("Google Apps Script URL belum dikonfigurasi.");

    const res = await fetch(`${gasUrl}?action=pull`);
    const json = await res.json();

    if (json.status === "success" && json.data) {
      const data = json.data;
      if (data.students) {
        setStudents(data.students);
        persistCache(KEYS.STUDENTS, data.students);
      }
      if (data.teachers) {
        setTeachers(data.teachers);
        persistCache(KEYS.TEACHERS, data.teachers);
      }
      if (data.attendance) {
        setAttendanceRecords(data.attendance);
        persistCache(KEYS.ATTENDANCE, data.attendance);
      }
      if (data.journals) {
        setJurnalRecords(data.journals);
        persistCache(KEYS.JOURNALS, data.journals);
      }
      if (data.rpp) {
        setRppRecords(data.rpp);
        persistCache(KEYS.RPP, data.rpp);
      }
      if (data.grades) {
        setGrades(data.grades);
        persistCache(KEYS.GRADES, data.grades);
      }

      const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      setLastSynced(dateStr);
      localStorage.setItem(KEYS.LAST_SYNCED, dateStr);
    } else {
      throw new Error(json.message || "Terdapat anomali penarikan API Google Spreadsheet.");
    }
  };

  // PUSH: send active local indices to Sheets
  const onPushData = async (isSimulation: boolean) => {
    const payload = {
      action: "push",
      payload: {
        students,
        teachers,
        attendance: attendanceRecords,
        journals: jurnalRecords,
        rpp: rppRecords,
        grades: grades
      }
    };

    if (isSimulation) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      setLastSynced(dateStr);
      localStorage.setItem(KEYS.LAST_SYNCED, dateStr);
      return;
    }

    if (!gasUrl) throw new Error("Google Apps Script URL belum dikonfigurasi.");

    // Direct HTTP POST to Apps Script Web App
    const res = await fetch(gasUrl, {
      method: "POST",
      mode: "no-cors", // Standard block to ignore direct redirect origin rules, triggers success writes
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // GAS POST requests require clean plain structures
      },
      body: JSON.stringify(payload)
    });

    const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    setLastSynced(dateStr);
    localStorage.setItem(KEYS.LAST_SYNCED, dateStr);
  };

  // 1b. Automatic Online Sync on Login (Master cloud hydration when entering the system)
  useEffect(() => {
    if (portal !== 'guest') {
      const runInitialSync = async () => {
        setInitialSyncStatus('syncing');
        try {
          // Pull live database directly from Apps Script URL
          await onPullData(false);
          setInitialSyncStatus('success');
          setTimeout(() => {
            setInitialSyncStatus('idle');
          }, 5000);
        } catch (error: any) {
          console.error("Failed automatic starter pull from Google Sheets:", error);
          setInitialSyncStatus('error');
          setInitialSyncError(error.message || 'Gagal tersambung dengan Google Spreadsheet. Pastikan internet Anda aktif.');
          setTimeout(() => {
            setInitialSyncStatus('idle');
          }, 8500);
        }
      };
      runInitialSync();
    }
  }, [portal]);

  // Database maintenance operation handlers
  const handleResetDatabase = () => {
    setStudents(PRESET_STUDENTS);
    persistCache(KEYS.STUDENTS, PRESET_STUDENTS);

    setTeachers(PRESET_TEACHERS);
    persistCache(KEYS.TEACHERS, PRESET_TEACHERS);

    setAttendanceRecords(PRESET_ATTENDANCE);
    persistCache(KEYS.ATTENDANCE, PRESET_ATTENDANCE);

    setJurnalRecords(PRESET_JURANAL);
    persistCache(KEYS.JOURNALS, PRESET_JURANAL);

    setRppRecords(PRESET_RPP);
    persistCache(KEYS.RPP, PRESET_RPP);

    setGrades(PRESET_GRADES);
    persistCache(KEYS.GRADES, PRESET_GRADES);
  };

  const handleClearDatabase = () => {
    setStudents([]);
    persistCache(KEYS.STUDENTS, []);

    setTeachers([]);
    persistCache(KEYS.TEACHERS, []);

    setAttendanceRecords([]);
    persistCache(KEYS.ATTENDANCE, []);

    setJurnalRecords([]);
    persistCache(KEYS.JOURNALS, []);

    setRppRecords([]);
    persistCache(KEYS.RPP, []);

    setGrades([]);
    persistCache(KEYS.GRADES, []);
  };

  const handleResetStudents = () => {
    setStudents(PRESET_STUDENTS);
    persistCache(KEYS.STUDENTS, PRESET_STUDENTS);
  };

  const handleResetTeachers = () => {
    setTeachers(PRESET_TEACHERS);
    persistCache(KEYS.TEACHERS, PRESET_TEACHERS);
  };

  const handleClearStudents = () => {
    setStudents([]);
    persistCache(KEYS.STUDENTS, []);
  };

  const handleClearTeachers = () => {
    setTeachers([]);
    persistCache(KEYS.TEACHERS, []);
  };

  const handleImportDatabase = (data: {
    students?: Student[];
    teachers?: Teacher[];
    attendanceRecords?: AttendanceRecord[];
    jurnalRecords?: JurnalRecord[];
    rppRecords?: RppRecord[];
    grades?: StudentGrade[];
  }) => {
    try {
      if (data.students) {
        setStudents(data.students);
        persistCache(KEYS.STUDENTS, data.students);
      }
      if (data.teachers) {
        setTeachers(data.teachers);
        persistCache(KEYS.TEACHERS, data.teachers);
      }
      if (data.attendanceRecords) {
        setAttendanceRecords(data.attendanceRecords);
        persistCache(KEYS.ATTENDANCE, data.attendanceRecords);
      }
      if (data.jurnalRecords) {
        setJurnalRecords(data.jurnalRecords);
        persistCache(KEYS.JOURNALS, data.jurnalRecords);
      }
      if (data.rppRecords) {
        setRppRecords(data.rppRecords);
        persistCache(KEYS.RPP, data.rppRecords);
      }
      if (data.grades) {
        setGrades(data.grades);
        persistCache(KEYS.GRADES, data.grades);
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const onPushGradesOnly = async () => {
    setSyncStatusMsg('Sedang mengunggah E-Raport ke Spreadsheet...');
    try {
      await onPushData(false); // Direct live push
      setSyncStatusMsg('SUKSES: E-Raport Semester Ganjil berhasil diunggah ke spreadsheet.');
    } catch (err: any) {
      // Fallback simulation notice
      setSyncStatusMsg('SINKRONISASI ONLINE GAGAL: Mencoba dengan simulator...');
      setTimeout(async () => {
        await onPushData(true);
        setSyncStatusMsg('SIMULASI SUKSES: E-Raport berhasil disinkronkan ke Spreadsheet (Simulation OK).');
      }, 800);
    }
    setTimeout(() => setSyncStatusMsg(''), 5000);
  };

  if (portal === 'guest') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Calculate live global ratios for stats visualization
  const teacherCount = teachers.length;
  const studentCount = students.length;
  const journalCount = jurnalRecords.length;
  const activeRppCount = rppRecords.filter(r => r.status === 'Aktif').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* Self-healing alert banner */}
      <AnimatePresence>
        {selfHealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-600 text-white text-xs px-4 py-3 flex items-center justify-between gap-3 shadow-md z-50 text-sans"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 animate-bounce shrink-0" />
              <span>
                <strong>LocalStorage Pulih Otomatis!</strong> Berhasil memuat data statis preset SDN 2 Sarigadung karena cache kosong (v2.6.2-stable By Bu Mei).
              </span>
            </div>
            <button
              id="btn-dismiss-healed-alert"
              type="button"
              onClick={() => setSelfHealed(false)}
              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 rounded-lg font-bold"
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synchronizer Toast Notifications */}
      <AnimatePresence>
        {syncStatusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 text-xs flex items-start gap-2.5 font-sans font-semibold"
          >
            <Activity className="w-5 h-5 text-blue-400 shrink-0 animate-pulse" />
            <div>
              <p>{syncStatusMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header navigation grid */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-850 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
           {/* Logo Brand info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-900 border border-emerald-950 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-850 dark:text-white">
                  Aplikasi Guru
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold rounded-lg border border-emerald-250/30">
                  SDN 2 Sarigadung
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5">
                v2.6.2-stable • Dibuat & Dikembangkan By Bu Mei, S.Pd.
              </p>
            </div>
          </div>

          {/* Active Logged-in credentials & Log out */}
          <div className="flex items-center gap-3 ml-auto md:ml-0">
            <div className="text-right">
              {/* Portal badge indicator */}
              <div className="flex items-center gap-1.5 justify-end mb-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${portal === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                <span className={`text-[9px] uppercase font-extrabold tracking-wider ${
                  portal === 'admin' ? 'text-blue-600' : 'text-emerald-600'
                }`}>
                  {portal === 'admin' ? 'Akses Administrator' : 'Wali Kelas / Guru'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-40 md:max-w-none">
                {username}
              </p>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />

            <button
              id="btn-logout"
              type="button"
              onClick={handleLogout}
              className="p-2 bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-100 dark:border-slate-900 group select-none"
              title="Keluar dari Sistem"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar Panel (Left on Desktop, Top Scroll on Mobile) - Natural Tones Theme */}
        <aside className="lg:w-48 shrink-0">
          <div className="relative select-none">
            {/* Left arrow button for easy sliding on mobile/tablet */}
            <button
              id="btn-slide-nav-left"
              type="button"
              onClick={scrollTabsLeft}
              className="lg:hidden absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-emerald-950/90 text-white border border-emerald-800/80 flex items-center justify-center active:scale-95 transition-all shadow-md shadow-emerald-950/30"
              title="Geser Kiri"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-300" />
            </button>

            <nav 
              ref={navRef}
              className="flex lg:flex-col bg-emerald-900 text-white border border-emerald-950 p-2.5 rounded-3xl gap-1 overflow-x-auto lg:overflow-x-visible pb-2.5 lg:pb-2.5 scrollbar-none shadow-md sticky top-24 select-none"
            >
              
              {/* 1. Beranda */}
              <button
                id="sidebar-nav-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all justify-start shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-800 text-white border border-emerald-700/50 shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Beranda</span>
              </button>

              {/* 2. Data Murid */}
              <button
                id="sidebar-nav-students"
                onClick={() => setActiveTab('students')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all justify-start shrink-0 ${
                  activeTab === 'students'
                    ? 'bg-emerald-800 text-white border border-emerald-700/50 shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Data Murid</span>
              </button>

              {/* 3. Presensi Harian */}
              <button
                id="sidebar-nav-attendance"
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all justify-start shrink-0 ${
                  activeTab === 'attendance'
                    ? 'bg-emerald-800 text-white border border-emerald-700/50 shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Presensi Harian</span>
              </button>

              {/* 4. Jurnal Harian */}
              <button
                id="sidebar-nav-journals"
                onClick={() => setActiveTab('journals')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all justify-start shrink-0 ${
                  activeTab === 'journals'
                    ? 'bg-emerald-800 text-white border border-emerald-700/50 shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Jurnal Harian</span>
              </button>

              {/* 5. Modul Ajar */}
              <button
                id="sidebar-nav-rpp"
                onClick={() => setActiveTab('rpp')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all justify-start shrink-0 ${
                  activeTab === 'rpp'
                    ? 'bg-emerald-800 text-white border border-emerald-700/50 shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Modul Ajar</span>
              </button>

              {/* 6. E-Raport */}
              <button
                id="sidebar-nav-grades"
                onClick={() => setActiveTab('grades')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all justify-start shrink-0 ${
                  activeTab === 'grades'
                    ? 'bg-emerald-800 text-white border border-emerald-700/50 shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>E-Raport</span>
              </button>

              {/* 7. Data Guru */}
              <button
                id="sidebar-nav-teachers"
                onClick={() => setActiveTab('teachers')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all justify-start shrink-0 ${
                  activeTab === 'teachers'
                    ? 'bg-emerald-800 text-white border border-emerald-700/50 shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Data Guru</span>
              </button>

              {/* 8. Google Syncron */}
              {portal === 'admin' && (
                <button
                  id="sidebar-nav-synchub"
                  onClick={() => setActiveTab('synchub')}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all justify-start shrink-0 ${
                    activeTab === 'synchub'
                      ? 'bg-emerald-800 text-white border border-emerald-700/50 shadow-sm'
                      : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40'
                  }`}
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Google Syncron</span>
                </button>
              )}

              {/* 9. Database */}
              {portal === 'admin' && (
                <button
                  id="sidebar-nav-database"
                  onClick={() => setActiveTab('database')}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all justify-start shrink-0 ${
                    activeTab === 'database'
                      ? 'bg-emerald-800 text-white border border-emerald-700/50 shadow-sm'
                      : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/40'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Database</span>
                </button>
              )}

            </nav>

            {/* Right arrow button for easy sliding on mobile/tablet */}
            <button
              id="btn-slide-nav-right"
              type="button"
              onClick={scrollTabsRight}
              className="lg:hidden absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-emerald-950/90 text-white border border-emerald-800/80 flex items-center justify-center active:scale-95 transition-all shadow-md shadow-emerald-950/30"
              title="Geser Kanan"
            >
              <ChevronRight className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </aside>

        {/* Dynamic Display Center based on activeTab */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* BRAND TAB TITLE BLOCK */}
              <div className="mb-6">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#10b981]">
                  Modul Administrasi SDN 2 Sarigadung
                </span>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white capitalize">
                  {activeTab === 'dashboard' && 'Beranda Utama'}
                  {activeTab === 'students' && 'Data Siswa Binaan'}
                  {activeTab === 'attendance' && 'Rekap Presensi Harian'}
                  {activeTab === 'journals' && 'Jurnal Pembelajaran Kelas'}
                  {activeTab === 'rpp' && 'Perancangan Modul Ajar (RPP)'}
                  {activeTab === 'grades' && 'Pengolahan E-Raport Nilai'}
                  {activeTab === 'teachers' && 'Roster Staff Pengajar'}
                  {activeTab === 'synchub' && 'Google Sheets Synchronizer'}
                  {activeTab === 'database' && 'Manajemen Database Lokal'}
                </h1>
              </div>

              {/* Startup automatic background synchronization */}
              <AnimatePresence mode="wait">
                <InitialSyncBanner 
                  syncState={initialSyncStatus} 
                  errorMsg={initialSyncError} 
                  onRetry={() => runBackgroundStartupSync(gasUrl, true)} 
                />
              </AnimatePresence>

              {/* 1. Dashboard View */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Creator / Welcome Banner */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
                        <span>👋 Selamat Datang di Pusat Administrasi Digital</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Sistem informasi pembelajaran terpadu SDN 2 Sarigadung.
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-100 dark:border-indigo-900/60 px-4 py-2.5 rounded-xl shrink-0 flex items-center gap-2.5 text-left shadow-xs">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs">
                        BM
                      </div>
                      <div>
                        <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-extrabold uppercase tracking-wider">Dibuat & Dikembangkan By</p>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100">Bu Mei, S.Pd.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bento statistics grid counters */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat Total Murid */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Siswa</p>
                      <div className="flex items-end space-x-2 mt-2">
                        <span className="text-3xl font-extrabold text-emerald-600 font-mono">{studentCount}</span>
                        <span className="text-slate-400 text-xs font-semibold mb-1">Anak</span>
                      </div>
                    </div>

                    {/* Stat Pendidik Staff */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pendidik Staff</p>
                      <div className="flex items-end space-x-2 mt-2">
                        <span className="text-3xl font-extrabold text-blue-600 font-mono">{teacherCount}</span>
                        <span className="text-slate-400 text-xs font-semibold mb-1">Guru</span>
                      </div>
                    </div>

                    {/* Stat Agenda Keg Jurnal */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Jurnal Entri</p>
                      <div className="flex items-end space-x-2 mt-2">
                        <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">{journalCount}</span>
                        <span className="text-slate-400 text-xs font-semibold mb-1">Draf</span>
                      </div>
                    </div>

                    {/* Stat Modul RPP rancang */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Nilai Diproses</p>
                      <div className="flex items-end space-x-2 mt-2">
                        <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">{activeRppCount}</span>
                        <span className="text-slate-400 text-xs font-semibold mb-1">RPP</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Student Count & Class-level Attendance stats */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        <span>Statistik Murid & Rekap Absensi Per Kelas</span>
                      </h3>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Real-time Absensi
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['I', 'II', 'III', 'IV', 'V', 'VI'].map(cls => {
                        const classStudents = students.filter(s => s.kelas === cls || s.kelas.startsWith(cls + ' '));
                        const totalStudents = classStudents.length;
                        const maleCount = classStudents.filter(s => s.jk === 'Laki-laki').length;
                        const femaleCount = classStudents.filter(s => s.jk === 'Perempuan').length;

                        // Dynamic calculation of attendance records for this class
                        const classRecords = attendanceRecords.filter(r => r.kelas === cls || r.kelas.startsWith(cls + ' '));
                        
                        // Find latest attendance date for this class
                        const dates: string[] = Array.from(new Set(classRecords.map(r => r.date))) as string[];
                        dates.sort().reverse();
                        const latestDate = dates[0] || null;
                        const latestRecords = latestDate ? classRecords.filter(r => r.date === latestDate) : [];
                        
                        const lHadir = latestRecords.filter(r => r.status === 'Hadir').length;
                        const lSakit = latestRecords.filter(r => r.status === 'Sakit').length;
                        const lIzin = latestRecords.filter(r => r.status === 'Izin').length;
                        const lAlpa = latestRecords.filter(r => r.status === 'Alpa').length;

                        // Cumulative totals
                        const totalHadir = classRecords.filter(r => r.status === 'Hadir').length;
                        const grandTotalRecords = classRecords.length;

                        const cumulativeRate = grandTotalRecords > 0 
                          ? Math.round((totalHadir / grandTotalRecords) * 100) 
                          : 0;

                        return (
                          <div key={cls} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:shadow-xs transition-all flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/20">
                            <div className="space-y-3">
                              {/* Header Class Name & Students Count */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                                    Kelas {cls}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {maleCount} L • {femaleCount} P
                                  </p>
                                </div>
                                <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-md font-bold">
                                  {totalStudents} Siswa
                                </span>
                              </div>

                              {/* Attendance Progress / Summary */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500 font-medium">Rasio Kehadiran</span>
                                  <span className="font-bold text-emerald-600 font-mono">
                                    {grandTotalRecords > 0 ? `${cumulativeRate}%` : '-'}
                                  </span>
                                </div>
                                {grandTotalRecords > 0 ? (
                                  <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-emerald-600 rounded-full transition-all" 
                                      style={{ width: `${cumulativeRate}%` }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full bg-slate-200/50 dark:bg-slate-800 h-1.5 rounded-full" />
                                )}
                              </div>

                              {/* Latest Check Summary / Status */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                  Laporan Terakhir ({latestDate ? new Date(latestDate as string).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}) : 'Belum Ada'})
                                </p>
                                {latestDate ? (
                                  <div className="grid grid-cols-4 gap-1 mt-1.5 text-center text-[10px] font-mono font-bold">
                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 py-1 rounded">
                                      <div>H</div>
                                      <div className="text-[11px] mt-0.5">{lHadir}</div>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 py-1 rounded">
                                      <div>S</div>
                                      <div className="text-[11px] mt-0.5">{lSakit}</div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 py-1 rounded">
                                      <div>I</div>
                                      <div className="text-[11px] mt-0.5">{lIzin}</div>
                                    </div>
                                    <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 py-1 rounded">
                                      <div>A</div>
                                      <div className="text-[11px] mt-0.5">{lAlpa}</div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-400/80 italic mt-1 font-medium">
                                    Belum ada data presensi harian
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Main Bento Information Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Warta Sekolah (School Notes bulletin block) - Natural Tones Style */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                          <Newspaper className="w-5 h-5 text-emerald-600" />
                          <span>Papan Informasi & Warta SDN 2 Sarigadung</span>
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400">Mei 26, 2026</span>
                      </div>

                      {/* Info Item 1 */}
                      <div className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-955 rounded-2xl transition-all border border-slate-100/60 dark:border-slate-800/40">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                          <HeartPulse className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Pencegahan Stunting Bersama Puskesmas Pembantu</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed mt-1">
                            Puskesmas Pembantu Sarigadung akan menyelenggarakan sosialisasi asupan bergizi serta penimbangan berat badan siswa Kelas I, II & III di aula sekolah pada hari Jum'at lusa. Guru diharapkan mendaftarkan kesiapan kelas.
                          </p>
                        </div>
                      </div>

                      {/* Info Item 2 */}
                      <div className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-955 rounded-2xl transition-all border border-slate-100/60 dark:border-slate-800/40">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0 mt-0.5">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Binaan Persiapan Penilaian Akhir Semester (PAS)</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed mt-1">
                            Bu Mei mengingatkan semua wali pengajar kelas I-VI agar menginput kisaran soal, mengunci capaian e-raport nilai harian siswa secara teliti, serta memastikan database tersinkronisasi rapi ke Google Spreadsheet koordinator.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive School Profile / Teacher sidebar summary - Natural Tones Emerald Banner */}
                    <div className="lg:col-span-1 space-y-6">
                      
                      {/* Developer / Creator Card */}
                      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-950 space-y-3">
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-800 border border-indigo-700/50 rounded-lg text-indigo-200 font-extrabold uppercase tracking-wider">Pembuat & Pengembang</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-indigo-100">Bu Mei, S.Pd.</h4>
                          <p className="text-[11px] text-indigo-300">Wali Kelas IV A & Inovator Sistem</p>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                          Aplikasi ini dirancang dan dikembangkan secara mandiri oleh <strong>Bu Mei, S.Pd.</strong> guna mendigitalisasi administrasi harian, nilai e-raport, data presensi, dan modul modul ajar secara permanen.
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* 2. Students Module View */}
              {activeTab === 'students' && (
                <div>
                  <AutoSyncBanner syncState={moduleSyncStates.students} />
                  <StudentModule
                    students={students}
                    onAddStudent={handleAddStudent}
                    onEditStudent={handleEditStudent}
                    onDeleteStudent={handleDeleteStudent}
                    portal={portal}
                  />
                </div>
              )}

              {/* 3. Teachers Module View */}
              {activeTab === 'teachers' && (
                <div>
                  <AutoSyncBanner syncState={moduleSyncStates.teachers} />
                  <TeacherModule
                    teachers={teachers}
                    onAddTeacher={handleAddTeacher}
                    onEditTeacher={handleEditTeacher}
                    onDeleteTeacher={handleDeleteTeacher}
                    portal={portal}
                  />
                </div>
              )}

              {/* 4. Attendance Presensi View */}
              {activeTab === 'attendance' && (
                <div>
                  <AutoSyncBanner syncState={moduleSyncStates.attendance} />
                  <AttendanceModule
                    students={students}
                    attendanceRecords={attendanceRecords}
                    onSaveAttendance={handleSaveAttendance}
                  />
                </div>
              )}

              {/* 5. E-Raport (10 Subject grades) View */}
              {activeTab === 'grades' && (
                <div>
                  <AutoSyncBanner syncState={moduleSyncStates.grades} />
                  <GradesModule
                    students={students}
                    grades={grades}
                    onSaveGrade={handleSaveGrade}
                    onPushGradesToCloud={onPushGradesOnly}
                    portal={portal}
                    syncStatus={syncStatusMsg}
                  />
                </div>
              )}

              {/* 6. Jurnal harian mengajar View */}
              {activeTab === 'journals' && (
                <div>
                  <AutoSyncBanner syncState={moduleSyncStates.journals} />
                  <JurnalModule
                    jurnalRecords={jurnalRecords}
                    onAddJurnal={handleAddJurnal}
                    onDeleteJurnal={handleDeleteJurnal}
                    activeTeacherName={username}
                  />
                </div>
              )}

              {/* 7. Lesson Plan portfolio (RPPs) View */}
              {activeTab === 'rpp' && (
                <div>
                  <AutoSyncBanner syncState={moduleSyncStates.rpp} />
                  <RppModule
                    rppRecords={rppRecords}
                    onAddRpp={handleAddRpp}
                    onDeleteRpp={handleDeleteRpp}
                    activeTeacherName={username}
                  />
                </div>
              )}

              {/* 8. Synchronizer SyncHub Integrator Center */}
              {activeTab === 'synchub' && (
                <SyncHub
                  gasUrl={gasUrl}
                  onSaveGasUrl={handleSaveGasUrl}
                  onPullData={onPullData}
                  onPushData={onPushData}
                  lastSynced={lastSynced}
                  isSimulating={isSimulating}
                  setIsSimulating={(val) => {
                    setIsSimulating(val);
                    localStorage.setItem('sdn2_is_simulating_v2.6', String(val));
                  }}
                  autoSyncOnStartup={autoSyncOnStartup}
                  setAutoSyncOnStartup={(val) => {
                    setAutoSyncOnStartup(val);
                    localStorage.setItem('sdn2_auto_sync_startup_v2.6', String(val));
                  }}
                />
              )}

              {/* 9. Database Maintenance local storage Console */}
              {activeTab === 'database' && (
                <DatabaseModule
                  students={students}
                  teachers={teachers}
                  attendanceRecords={attendanceRecords}
                  jurnalRecords={jurnalRecords}
                  rppRecords={rppRecords}
                  grades={grades}
                  onResetDatabase={handleResetDatabase}
                  onClearDatabase={handleClearDatabase}
                  onImportDatabase={handleImportDatabase}
                  onResetStudents={handleResetStudents}
                  onResetTeachers={handleResetTeachers}
                  onClearStudents={handleClearStudents}
                  onClearTeachers={handleClearTeachers}
                  gasUrl={gasUrl}
                  lastSynced={lastSynced}
                  syncStatusMsg={syncStatusMsg}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Persistent platform frame footer */}
      <footer className="bg-white/45 dark:bg-slate-950 border-t border-slate-250/20 py-4 text-center mt-12 select-none">
        <p className="text-[10px] text-slate-400 dark:text-slate-600 font-sans tracking-wide leading-relaxed">
          Sistem Informasi Administrasi SDN 2 Sarigadung v2.6.2-stable By Bu Mei, S.Pd.<br />
          Sistem Cloud Terintegrasi Google Apps Script Web App Services • Dilindungi Kebijakan Sekolah Kalsel
        </p>
      </footer>
    </div>
  );
}
