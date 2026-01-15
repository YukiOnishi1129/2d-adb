"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryModalProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function ImageGalleryModal({
  images,
  initialIndex,
  isOpen,
  onClose,
  title,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // initialIndexが変わったら更新
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // キーボード操作
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    },
    [isOpen, onClose, goToPrev, goToNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // スクロール禁止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // スワイプ操作
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // 左スワイプ → 次へ
        goToNext();
      } else {
        // 右スワイプ → 前へ
        goToPrev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* 閉じるボタン */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="閉じる"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* カウンター */}
      <div className="absolute top-4 left-4 text-white/80 text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* 前へボタン */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="absolute left-3 sm:left-6 z-10 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 border border-white/30 shadow-lg transition-all active:scale-95"
          aria-label="前の画像"
        >
          <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
        </button>
      )}

      {/* 画像 */}
      <div
        className="max-w-[90vw] max-h-[70vh] sm:max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={title ? `${title} ${currentIndex + 1}` : `画像 ${currentIndex + 1}`}
          className="max-w-full max-h-[70vh] sm:max-h-[85vh] object-contain select-none"
          draggable={false}
        />
      </div>

      {/* 次へボタン */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-3 sm:right-6 z-10 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 border border-white/30 shadow-lg transition-all active:scale-95"
          aria-label="次の画像"
        >
          <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
        </button>
      )}

      {/* サムネイル一覧 */}
      {images.length > 1 && (
        <div className="absolute bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 max-w-[95vw] sm:max-w-[90vw] overflow-x-auto p-2 bg-black/40 rounded-lg">
          {images.map((img, idx) => (
            <button
              type="button"
              key={img}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? "border-white opacity-100 scale-110"
                  : "border-transparent opacity-50 hover:opacity-75"
              }`}
            >
              <img
                src={img}
                alt={`サムネイル ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
