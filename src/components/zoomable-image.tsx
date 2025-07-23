import { useState } from "react";
import { ImageModal } from "./image-modal";

type ZoomableImageProps = {
  src: string;
  alt?: string;
};

export const ZoomableImage = ({ src, alt }: ZoomableImageProps) => {
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomVisible, setZoomVisible] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <>
      <div
        className="relative hidden cursor-zoom-in overflow-hidden md:block dark:border-zinc-700"
        onMouseEnter={() => setZoomVisible(true)}
        onMouseLeave={() => setZoomVisible(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setModalOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] w-auto object-contain transition duration-200"
        />
        {isZoomVisible && (
          <div
            className="pointer-events-none absolute inset-0 z-10 scale-150 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: "200%",
            }}
          />
        )}
      </div>

      {/* Mobile view (sem zoom, mas com clique para expandir) */}
      <div className="block md:hidden" onClick={() => setModalOpen(true)}>
        <img
          src={src}
          alt={alt}
          className="h-72 w-full cursor-zoom-in object-contain"
        />
      </div>

      {isModalOpen && (
        <ImageModal src={src} alt={alt} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};
