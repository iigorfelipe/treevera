import alvoVideo from "@/assets/videos/alvo.webm";
import alvoWhiteVideo from "@/assets/videos/alvo-white.webm";
import { useTheme } from "@/context/theme";

type TargetVideoProps = {
  className?: string;
};

export const TargetVideo = ({ className }: TargetVideoProps) => {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === "dark" ? alvoWhiteVideo : alvoVideo;

  return (
    <video
      key={src}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      disablePictureInPicture
    >
      <source src={src} type="video/webm" />
    </video>
  );
};
