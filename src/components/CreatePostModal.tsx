import React, { useState, useRef } from 'react';
import { X, Camera, FolderOpen, Trash2, Loader2 } from 'lucide-react';
import { SquashMember, FeedPost } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: SquashMember[];
  currentUser?: SquashMember | null;
  onAddPost: (
    post: Omit<FeedPost, 'id' | 'niceShots' | 'isNiceShotGiven' | 'isBookmarked' | 'comments' | 'commentsCount'>,
    sendPush?: boolean
  ) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUser,
  onAddPost,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);

  if (!isOpen) return null;

  const currentMember = currentUser || members[0];

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        // Automatically compress image client-side to be under 400KB so Firestore limit is never exceeded
        const compressedBase64 = await compressImageFile(file, {
          maxWidth: 1280,
          maxHeight: 1280,
          quality: 0.8,
          maxSizeBytes: 400 * 1024,
        });
        setImageUrl(compressedBase64);
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
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !title.trim()) {
      alert('공지 제목 또는 내용을 작성해주세요.');
      return;
    }

    // Only set imageUrl if user actually attached an image
    const finalImage = imageUrl.trim() ? imageUrl.trim() : undefined;

    onAddPost(
      {
        authorId: currentMember.id,
        authorName: currentMember.name,
        authorAvatar: currentMember.avatar,
        authorBadge: currentMember.role === 'captain' ? 'CAPTAIN' : currentMember.roleLabel,
        isCaptain: currentMember.role === 'captain',
        timeAgo: '방금 전',
        location: 'MAKS 스쿼시 클럽',
        badgeTag: 'NOTICE',
        badgeType: 'regular',
        title: title.trim() || undefined,
        imageUrl: finalImage,
        caption: caption.trim(),
        category: 'all',
      },
      true
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#161822] border border-white/[0.12] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-4 py-3 bg-[#11131a] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#f5c200]">📢</span>
            <h2 className="font-chivo font-black text-base text-white">
              공지글 작성
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[82vh] overflow-y-auto no-scrollbar">
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
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1 flex items-center justify-between">
              <span>
                내용 입력 <span className="text-red-400">*</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">필수</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="스쿼시 클럽 공지사항 및 회원 안내 내용을 입력해주세요..."
              rows={5}
              className="w-full px-3 py-2.5 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c200] resize-none leading-relaxed"
              required
            />
          </div>

          {/* 3. 파일선택 / 사진촬영 (선택 사항) */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1.5 flex items-center justify-between">
              <span>사진 첨부 (파일선택 / 사진촬영)</span>
              <span className="text-[10px] text-gray-400 font-normal">선택 사항 (없을 시 내용만 표시)</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {/* File Select Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-[#1e222d] hover:bg-[#282d3c] border border-white/10 hover:border-white/25 text-xs font-chivo font-bold text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FolderOpen size={16} className="text-[#f5c200]" />
                <span>파일선택</span>
              </button>

              {/* Camera Capture Input */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-[#1e222d] hover:bg-[#282d3c] border border-white/10 hover:border-white/25 text-xs font-chivo font-bold text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera size={16} className="text-emerald-400" />
                <span>사진촬영</span>
              </button>
            </div>

            {/* Image Preview or Informative empty state */}
            {isCompressing ? (
              <div className="aspect-video rounded-xl border border-dashed border-[#f5c200]/50 bg-[#11131a] flex flex-col items-center justify-center text-[#f5c200] gap-2 p-4 text-center animate-pulse">
                <Loader2 size={26} className="animate-spin text-[#f5c200]" />
                <span className="text-xs font-chivo font-bold">고화질 사진 최적화 및 용량 압축 중...</span>
              </div>
            ) : imageUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#f5c200]/40 bg-black/50 group">
                <img
                  src={imageUrl}
                  alt="선택된 사진"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
                  title="사진 삭제 (내용만 등록)"
                >
                  <Trash2 size={14} />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] text-emerald-400 font-chivo font-bold flex items-center gap-1">
                  <span>✓ 사진 첨부됨 (휴지통 클릭 시 내용만 등록)</span>
                </div>
              </div>
            ) : (
              <div className="py-2.5 px-3 rounded-xl border border-white/[0.08] bg-[#11131a]/60 text-center text-[11px] text-gray-400">
                사진을 첨부하지 않으면 <span className="text-white font-bold">제목과 내용만 깔끔하게 등록</span>됩니다.
              </div>
            )}
          </div>

          {/* Bottom Buttons: 취소 & 등록 */}
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
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
