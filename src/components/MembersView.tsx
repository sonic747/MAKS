import React, { useState } from 'react';
import { UserPlus, Trophy, Eye, UserCog, Trash2 } from 'lucide-react';
import { SquashMember, BallRating } from '../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface MembersViewProps {
  members: SquashMember[];
  maxCapacity: number;
  currentUser?: SquashMember | null;
  onSelectMemberForTrophy: (memberId: string) => void;
  onSelectMemberForFeed: (memberId: string) => void;
  onOpenRegister: () => void;
  onOpenEditProfile?: (member: SquashMember) => void;
  onDeleteMember?: (memberId: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  maxCapacity,
  currentUser,
  onSelectMemberForTrophy,
  onSelectMemberForFeed,
  onOpenRegister,
  onOpenEditProfile,
  onDeleteMember,
}) => {
  const [memberToDelete, setMemberToDelete] = useState<SquashMember | null>(null);
  const isAdmin = currentUser?.username === 'admin' || currentUser?.role === 'admin' || currentUser?.isAdmin;

  const getBallDotBadge = (ballRating: BallRating) => {
    switch (ballRating) {
      case 'elite':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/50 text-red-400 text-[10px] font-chivo font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>선수 (엘리트)</span>
          </span>
        );
      case 'master':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/50 text-amber-300 text-[10px] font-chivo font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>마스터부</span>
          </span>
        );
      case 's1':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/50 text-purple-300 text-[10px] font-chivo font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>S1 (최상급)</span>
          </span>
        );
      case 's2':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#202534] border border-[#f5c200]/40 text-[#f5c200] text-[10px] font-chivo font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5c200]"></span>
            <span>S2 (상급)</span>
          </span>
        );
      case 's3':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-500/50 text-blue-300 text-[10px] font-chivo font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>S3 (중급)</span>
          </span>
        );
      case 's4':
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[10px] font-chivo font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>S4 (입문/초보)</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3 pb-24">
      {/* Admin User Management Header Banner */}
      <div className="p-3.5 rounded-xl bg-[#161822] border border-[#f5c200]/30 flex items-center justify-between gap-3 shadow-md">
        <div>
          <h2 className="font-chivo font-black text-white text-base flex items-center gap-2">
            <UserCog size={18} className="text-[#f5c200]" />
            <span>사용자 관리</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 font-chivo">
            등록된 클럽 회원 <span className="text-[#f5c200] font-bold">{members.length}</span>명 / 정원 {maxCapacity}명
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenRegister}
          className="px-3 py-1.5 rounded-lg bg-[#f5c200] hover:bg-[#ffe299] text-[#0f1118] font-chivo font-black text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <UserPlus size={14} />
          <span>신규 회원 등록</span>
        </button>
      </div>

      {/* Member Cards List */}
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-3.5 rounded-xl bg-[#161822] border border-white/[0.08] hover:border-white/20 transition-all shadow-md"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 p-0.5">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-[8px]"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#161822]"
                  style={{ backgroundColor: member.statusColor || '#10b981' }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-chivo font-black text-white text-base">
                      {member.name}
                    </h3>
                    {member.role === 'captain' && (
                      <span className="px-1.5 py-0.5 rounded bg-[#f5c200] text-[#0f1118] text-[9px] font-chivo font-black uppercase">
                        CAPTAIN
                      </span>
                    )}
                  </div>
                  {getBallDotBadge(member.ballRating)}
                </div>

                <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-2 font-chivo">
                  <span>{member.age}세</span>
                  <span>•</span>
                  <span className="text-gray-300 font-semibold">{member.tenure}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                  <span className="text-gray-400 text-[11px] truncate max-w-[140px] sm:max-w-[200px]">
                    {member.primaryTeam}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onOpenEditProfile && (
                      <button
                        onClick={() => onOpenEditProfile(member)}
                        title="개인정보 및 등급 수정"
                        className="px-2 py-1 rounded bg-[#1e222d] hover:bg-[#282d3c] text-gray-300 hover:text-white font-chivo font-bold text-xs flex items-center gap-1 transition-colors border border-white/10"
                      >
                        <UserCog size={12} />
                        <span>수정</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectMemberForTrophy(member.id)}
                      className="px-2.5 py-1 rounded bg-[#1e222d] hover:bg-[#282d3c] text-[#f5c200] font-chivo font-bold text-xs flex items-center gap-1 transition-colors border border-white/10"
                    >
                      <Trophy size={12} />
                      <span>{member.trophiesCount}</span>
                    </button>
                    <button
                      onClick={() => onSelectMemberForFeed(member.id)}
                      className="px-2.5 py-1 rounded bg-[#1e222d] hover:bg-[#282d3c] text-gray-300 font-chivo font-bold text-xs flex items-center gap-1 transition-colors border border-white/10"
                    >
                      <Eye size={12} />
                      <span>피드</span>
                    </button>
                    {isAdmin && member.role !== 'admin' && onDeleteMember && (
                      <button
                        onClick={() => setMemberToDelete(member)}
                        title="회원 탈퇴 및 삭제 (관리자 전용)"
                        className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && onDeleteMember && (
        <DeleteConfirmModal
          isOpen={true}
          title="회원 삭제 확인"
          description={`'${memberToDelete.name}' 회원을 명부에서 완전히 삭제하시겠습니까?`}
          onConfirm={() => {
            onDeleteMember(memberToDelete.id);
            setMemberToDelete(null);
          }}
          onClose={() => setMemberToDelete(null)}
        />
      )}
    </div>
  );
};
