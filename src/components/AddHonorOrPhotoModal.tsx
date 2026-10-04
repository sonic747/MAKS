import React, { useState, useRef, useEffect } from 'react';
import { X, Trophy, Camera, Image, Trash2, Calendar, Award } from 'lucide-react';
import { SquashMember, HonorItem, MemberPhoto } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface AddHonorOrPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: SquashMember;
  onAddHonor: (memberId: string, honor: Omit<HonorItem, 'id'>) => void;
  onUpdateHonor?: (memberId: string, honor: HonorItem) => void;
  onDeleteHonor?: (memberId: string, honorId: string) => void;
  editingHonor?: HonorItem | null;
  onAddPhoto?: (memberId: string, photo: Omit<MemberPhoto, 'id'>) => void;
}

export const AddHonorOrPhotoModal: React.FC<AddHonorOrPhotoModalProps> = ({
  isOpen,
  onClose,
  member,
  onAddHonor,
  onUpdateHonor,
  onDeleteHonor,
  editingHonor,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Honor form state
  const [honorTitle, setHonorTitle] = useState('2024 경기도협회장배 스쿼시 대회');
  const [organizer, setOrganizer] = useState('경기도스쿼시연맹 공인 • 개인전');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Rank selection & custom rank state
  const [rankPreset, setRankPreset] = useState<string>('1위');
  const [customRank, setCustomRank] = useState<string>('');
  const [customBadge, setCustomBadge] = useState<string>('SPECIAL');
  const [rankType, setRankType] = useState<'gold' | 'silver' | 'bronze'>('gold');

  const [imageUrl, setImageUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const standardRanks = ['1위', '2위', '3위', '공동 3위', '8강', '본선 진출'];

  useEffect(() => {
    if (editingHonor) {
      setHonorTitle(editingHonor.title || '');
      setOrganizer(editingHonor.organizer || '');

      // Parse date to YYYY-MM-DD for HTML input
      if (editingHonor.date) {
        const normalized = editingHonor.date.replace(/\./g, '-');
        if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
          setDate(normalized);
        } else {
          setDate(new Date().toISOString().split('T')[0]);
        }
      } else {
        setDate(new Date().toISOString().split('T')[0]);
      }

      // Parse rank preset vs custom
      if (standardRanks.includes(editingHonor.rank)) {
        setRankPreset(editingHonor.rank);
        setCustomRank('');
      } else {
        setRankPreset('기타');
        setCustomRank(editingHonor.rank || '');
        setCustomBadge(editingHonor.rankBadge || 'SPECIAL');
      }

      setRankType(editingHonor.rankType || 'gold');
      setImageUrl(editingHonor.imageUrl || '');
    } else {
      setHonorTitle('2024 경기도협회장배 스쿼시 대회');
      setOrganizer('경기도스쿼시연맹 공인 • 개인전');
      setDate(new Date().toISOString().split('T')[0]);
      setRankPreset('1위');
      setCustomRank('');
      setCustomBadge('SPECIAL');
      setRankType('gold');
      setImageUrl('');
    }
  }, [editingHonor, isOpen]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    try {
      setIsCompressing(true);
      const compressed = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1800,
        quality: 0.8,
        maxSizeBytes: 400 * 1024,
      });
      setImageUrl(compressed);
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleHonorSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine final rank, badge and type
    let finalRank = rankPreset;
    let finalBadge = 'CHAMPION';
    let finalType = rankType;

    if (rankPreset === '1위') {
      finalRank = '1위';
      finalBadge = 'CHAMPION';
      finalType = 'gold';
    } else if (rankPreset === '2위') {
      finalRank = '2위';
      finalBadge = 'RUNNER-UP';
      finalType = 'silver';
    } else if (rankPreset === '3위') {
      finalRank = '3위';
      finalBadge = '3RD PLACE';
      finalType = 'bronze';
    } else if (rankPreset === '공동 3위') {
      finalRank = '공동 3위';
      finalBadge = '3RD PLACE';
      finalType = 'bronze';
    } else if (rankPreset === '8강') {
      finalRank = '8강';
      finalBadge = 'TOP 8';
      finalType = 'bronze';
    } else if (rankPreset === '본선 진출') {
      finalRank = '본선 진출';
      finalBadge = 'FINALIST';
      finalType = 'bronze';
    } else {
      // 기타 (직접 입력)
      finalRank = customRank.trim() || '특별상';
      finalBadge = customBadge.trim() || 'AWARD';
      finalType = rankType;
    }

    const formattedDate = date ? date.replace(/-/g, '.') : new Date().toISOString().split('T')[0].replace(/-/g, '.');

    if (editingHonor && onUpdateHonor) {
      onUpdateHonor(member.id, {
        ...editingHonor,
        title: honorTitle.trim(),
        organizer: organizer.trim(),
        rank: finalRank,
        rankBadge: finalBadge,
        rankType: finalType,
        date: formattedDate,
        imageUrl: imageUrl || undefined,
      });
    } else {
      onAddHonor(member.id, {
        title: honorTitle.trim(),
        organizer: organizer.trim(),
        rank: finalRank,
        rankBadge: finalBadge,
        rankType: finalType,
        date: formattedDate,
        division: '일반부',
        imageUrl: imageUrl || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#161822] border border-white/[0.12] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in duration-200">
        {/* Header: 시상 등록 / 시상 수정 */}
        <div className="px-4 py-3 bg-[#11131a] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[#f5c200]" />
            <h3 className="font-chivo font-black text-sm text-white">
              {member.name} 님의 {editingHonor ? '시상 이력 수정' : '시상 등록'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleHonorSubmit} className="p-4 space-y-3.5 max-h-[85vh] overflow-y-auto">
          {/* 대회 명칭 */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
              대회 명칭
            </label>
            <input
              type="text"
              value={honorTitle}
              onChange={(e) => setHonorTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
              placeholder="예: 2024 제15회 전국 클럽 스쿼시 선수권 대회"
              required
            />
          </div>

          {/* 주관 및 부문 설명 */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
              주관 및 부문 설명
            </label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
              placeholder="예: 대한스쿼시연맹 공인 • 개인전 남자부"
              required
            />
          </div>

          {/* 대회 날짜 입력 */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#f5c200]" />
                <span>대회 일자 (날짜)</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">최신순 정렬에 반영</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200] cursor-pointer"
              required
            />
          </div>

          {/* 순위 결과 선택 및 기타 입력 */}
          <div className="space-y-2">
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1 flex items-center gap-1.5">
              <Award size={13} className="text-[#f5c200]" />
              <span>순위 결과 선택</span>
            </label>
            <select
              value={rankPreset}
              onChange={(e) => {
                const val = e.target.value;
                setRankPreset(val);
                if (val === '1위') {
                  setRankType('gold');
                } else if (val === '2위') {
                  setRankType('silver');
                } else if (val === '3위' || val === '공동 3위' || val === '8강' || val === '본선 진출') {
                  setRankType('bronze');
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200] cursor-pointer"
            >
              <option value="1위">1위 🥇 (우승 - CHAMPION)</option>
              <option value="2위">2위 🥈 (준우승 - RUNNER-UP)</option>
              <option value="3위">3위 🥉 (동메달 - 3RD PLACE)</option>
              <option value="공동 3위">공동 3위 🥉 (동메달 - 3RD PLACE)</option>
              <option value="8강">8강 (TOP 8)</option>
              <option value="본선 진출">본선 진출 (FINALIST)</option>
              <option value="기타">기타 (직접 입력)</option>
            </select>

            {/* 기타 직접 입력 시 나타나는 입력 필드 */}
            {rankPreset === '기타' && (
              <div className="p-3 rounded-xl bg-[#0c0e15] border border-[#f5c200]/30 space-y-2.5 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">
                    직접 입력 순위명
                  </label>
                  <input
                    type="text"
                    value={customRank}
                    onChange={(e) => setCustomRank(e.target.value)}
                    placeholder="예: 4위, 장려상, 패자부활전 우승, 감투상 등"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#161822] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">
                    영문 뱃지 라벨
                  </label>
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    placeholder="예: SPECIAL, 4TH PLACE, MERIT 등"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#161822] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">
                    메달/강조 색상 톤
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRankType('gold')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                        rankType === 'gold'
                          ? 'bg-[#3e3412] text-[#f5c200] border-[#f5c200]'
                          : 'bg-[#161822] text-gray-400 border-white/10'
                      }`}
                    >
                      🥇 골드 (금)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRankType('silver')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                        rankType === 'silver'
                          ? 'bg-[#252833] text-slate-200 border-slate-300'
                          : 'bg-[#161822] text-gray-400 border-white/10'
                      }`}
                    >
                      🥈 실버 (은)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRankType('bronze')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                        rankType === 'bronze'
                          ? 'bg-[#332219] text-amber-400 border-amber-500'
                          : 'bg-[#161822] text-gray-400 border-white/10'
                      }`}
                    >
                      🥉 브론즈 (동)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 사진 첨부 섹션: 사진선택 / 사진촬영 및 세로 4:2 (2:1) 세워서 표시 */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1.5">
              시상 및 상장/메달 사진 (선택)
            </label>

            {/* Hidden file inputs: Gallery & Camera capture */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessFile(file);
              }}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessFile(file);
              }}
            />

            {/* Two Action Buttons: 사진 선택 & 사진 촬영 */}
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-[#1e222d] hover:bg-[#272b38] border border-white/15 text-xs font-chivo font-bold text-gray-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Image size={15} className="text-[#f5c200]" />
                <span>사진선택</span>
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-[#1e222d] hover:bg-[#272b38] border border-white/15 text-xs font-chivo font-bold text-gray-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Camera size={15} className="text-emerald-400" />
                <span>사진촬영</span>
              </button>
            </div>

            {/* Photo Preview: 세로 4 대 가로 2 (1:2 ratio) 비율로 세워서 표시 */}
            {imageUrl ? (
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#11131a] border border-[#f5c200]/30">
                <div
                  className="w-32 rounded-lg overflow-hidden bg-[#0c0e15] border-2 border-[#f5c200] shadow-md relative group"
                  style={{ aspectRatio: '1 / 2' }}
                >
                  <img
                    src={imageUrl}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    title="사진 제거"
                  >
                    <X size={14} />
                  </button>
                </div>
                <span className="text-[11px] text-gray-400 font-chivo">
                  세로형 (4:2 비율) 상장/메달 사진 등록됨
                </span>
              </div>
            ) : isCompressing ? (
              <div className="py-4 rounded-xl bg-[#11131a] border border-white/10 text-center text-xs text-[#f5c200] animate-pulse">
                사진 최적화 중...
              </div>
            ) : null}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isCompressing}
              className="w-full py-3 px-4 rounded-xl bg-[#f5c200] hover:bg-[#ffe299] text-[#0f1118] font-chivo font-black text-xs sm:text-sm shadow-[0_4px_16px_rgba(245,194,0,0.3)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {editingHonor ? '시상 이력 수정 완료' : '새 시상 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
