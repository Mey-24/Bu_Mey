import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';
import { Search, Plus, Filter, Edit2, Trash2, Calendar, MapPin, User, Check, X, ShieldAlert, Award } from 'lucide-react';

interface StudentModuleProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (nis: string) => void;
  portal: 'guru' | 'admin';
}

export default function StudentModule({ students, onAddStudent, onEditStudent, onDeleteStudent, portal }: StudentModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [tempat, setTempat] = useState('');
  const [tgl, setTgl] = useState('');
  const [kelas, setKelas] = useState('IV A');
  const [jk, setJk] = useState('Laki-laki');
  const [errorMsg, setErrorMsg] = useState('');

  const classOptions = [
    'Semua',
    'I A', 'I B', 'I C', 'I D',
    'II A', 'II B', 'II C', 'II D',
    'III A', 'III B', 'III C', 'III D',
    'IV A', 'IV B', 'IV C', 'IV D',
    'V A', 'V B', 'V C', 'V D',
    'VI A', 'VI B', 'VI C'
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.nis.includes(searchQuery);
    const matchesClass = selectedClass === 'Semua' || student.kelas === selectedClass;
    return matchesSearch && matchesClass;
  });

  const studentsPerPage = 9;
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  
  // Safe bounded check
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (activePage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const handleOpenAddForm = () => {
    setEditingStudent(null);
    setNis('');
    setNama('');
    setTempat('Tanah Bumbu');
    setTgl('2016-01-01');
    setKelas('IV A');
    setJk('Laki-laki');
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (student: Student) => {
    setEditingStudent(student);
    setNis(student.nis);
    setNama(student.nama);
    setTempat(student.tempat);
    setTgl(student.tgl);
    setKelas(student.kelas);
    setJk(student.jk);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nis || !nama || !tempat || !tgl || !kelas || !jk) {
      setErrorMsg('Semua kolom wajib diisi harian.');
      return;
    }

    // Check unique NIS in adding mode
    if (!editingStudent && students.some(s => s.nis === nis)) {
      setErrorMsg(`Siswa dengan NIS ${nis} sudah terdaftar.`);
      return;
    }

    const payload: Student = { nis, nama, tempat, tgl, kelas, jk };

    if (editingStudent) {
      onEditStudent(payload);
    } else {
      onAddStudent(payload);
    }
    setIsFormOpen(false);
  };

  return (
    <div id="student-module" className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="student-search-input"
            type="text"
            placeholder="Cari nama siswa atau NIS..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Pilih Kelas:</span>
          </span>
          <select
            id="student-class-filter-dropdown"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer min-w-[120px] font-mono"
          >
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        {portal === 'admin' ? (
          <button
            id="btn-tambah-siswa-modal"
            type="button"
            onClick={handleOpenAddForm}
            className="bg-emerald-900 border border-emerald-950 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Siswa Baru</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-900 flex items-center gap-1.5 self-start md:self-auto">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Tambah/Edit Siswa dikunci (Hubungi Admin)</span>
          </div>
        )}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {paginatedStudents.map((student) => (
            <motion.div
              id={`student-card-${student.nis}`}
              key={student.nis}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Information */}
                <div className="flex justify-between items-start mb-3">
                  <div className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold font-mono border border-emerald-100/30">
                    Kelas {student.kelas}
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400 tracking-wider">
                    NIS: {student.nis}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base mb-3 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {student.nama}
                </h3>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.jk}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{student.tempat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.tgl}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions (Only for Admin) */}
              {portal === 'admin' && (
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    id={`btn-edit-student-${student.nis}`}
                    type="button"
                    onClick={() => handleOpenEditForm(student)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors border border-transparent hover:border-emerald-200/20"
                    title="Ubah Data Siswa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-student-${student.nis}`}
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus siswa ${student.nama} (${student.nis}) dari basis data?`)) {
                        onDeleteStudent(student.nis);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-200/20"
                    title="Hapus Siswa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredStudents.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="text-slate-400 dark:text-slate-600 text-sm font-semibold">TIdak ada siswa yang sesuai pencarian.</p>
          </div>
        )}
      </div>

      {/* Tombol Geser / Pagination Slider */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm select-none">
          <div className="text-xs text-slate-550 dark:text-slate-400 font-semibold text-center sm:text-left">
            Menampilkan Murid <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{startIndex + 1} - {Math.min(endIndex, totalStudents)}</span> dari <span className="font-extrabold text-slate-755 dark:text-white">{totalStudents}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              id="btn-student-prev-page"
              type="button"
              disabled={activePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-950/40 text-slate-705 dark:text-slate-300 rounded-xl text-xs font-bold transition border border-slate-200/50 dark:border-slate-800 flex items-center gap-1 disabled:cursor-not-allowed"
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
                        ? 'bg-emerald-900 text-white border border-emerald-950 shadow-xs' 
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 text-slate-650 dark:text-slate-350'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              id="btn-student-next-page"
              type="button"
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-950/40 text-slate-705 dark:text-slate-300 rounded-xl text-xs font-bold transition border border-slate-200/50 dark:border-slate-800 flex items-center gap-1 disabled:cursor-not-allowed"
            >
              <span className="hidden xs:inline">Selanjutnya</span> &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Dialog Form Siswa (Add & Edit) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <span>{editingStudent ? 'Edit Profil Siswa' : 'Tambah Siswa Baru'}</span>
                </h3>
                <button
                  id="btn-close-student-modal"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/55 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* NIS */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                      NIS (Nomor Induk Siswa)
                    </label>
                    <input
                      id="form-student-nis"
                      type="text"
                      pattern="[0-9]+"
                      disabled={!!editingStudent}
                      placeholder="Contoh: 4009"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-emerald-500 disabled:opacity-50 disabled:bg-slate-100 font-mono"
                    />
                  </div>

                  {/* Kelas */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                      Kelas
                    </label>
                    <select
                      id="form-student-kelas"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-emerald-500 font-semibold font-mono"
                    >
                      {classOptions.filter(cls => cls !== 'Semua').map((cls) => (
                        <option key={cls} value={cls}>Kelas {cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                    Nama Lengkap Siswa
                  </label>
                  <input
                    id="form-student-name"
                    type="text"
                    placeholder="Masukkan nama lengkap..."
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        id="form-student-jk-l"
                        type="radio"
                        name="jk"
                        checked={jk === 'Laki-laki'}
                        onChange={() => setJk('Laki-laki')}
                        className="accent-emerald-600"
                      />
                      <span>Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        id="form-student-jk-p"
                        type="radio"
                        name="jk"
                        checked={jk === 'Perempuan'}
                        onChange={() => setJk('Perempuan')}
                        className="accent-emerald-600"
                      />
                      <span>Perempuan</span>
                    </label>
                  </div>
                </div>

                {/* Tempat & Tanggal Lahir */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                      Tempat Lahir
                    </label>
                    <input
                      id="form-student-tempat"
                      type="text"
                      placeholder="Contoh: Tanah Bumbu"
                      value={tempat}
                      onChange={(e) => setTempat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      id="form-student-tgl"
                      type="date"
                      value={tgl}
                      onChange={(e) => setTgl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    id="btn-cancel-student"
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-save-student"
                    type="submit"
                    className="bg-emerald-900 hover:bg-emerald-800 border border-emerald-950 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingStudent ? 'Simpan' : 'Tambah'}</span>
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
