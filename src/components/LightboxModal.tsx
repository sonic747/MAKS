import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';

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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // Pinch-to-zoom and drag tracking refs
  const initialDistRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(1);
  const lastTouchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const lastTapRef = useRef<number>(0);
  const isMouseDownRef = useRef<boolean>(false);
  const mouseStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset zoom and position when image changes or modal opens
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Helper to calculate distance between two touch points
  const getDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  };

  // Touch event handlers for smartphone pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 fingers: pinch start
      setIsInteracting(true);
      initialDistRef.current = getDistance(e.touches[0], e.touches[1]);
      initialScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      // 1 finger: check for double tap or pan
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double-tap: toggle between 1x and 2.5x
        if (scale > 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          setScale(2.5);
        }
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      if (scale > 1) {
        isDraggingRef.current = true;
        setIsInteracting(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistRef.current > 0) {
      // Pinch zooming
      e.preventDefault();
      const currentDist = getDistance(e.touches[0], e.touches[1]);
      const factor = currentDist / initialDistRef.current;
      const newScale = Math.min(Math.max(1, initialScaleRef.current * factor), 5);
      setScale(newScale);

      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDraggingRef.current && scale > 1) {
      // Panning while zoomed
      e.preventDefault();
      const dx = e.touches[0].clientX - lastTouchRef.current.x;
      const dy = e.touches[0].clientY - lastTouchRef.current.y;
      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialDistRef.current = 0;
    }
    if (e.touches.length === 0) {
      isDraggingRef.current = false;
      setIsInteracting(false);
      if (scale <= 1) {
        setPosition({ x: 0, y: 0 });
        setScale(1);
      }
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prev) => {
      const next = Math.min(Math.max(1, prev + zoomDelta), 5);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Mouse drag when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      isMouseDownRef.current = true;
      setIsInteracting(true);
      mouseStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMouseDownRef.current && scale > 1) {
      const dx = e.clientX - mouseStartRef.current.x;
      const dy = e.clientY - mouseStartRef.current.y;
      mouseStartRef.current = { x: e.clientX, y: e.clientY };
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setIsInteracting(false);
  };

  // Button Zoom Helpers
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 5));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-2 select-none overflow-hidden"
      onClick={(e) => {
        // If user clicks on backdrop and not zoomed, close
        if (scale === 1 && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Top Title Bar - clean and subtle, away from mobile clock/status bar */}
      <div className="w-full pt-2 sm:pt-4 px-4 text-center z-10 pointer-events-none">
        {title ? (
          <p className="text-xs sm:text-sm font-chivo font-bold text-gray-200 truncate max-w-lg mx-auto bg-black/40 py-1 px-3 rounded-full backdrop-blur-sm border border-white/10 inline-block pointer-events-auto">
            {title}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* Main Image Viewport with Pinch-to-Zoom */}
      <div
        className="flex-1 w-full flex items-center justify-center overflow-hidden touch-none relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: scale > 1 ? (isInteracting ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={imageUrl}
          alt={title || '확대 사진'}
          className="max-w-[95vw] max-h-[72vh] object-contain rounded-xl shadow-2xl select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isInteracting ? 'none' : 'transform 0.2s ease-out',
          }}
          draggable={false}
          referrerPolicy="no-referrer"
        />

        {/* Pinch / Double-tap zoom guide (fades out when zoomed) */}
        {scale === 1 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-60">
            <span className="text-[10px] text-gray-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 font-chivo">
              손가락으로 벌려 확대(핀치줌) 또는 더블 탭
            </span>
          </div>
        )}
      </div>

      {/* BOTTOM CENTER CONTROL DOCK & BIG CLOSE BUTTON */}
      {/* Positioned safely at the bottom center to avoid smartphone clock/notch clashes */}
      <div
        className="w-full pb-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] pt-2 flex flex-col items-center gap-2 z-40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zoom Controls toolbar */}
        <div className="flex items-center gap-1.5 bg-[#161822]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-xl">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="축소"
          >
            <ZoomOut size={16} />
          </button>

          <button
            type="button"
            onClick={resetZoom}
            className="px-2 py-0.5 rounded text-xs font-chivo font-black text-[#f5c200] hover:bg-white/10 transition-all cursor-pointer"
            title="원래 크기(100%)로 복원"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 5}
            className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="확대"
          >
            <ZoomIn size={16} />
          </button>

          <span className="w-px h-4 bg-white/15 mx-0.5" />

          {/* External Link button */}
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="새 탭에서 원본 보기"
          >
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Primary Close Button (X) - Bottom Center, Large & Highly Touchable */}
        <button
          type="button"
          onClick={onClose}
          className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-chivo font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(220,38,38,0.5)] border border-white/20 transition-all cursor-pointer"
          title="사진 보기 닫기"
        >
          <X size={20} strokeWidth={2.8} />
          <span>닫기 (X)</span>
        </button>
      </div>
    </div>
  );
};
