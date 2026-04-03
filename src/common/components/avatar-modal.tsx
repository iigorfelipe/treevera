import { useEffect } from "react";

type AvatarModalProps = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export const AvatarModal = ({ src, alt, onClose }: AvatarModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="size-56 rounded-full object-cover shadow-2xl sm:size-72"
        draggable={false}
      />
    </div>
  );
};
