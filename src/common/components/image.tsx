import { useState, useEffect } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  onFallbackChange?: (isFallback: boolean) => void;
};

export const Image = ({
  src,
  alt,
  fallbackSrc = "",
  loading = "lazy",
  decoding = "async",
  onFallbackChange,
  ...props
}: Props) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const isFallback = imgSrc === fallbackSrc;

  useEffect(() => {
    onFallbackChange?.(isFallback);
  }, [isFallback, onFallbackChange]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={() => {
        if (fallbackSrc && !isFallback) {
          setImgSrc(fallbackSrc);
        }
      }}
      {...props}
    />
  );
};
