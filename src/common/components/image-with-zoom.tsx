import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Image, type ImageProps } from "./image";

type Props = {
  zoom?: number;
  contain?: boolean;
  zoomSrc?: string;
} & ImageProps;

export const ImageWithZoom = ({
  zoom = 3,
  contain = false,
  zoomSrc,
  ...imageProps
}: Props) => {
  const fullResSrc = zoomSrc ?? imageProps.src;
  const modalRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [bgPosition, setBgPosition] = useState({ xPercent: 50, yPercent: 50 });

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isZoomActive) return;
    const bounds = modalRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setBgPosition({
      xPercent: ((e.clientX - bounds.left) / bounds.width) * 100,
      yPercent: ((e.clientY - bounds.top) / bounds.height) * 100,
    });
  };

  const openFullscreen = () => {
    setIsZoomActive(false);
    setBgPosition({ xPercent: 50, yPercent: 50 });
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setIsZoomActive(false);
  };

  const toggleZoom = () => {
    setIsZoomActive((active) => !active);
  };

  useEffect(() => {
    if (!isFullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  return (
    <>
      <div
        className={`relative size-full cursor-zoom-in overflow-hidden ${imageProps.className ?? ""}`}
        onClick={openFullscreen}
      >
        <Image
          src={imageProps.src}
          alt={imageProps.alt}
          className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`}
          draggable={false}
          fallbackSrc={imageProps.fallbackSrc}
          onFallbackChange={imageProps.onFallbackChange}
          onError={imageProps.onError}
          onLoad={imageProps.onLoad}
        />
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-9999 flex cursor-zoom-out items-center justify-center bg-black/90"
          onClick={closeFullscreen}
        >
          <div
            ref={modalRef}
            className={`relative max-h-[95vh] max-w-[95vw] overflow-hidden rounded-lg ${
              isZoomActive ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onMouseMove={handleModalMouseMove}
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
            style={{
              backgroundImage: `url(${fullResSrc})`,
              backgroundSize: isZoomActive ? `${zoom * 100}%` : "contain",
              backgroundPosition: `${bgPosition.xPercent}% ${bgPosition.yPercent}%`,
              backgroundRepeat: "no-repeat",
              transition: "background-size 0.15s ease-out",
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
              aria-label={isZoomActive ? "Desativar zoom" : "Ativar zoom"}
              title={isZoomActive ? "Desativar zoom" : "Ativar zoom"}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/55 p-2 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/75"
            >
              {isZoomActive ? (
                <ZoomOut className="size-5" />
              ) : (
                <ZoomIn className="size-5" />
              )}
            </button>

            <Image
              src={fullResSrc}
              alt={imageProps.alt}
              className={`max-h-[95vh] max-w-[95vw] rounded-lg object-contain transition-opacity duration-150 ${
                isZoomActive ? "opacity-0" : "opacity-100"
              }`}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
};
