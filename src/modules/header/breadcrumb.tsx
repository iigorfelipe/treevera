import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { useGetListDetail } from "@/hooks/queries/useGetLists";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import type { TFunction } from "i18next";

type CrumbLink = {
  to: string;
  href: string;
  params?: Record<string, string>;
};

type Crumb = {
  key: string;
  label: string;
  link?: CrumbLink;
};

type Shape =
  | { kind: "none" }
  | { kind: "publicLists" }
  | { kind: "about" }
  | { kind: "settings" }
  | { kind: "search" }
  | { kind: "tree" }
  | { kind: "challenges"; variant?: "daily" | "random" | "custom" }
  | { kind: "profile"; username: string }
  | { kind: "userLists"; username: string }
  | { kind: "userLikedLists"; username: string }
  | { kind: "userSpeciesGallery"; username: string }
  | { kind: "listDetail"; username: string; listSlug: string }
  | { kind: "listLikes"; username: string; listSlug: string }
  | {
      kind: "specieDetail";
      specieKey: string;
      sub?: "likes" | "lists";
    };

const RESERVED_ROOTS = new Set([
  "lists",
  "about",
  "settings",
  "search",
  "tree",
  "challenges",
  "specie-detail",
  "login",
  "auth-callback",
]);

function analyzePath(path: string): Shape {
  const segs = path.split("/").filter(Boolean);
  if (segs.length === 0) return { kind: "none" };

  const [first, second, third, fourth] = segs;

  if (first === "lists") return { kind: "publicLists" };
  if (first === "about") return { kind: "about" };
  if (first === "settings") return { kind: "settings" };
  if (first === "search") return { kind: "search" };
  if (first === "tree") return { kind: "tree" };

  if (first === "challenges") {
    const variant =
      second === "daily" || second === "random" || second === "custom"
        ? second
        : undefined;
    return { kind: "challenges", variant };
  }

  if (first === "specie-detail") {
    if (!second) return { kind: "none" };
    const sub = third === "likes" || third === "lists" ? third : undefined;
    return { kind: "specieDetail", specieKey: second, sub };
  }

  if (RESERVED_ROOTS.has(first)) return { kind: "none" };

  const username = first;
  if (segs.length === 1) return { kind: "profile", username };

  if (second === "species-gallery")
    return { kind: "userSpeciesGallery", username };
  if (second === "liked-lists") return { kind: "userLikedLists", username };

  if (second === "lists") {
    if (!third) return { kind: "userLists", username };
    if (fourth === "likes")
      return { kind: "listLikes", username, listSlug: third };
    return { kind: "listDetail", username, listSlug: third };
  }

  return { kind: "none" };
}

function sanitizeFrom(from: string | undefined): string | undefined {
  if (!from) return undefined;
  if (!from.startsWith("/")) return undefined;
  if (from.startsWith("//")) return undefined;
  return from;
}

function profileCrumb(username: string): Crumb {
  return {
    key: `profile-${username}`,
    label: `@${username}`,
    link: {
      to: "/$username",
      href: `/${username}`,
      params: { username },
    },
  };
}

function userListsCrumb(username: string, t: TFunction): Crumb {
  return {
    key: `user-lists-${username}`,
    label: t("breadcrumb.userLists"),
    link: {
      to: "/$username/lists",
      href: `/${username}/lists`,
      params: { username },
    },
  };
}

function basicCrumbs(
  shape: Shape,
  listTitle: string | undefined,
  t: TFunction,
): Crumb[] {
  switch (shape.kind) {
    case "none":
      return [];
    case "publicLists":
      return [
        {
          key: "public-lists",
          label: t("breadcrumb.publicLists"),
          link: { to: "/lists", href: "/lists" },
        },
      ];
    case "about":
      return [
        {
          key: "about",
          label: t("nav.about"),
          link: { to: "/about", href: "/about" },
        },
      ];
    case "settings":
      return [{ key: "settings", label: t("nav.settings") }];
    case "search":
      return [{ key: "search", label: t("breadcrumb.search") }];
    case "tree":
      return [
        {
          key: "tree",
          label: t("breadcrumb.tree"),
          link: { to: "/tree", href: "/tree" },
        },
      ];
    case "challenges": {
      const base: Crumb = {
        key: "challenges",
        label: t("nav.challenges"),
        link: { to: "/challenges", href: "/challenges" },
      };
      if (!shape.variant) return [base];
      return [
        base,
        {
          key: `challenge-${shape.variant}`,
          label: t(`breadcrumb.${shape.variant}`),
        },
      ];
    }
    case "profile":
      return [profileCrumb(shape.username)];
    case "userLists":
      return [profileCrumb(shape.username), userListsCrumb(shape.username, t)];
    case "userLikedLists":
      return [
        profileCrumb(shape.username),
        {
          key: "user-liked-lists",
          label: t("breadcrumb.likedLists"),
        },
      ];
    case "userSpeciesGallery":
      return [
        profileCrumb(shape.username),
        {
          key: "user-gallery",
          label: t("breadcrumb.speciesGallery"),
        },
      ];
    case "listDetail":
      return [
        profileCrumb(shape.username),
        userListsCrumb(shape.username, t),
        {
          key: `list-${shape.listSlug}`,
          label: listTitle ?? shape.listSlug,
          link: {
            to: "/$username/lists/$listSlug",
            href: `/${shape.username}/lists/${shape.listSlug}`,
            params: { username: shape.username, listSlug: shape.listSlug },
          },
        },
      ];
    case "listLikes":
      return [
        profileCrumb(shape.username),
        userListsCrumb(shape.username, t),
        {
          key: `list-${shape.listSlug}`,
          label: listTitle ?? shape.listSlug,
          link: {
            to: "/$username/lists/$listSlug",
            href: `/${shape.username}/lists/${shape.listSlug}`,
            params: { username: shape.username, listSlug: shape.listSlug },
          },
        },
        { key: "list-likes", label: t("breadcrumb.likes") },
      ];
    case "specieDetail":
      return [];
  }
}

