import React, { useState } from 'react';
import { X, ThumbsUp } from 'lucide-react';
import { SquashMember } from '../types';

interface AddCheerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember: SquashMember;
  allMembers: SquashMember[];
  currentUser?: SquashMember | null;
  onAddCheer: (targetMemberId: string, authorName: string, text: string) => void;
}

export const AddCheerModal: React.FC<AddCheerModalProps> = ({
  isOpen,
  onClose,
  targetMember,
  currentUser,
  onAddCheer,
}) => {
  const [authorName, setAuthorName] = useState(currentUser?.name || '익명');
  const [cheerText, setCheerText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cheerText.trim()) return;

    onAddCheer(targetMember.id, authorName.trim() || '익명', cheerText.trim());
    setCheerText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#161822] border border-white/[0.12] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in duration-200">
        <div className="px-4 py-3 bg-[#11131a] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp size={16} className="text-[#f5c200]" />
            <h3 className="font-chivo font-black text-sm text-white">
              {targetMember.name} 님에게 동료 응원 남기기
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* 작성자 이름 & 등록 버튼 (작성자 이름 옆으로 이동) */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
              작성자 이름
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="작성자 이름 입력"
                className="flex-1 px-3 py-2.5 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-[#f5c200] hover:bg-[#ffe299] text-[#0f1118] font-chivo font-black text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                등록
              </button>
            </div>
          </div>

          {/* 응원 메시지 */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
              응원 메시지
            </label>
            <textarea
              rows={4}
              value={cheerText}
              onChange={(e) => setCheerText(e.target.value)}
              placeholder="동료에게 힘이 되는 응원과 찬사를 전해주세요!"
              className="w-full px-3 py-2.5 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#f5c200] leading-relaxed resize-none"
              required
            />
          </div>
        </form>
      </div>
    </div>
  );
};
