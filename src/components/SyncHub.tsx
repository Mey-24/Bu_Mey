import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GAS_CODE_TEMPLATE } from '../data';
import { Cloud, ArrowDownCircle, ArrowUpCircle, Info, Copy, Check, Settings, AlertTriangle, ShieldCheck, Loader2, PlayCircle, ToggleLeft, ToggleRight, Sparkles, Link2 } from 'lucide-react';

interface SyncHubProps {
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
  onPullData: (isSimulation: boolean) => Promise<any>;
  onPushData: (isSimulation: boolean) => Promise<any>;
  lastSynced: string;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  autoSyncOnStartup: boolean;
  setAutoSyncOnStartup: (val: boolean) => void;
}

export default function SyncHub({ 
  gasUrl, 
  onSaveGasUrl, 
  onPullData, 
  onPushData, 
  lastSynced,
  isSimulating,
  setIsSimulating,
  autoSyncOnStartup,
  setAutoSyncOnStartup
}: SyncHubProps) {
  const [urlInput, setUrlInput] = useState(gasUrl);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'pull' | 'push' | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GAS_CODE_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const saveUrl = () => {
    onSaveGasUrl(urlInput);
    setSyncStatus({
      type: 'success',
      msg: 'Tautan Google Apps Script berhasil disimpan secara lokal!'
    });
    setTimeout(() => setSyncStatus({ type: '', msg: '' }), 3000);
  };

  const triggerPull = async () => {
    setSyncDirection('pull');
    setSyncLoading(true);
    setSyncStatus({ type: '', msg: '' });

    try {
      const res = await onPullData(isSimulating);
      setSyncStatus({
        type: 'success',
        msg: isSimulating 
          ? 'SIMULASI SUKSES: Data murid & guru berhasil di-Pull dari Google Sheets kustom!' 
          : 'SINKRONISASI SUKSES: Seluruh data lokal mutakhir di-update dari Google Sheets!'
      });
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        msg: `Sinkronisasi gagal: ${err.message || 'Periksa koneksi internet atau validitas Web App URL.'}`
      });
    } finally {
      setSyncLoading(false);
      setSyncDirection(null);
    }
  };

  const triggerPush = async () => {
    setSyncDirection('push');
    setSyncLoading(true);
    setSyncStatus({ type: '', msg: '' });

    try {
      await onPushData(isSimulating);
      setSyncStatus({
        type: 'success',
        msg: isSimulating 
          ? 'SIMULASI SUKSES: Presensi, RPP, Jurnal & E-Raport dikirim ke Sheet!' 
          : 'SINKRONISASI SUKSES: Seluruh lembar pencatatan berhasil dilebur (merge) ke Google Sheets!'
      });
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        msg: `Sinkronisasi gagal: ${err.message || 'Periksa koneksi internet atau validitas Web App URL.'}`
      });
    } finally {
      setSyncLoading(false);
      setSyncDirection(null);
    }
  };

  return (
    <div id="sync-hub" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Cloud Service Panel */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Connection status card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              <span>Koneksi Spreadsheet</span>
            </h3>

            {/* Simulated vs Real pill indicator */}
            <button
              id="btn-toggle-simulator"
              type="button"
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-extrabold border transition-all ${
                isSimulating
                  ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
              }`}
            >
              <span>{isSimulating ? 'Mode Simulasi' : 'Koneksi Asli (LIVE)'}</span>
              {isSimulating ? <ToggleRight className="w-4 h-4 text-amber-500" /> : <ToggleLeft className="w-4 h-4 text-emerald-500" />}
            </button>
          </div>

          {/* Web App URL Form input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Google Web App Deployment URL
            </label>
            <textarea
              id="sync-gas-url-input"
              rows={3}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl font-mono border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-white outline-none focus:border-blue-500"
            />
            <button
              id="btn-sync-save-url"
              type="button"
              onClick={saveUrl}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Simpan Tautan
            </button>
          </div>

          <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

          {/* Connected indicators */}
          <div className="space-y-3 text-xs">
            {/* Auto-Sync startup option */}
            <div className="flex justify-between items-center py-1">
              <div className="flex flex-col text-left pr-2">
                <span className="text-[11px] font-bold text-slate-705 dark:text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  Auto-Sync Buka Web
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight">
                  Tarik database terbaru otomatis saat portal dibuka di HP/Device lain
                </span>
              </div>
              <button
                id="btn-toggle-auto-sync"
                type="button"
                onClick={() => setAutoSyncOnStartup(!autoSyncOnStartup)}
                disabled={isSimulating}
                className="focus:outline-none transition-all duration-250 shrink-0"
                style={{ opacity: isSimulating ? 0.35 : 1, cursor: isSimulating ? 'not-allowed' : 'pointer' }}
                title={isSimulating ? "Aktifkan Mode LIVE untuk mengaktifkan sinkronisasi otomatis" : "Aktifkan Auto-Sync Beralih"}
              >
                {autoSyncOnStartup && !isSimulating ? (
                  <ToggleRight className="w-8 h-8 text-emerald-500 transition-colors" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400 dark:text-slate-650 transition-colors" />
                )}
              </button>
            </div>

            <div className="h-[1px] bg-slate-150/60 dark:bg-slate-800/40" />

            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-400">Status Server</span>
              {isSimulating ? (
                <span className="text-amber-600 font-bold flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-amber-500" />
                  Simulated Local
                </span>
              ) : gasUrl ? (
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Koneksi LIVE Aktif
                </span>
              ) : (
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                  Belum Digabungkan
                </span>
              )}
            </div>

            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-400">Sinkronisasi Terakhir</span>
              <span className="font-mono text-slate-700 dark:text-slate-350">{lastSynced || 'Bulan ini belum pernah'}</span>
            </div>
          </div>
        </div>

        {/* Sync Actions Card */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-md text-white space-y-5">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-extrabold">Operasi Sinkronisasi Cloud</h3>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Gunakan fungsionalitas di bawah untuk menarik daftar murid/guru terpusat, atau mengunggah nilai E-Raport & Presensi ke server Google Sheets.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Pull Data action */}
            <button
              id="btn-sync-pull"
              type="button"
              onClick={triggerPull}
              disabled={syncLoading || (!isSimulating && !gasUrl)}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 font-bold group select-none ${
                syncLoading
                  ? 'bg-slate-800/20 border-slate-800 text-slate-500'
                  : (!isSimulating && !gasUrl)
                    ? 'bg-slate-800/10 border-slate-800/40 text-slate-600 cursor-not-allowed font-medium'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-750 text-white'
              }`}
            >
              {syncLoading && syncDirection === 'pull' ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              ) : (
                <ArrowDownCircle className="w-6 h-6 text-sky-400 group-hover:scale-105 transition-transform" />
              )}
              <span className="text-xs">Pull Data</span>
              <span className="text-[9px] text-slate-450 font-semibold">Tarik Dari Google Sheet</span>
            </button>

            {/* Push Data action */}
            <button
              id="btn-sync-push"
              type="button"
              onClick={triggerPush}
              disabled={syncLoading || (!isSimulating && !gasUrl)}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 font-bold group select-none ${
                syncLoading
                  ? 'bg-slate-800/20 border-slate-800 text-slate-500'
                  : (!isSimulating && !gasUrl)
                    ? 'bg-slate-800/10 border-slate-800/40 text-slate-600 cursor-not-allowed font-medium'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-750 text-white'
              }`}
            >
              {syncLoading && syncDirection === 'push' ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              ) : (
                <ArrowUpCircle className="w-6 h-6 text-emerald-400 group-hover:scale-105 transition-transform" />
              )}
              <span className="text-xs">Push Data</span>
              <span className="text-[9px] text-slate-450 font-semibold">Kirim Dari Cache Lokal</span>
            </button>
          </div>

          {/* Sync logging outputs */}
          <AnimatePresence mode="popLayout font-sans text-xs">
            {syncStatus.msg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-3.5 rounded-2xl border flex items-start gap-2 text-xs font-semibold ${
                  syncStatus.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-900 text-rose-400'
                }`}
              >
                {syncStatus.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />}
                <span>{syncStatus.msg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Link Berbagi Multi-Device Card */}
        {!isSimulating && gasUrl && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4 text-left">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-500" />
              <span>Link Integrasi HP & perangkat lain</span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Buka atau bagikan tautan khusus ini melalui WhatsApp agar HP/perangkat lain terkonfigurasi secara otomatis menggunakan database Google Spreadsheet saat ini tanpa perlu memasukkan tautan manual:
            </p>
            <div className="flex gap-2">
              <input
                id="share-link-input"
                type="text"
                readOnly
                value={`${window.location.origin}${window.location.pathname}?gasUrl=${encodeURIComponent(gasUrl)}&sim=false`}
                className="flex-1 px-3 py-2 text-[10px] font-mono rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-805 text-slate-500 dark:text-slate-350 truncate outline-none"
              />
              <button
                id="btn-copy-sharing-link"
                type="button"
                onClick={async () => {
                  try {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?gasUrl=${encodeURIComponent(gasUrl)}&sim=false`;
                    await navigator.clipboard.writeText(shareUrl);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  } catch (err) {
                    console.error("Gagal menyalin tautan", err);
                  }
                }}
                className={`p-2 rounded-xl text-xs font-bold text-white transition-all select-none flex items-center justify-center shrink-0 w-10 h-8 ${
                  linkCopied ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title="Salin Tautan Berbagi"
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold leading-tight font-sans">
              💡 Tips: Bagikan link ini, lalu buka di browser smartphone Anda. Portal akan otomatis di-link ke Google Spreadsheet dan auto-sync database terbaru saat dibuka!
            </p>
          </div>
        )}

      </div>

      {/* Deployment & Guide Panel (Right details) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Step by Step Guide Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 font-sans text-xs">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            Panduan Deploy Sinkronisasi Google Sheets
          </h3>

          <div className="space-y-3.5 text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-350 rounded-full flex items-center justify-center shrink-0">1</div>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Buat Spreadsheet Baru</strong>: Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Sheets Baru</a> di akun Google Anda. Beri nama spreadsheet Anda.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-350 rounded-full flex items-center justify-center shrink-0">2</div>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Buka Apps Script Editor</strong>: Dari menu atas Spreadsheet kustom Anda, pilih <strong className="font-semibold text-slate-700 dark:text-slate-300">Ekstensi &gt; Apps Script</strong>.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-350 rounded-full flex items-center justify-center shrink-0">3</div>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Salin & Tempel Kode</strong>: Bersihkan editor kode Apps Script Anda, salin seluruh blok kode `Code.gs` di panel samping kanan, lalu tempelkan. Simpan proyek dengan klik ikon disket.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-350 rounded-full flex items-center justify-center shrink-0">4</div>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Deploy sebagai Web App</strong>:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Klik tombol <strong className="font-bold text-slate-700 dark:text-slate-300">Terapkan unsur baru &gt; Penerapan Baru</strong> (Deploy &gt; New Deployment).</li>
                  <li>Pilih jenis <strong className="font-bold">Aplikasi Web</strong> (Web App).</li>
                  <li>Ubah kolom <strong className="font-bold">Who has access</strong> (Siapa yang memiliki akses) menjadi <strong className="text-emerald-600 font-bold">Anyone</strong> (Semua Orang/Siapa saja, termasuk akun anonim). Kolom 'Execute as' biarkan akun Anda.</li>
                  <li>Klik Terapkan / Deploy. Izinkan akses Google ketika diminta persetujuan harian.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-350 rounded-full flex items-center justify-center shrink-0">5</div>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Salin URL ke Aplikasi Guru</strong>: Copy <strong className="text-blue-600 font-bold">Web App URL</strong> yang dihasilkan (biasanya berakhiran `/exec`), lalu tempel di kolom input sebelah kiri dan klik save. Selesai! Anda siap melakukan Pull dan Push data asli.
              </div>
            </div>
          </div>
        </div>

        {/* Copyable code wrapper block */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl text-white space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-slate-850 p-2 rounded-xl">
            <span className="text-sky-400 font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-400" />
              Code.gs • Google Apps Script Source
            </span>
            <button
              id="btn-sync-copy-code"
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[10px] font-bold px-3 py-1 bg-slate-800 hover:bg-slate-750 rounded-lg text-slate-300 hover:text-white transition-all select-none"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          <div className="h-44 overflow-y-auto bg-slate-950 p-3.5 rounded-xl text-slate-400 leading-relaxed text-[10px] border border-slate-900 scrollbar-none">
            <pre className="text-left font-mono">{GAS_CODE_TEMPLATE}</pre>
          </div>
        </div>

      </div>

    </div>
  );
}
