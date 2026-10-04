import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="새 탭에서 원본 보기"
        >
          <ExternalLink size={18} />
        </a>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div
        className="max-w-3xl w-full max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
          referrerPolicy="no-referrer"
        />
        {title && (
          <p className="mt-3 text-sm font-medium text-gray-200 text-center max-w-xl">
            {title}
          </p>
        )}
      </div>
    </div>
  );
};
