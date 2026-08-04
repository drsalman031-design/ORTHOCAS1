import React, { useState } from 'react';
import {
  Stethoscope,
  Search,
  User,
  Bell,
  ChevronDown,
  UserCheck,
  LogOut,
  Sparkles,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { getCurrentUserAccount, setCurrentUserAccount, PRESET_ACCOUNTS } from '../lib/authContext';

interface HeaderProps {
  profile: StudentProfile;
  compact?: boolean;
  activeTabTitle?: string;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onRoleChanged?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  compact = false,
  activeTabTitle,
  onOpenSearch,
  onOpenSettings,
  onLogout,
  onRoleChanged,
}) => {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const currentUser = getCurrentUserAccount();
  const isResident = currentUser.role === 'STUDENT';
  const isHOD = currentUser.role === 'HOD';

  const handleSwitchAccount = (userId: string) => {
    setCurrentUserAccount(userId);
    setAccountMenuOpen(false);
    if (onRoleChanged) {
      onRoleChanged();
    } else {
      window.location.reload();
    }
  };

  const notificationItems = [
    { id: 1, text: 'Case #ORD-2024-0892 submitted by Dr. Rahul V. (PGY2)', time: '10m ago', urgent: true },
    { id: 2, text: 'HOD approved Case #OC-8821 (Chen, Wei-Long)', time: '1h ago', urgent: false },
    { id: 3, text: 'Correction requested on Bracket Positioning for Case #771', time: '2h ago', urgent: true },
  ];

  // Derive initial from current user's name
  const cleanName = currentUser.name.replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
  const avatarInitial = cleanName.charAt(0).toUpperCase() || 'U';

  const roleBadgeLabel = currentUser.role === 'HOD' ? 'HOD' : currentUser.role === 'STAFF_GUIDE' ? 'FACULTY' : 'RESIDENT';
  const rolePortalLabel = isResident ? 'Resident Portal' : isHOD ? 'HOD Portal' : 'Faculty Portal';
  const deptName = currentUser.department === 'Orthodontics & Dentofacial Orthopedics' ? 'Dept. of Orthodontics' : (currentUser.department || 'Dept. of Orthodontics');
  const subHeaderText = `${deptName} • ${rolePortalLabel}`;

  return (
    <header className="z-40 bg-[#0F172A] text-white shadow-md border-b border-slate-800 shrink-0 sticky top-0 flex flex-col">
      {/* 44px TOP NAV BAR */}
      <div className="h-[44px] flex items-center w-full border-b border-slate-800/60">
        <div className="w-full max-w-md mx-auto px-3 flex items-center justify-between gap-2 min-w-0">
          {/* BRAND LOGO & TITLE + ROLE BADGE */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 backdrop-blur-md flex items-center justify-center text-white border border-blue-400/30 shrink-0 shadow-xs">
              <Stethoscope className="w-3.5 h-3.5 text-blue-300" />
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <h1 className="font-bold text-[13px] tracking-tight text-white leading-none truncate">
                OrthoCase
              </h1>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
                {roleBadgeLabel}
              </span>
            </div>
          </div>

          {/* HEADER ACTIONS: SEARCH, NOTIFICATION BELL & USER AVATAR CIRCLE */}
          <div className="flex items-center gap-1.5 shrink-0 relative">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  setAccountMenuOpen(false);
                }}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-white text-[8px] font-extrabold flex items-center justify-center leading-none">
                  3
                </span>
              </button>

              {/* NOTIFICATIONS DROPDOWN */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white text-slate-800 border border-[#E5E8F0] shadow-2xl z-50 p-3 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#0D52D6]" /> Clinical Notifications
                      </span>
                      <span className="text-[10px] bg-blue-50 text-[#0D52D6] px-2 py-0.5 rounded-full font-bold">
                        3 New
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {notificationItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 transition-all text-xs"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-slate-800 font-medium leading-snug">{item.text}</p>
                            {item.urgent && (
                              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block mt-1">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>


          </div>
        </div>
      </div>

      {/* SLIM SUB-HEADER STRIP (Height: 20px) */}
      <div className="w-full bg-slate-100 text-slate-700 h-[20px] flex items-center border-b border-slate-200/80">
        <div className="w-full max-w-md mx-auto px-3 flex items-center justify-between text-[10px] font-medium min-w-0">
          <span className="truncate max-w-[220px] sm:max-w-none text-slate-700 font-medium leading-none">
            {subHeaderText}
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-slate-600 bg-white px-1.5 py-0.2 rounded-full border border-slate-200/80 shrink-0 shadow-2xs leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sync: Updated</span>
          </span>
        </div>
      </div>
    </header>
  );
};
