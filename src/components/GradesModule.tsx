import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StudentGrade } from '../types';
import { Award, Edit, Check, AlertTriangle, Sparkles, Filter, CloudLightning, Save, X, Search, ChevronRight } from 'lucide-react';

interface GradesModuleProps {
  students: Student[];
  grades: StudentGrade[];
  onSaveGrade: (grade: StudentGrade) => void;
  onPushGradesToCloud?: () => void;
  portal: 'guru' | 'admin';
  syncStatus: string;
}

export default function GradesModule({ students, grades, onSaveGrade, onPushGradesToCloud, portal, syncStatus }: GradesModuleProps) {
  const [selectedClass, setSelectedClass] = useState('IV A');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form scores state
  const [scores, setScores] = useState({
    agama: 80,
    pPancasila: 80,
    bIndonesia: 80,
    matematika: 80,
    sMusik: 80,
    bta: 80,
    sRupa: 80,
    pjok: 80,
    inggris: 80,
    bBanjar: 80
  });

  const classList = [
    'I A', 'I B', 'I C', 'I D',
    'II A', 'II B', 'II C', 'II D',
    'III A', 'III B', 'III C', 'III D',
    'IV A', 'IV B', 'IV C', 'IV D',
    'V A', 'V B', 'V C', 'V D',
    'VI A', 'VI B', 'VI C'
  ];
  
  // Filter students based on class & search query
  const studentsInClass = students.filter(s => s.kelas === selectedClass && 
    (s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery))
  );

  const studentsPerPage = 9;
  const totalStudents = studentsInClass.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (activePage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = studentsInClass.slice(startIndex, endIndex);

  const getStudentGrade = (nis: string, studentNama: string): StudentGrade => {
    const found = grades.find(g => g.studentNis === nis);
    if (found) return found;
    // Fallback default empty grade if student has no score record yet (Self-healing on the fly)
    return {
      studentNis: nis,
      studentNama: studentNama,
      kelas: selectedClass,
      nilai: {
        agama: 0, pPancasila: 0, bIndonesia: 0, matematika: 0, sMusik: 0, bta: 0, sRupa: 0, pjok: 0, inggris: 0, bBanjar: 0
      }
    };
  };

  const calculateAverage = (g: StudentGrade) => {
    const keys = Object.keys(g.nilai) as Array<keyof typeof g.nilai>;
    // Check if there are values filled, excluding 0 optionally or simple mean
    const sum = keys.reduce((acc, key) => acc + (g.nilai[key] || 0), 0);
    return Math.round((sum / keys.length) * 10) / 10;
  };

  const handleOpenEditModal = (student: Student) => {
    const activeGrade = getStudentGrade(student.nis, student.nama);
    setEditingGrade(activeGrade);
    setScores({ ...activeGrade.nilai });
    setIsModalOpen(true);
  };

  const handleScoreChange = (subject: keyof typeof scores, value: string) => {
    let num = Number(value);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    
    setScores(prev => ({
      ...prev,
      [subject]: num
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    const updatedGrade: StudentGrade = {
      ...editingGrade,
      nilai: { ...scores }
    };

    onSaveGrade(updatedGrade);
    setIsModalOpen(false);
  };

  return (
    <div id="grades-module" className="space-y-6 font-sans">
      
      {/* Top action controls bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Class Filter & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-1">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Pilih Kelas:</span>
            </span>
            <select
              id="grade-class-select-dropdown"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer min-w-[120px]"
            >
              {classList.map(cls => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="grade-search-input"
              type="text"
              placeholder="Cari siswa di kelas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white outline-none focus:border-blue-500 text-xs text-sans"
            />
          </div>
        </div>

        {/* Exclusive Push Button for Admin */}
        <div className="flex items-center gap-3">
          {portal === 'admin' ? (
            <button
              id="btn-push-grades-cloud"
              type="button"
              onClick={onPushGradesToCloud}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <CloudLightning className="w-4 h-4 animate-bounce" />
              <span>Kirim E-Raport ke Spreadsheet</span>
            </button>
          ) : (
            <div className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 py-2 px-3 border border-slate-100 dark:border-slate-900 rounded-xl">
              Mode Guru: Edit E-Raport tersimpan lokal. Hubungi Admin untuk ekspor ke spreadsheet.
            </div>
          )}
        </div>
      </div>

      {/* Main Grid showing school kids averages & subject counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedStudents.map(student => {
          const studentGrade = getStudentGrade(student.nis, student.nama);
          const avg = calculateAverage(studentGrade);
          
          // Count failing subjects (Score below 70)
          const fKeys = Object.keys(studentGrade.nilai) as Array<keyof typeof studentGrade.nilai>;
          const failingSubjects = fKeys.filter(k => (studentGrade.nilai[k] || 0) < 70 && (studentGrade.nilai[k] || 0) > 0);
          
          return (
            <div
              id={`grade-card-${student.nis}`}
              key={student.nis}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider">
                    NIS: {student.nis}
                  </span>
                  {failingSubjects.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-300/30">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{failingSubjects.length} Nilai &lt; 70</span>
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-4 leading-snug">
                  {student.nama}
                </h3>

                {/* Score Summary List */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-550 dark:text-slate-400 text-xs font-semibold mb-4 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-900/40">
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/50 pb-1">
                    <span className="text-[10px] text-slate-400">Agama</span>
                    <span className={`font-mono text-xs ${studentGrade.nilai.agama < 70 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-350'}`}>{studentGrade.nilai.agama || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/50 pb-1">
                    <span className="text-[10px] text-slate-400">Pancasila</span>
                    <span className={`font-mono text-xs ${studentGrade.nilai.pPancasila < 70 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-350'}`}>{studentGrade.nilai.pPancasila || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/50 pb-1">
                    <span className="text-[10px] text-slate-400">B. Indo</span>
                    <span className={`font-mono text-xs ${studentGrade.nilai.bIndonesia < 70 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-350'}`}>{studentGrade.nilai.bIndonesia || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/50 pb-1">
                    <span className="text-[10px] text-slate-400">MTK</span>
                    <span className={`font-mono text-xs ${studentGrade.nilai.matematika < 70 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-350'}`}>{studentGrade.nilai.matematika || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/50 pb-1">
                    <span className="text-[10px] text-slate-400">S. Musik</span>
                    <span className={`font-mono text-xs ${studentGrade.nilai.sMusik < 70 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-350'}`}>{studentGrade.nilai.sMusik || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/50 pb-1">
                    <span className="text-[10px] text-slate-400">BTA</span>
                    <span className={`font-mono text-xs ${studentGrade.nilai.bta < 70 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-350'}`}>{studentGrade.nilai.bta || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">S. Rupa</span>
                    <span className={`font-mono text-xs ${studentGrade.nilai.sRupa < 70 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-350'}`}>{studentGrade.nilai.sRupa || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">PJOK</span>
                    <span className={`font-mono text-xs ${studentGrade.nilai.pjok < 70 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-350'}`}>{studentGrade.nilai.pjok || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Average Indicator & Edit trigger */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] block text-slate-400 uppercase tracking-wider font-extrabold">Rata-rata</span>
                  <span className={`font-mono text-lg font-bold leading-none ${avg < 70 ? 'text-rose-500' : avg >= 85 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                    {avg || 'N/A'}
                  </span>
                </div>

                <button
                  id={`btn-open-grade-edit-${student.nis}`}
                  type="button"
                  onClick={() => handleOpenEditModal(student)}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-800 p-2 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-750 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-all flex items-center gap-1 active:scale-95 select-none"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Input Nilai</span>
                </button>
              </div>
            </div>
          );
        })}

        {studentsInClass.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs font-semibold">
            TIdak ada siswa terdaftar di Kelas {selectedClass}.
          </div>
        )}
      </div>

      {/* Tombol Geser / Pagination Slider */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm select-none">
          <div className="text-xs text-slate-550 dark:text-slate-400 font-semibold text-center sm:text-left">
            Menampilkan Murid <span className="font-extrabold text-blue-600 dark:text-blue-400">{startIndex + 1} - {Math.min(endIndex, totalStudents)}</span> dari <span className="font-extrabold text-slate-755 dark:text-white">{totalStudents}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              id="btn-grade-prev-page"
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
                        ? 'bg-blue-700 text-white border border-blue-800 shadow-xs' 
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 text-slate-655 dark:text-slate-350'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              id="btn-grade-next-page"
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

      {/* Inputs Editor Modal popup */}
      <AnimatePresence>
        {isModalOpen && editingGrade && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-xs font-sans"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                    Edit E-Raport (10 Mapel)
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Siswa: <span className="font-bold text-slate-600 dark:text-slate-300">{editingGrade.studentNama}</span> • Kelas {editingGrade.kelas} (NIS: {editingGrade.studentNis})
                  </p>
                </div>
                <button
                  id="btn-close-grade-modal"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Subject Inputs Grid mapping exact values */}
                  
                  {/* AGAMA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      1. Pendidikan Agama
                    </label>
                    <input
                      id="grade-input-agama"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.agama}
                      onChange={(e) => handleScoreChange('agama', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* PANCASILA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      2. Pendidikan Pancasila
                    </label>
                    <input
                      id="grade-input-ppancasila"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.pPancasila}
                      onChange={(e) => handleScoreChange('pPancasila', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* BAHASA INDONESIA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      3. Bahasa Indonesia
                    </label>
                    <input
                      id="grade-input-bindonesia"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.bIndonesia}
                      onChange={(e) => handleScoreChange('bIndonesia', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* MATEMATIKA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      4. Matematika
                    </label>
                    <input
                      id="grade-input-matematika"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.matematika}
                      onChange={(e) => handleScoreChange('matematika', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* SENI MUSIK */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      5. Seni Musik
                    </label>
                    <input
                      id="grade-input-smusik"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.sMusik}
                      onChange={(e) => handleScoreChange('sMusik', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* BTA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      6. Baca Tulis Al-Qur'an (BTA)
                    </label>
                    <input
                      id="grade-input-bta"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.bta}
                      onChange={(e) => handleScoreChange('bta', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* SENI RUPA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      7. Seni Rupa
                    </label>
                    <input
                      id="grade-input-srupa"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.sRupa}
                      onChange={(e) => handleScoreChange('sRupa', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* PJOK */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      8. Penjas Orkes (PJOK)
                    </label>
                    <input
                      id="grade-input-pjok"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.pjok}
                      onChange={(e) => handleScoreChange('pjok', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* BAHASA INGGRIS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      9. Bahasa Inggris
                    </label>
                    <input
                      id="grade-input-inggris"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.inggris}
                      onChange={(e) => handleScoreChange('inggris', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* BAHASA BANJAR */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      10. Bahasa Daerah (Banjar)
                    </label>
                    <input
                      id="grade-input-bbanjar"
                      type="number"
                      min="0"
                      max="100"
                      value={scores.bBanjar}
                      onChange={(e) => handleScoreChange('bBanjar', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    id="btn-cancel-grade-edit"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-save-grade-submit"
                    type="submit"
                    className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Nilai</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
