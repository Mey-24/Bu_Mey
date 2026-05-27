import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, AttendanceRecord } from '../types';
import { Calendar, Users, HelpCircle, Save, CheckCircle2, ChevronRight, FileText, Sparkles } from 'lucide-react';

interface AttendanceModuleProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}

export default function AttendanceModule({ students, attendanceRecords, onSaveAttendance }: AttendanceModuleProps) {
  const [selectedClass, setSelectedClass] = useState('IV A');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [currentPage, setCurrentPage] = useState(1);

  // State to manage the active attendance session
  const [tempRecords, setTempRecords] = useState<{
    [studentNis: string]: {
      status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
      keterangan: string;
    }
  }>({});

  const [notif, setNotif] = useState('');

  const classList = [
    'I A', 'I B', 'I C', 'I D',
    'II A', 'II B', 'II C', 'II D',
    'III A', 'III B', 'III C', 'III D',
    'IV A', 'IV B', 'IV C', 'IV D',
    'V A', 'V B', 'V C', 'V D',
    'VI A', 'VI B', 'VI C'
  ];
  const studentsInClass = students.filter(s => s.kelas === selectedClass);

  const studentsPerPage = 9;
  const totalStudents = studentsInClass.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (activePage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = studentsInClass.slice(startIndex, endIndex);

  // When class or date changes, load existing records if any, or default all to 'Hadir'
  useEffect(() => {
    const classNises = studentsInClass.map(s => s.nis);
    const existing = attendanceRecords.filter(r => r.date === selectedDate && r.kelas === selectedClass);
    
    const initialSession: typeof tempRecords = {};
    
    studentsInClass.forEach(student => {
      const match = existing.find(e => e.studentNis === student.nis);
      initialSession[student.nis] = {
        status: match ? match.status : 'Hadir',
        keterangan: match?.keterangan || ''
      };
    });

    setTempRecords(initialSession);
  }, [selectedClass, selectedDate, attendanceRecords, students.length]);

  const handleStatusChange = (nis: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa') => {
    setTempRecords(prev => ({
      ...prev,
      [nis]: {
        ...prev[nis],
        status
      }
    }));
  };

  const handleKeteranganChange = (nis: string, keterangan: string) => {
    setTempRecords(prev => ({
      ...prev,
      [nis]: {
        ...prev[nis],
        keterangan
      }
    }));
  };

  const markAllAsHadir = () => {
    const updated = { ...tempRecords };
    studentsInClass.forEach(s => {
      if (updated[s.nis]) {
        updated[s.nis].status = 'Hadir';
      }
    });
    setTempRecords(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalizedRecords: AttendanceRecord[] = studentsInClass.map(s => {
      const sess = tempRecords[s.nis] || { status: 'Hadir', keterangan: '' };
      return {
        id: `ATT-${selectedDate}-${selectedClass}-${s.nis}`,
        date: selectedDate,
        kelas: selectedClass,
        studentNis: s.nis,
        studentNama: s.nama,
        status: sess.status,
        keterangan: sess.keterangan || undefined
      };
    });

    onSaveAttendance(finalizedRecords);
    setNotif('Presensi harian berhasil disimpan secara lokal!');
    setTimeout(() => setNotif(''), 3000);
  };

  // Compile statistics
  const stats = (Object.values(tempRecords) as Array<{ status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'; keterangan: string }>).reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 } as Record<'Hadir' | 'Sakit' | 'Izin' | 'Alpa', number>);

  const total = studentsInClass.length;
  const presencePercentage = total > 0 ? Math.round((stats.Hadir / total) * 100) : 0;

  return (
    <div id="attendance-module" className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-sans">
      
      {/* Parameters & Statistics panel (Left sidebar in desktop) */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Setup Config Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <span>Konfigurasi Kelas & Tanggal</span>
          </h3>

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Tanggal Presensi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="attendance-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Class selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Pilih Kelas</label>
            <select
              id="attendance-class-select-dropdown"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              {classList.map(cls => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Realtime Statistics Indicator Widget */}
        {total > 0 && (
          <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-sm border border-emerald-950 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Rasio Kehadiran</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-emerald-500/20 rounded-lg text-emerald-300">
                {stats.Hadir} dari {total} Murid
              </span>
            </div>

            <div className="py-2 flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight">{presencePercentage}%</span>
              <span className="text-xs opacity-70">hadir hari ini</span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-emerald-950/60 dark:bg-slate-950/60 rounded-full h-2">
              <div 
                className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${presencePercentage}%` }}
              />
            </div>

            {/* Quick counters */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] font-semibold text-emerald-100">
              <div className="bg-emerald-800/20 dark:bg-emerald-800/10 p-2 rounded-xl">
                <span className="block text-emerald-300 font-bold text-sm leading-none mb-1">{stats.Hadir}</span>
                Hadir
              </div>
              <div className="bg-amber-800/20 dark:bg-amber-800/10 p-2 rounded-xl">
                <span className="block text-amber-300 font-bold text-sm leading-none mb-1">{stats.Sakit}</span>
                Sakit
              </div>
              <div className="bg-orange-850/20 dark:bg-orange-850/10 p-2 rounded-xl">
                <span className="block text-orange-300 font-bold text-sm leading-none mb-1">{stats.Izin}</span>
                Izin
              </div>
              <div className="bg-rose-800/20 dark:bg-rose-800/10 p-2 rounded-xl">
                <span className="block text-rose-300 font-bold text-sm leading-none mb-1">{stats.Alpa}</span>
                Alpa
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Student Register list */}
      <div className="xl:col-span-2 space-y-4">
        {studentsInClass.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Siswa</h4>
            <p className="text-xs text-slate-400">Silakan tambahkan data murid Kelas {selectedClass} terlebih dahulu melalui portal Admin.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Action Bar */}
            <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md px-5 py-3 rounded-2.5xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Daftar Presensi Kelas {selectedClass}</span>
                <span className="text-slate-400 block sm:inline sm:ml-2">({total} Siswa terdaftar)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  id="btn-mark-all-hadir"
                  type="button"
                  onClick={markAllAsHadir}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold select-none"
                >
                  Set Semua Hadir
                </button>
                <button
                  id="btn-save-attendance-submit"
                  type="submit"
                  className="px-4 py-1.8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Presensi</span>
                </button>
              </div>
            </div>

            {/* Notification alert */}
            <AnimatePresence>
              {notif && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-950/50 rounded-2xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{notif}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Students List */}
            <div className="space-y-2 bg-slate-100/40 dark:bg-slate-950/10 p-2 rounded-3xl border border-slate-100 dark:border-slate-900 flex flex-col">
              {paginatedStudents.map((student, pIdx) => {
                const idx = startIndex + pIdx;
                const sessionInfo = tempRecords[student.nis] || { status: 'Hadir', keterangan: '' };
                
                return (
                  <div
                    id={`attendance-row-${student.nis}`}
                    key={student.nis}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Student details */}
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 font-mono">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">
                          {student.nama}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                          <span>NIS: {student.nis}</span>
                          <span>•</span>
                          <span className="font-sans font-medium">{student.jk}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Button Pills & input notes */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 md:justify-end">
                      
                      {/* Attendance Pills Selection */}
                      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/20">
                        {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as const).map(st => {
                          const active = sessionInfo.status === st;
                          let btnStyle = '';
                          
                          if (active) {
                            if (st === 'Hadir') btnStyle = 'bg-emerald-600 text-white';
                            if (st === 'Sakit') btnStyle = 'bg-amber-500 text-slate-900';
                            if (st === 'Izin') btnStyle = 'bg-orange-500 text-white';
                            if (st === 'Alpa') btnStyle = 'bg-rose-600 text-white';
                          } else {
                            btnStyle = 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50';
                          }
                          
                          return (
                            <button
                              id={`btn-mark-${student.nis}-${st.toLowerCase()}`}
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(student.nis, st)}
                              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${btnStyle}`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>

                      {/* Optional Notes Input (especially useful for Sick/Permit/Alpha status!) */}
                      <div className="relative flex-1 max-w-sm">
                        <input
                          id={`input-note-${student.nis}`}
                          type="text"
                          placeholder="Keterangan singkat..."
                          value={sessionInfo.keterangan}
                          onChange={(e) => handleKeteranganChange(student.nis, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tombol Geser / Pagination Slider */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-3 select-none">
                <div className="text-xs text-slate-550 dark:text-slate-400 font-semibold text-center sm:text-left">
                  Menampilkan Murid <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{startIndex + 1} - {Math.min(endIndex, totalStudents)}</span> dari <span className="font-extrabold text-slate-755 dark:text-white">{totalStudents}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    id="btn-attendance-prev-page"
                    type="button"
                    disabled={activePage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-950/40 text-slate-705 dark:text-slate-300 rounded-xl text-xs font-bold transition border border-slate-200/50 dark:border-slate-800 flex items-center gap-1 disabled:cursor-not-allowed text-nowrap"
                  >
                    &larr; <span className="hidden xs:inline">Sebelumnya</span>
                  </button>
                  
                  <div className="flex items-center gap-1 font-mono text-xs font-bold">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === activePage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl transition ${
                            isActive 
                              ? 'bg-emerald-950 text-white border border-emerald-950 shadow-xs' 
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 text-slate-655 dark:text-slate-350'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    id="btn-attendance-next-page"
                    type="button"
                    disabled={activePage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-950/40 text-slate-705 dark:text-slate-300 rounded-xl text-xs font-bold transition border border-slate-200/50 dark:border-slate-800 flex items-center gap-1 disabled:cursor-not-allowed text-nowrap"
                  >
                    <span className="hidden xs:inline">Selanjutnya</span> &rarr;
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>

    </div>
  );
}
