import { useEffect } from "react";

const BASE_TITLE = "Treevera";

export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute(
        "href",
        `${window.location.origin}${window.location.pathname}`,
      );
    }

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description]);
}