type BuildInput = {
  mainShape: Shape;
  fromShape: Shape;
  mainListTitle: string | undefined;
  fromListTitle: string | undefined;
  specieName: string | undefined;
  t: TFunction;
};

function buildCrumbs(input: BuildInput): Crumb[] {
  const { mainShape, fromShape, mainListTitle, fromListTitle, specieName, t } =
    input;

  if (mainShape.kind !== "specieDetail") {
    return basicCrumbs(mainShape, mainListTitle, t);
  }

  const prefix =
    fromShape.kind === "none" ? [] : basicCrumbs(fromShape, fromListTitle, t);

  const specieLabel = specieName ?? t("breadcrumb.species");
  const specieCrumb: Crumb = {
    key: `specie-${mainShape.specieKey}`,
    label: specieLabel,
    link: {
      to: "/specie-detail/$specieKey",
      href: `/specie-detail/${mainShape.specieKey}`,
      params: { specieKey: mainShape.specieKey },
    },
  };

  if (mainShape.sub === "likes") {
    return [
      ...prefix,
      specieCrumb,
      { key: "specie-likes", label: t("breadcrumb.likes") },
    ];
  }

  if (mainShape.sub === "lists") {
    return [
      ...prefix,
      specieCrumb,
      { key: "specie-lists", label: t("breadcrumb.listsWith") },
    ];
  }

  if (prefix.length === 0) return [specieCrumb];
  return [...prefix, specieCrumb];
}

export const Breadcrumb = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const rawFrom = (location.search as { from?: unknown } | undefined)?.from;
  const from = sanitizeFrom(typeof rawFrom === "string" ? rawFrom : undefined);

  const mainShape = analyzePath(pathname);
  const fromShape: Shape = from ? analyzePath(from) : { kind: "none" };

  const mainListUser =
    mainShape.kind === "listDetail" || mainShape.kind === "listLikes"
      ? mainShape.username
      : undefined;
  const mainListSlug =
    mainShape.kind === "listDetail" || mainShape.kind === "listLikes"
      ? mainShape.listSlug
      : undefined;
  const { data: mainList } = useGetListDetail(mainListUser, mainListSlug);

  const fromListUser =
    fromShape.kind === "listDetail" || fromShape.kind === "listLikes"
      ? fromShape.username
      : undefined;
  const fromListSlug =
    fromShape.kind === "listDetail" || fromShape.kind === "listLikes"
      ? fromShape.listSlug
      : undefined;
  const { data: fromList } = useGetListDetail(fromListUser, fromListSlug);

  const specieKeyNum =
    mainShape.kind === "specieDetail" ? Number(mainShape.specieKey) : 0;
  const hasValidSpecieKey =
    mainShape.kind === "specieDetail" &&
    Number.isFinite(specieKeyNum) &&
    specieKeyNum > 0;
  const { data: specieData } = useGetSpecieDetail({
    specieKey: specieKeyNum,
    enabled: hasValidSpecieKey,
  });
  const specieName = specieData?.canonicalName ?? specieData?.scientificName;

  const crumbs = buildCrumbs({
    mainShape,
    fromShape,
    mainListTitle: mainList?.title,
    fromListTitle: fromList?.title,
    specieName: specieName ?? undefined,
    t,
  });

  if (crumbs.length === 0) return null;

  const lastIndex = crumbs.length - 1;

  const handleClick = (e: React.MouseEvent, link: CrumbLink) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    void navigate({
      to: link.to as never,
      params: link.params as never,
    });
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden min-w-0 flex-1 md:flex md:justify-center"
    >
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {crumbs.map((c, i) => {
          const isLast = i === lastIndex;
          return (
            <li key={c.key} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className="text-muted-foreground size-3.5 shrink-0"
                  aria-hidden="true"
                />
              )}
              {c.link && !isLast ? (
                <a
                  href={c.link.href}
                  onClick={(e) => handleClick(e, c.link!)}
                  className="text-muted-foreground hover:text-foreground max-w-48 truncate transition-colors"
                  title={c.label}
                >
                  {c.label}
                </a>
              ) : (
                <span
                  className={
                    isLast
                      ? "text-foreground max-w-[16rem] truncate font-medium"
                      : "text-muted-foreground max-w-48 truncate"
                  }
                  title={c.label}
                  aria-current={isLast ? "page" : undefined}
                >
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
