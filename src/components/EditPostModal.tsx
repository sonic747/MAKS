import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, FolderOpen, MapPin, Clock, Trophy, Trash2, Loader2 } from 'lucide-react';
import { FeedPost } from '../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { compressImageFile } from '../utils/imageCompressor';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: FeedPost | null;
  onUpdatePost: (updatedPost: FeedPost) => void;
  onDeletePost: (postId: string) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onUpdatePost,
  onDeletePost,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [category, setCategory] = useState<'match' | 'awards' | 'all'>('match');

  // 게임/매치 전용
  const [location, setLocation] = useState('');
  const [matchDuration, setMatchDuration] = useState('');
  const [setScore, setSetScore] = useState('');

  // 대회/수상 전용
  const [awardsDetail, setAwardsDetail] = useState('');

  const [badgeTag, setBadgeTag] = useState('');
  const [badgeType, setBadgeType] = useState<'pro' | 'kit' | 'trophy' | 'regular'>('pro');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setCaption(post.caption || '');
      setImageUrl(post.imageUrl || '');
      setLocation(post.location || '');
      setMatchDuration(post.matchDuration || '');
      setSetScore(post.setScore || '');
      setAwardsDetail(post.awardsDetail || '');
      setBadgeTag(post.badgeTag || '');
      setBadgeType(post.badgeType || 'regular');
      setCategory(post.category || 'all');
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const compressedBase64 = await compressImageFile(file, {
          maxWidth: 1280,
          maxHeight: 1280,
          quality: 0.8,
          maxSizeBytes: 400 * 1024,
        });
        setImageUrl(compressedBase64);
      } catch (err) {
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
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !title.trim()) {
      alert('공지 제목 또는 내용을 작성해주세요.');
      return;
    }

    let calculatedBadgeTag = badgeTag;
    let calculatedBadgeType = badgeType;

    if (category === 'match') {
      calculatedBadgeTag = badgeTag || 'GAME / MATCH';
      calculatedBadgeType = 'pro';
    } else if (category === 'awards') {
      calculatedBadgeTag = awardsDetail ? `🏆 ${awardsDetail}` : 'CHAMPIONSHIP';
      calculatedBadgeType = 'trophy';
    } else {
      calculatedBadgeTag = 'NOTICE';
      calculatedBadgeType = 'regular';
    }

    onUpdatePost({
      ...post,
      title: title.trim() || undefined,
      caption: caption.trim(),
      imageUrl: imageUrl.trim() ? imageUrl.trim() : undefined,
      location: category === 'match' ? location.trim() || '클럽 코트' : 'MAKS 스쿼시 클럽',
      matchDuration: category === 'match' ? matchDuration.trim() || undefined : undefined,
      setScore: category === 'match' ? setScore.trim() || undefined : undefined,
      awardsDetail: category === 'awards' ? awardsDetail.trim() || undefined : undefined,
      badgeTag: calculatedBadgeTag || undefined,
      badgeType: calculatedBadgeType,
      category,
    });

    onClose();
  };

  const handleOpenDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    onDeletePost(post.id);
    setIsConfirmDeleteOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#161822] border border-white/[0.12] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-4 py-3 bg-[#11131a] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#f5c200]">✏️</span>
            <h2 className="font-chivo font-black text-base text-white">
              게시글 / 공지 수정
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpenDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="게시글 삭제"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[82vh] overflow-y-auto no-scrollbar">
          {/* Category Tabs: 일반 공지, 대회/수상, 게임/매치 */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1.5">
              공지 분류
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`py-2 text-xs font-chivo font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  category === 'all'
                    ? 'bg-[#f5c200] text-[#0f1118] border-[#f5c200] font-extrabold shadow-sm'
                    : 'bg-[#11131a] text-gray-400 border-white/10'
                }`}
              >
                <span>📢</span>
                <span>일반 공지</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('awards')}
                className={`py-2 text-xs font-chivo font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  category === 'awards'
                    ? 'bg-[#f5c200] text-[#0f1118] border-[#f5c200] font-extrabold shadow-sm'
                    : 'bg-[#11131a] text-gray-400 border-white/10'
                }`}
              >
                <span>🏆</span>
                <span>대회/수상</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('match')}
                className={`py-2 text-xs font-chivo font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  category === 'match'
                    ? 'bg-[#f5c200] text-[#0f1118] border-[#f5c200] font-extrabold shadow-sm'
                    : 'bg-[#11131a] text-gray-400 border-white/10'
                }`}
              >
                <span>🔥</span>
                <span>게임/매치</span>
              </button>
            </div>
          </div>

          {/* 1. 제목 입력 */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1 flex items-center justify-between">
              <span>제목</span>
              <span className="text-[10px] text-gray-400 font-normal">공지 요약 제목</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2024 클럽 리그전 일정 및 대진표 안내"
              className="w-full px-3 py-2.5 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c200]"
            />
          </div>

          {/* 2. 내용 입력 */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
              내용 입력 <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="스쿼시 경기 결과나 클럽 공지사항을 작성해주세요..."
              className="w-full px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200] leading-relaxed resize-none"
              required
            />
          </div>

          {/* 3. 파일선택 / 사진촬영 (선택 사항) */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1.5 flex items-center justify-between">
              <span>사진 첨부 (파일 선택 / 사진 촬영)</span>
              <span className="text-[10px] text-gray-400 font-normal">선택 사항</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-[#1e222d] hover:bg-[#282d3c] border border-white/10 hover:border-white/25 text-xs font-chivo font-bold text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FolderOpen size={16} className="text-[#f5c200]" />
                <span>파일 선택</span>
              </button>

              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleImageFileSelect}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-[#1e222d] hover:bg-[#282d3c] border border-white/10 hover:border-white/25 text-xs font-chivo font-bold text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera size={16} className="text-emerald-400" />
                <span>사진 촬영</span>
              </button>
            </div>

            {/* Preview or Empty state */}
            {isCompressing ? (
              <div className="aspect-video rounded-xl border border-dashed border-[#f5c200]/50 bg-[#11131a] flex flex-col items-center justify-center text-[#f5c200] gap-2 p-4 text-center animate-pulse">
                <Loader2 size={26} className="animate-spin text-[#f5c200]" />
                <span className="text-xs font-chivo font-bold">고화질 사진 최적화 중...</span>
              </div>
            ) : imageUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#f5c200]/40 bg-black/50 group">
                <img
                  src={imageUrl}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-500 text-white transition-colors cursor-pointer"
                  title="사진 삭제 (내용만 표시)"
                >
                  <Trash2 size={14} />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] text-emerald-400 font-chivo font-bold flex items-center gap-1">
                  <span>✓ 사진 첨부됨 (휴지통 클릭 시 사진 삭제)</span>
                </div>
              </div>
            ) : (
              <div className="py-2.5 px-3 rounded-xl border border-white/[0.08] bg-[#11131a]/60 text-center text-[11px] text-gray-400">
                사진이 첨부되지 않았습니다. (내용만 피드에 깔끔하게 표시됩니다)
              </div>
            )}
          </div>

          {/* Match Fields */}
          {category === 'match' && (
            <div className="space-y-3 p-3 rounded-xl bg-[#11131a]/80 border border-white/10 animate-in fade-in duration-150">
              <div className="text-[11px] font-chivo font-black text-[#f5c200] flex items-center gap-1.5">
                <span>🔥</span>
                <span>게임 / 매치 상세 정보</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                    🎾 경기 스코어
                  </label>
                  <input
                    type="text"
                    value={setScore}
                    onChange={(e) => setSetScore(e.target.value)}
                    placeholder="예: 3:1"
                    className="w-full px-3 py-2 rounded-lg bg-[#161822] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c200]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1 flex items-center gap-1">
                    <Clock size={12} className="text-[#f5c200]" />
                    <span>경기 시간</span>
                  </label>
                  <input
                    type="text"
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(e.target.value)}
                    placeholder="예: 50분"
                    className="w-full px-3 py-2 rounded-lg bg-[#161822] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c200]"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'awards' && (
            <div className="space-y-2 p-3 rounded-xl bg-[#11131a]/80 border border-white/10 animate-in fade-in duration-150">
              <div className="text-[11px] font-chivo font-black text-[#f5c200] flex items-center gap-1.5">
                <Trophy size={13} className="text-[#f5c200]" />
                <span>대회 / 수상 상세 정보</span>
              </div>
              <div>
                <input
                  type="text"
                  value={awardsDetail}
                  onChange={(e) => setAwardsDetail(e.target.value)}
                  placeholder="예: 청주스쿼시대회 S1 우승"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#161822] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c200]"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-[#11131a] hover:bg-[#1a1c24] border border-white/10 text-xs font-chivo font-bold text-gray-300 cursor-pointer transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 rounded-xl bg-[#f5c200] hover:bg-[#ffe299] text-[#0f1118] font-chivo font-black text-sm shadow-[0_4px_16px_rgba(245,194,0,0.3)] active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              수정 완료 저장
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title="게시글 삭제 확인"
          description="이 게시글을 정말로 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
        />
      </div>
    </div>
  );
};
