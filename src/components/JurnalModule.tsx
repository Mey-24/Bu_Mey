import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JurnalRecord } from '../types';
import { BookOpen, Calendar, FileText, Check, Plus, Trash2, Search, Edit2, ShieldAlert, Sparkles, X, Filter } from 'lucide-react';

interface JurnalModuleProps {
  jurnalRecords: JurnalRecord[];
  onAddJurnal: (record: JurnalRecord) => void;
  onDeleteJurnal: (id: string) => void;
  activeTeacherName: string;
}

export default function JurnalModule({ jurnalRecords, onAddJurnal, onDeleteJurnal, activeTeacherName }: JurnalModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('Semua');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [kelas, setKelas] = useState('IV A');
  const [materi, setMateri] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [status, setStatus] = useState<'Tercatat' | 'Draf'>('Tercatat');
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

  const handleOpenForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setKelas('IV A');
    setMateri('');
    setDeskripsi('');
    setStatus('Tercatat');
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!materi || !deskripsi) {
      setErrorMsg('Materi harian dan deskripsi aktivitas wajib diisi.');
      return;
    }

    const payload: JurnalRecord = {
      id: `JUR-${Date.now()}`,
      date,
      kelas,
      guruNama: activeTeacherName || 'Bu Mei, S.Pd.',
      materi,
      deskripsi,
      status
    };

    onAddJurnal(payload);
    setIsFormOpen(false);
  };

  const filteredRecords = jurnalRecords.filter(item => {
    const matchesSearch = item.materi.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.guruNama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassFilter === 'Semua' || item.kelas === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div id="jurnal-module" className="space-y-6 font-sans">
      
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="jurnal-search-input"
            type="text"
            placeholder="Cari materi, deskripsi jurnal harian, nama guru..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-xs"
          />
        </div>

        {/* Class Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1 shrink-0 font-sans">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Pilih Kelas:</span>
          </span>
          <select
            id="jurnal-class-filter-dropdown"
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer min-w-[120px]"
          >
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                {cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}
              </option>
            ))}
          </select>
        </div>

        {/* Trigger Create Form */}
        <button
          id="btn-tambah-jurnal-modal"
          type="button"
          onClick={handleOpenForm}
          className="bg-emerald-900 border border-emerald-950 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jurnal</span>
        </button>
      </div>

      {/* Chronological List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((item) => (
            <motion.div
              id={`jurnal-item-${item.id}`}
              key={item.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-3 flex-1">
                {/* Meta details header row */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold font-mono">
                    Kelas {item.kelas}
                  </div>
                  
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </span>

                  <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold">• Diisi oleh: {item.guruNama}</span>
                  
                  {/* Status Indicator */}
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ml-auto md:ml-0 ${
                    item.status === 'Tercatat'
                      ? 'bg-emerald-50 border-emerald-200/40 text-emerald-600 dark:bg-emerald-950/20'
                      : 'bg-amber-50 border-amber-200/40 text-amber-600 dark:bg-amber-950/20'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Subject Topic Title */}
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base leading-tight">
                  Materi: {item.materi}
                </h3>

                {/* Long description text block */}
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-sans mt-1">
                  {item.deskripsi}
                </p>
              </div>

              {/* Actions segment */}
              <div className="flex md:flex-col items-center justify-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4 shrink-0">
                <button
                  id={`btn-delete-jurnal-${item.id}`}
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus catatan jurnal pembelajaran ini?`)) {
                      onDeleteJurnal(item.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/15 rounded-lg transition-colors border border-transparent hover:border-rose-200/20 ml-auto md:ml-0"
                  title="Hapus Catatan Jurnal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRecords.length === 0 && (
          <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <p className="text-slate-400 dark:text-slate-600 text-sm font-semibold">TIdak ada catatan jurnal yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* Dialog Form Form Jurnal (Add) */}
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
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  <span>Catat Jurnal Mengajar Baru</span>
                </h3>
                <button
                  id="btn-close-jurnal-modal"
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
                <div className="grid grid-cols-2 gap-4">
                  {/* Date selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                    <input
                      id="form-jurnal-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Class assignment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kelas</label>
                    <select
                      id="form-jurnal-kelas"
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

                {/* Materi Pokok */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Materi Pokok / Bahasan</label>
                  <input
                    id="form-jurnal-materi"
                    type="text"
                    placeholder="Contoh: Perkalian bersusun, Puisi Rakyat"
                    value={materi}
                    onChange={(e) => setMateri(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Deskripsi Aktivitas */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi & Catatan Kegiatan Kelas</label>
                  <textarea
                    id="form-jurnal-deskripsi"
                    rows={4}
                    placeholder="Tulis jalannya pembelajaran, ketuntasan materi, respons siswa, hambatan..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Status Toggle Draft / Publish */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Status Jurnal</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl w-48">
                    <button
                      id="form-jurnal-status-tercatat"
                      type="button"
                      onClick={() => setStatus('Tercatat')}
                      className={`flex-1 py-1 px-3 text-xs font-bold rounded-lg transition-all ${
                        status === 'Tercatat'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      Tercatat
                    </button>
                    <button
                      id="form-jurnal-status-draf"
                      type="button"
                      onClick={() => setStatus('Draf')}
                      className={`flex-1 py-1 px-3 text-xs font-bold rounded-lg transition-all ${
                        status === 'Draf'
                          ? 'bg-amber-500 text-slate-750'
                          : 'text-slate-500'
                      }`}
                    >
                      Draf
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
                  <button
                    id="btn-cancel-jurnal"
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 font-bold text-slate-500"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-save-jurnal"
                    type="submit"
                    className="bg-emerald-900 hover:bg-emerald-800 border border-emerald-950 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Catat Jurnal</span>
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
