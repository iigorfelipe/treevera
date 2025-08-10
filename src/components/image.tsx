import type { ImgHTMLAttributes } from "react";

export const Image = ({
  src,
  alt,
  loading = "lazy",
  decoding = "async",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={src} alt={alt} loading={loading} decoding={decoding} {...props} />
);
