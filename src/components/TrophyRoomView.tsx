import React, { useState } from 'react';
import { Trophy, Medal, Award, Calendar, Shield, Dna, Plus, MessageCircle, ChevronRight, Share2, UserCog, Edit2, Trash2 } from 'lucide-react';
import { SquashMember, HonorItem, MemberPhoto, CheerMessage } from '../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface TrophyRoomViewProps {
  member: SquashMember;
  allMembers: SquashMember[];
  currentUser?: SquashMember | null;
  onSelectMember: (memberId: string) => void;
  onOpenAddPhotoModal: () => void;
  onOpenCheerModal: () => void;
  onOpenImageModal: (imageUrl: string, title: string) => void;
  onOpenEditProfile?: (member: SquashMember) => void;
  onEditHonor?: (honor: HonorItem) => void;
  onDeleteHonor?: (memberId: string, honorId: string) => void;
}

export const TrophyRoomView: React.FC<TrophyRoomViewProps> = ({
  member,
  allMembers,
  currentUser,
  onSelectMember,
  onOpenAddPhotoModal,
  onOpenCheerModal,
  onOpenImageModal,
  onOpenEditProfile,
  onEditHonor,
  onDeleteHonor,
}) => {
  const getRankColor = (rankType: HonorItem['rankType']) => {
    switch (rankType) {
      case 'gold':
        return 'text-[#f5c200]';
      case 'silver':
        return 'text-slate-300';
      case 'bronze':
        return 'text-amber-600';
      default:
        return 'text-white';
    }
  };

  const getRankBadgeBg = (rankType: HonorItem['rankType']) => {
    switch (rankType) {
      case 'gold':
        return 'bg-[#3e3412] text-[#f5c200] border-[#f5c200]/40';
      case 'silver':
        return 'bg-[#252833] text-slate-300 border-slate-500/40';
      case 'bronze':
        return 'bg-[#332219] text-amber-500 border-amber-600/40';
      default:
        return 'bg-[#1e222d] text-gray-300 border-white/10';
    }
  };

  // Only admin and the member themselves can edit personal profile
  const isAdmin =
    currentUser?.username === 'admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.isAdmin === true;

  const isSelf = Boolean(
    currentUser &&
    (currentUser.id === member.id || currentUser.username.toLowerCase() === member.username.toLowerCase())
  );

  const canEditProfile = isAdmin || isSelf;

  const [honorToDelete, setHonorToDelete] = useState<HonorItem | null>(null);

  // 시상내역을 최근 자료(최신 날짜)부터 순서대로 정렬
  const sortedHonors = [...(member.honors || [])].sort((a, b) => {
    const parseTime = (dateStr?: string) => {
      if (!dateStr) return 0;
      const normalized = dateStr.replace(/\./g, '-');
      const time = new Date(normalized).getTime();
      return isNaN(time) ? 0 : time;
    };
    const timeA = parseTime(a.date);
    const timeB = parseTime(b.date);
    if (timeA !== timeB) return timeB - timeA;
    return (b.id || '').localeCompare(a.id || '');
  });

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-4 pb-24">
      {/* Member Profile Card */}
      <div className="rounded-xl bg-[#161822] border border-white/[0.08] p-4 relative overflow-hidden shadow-lg">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f5c200]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex items-start gap-3.5">
          {/* Avatar with yellow border */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden p-0.5 border-2 border-[#f5c200] shadow-[0_0_15px_rgba(245,194,0,0.25)]">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover rounded-[8px]"
                referrerPolicy="no-referrer"
              />
            </div>
            {member.role === 'captain' && (
              <span className="absolute -bottom-1 -right-1 bg-[#c62828] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                KOR
              </span>
            )}
          </div>

          {/* Member Bio */}
          <div className="flex-1 min-w-0">
            {/* Name and Edit Button */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <h2 className="font-chivo font-black text-xl sm:text-2xl text-white tracking-tight leading-none">
                {member.name}
              </h2>
              {canEditProfile && onOpenEditProfile && (
                <button
                  type="button"
                  onClick={() => onOpenEditProfile(member)}
                  className="px-2.5 py-1 rounded-lg bg-[#f5c200] hover:bg-[#ffe299] text-[#0f1118] text-xs font-chivo font-black flex items-center gap-1 shadow transition-all active:scale-95 shrink-0 cursor-pointer"
                  title={isAdmin ? '관리자 권한으로 정보수정' : '정보수정'}
                >
                  <UserCog size={13} />
                  <span>정보수정</span>
                </button>
              )}
            </div>

            {/* Korean / English Tagline */}
            <p className="text-xs text-gray-400 truncate">
              {member.bio || `${member.name} • MAKS 공인 클럽 마스터`}
            </p>
          </div>
        </div>
      </div>



      {/* Section: 🏆 시상 이력 룸 */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 font-chivo font-extrabold text-base text-white">
            <span>🏆</span>
            <span>시상 이력 룸</span>
          </div>
          <span className="text-[11px] font-chivo font-bold tracking-wider text-[#f5c200]">
            CAREER HONORS: {member.honors.length < 10 ? `0${member.honors.length}` : member.honors.length}
          </span>
        </div>

        {member.honors.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#161822] border border-white/[0.08] text-center text-gray-400 text-xs">
            아직 등록된 수상 이력이 없습니다. 새 대회를 정복해 보세요!
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedHonors.map((honor) => (
              <div
                key={honor.id}
                className="p-3 sm:p-3.5 rounded-xl bg-[#161822] border border-white/[0.08] flex items-start justify-between gap-3 hover:border-white/20 transition-all"
              >
                {/* Optional Vertical 4:2 Photo */}
                {honor.imageUrl && (
                  <div
                    onClick={() => onOpenImageModal(honor.imageUrl!, honor.title)}
                    className="w-16 sm:w-20 rounded-lg overflow-hidden bg-[#0c0e15] border border-[#f5c200]/30 shrink-0 shadow cursor-pointer group"
                    style={{ aspectRatio: '1 / 2' }}
                    title="클릭하여 확대 보기"
                  >
                    <img
                      src={honor.imageUrl}
                      alt={honor.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Badge & Date */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-chivo font-black tracking-wider uppercase border ${getRankBadgeBg(
                        honor.rankType
                      )}`}
                    >
                      {honor.rankBadge}
                    </span>
                    <span className="text-[11px] text-gray-400 font-chivo font-medium">
                      {honor.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-chivo font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug">
                    {honor.title}
                  </h3>

                  {/* Subtitle / Organizer */}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {honor.organizer}
                  </p>
                </div>

                {/* Right Rank Callout & Actions */}
                <div className="shrink-0 flex flex-col items-end gap-1.5 self-center">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-chivo font-black text-lg sm:text-xl tracking-tight ${getRankColor(honor.rankType)}`}>
                      {honor.rank}
                    </span>
                    <span className="text-lg">
                      {honor.rankType === 'gold' ? '🥇' : honor.rankType === 'silver' ? '🥈' : '🥉'}
                    </span>
                  </div>

                  {/* Edit / Delete Buttons (Admin과 게시자/본인만 수정 및 삭제 가능) */}
                  {canEditProfile && (
                    <div className="flex items-center gap-1 mt-1">
                      {onEditHonor && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditHonor(honor);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-[#f5c200] hover:bg-white/5 transition-colors cursor-pointer"
                          title="시상 이력 수정"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      {onDeleteHonor && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHonorToDelete(honor);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                          title="시상 이력 삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section: 💬 클럽 동료들의 응원 */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 font-chivo font-extrabold text-base text-white">
            <span>💬</span>
            <span>클럽 동료들의 응원</span>
          </div>
          <span className="text-[11px] font-chivo font-bold text-gray-400">
            최근 {member.cheers.length}개
          </span>
        </div>

        <div className="space-y-2">
          {member.cheers.map((cheer) => (
            <div
              key={cheer.id}
              className="p-3 rounded-lg bg-[#161822] border border-white/[0.08] text-xs leading-relaxed"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-chivo font-bold text-[#f5c200]">
                  {cheer.author}
                </span>
                <span className="text-[10px] text-gray-400 font-chivo">
                  {cheer.timestamp}
                </span>
              </div>
              <p className="text-gray-200">
                "{cheer.text}"
              </p>
            </div>
          ))}

          {member.cheers.length === 0 && (
            <div className="p-4 rounded-lg bg-[#161822] border border-white/[0.08] text-center text-gray-400 text-xs">
              아직 남겨진 동료 응원이 없습니다. 첫 번째 응원 한마디를 남겨보세요!
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onOpenAddPhotoModal}
          className="w-full py-3.5 px-4 rounded-lg bg-[#f5c200] hover:bg-[#ffe299] text-[#0f1118] font-chivo font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(245,194,0,0.25)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>🏆</span>
          <span>시상 등록</span>
        </button>

        <button
          onClick={onOpenCheerModal}
          className="w-full py-3 px-4 rounded-lg bg-[#1e222d] hover:bg-[#282d3c] border border-white/[0.12] text-white font-chivo font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>👍</span>
          <span>동료 응원 한마디 남기기</span>
        </button>
      </div>

      {/* Delete Honor Confirm Modal */}
      {honorToDelete && onDeleteHonor && (
        <DeleteConfirmModal
          isOpen={!!honorToDelete}
          title="시상 이력 삭제"
          description={`'${honorToDelete.title}' (${honorToDelete.rank}) 시상 이력을 완전히 삭제하시겠습니까?`}
          onConfirm={() => {
            onDeleteHonor(member.id, honorToDelete.id);
            setHonorToDelete(null);
          }}
          onClose={() => setHonorToDelete(null)}
        />
      )}
    </div>
  );
};
