import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, KeyRound, User, Loader2, ArrowRight, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (portal: 'guru' | 'admin', username: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [portal, setPortal] = useState<'guru' | 'admin'>('guru');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;

    setIsLoading(true);
    setErrorMessage('');

    // Simulate 600ms authentic validation latency
    setTimeout(() => {
      setIsLoading(false);
      if (portal === 'guru') {
        if (pin === 'sarigadung') {
          onLoginSuccess('guru', 'Bu Mei, S.Pd.');
        } else {
          setErrorMessage('Sandi masuk Portal Guru salah.');
          setPin('');
        }
      } else {
        if (pin === 'admin123') {
          onLoginSuccess('admin', 'Administrator Utama');
        } else {
          setErrorMessage('Sandi masuk Portal Admin salah.');
          setPin('');
        }
      }
    }, 600);
  };

  return (
    <div id="login-screen-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-108 h-108 bg-emerald-950/5 rounded-full blur-3xl" />
      
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 z-10"
      >
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="p-3.5 bg-emerald-900 border border-emerald-950 rounded-2xl shadow-md relative">
            <BookOpen className="w-7 h-7 text-emerald-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
          </div>
          <div className="text-left">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              SDN 2 Sarigadung
            </h1>
            <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">
              Aplikasi Guru v2.6.2-stable
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sistem Informasi Administrasi Akademik Sekolah Dasar
        </p>
      </motion.div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-20"
      >
        {/* Toggle Portal Header */}
        <div className="p-2 flex bg-slate-100 dark:bg-slate-950/60 rounded-t-3xl border-b border-slate-200 dark:border-slate-800 relative">
          <button
            id="btn-portal-guru"
            type="button"
            onClick={() => {
              setPortal('guru');
              setPin('');
              setErrorMessage('');
            }}
            className={`flex-1 relative py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 z-10 ${
              portal === 'guru' 
                ? 'text-emerald-700 dark:text-emerald-300' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {portal === 'guru' && (
              <motion.div 
                layoutId="active-portal"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50" 
              />
            )}
            <User className="w-4 h-4 z-10" />
            <span className="z-10">Portal Guru</span>
          </button>
          
          <button
            id="btn-portal-admin"
            type="button"
            onClick={() => {
              setPortal('admin');
              setPin('');
              setErrorMessage('');
            }}
            className={`flex-1 relative py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 z-10 ${
              portal === 'admin' 
                ? 'text-blue-700 dark:text-blue-300' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {portal === 'admin' && (
              <motion.div 
                layoutId="active-portal"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50" 
              />
            )}
            <Shield className="w-4 h-4 z-10" />
            <span className="z-10">Portal Admin</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <span className={`inline-flex p-3 rounded-2xl mb-2 items-center justify-center ${
                portal === 'guru' 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
              }`}>
                {portal === 'guru' ? (
                  <User className="w-6 h-6 animate-pulse" />
                ) : (
                  <Shield className="w-6 h-6 animate-pulse" />
                )}
              </span>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {portal === 'guru' ? 'Masuk Portal Guru' : 'Masuk Portal Admin'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {portal === 'guru' 
                  ? 'Gunakan kata sandi wali kelas (Petunjuk: sarigadung)' 
                  : 'Sandi admin sekolah penuh (Petunjuk: admin123)'}
              </p>
            </div>

            {/* Password Input Display */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                id="input-login-sandi"
                type="password"
                value={pin}
                onChange={(e) => {
                  setErrorMessage('');
                  setPin(e.target.value);
                }}
                placeholder="Masukkan kata sandi..."
                className={`w-full pl-11 pr-16 py-3.5 rounded-2xl text-center text-lg font-mono tracking-widest border bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white transition-all outline-none ${
                  errorMessage 
                    ? 'border-rose-500 ring-4 ring-rose-500/10' 
                    : portal === 'guru'
                      ? 'border-slate-200 dark:border-slate-800 focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-800 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10'
                }`}
              />
              
              {/* Reset button inside input if any pin entered */}
              {pin && !isLoading && (
                <button
                  id="btn-sandi-clear-inline"
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Batal
                </button>
              )}
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/50 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login button */}
            <motion.button
              id="btn-login-submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading || !pin}
              className={`w-full py-3.5 px-4 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                !pin 
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed' 
                  : portal === 'guru'
                    ? 'bg-emerald-900 border border-emerald-950 hover:bg-emerald-800 shadow-emerald-900/10'
                    : 'bg-blue-700 hover:bg-blue-800 shadow-blue-500/10'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memvalidasi PIN...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Credit Footer */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-xs text-slate-400 dark:text-slate-600 mt-12 text-center"
      >
        Aplikasi Guru • SDN 2 Sarigadung <br />
        Binaan Penasihat Akademik Bu Mei, S.Pd. • Dikembangkan Tahun 2026
      </motion.p>
    </div>
  );
}
