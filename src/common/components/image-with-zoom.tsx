import { useRef, useState } from "react";
import { Image, type ImageProps } from "./image";

type Props = {
  zoom?: number; // TODO: controlar o zoom com a rolagem do mouse seria interessante
} & ImageProps;

export const ImageWithZoom = ({ zoom = 3, ...imageProps }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [bgPosition, setBgPosition] = useState({ xPercent: 50, yPercent: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const containerBounds = containerRef.current?.getBoundingClientRect();
    if (!containerBounds) return;

    const mouseX =
      ((e.clientX - containerBounds.left) / containerBounds.width) * 100;
    const mouseY =
      ((e.clientY - containerBounds.top) / containerBounds.height) * 100;

    setBgPosition({ xPercent: mouseX, yPercent: mouseY });
  };

  return (
    <div
      ref={containerRef}
      className={`relative size-full overflow-hidden ${imageProps.className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      style={{
        backgroundImage: `url(${imageProps.src})`,
        backgroundSize: isHovering ? `${zoom * 100}%` : "cover",
        backgroundPosition: `${bgPosition.xPercent}% ${bgPosition.yPercent}%`,
        backgroundRepeat: "no-repeat",
        transition: "background-size 0.15s ease-out",
      }}
    >
      <Image
        src={imageProps.src}
        alt={imageProps.alt}
        className={`h-full w-full object-cover transition-opacity duration-150 ${
          isHovering ? "opacity-0" : "opacity-100"
        }`}
        draggable={false}
        fallbackSrc={imageProps.fallbackSrc}
      />
    </div>
  );
};
