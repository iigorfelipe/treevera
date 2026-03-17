import { useEffect, useRef, useState } from "react";
import { Image, type ImageProps } from "./image";

type Props = {
  zoom?: number;
  contain?: boolean;
} & ImageProps;

export const ImageWithZoom = ({
  zoom = 3,
  contain = false,
  ...imageProps
}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoveringModal, setIsHoveringModal] = useState(false);
  const [bgPosition, setBgPosition] = useState({ xPercent: 50, yPercent: 50 });

  const handleModalMouseMove = (e: React.MouseEvent) => {
    const bounds = modalRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setBgPosition({
      xPercent: ((e.clientX - bounds.left) / bounds.width) * 100,
      yPercent: ((e.clientY - bounds.top) / bounds.height) * 100,
    });
  };

  useEffect(() => {
    if (!isFullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  return (
    <>
      <div
        className={`relative size-full cursor-zoom-in overflow-hidden ${imageProps.className ?? ""}`}
        onClick={() => setIsFullscreen(true)}
      >
        <Image
          src={imageProps.src}
          alt={imageProps.alt}
          className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`}
          draggable={false}
          fallbackSrc={imageProps.fallbackSrc}
          onFallbackChange={imageProps.onFallbackChange}
        />
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-9999 flex cursor-zoom-out items-center justify-center bg-black/90"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            ref={modalRef}
            className="relative max-h-[95vh] max-w-[95vw] cursor-zoom-in overflow-hidden rounded-lg"
            onMouseEnter={() => setIsHoveringModal(true)}
            onMouseLeave={() => setIsHoveringModal(false)}
            onMouseMove={handleModalMouseMove}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage: `url(${imageProps.src})`,
              backgroundSize: isHoveringModal ? `${zoom * 100}%` : "contain",
              backgroundPosition: `${bgPosition.xPercent}% ${bgPosition.yPercent}%`,
              backgroundRepeat: "no-repeat",
              transition: "background-size 0.15s ease-out",
            }}
          >
            <Image
              src={imageProps.src}
              alt={imageProps.alt}
              className={`max-h-[95vh] max-w-[95vw] rounded-lg object-contain transition-opacity duration-150 ${
                isHoveringModal ? "opacity-0" : "opacity-100"
              }`}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
};
