const base = import.meta.env.BASE_URL ?? "/";

export function getAppUrl(path = ""): string {
  const origin = window.location.origin;
  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}${normalizedPath}`;
}

export function getBasePath(): string {
  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
  return normalized || "/";
}
