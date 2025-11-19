import { useEffect } from "react";
import { ImageWithZoom } from "./image-with-zoom";

type ImageModalProps = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export const ImageModal = ({ src, alt, onClose }: ImageModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[100%] max-w-[100%] overflow-hidden shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <ImageWithZoom src={src} alt={alt} />
      </div>
    </div>
  );
};
