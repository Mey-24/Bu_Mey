import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RppRecord } from '../types';
import { BookOpen, Award, FileText, Check, Plus, Trash2, Search, Filter, ShieldAlert, Sparkles, X, Archive, BookOpenCheck } from 'lucide-react';

interface RppModuleProps {
  rppRecords: RppRecord[];
  onAddRpp: (record: RppRecord) => void;
  onDeleteRpp: (id: string) => void;
  activeTeacherName: string;
}

export default function RppModule({ rppRecords, onAddRpp, onDeleteRpp, activeTeacherName }: RppModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('Semua');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [judul, setJudul] = useState('');
  const [mapel, setMapel] = useState('Matematika');
  const [kelas, setKelas] = useState('IV A');
  const [materi, setMateri] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Arsip'>('Aktif');
  const [errorMsg, setErrorMsg] = useState('');

  const classList = [
    'Semua',
    'I A', 'I B', 'I C', 'I D',
    'II A', 'II B', 'II C', 'II D',
    'III A', 'III B', 'III C', 'III D',
    'IV A', 'IV B', 'IV C', 'IV D',
    'V A', 'V B', 'V C', 'V D',
    'VI A', 'VI B', 'VI C'
  ];
  const mapelOptions = ['Matematika', 'Bahasa Indonesia', 'Agama Islam', 'Pendidikan Pancasila', 'PJOK', 'Seni Musik', 'Seni Rupa', 'BTA', 'Bahasa Inggris', 'Bahasa Banjar'];

  const handleOpenForm = () => {
    setJudul('');
    setMapel('Matematika');
    setKelas('IV A');
    setMateri('');
    setDeskripsi('');
    setStatus('Aktif');
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!judul || !materi || !deskripsi) {
      setErrorMsg('Semua kolom (Judul, Materi, Deskripsi) wajib diisi.');
      return;
    }

    const payload: RppRecord = {
      id: `RPP-${Date.now()}`,
      judul,
      mapel,
      kelas,
      guruNama: activeTeacherName || 'Bu Mei, S.Pd.',
      materi,
      deskripsi,
      status
    };

    onAddRpp(payload);
    setIsFormOpen(false);
  };

  const filteredRecords = rppRecords.filter(item => {
    const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.materi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.mapel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassFilter === 'Semua' || item.kelas === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div id="rpp-module" className="space-y-6 font-sans">
      
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="rpp-search-input"
            type="text"
            placeholder="Cari RPP berdasarkan judul, Mapel, kompetensi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs"
          />
        </div>

        {/* Class Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1 shrink-0 font-sans">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Pilih Kelas:</span>
          </span>
          <select
            id="rpp-class-filter-dropdown"
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer min-w-[120px]"
          >
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                {cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}
              </option>
            ))}
          </select>
        </div>

        {/* Trigger Create */}
        <button
          id="btn-tambah-rpp-modal"
          type="button"
          onClick={handleOpenForm}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Modul Ajar / RPP baru</span>
        </button>
      </div>

      {/* RPP Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((item) => (
            <motion.div
              id={`rpp-item-${item.id}`}
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/20 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Meta Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-extrabold">
                      Kelas {item.kelas}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-950/60 px-2 py-0.5 rounded-md uppercase">
                      {item.mapel}
                    </span>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${
                    item.status === 'Aktif'
                      ? 'bg-emerald-50 border-emerald-200/40 text-emerald-600 dark:bg-emerald-950/15'
                      : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-950/20'
                  }`}>
                    {item.status === 'Aktif' ? (
                      <BookOpenCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                    <span>{item.status}</span>
                  </span>
                </div>

                {/* Judul & Guru */}
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.judul}
                  </h3>
                  <p className="text-[10px] text-slate-450 dark:text-slate-550 mt-1">
                    Penyusun: <span className="font-bold">{item.guruNama}</span>
                  </p>
                </div>

                {/* Materi Highlight */}
                <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-900/45">
                  <span className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-1.5">Inti Pembahasan</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{item.materi}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans line-clamp-3 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">ID: {item.id}</span>
                
                <button
                  id={`btn-delete-rpp-${item.id}`}
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus Modul Ajar / RPP ini?`)) {
                      onDeleteRpp(item.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors border border-transparent hover:border-rose-250/20"
                  title="Hapus Modul Ajar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRecords.length === 0 && (
          <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl col-span-full">
            <p className="text-slate-400 dark:text-slate-600 text-sm font-semibold">TIdak ada Modul Ajar / RPP yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* Dialog Form RPP (Add) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>Buat Modul Ajar / RPP Baru</span>
                </h3>
                <button
                  id="btn-close-rpp-modal"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
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
                {/* Judul RPP */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Judul Dokumen Modul Ajar / RPP</label>
                  <input
                    id="form-rpp-judul"
                    type="text"
                    placeholder="Contoh: Modul Ajar Seni Musik Kelas IV Bab I"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Mapel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Mata Pelajaran</label>
                    <select
                      id="form-rpp-mapel"
                      value={mapel}
                      onChange={(e) => setMapel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white"
                    >
                      {mapelOptions.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Kelas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kelas</label>
                    <select
                      id="form-rpp-kelas"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white font-semibold font-mono"
                    >
                      {classList.filter(cls => cls !== 'Semua').map((cls) => (
                        <option key={cls} value={cls}>Kelas {cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Materi Pembahasan */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Materi Pembahasan Pokok</label>
                  <input
                    id="form-rpp-materi"
                    type="text"
                    placeholder="Contoh: Interval nada, FPB harian"
                    value={materi}
                    onChange={(e) => setMateri(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Deskripsi Pembelajaran */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tujuan Pembelajaran & Kompetensi Dasar (Lengkap)</label>
                  <textarea
                    id="form-rpp-deskripsi"
                    rows={4}
                    placeholder="Tuliskan tujuan pokok, langkah-langkah kegiatan inti, media pembelajaran, asesmen formatif yang digunakan..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Status Aktif / Arsip */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Status Modul</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl w-48">
                    <button
                      id="form-rpp-status-aktif"
                      type="button"
                      onClick={() => setStatus('Aktif')}
                      className={`flex-1 py-1 px-3 text-xs font-bold rounded-lg transition-all ${
                        status === 'Aktif'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      id="form-rpp-status-arsip"
                      type="button"
                      onClick={() => setStatus('Arsip')}
                      className={`flex-1 py-1 px-3 text-xs font-bold rounded-lg transition-all ${
                        status === 'Arsip'
                          ? 'bg-slate-350 text-slate-800'
                          : 'text-slate-500'
                      }`}
                    >
                      Arsip
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
                  <button
                    id="btn-cancel-rpp"
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 font-bold text-slate-500"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-save-rpp"
                    type="submit"
                    className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Rancang Modul</span>
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
