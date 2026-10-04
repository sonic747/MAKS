import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '게시물 삭제',
  description = '정말로 이 게시물을 삭제하시겠습니까? 삭제된 게시물은 복구할 수 없습니다.',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[#161822] border border-red-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-red-950/40 border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <h3 className="font-chivo font-black text-white text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 leading-relaxed font-chivo">
              {description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-[#11131a] border-t border-white/[0.06] flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#1a1c26] hover:bg-[#222533] text-gray-300 font-chivo font-bold text-xs transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-chivo font-black text-xs shadow-lg shadow-red-900/30 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>삭제 확인</span>
          </button>
        </div>
      </div>
    </div>
  );
};
