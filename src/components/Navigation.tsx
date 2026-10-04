import React from 'react';
import { Flame, Trophy, HardDrive, UserCog } from 'lucide-react';
import { TabType, SquashMember } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentUser?: SquashMember | null;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  unreadCount = 0,
}) => {
  const isAdmin = currentUser?.username === 'admin' || currentUser?.role === 'admin' || currentUser?.isAdmin;

  // Non-admins see only '공지' and '명예' ("회원" 탭 삭제).
  // Admins see '사용자관리', '백업관리', '공지', '명예'.
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = isAdmin
    ? [
        {
          id: 'members',
          label: '사용자관리',
          icon: <UserCog size={19} strokeWidth={2.2} />,
        },
        {
          id: 'backup',
          label: '백업관리',
          icon: <HardDrive size={19} strokeWidth={2.2} />,
        },
        {
          id: 'feed',
          label: '공지',
          icon: <Flame size={19} strokeWidth={2.2} />,
          badge: unreadCount,
        },
        {
          id: 'trophies',
          label: '명예',
          icon: <Trophy size={19} strokeWidth={2.2} />,
        },
      ]
    : [
        {
          id: 'feed',
          label: '공지',
          icon: <Flame size={19} strokeWidth={2.2} />,
          badge: unreadCount,
        },
        {
          id: 'trophies',
          label: '명예',
          icon: <Trophy size={19} strokeWidth={2.2} />,
        },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e15]/95 backdrop-blur-md border-t border-white/[0.08] max-w-md mx-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 focus:outline-none transition-colors relative cursor-pointer ${
                isActive ? 'text-[#f5c200]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className={`relative transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1 min-w-[15px] h-[15px] rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center border border-[#0c0e15] shadow-sm animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-wider font-chivo mt-1 ${isActive ? 'font-black' : 'font-semibold'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
