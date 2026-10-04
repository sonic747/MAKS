import React from 'react';
import { LogOut } from 'lucide-react';
import { SquashMember } from '../types';

interface MemberSidebarProps {
  members: SquashMember[];
  maxCapacity: number;
  selectedMemberId: string;
  isLoading?: boolean;
  currentUser?: SquashMember | null;
  onSelectMember: (memberId: string) => void;
  onAddMemberClick: () => void;
  onLogout?: () => void;
  onMemberDoubleTap?: (member: SquashMember) => void;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  members,
  maxCapacity,
  selectedMemberId,
  isLoading = false,
  currentUser,
  onSelectMember,
  onAddMemberClick,
  onLogout,
}) => {
  return (
    <aside className="w-[72px] sm:w-20 shrink-0 bg-[#0c0e15] border-r border-white/[0.08] flex flex-col items-center py-3 select-none justify-between h-full">
      {/* Top Section: Capacity Counter & Member Avatar List */}
      <div className="w-full flex flex-col items-center flex-1 min-h-0 overflow-hidden">
        {/* Capacity Counter */}
        <div className="flex flex-col items-center mb-3 shrink-0">
          <div className="px-2 py-0.5 rounded-full bg-[#f5c200] text-[#0f1118] font-chivo font-black text-[11px] shadow-sm tracking-tight">
            {members.length} / {maxCapacity}
          </div>
          <span className="text-[10px] font-chivo font-bold tracking-wider text-gray-400 mt-1 uppercase">
            MEMBERS
          </span>
        </div>

        {/* Member Avatar List */}
        <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-y-auto overflow-x-hidden no-scrollbar px-1 pt-1 pb-2">
          {isLoading && members.length === 0 ? (
            [1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex flex-col items-center w-full animate-pulse gap-1 py-1">
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/5" />
                <div className="w-8 h-2.5 rounded bg-white/[0.06]" />
                <div className="w-6 h-2 rounded bg-white/[0.04]" />
              </div>
            ))
          ) : (
            members.map((member) => {
              const isSelected = selectedMemberId === member.id;
              const isCaptain = member.role === 'captain';

              return (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(member.id)}
                  className="group flex flex-col items-center w-full focus:outline-none transition-transform active:scale-95 cursor-pointer shrink-0"
                  title={`${member.name} (${member.roleLabel})`}
                >
                  <div className="relative">
                    {/* Avatar container */}
                    <div
                      className={`w-12 h-12 rounded-xl overflow-hidden p-0.5 transition-all duration-200 ${
                        isSelected || isCaptain
                          ? 'ring-2 ring-[#f5c200] shadow-[0_0_12px_rgba(245,194,0,0.35)]'
                          : 'border border-white/20 opacity-85 group-hover:opacity-100 group-hover:border-white/50'
                      }`}
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-[10px]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                    </div>

                    {/* Status Dot */}
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c0e15]"
                      style={{ backgroundColor: member.statusColor || '#10b981' }}
                    />

                    {/* Captain Badge Indicator */}
                    {isCaptain && (
                      <div className="absolute -top-1 -right-1 bg-[#c62828] text-white text-[8px] font-black px-1 rounded-sm shadow">
                        C
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <span
                    className={`text-[12px] font-semibold mt-1 truncate max-w-[62px] text-center leading-tight ${
                      isSelected ? 'text-[#f5c200] font-bold' : 'text-gray-200'
                    }`}
                  >
                    {member.name}
                  </span>

                  {/* Role / Tenure Tag */}
                  <span
                    className={`text-[10px] truncate max-w-[62px] text-center font-chivo font-medium ${
                      isCaptain ? 'text-[#f5c200] font-bold' : 'text-gray-400'
                    }`}
                  >
                    {member.roleLabel}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Section: Logout Button (이동 완료) */}
      {currentUser && onLogout && (
        <div className="w-full flex flex-col items-center pt-2.5 pb-16 sm:pb-3 border-t border-white/[0.08] shrink-0 bg-[#0c0e15]">
          <button
            type="button"
            onClick={onLogout}
            className="group flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/[0.06] transition-all active:scale-95 cursor-pointer w-full"
            title="로그아웃"
          >
            <LogOut size={18} className="text-gray-400 group-hover:text-red-400 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-chivo font-bold mt-1 text-gray-400 group-hover:text-red-400 tracking-tight">
              로그아웃
            </span>
          </button>
        </div>
      )}
    </aside>
  );
};
