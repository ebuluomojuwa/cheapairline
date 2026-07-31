import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  UserMinus, 
  Search, 
  Crown, 
  Building2, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Calendar,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AppUserProfile, subscribeUserProfiles, updateUserRoleInFirestore, SUPER_ADMIN_EMAIL, UserRole } from '../lib/firebase';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface AdminUsersPageProps {
  currentUser: AppUserProfile | null;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AppUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || currentUser?.role === 'superadmin';

  useEffect(() => {
    const unsub = subscribeUserProfiles((list) => {
      setUsers(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleRoleChange = async (uid: string, targetEmail: string, newRole: UserRole) => {
    if (targetEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && newRole !== 'superadmin') {
      alert('The designated Super Admin account cannot be downgraded from superadmin role.');
      return;
    }

    setUpdatingUid(uid);
    try {
      await updateUserRoleInFirestore(uid, newRole);
      setStatusMsg(`Updated role for ${targetEmail} to ${newRole.toUpperCase()}`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update user role. Please check database permissions.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = query.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-950/80 rounded-3xl flex items-center justify-center mx-auto text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 shadow-xl">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Access Restricted</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This Admin Page is strictly reserved for the Super Admin (<strong className="text-red-600 dark:text-red-400 font-mono">{SUPER_ADMIN_EMAIL}</strong>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#C41230] p-8 text-white shadow-2xl border border-red-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-red-400 border border-red-500/40 text-xs font-black uppercase tracking-wider shadow-md">
            <Crown className="w-4 h-4 text-amber-400" /> Super Admin User & Role Management Portal
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            User Accounts & Permission Administration
          </h1>
          <p className="text-slate-200 text-sm leading-relaxed">
            Manage registered user accounts, assign Administrator privileges, and manage flight ticketing system permissions in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-amber-300 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Signed in as: {currentUser?.email}
            </div>
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-sky-300 flex items-center gap-1.5 font-bold">
              <Users className="w-4 h-4 text-sky-400" /> Total Accounts: {users.length}
            </div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* User Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users by email, name, or role..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] outline-none text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            Showing {filteredUsers.length} user(s)
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider">
                <th className="py-4 px-6">User / Email</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Registered Date</th>
                <th className="py-4 px-6 text-right">Role Management Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">
                    Loading users from Firestore...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">
                    No user accounts found matching "{query}".
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuper = u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm ${
                            isSuper 
                              ? 'bg-gradient-to-tr from-amber-500 to-red-600 shadow-md' 
                              : u.role === 'admin'
                              ? 'bg-[#0078D2]'
                              : 'bg-slate-600'
                          }`}>
                            {u.displayName?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {u.displayName || 'User'}
                              {isSuper && (
                                <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-md font-black border border-amber-300 dark:border-amber-800 uppercase flex items-center gap-1">
                                  <Crown className="w-3 h-3 text-amber-500" /> Super Admin
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
                          u.role === 'superadmin'
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                            : u.role === 'admin'
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}>
                          {u.role === 'superadmin' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                          {u.role === 'admin' && <Building2 className="w-3.5 h-3.5 text-sky-500" />}
                          {u.role === 'user' && <UserCheck className="w-3.5 h-3.5 text-slate-400" />}
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {isSuper ? (
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 italic">
                            Protected Super Admin
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              disabled={updatingUid === u.uid}
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.uid, u.email, e.target.value as UserRole)}
                              className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#0078D2] outline-none"
                            >
                              <option value="user">Regular Passenger (User)</option>
                              <option value="admin">Airline Front Desk Admin</option>
                              <option value="superadmin">Super Admin</option>
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
