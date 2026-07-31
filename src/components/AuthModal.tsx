import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Building2,
  Crown
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth, syncUserProfile, signInWithGoogle, SUPER_ADMIN_EMAIL, AppUserProfile } from '../lib/firebase';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  onSetUser?: (user: AppUserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onSetUser,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showBypass, setShowBypass] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickSuperAdminFill = () => {
    setEmail(SUPER_ADMIN_EMAIL);
    setPassword('SuperAdmin2026!');
    setDisplayName('Super Admin');
  };

  const handleBypassSuperAdmin = () => {
    const superUser: AppUserProfile = {
      uid: 'superadmin-bypass-session',
      email: SUPER_ADMIN_EMAIL,
      displayName: 'Super Admin',
      role: 'superadmin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    if (onSetUser) {
      onSetUser(superUser);
    }
    setSuccessMsg('Super Admin Session activated!');
    setTimeout(() => {
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    }, 500);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMsg(null);
    setShowBypass(false);
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('Signed in with Google successfully!');
      setLoading(false);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setLoading(false);
      console.error('Google Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in your Firebase Console yet (auth/operation-not-allowed). Please enable Google Auth in your Firebase Authentication settings.');
        setShowBypass(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing.');
      } else {
        setError(err.message || 'Failed to sign in with Google.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setShowBypass(false);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
        await syncUserProfile(cred.user);
        setSuccessMsg('Account created successfully!');
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await syncUserProfile(cred.user);
        setSuccessMsg('Signed in successfully!');
      }

      setLoading(false);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setLoading(false);
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is disabled in your Firebase console (auth/operation-not-allowed). To fix: Open Firebase Console -> Authentication -> Sign-in method -> Enable Email/Password or Google.';
        setShowBypass(true);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. If you do not have an account, click "Create Account".';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please click "Sign In".';
      }
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002B5B] to-[#C41230] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <AmericanAirlinesLogo size="md" variant="dark-bg" />
            <span className="text-xs bg-red-600/80 text-white font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-400/40">
              Firebase Auth
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {mode === 'signin' ? 'Sign In to American Airlines' : 'Create Flight Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Access optional features, ticket history, or admin privileges.
          </p>
        </div>

        {/* Super Admin Preset Quick Action */}
        <div className="bg-sky-50 dark:bg-sky-950/60 p-3 px-6 border-b border-sky-100 dark:border-sky-900/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-sky-950 dark:text-sky-200 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0078D2] shrink-0" />
            <span>Super Admin Email: <strong className="font-mono text-red-600 dark:text-red-400">{SUPER_ADMIN_EMAIL}</strong></span>
          </div>
          <button
            type="button"
            onClick={handleQuickSuperAdminFill}
            className="bg-[#0078D2] hover:bg-[#0060A9] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition shrink-0 shadow-xs"
          >
            Fill Super Admin
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Primary Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-extrabold text-sm border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm flex items-center justify-center gap-3 transition transform active:scale-98"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              or Email Credentials
            </span>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-[#0078D2] dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-[#C41230] dark:text-red-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Create Account
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs space-y-2">
              <div className="flex items-start gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {showBypass && (
                <button
                  type="button"
                  onClick={handleBypassSuperAdmin}
                  className="w-full mt-1 py-2 px-3 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition transform active:scale-98"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Activate Super Admin Session (Offline Bypass)</span>
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Captain Vance"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm font-bold placeholder:text-slate-400 focus:border-[#0078D2] outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm font-bold placeholder:text-slate-400 focus:border-[#0078D2] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm font-bold placeholder:text-slate-400 focus:border-[#0078D2] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition transform active:scale-98 ${
                mode === 'signin' 
                  ? 'bg-[#0078D2] hover:bg-[#0060A9] shadow-sky-600/30' 
                  : 'bg-[#C41230] hover:bg-[#A00E26] shadow-red-600/30'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" /> Sign In to Account
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create New Account
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center">
            Authentication is optional. Unauthenticated users can still search their ticket using Ticket # or Passenger Name.
          </p>
        </div>
      </div>
    </div>
  );
};
