import { router } from "@/routes";

export const getSectionPathname = (
  pathname: string,
  section: "tree" | "challenges",
) => {
  const sectionPath = `/${section}`;
  const baseSectionPath = `${router.basepath}${sectionPath}`;

  if (pathname === sectionPath || pathname.startsWith(`${sectionPath}/`)) {
    return pathname;
  }

  if (
    pathname === baseSectionPath ||
    pathname.startsWith(`${baseSectionPath}/`)
  ) {
    return pathname.slice(router.basepath.length) || "/";
  }

  return pathname;
};
