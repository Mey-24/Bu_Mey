import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Teacher } from '../types';
import { Search, Plus, Edit2, Trash2, ShieldAlert, Check, X, Award, Briefcase } from 'lucide-react';

interface TeacherModuleProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  portal: 'guru' | 'admin';
}

export default function TeacherModule({ teachers, onAddTeacher, onEditTeacher, onDeleteTeacher, portal }: TeacherModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [mapel, setMapel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const filteredTeachers = teachers.filter(teacher => {
    return teacher.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
           teacher.nip.includes(searchQuery) ||
           (teacher.mapel && teacher.mapel.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleOpenAddForm = () => {
    setEditingTeacher(null);
    setId(`T${String(teachers.length + 1).padStart(3, '0')}`);
    setNama('');
    setNip('');
    setMapel('');
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setId(teacher.id);
    setNama(teacher.nama);
    setNip(teacher.nip);
    setMapel(teacher.mapel || '');
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!id || !nama || !nip) {
      setErrorMsg('Kolom ID, Nama, dan NIP wajib diisi.');
      return;
    }

    // Check unique ID
    if (!editingTeacher && teachers.some(t => t.id === id)) {
      setErrorMsg(`Guru dengan ID ${id} sudah terdaftar.`);
      return;
    }

    const payload: Teacher = { id, nama, nip, mapel, foto_url: '' };

    if (editingTeacher) {
      onEditTeacher(payload);
    } else {
      onAddTeacher(payload);
    }
    setIsFormOpen(false);
  };

  return (
    <div id="teacher-module" className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="teacher-search-input"
            type="text"
            placeholder="Cari guru berdasarkan nama, NIP, atau mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        {/* Action Button */}
        {portal === 'admin' ? (
          <button
            id="btn-tambah-guru-modal"
            type="button"
            onClick={handleOpenAddForm}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all shrink-0 font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>Guru/Pendidik Baru</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-900 flex items-center gap-1.5 self-start md:self-auto">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
            <span>Data Pendidik dikunci oleh Administrator</span>
          </div>
        )}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTeachers.map((teacher) => {
            // Generate elegant initial character avatar
            const initial = teacher.nama ? teacher.nama.replace(/^(Bu|Pak)\s+/i, '').charAt(0) : 'G';
            return (
              <motion.div
                id={`teacher-card-${teacher.id}`}
                key={teacher.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header Card */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Visual Initial Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-emerald-900 border border-emerald-950 flex items-center justify-center font-bold text-emerald-300 text-lg shadow-sm shrink-0">
                      {initial}
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {teacher.nama}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        ID: {teacher.id}
                      </p>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="space-y-2 mt-2 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-900/40">
                    <div className="text-xs">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">NIP</span>
                      <span className="font-mono font-medium text-slate-600 dark:text-slate-300">
                        {teacher.nip}
                      </span>
                    </div>

                    <div className="text-xs">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Tugas/Mapel Utama</span>
                      <span className="font-sans font-semibold text-slate-700 dark:text-slate-300">
                        {teacher.mapel || 'Guru Pengampu'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions (Only for Admin) */}
                {portal === 'admin' && (
                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                    <button
                      id={`btn-edit-teacher-${teacher.id}`}
                      type="button"
                      onClick={() => handleOpenEditForm(teacher)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors border border-transparent hover:border-blue-200/20"
                      title="Ubah Data Guru"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-delete-teacher-${teacher.id}`}
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus pendidik ${teacher.nama} (${teacher.nip}) dari basis data?`)) {
                          onDeleteTeacher(teacher.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-200/20"
                      title="Hapus Guru"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {filteredTeachers.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-slate-400 dark:text-slate-600 text-sm font-semibold">TIdak ada pendidik yang sesuai pencarian.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialog Form Guru (Add & Edit) */}
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
                <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <span>{editingTeacher ? 'Ubah Profil Pendidik' : 'Pendaftaran Pendidik Baru'}</span>
                </h3>
                <button
                  id="btn-close-teacher-modal"
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

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  {/* ID */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                      ID Pendidik (Kode)
                    </label>
                    <input
                      id="form-teacher-id"
                      type="text"
                      disabled={!!editingTeacher}
                      placeholder="Contoh: T006"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-100 font-mono"
                    />
                  </div>

                  {/* NIP */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                      NIP Pendidik
                    </label>
                    <input
                      id="form-teacher-nip"
                      type="text"
                      placeholder="Masukkan NIP harian..."
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Nama Pendidik */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                    Nama Lengkap & Gelar Akademik
                  </label>
                  <input
                    id="form-teacher-name"
                    type="text"
                    placeholder="Contoh: Bu Mei, S.Pd. atau Pak Ahmad, S.Pd."
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                {/* Mapel Utama */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                    Tugas Pengajaran atau Wali Kelas
                  </label>
                  <input
                    id="form-teacher-mapel"
                    type="text"
                    placeholder="Contoh: Wali Kelas IV / Guru PJOK"
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    id="btn-cancel-teacher"
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-save-teacher"
                    type="submit"
                    className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingTeacher ? 'Simpan Perubahan' : 'Daftarkan'}</span>
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
