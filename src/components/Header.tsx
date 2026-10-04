import React from 'react';
import { MaksLogo } from './MaksLogo';
import { TabType, SquashMember } from '../types';
import { LogOut, RefreshCw, UserPlus, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  title?: string;
  isSyncing?: boolean;
  cloudConnected?: boolean;
  currentUser?: SquashMember | null;
  selectedMember?: SquashMember;
  unreadCount?: number;
  onNavigateToRegister?: () => void;
  onOpenInstallModal?: () => void;
  onLogout?: () => void;
  onOpenGate?: () => void;
  onSyncNow?: () => void;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  title,
  isSyncing,
  cloudConnected = true,
  currentUser,
  unreadCount = 0,
  onNavigateToRegister,
  onOpenInstallModal,
  onLogout,
  onSyncNow,
  onManualSync,
}) => {
  const handleSync = onSyncNow || onManualSync;

  const getTabTitle = () => {
    if (title) return title;
    switch (currentTab) {
      case 'feed':
        return '클럽 공지';
      case 'members':
        return currentUser?.isAdmin || currentUser?.role === 'admin' ? '사용자관리' : '클럽 공지';
      case 'trophies':
        return '명예의 전당';
      case 'register':
        return '신규 회원등록';
      case 'backup':
        return '백업관리';
      default:
        return '클럽 공지';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0f1118]/95 backdrop-blur-md border-b border-white/[0.08] px-2.5 sm:px-3.5 pt-[max(1.75rem,env(safe-area-inset-top,0px))] pb-2 sm:py-2">
      <div className="flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Logo and Active Tab Name with Badging indication */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
          <div className="shrink-0">
            <MaksLogo size="sm" />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-gray-500 text-xs hidden xs:inline">|</span>
            <span className="text-white text-[11px] sm:text-xs font-chivo font-black tracking-wide truncate flex items-center gap-1">
              <span className="truncate">{getTabTitle()}</span>
              {unreadCount > 0 && currentTab === 'feed' && (
                <span className="px-1 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black shrink-0 animate-pulse">
                  N {unreadCount}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right Action Icons: Cloud Sync, Current User & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Real-time Cloud Status */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-chivo font-bold border transition-colors ${
              cloudConnected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
            }`}
            title="스마트폰과 PC 웹 브라우저가 클라우드 실시간 데이터베이스로 즉시 동기화됩니다."
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                cloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden xs:inline">실시간 연동</span>
          </div>

          {/* Sync Now Button */}
          {handleSync && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              title="클라우드 실시간 동기화 확인"
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#161822] hover:bg-[#1e222d] text-gray-300 hover:text-white border border-white/10 text-xs font-chivo font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin text-[#f5c200]' : ''} />
              <span className="text-[11px] hidden sm:inline">동기화</span>
            </button>
          )}

          {/* Current User Profile Pill */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full bg-[#181a24] border border-white/10 shadow-sm">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#f5c200]/50"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-chivo font-bold text-gray-200 max-w-[70px] truncate">
                {currentUser.name}
              </span>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[#f5c200] text-[11px] font-chivo font-bold">
              게스트
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
