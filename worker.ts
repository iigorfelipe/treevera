const CRAWLERS =
  /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|whatsapp|telegram|discord/i;

const SITEMAP_CACHE_TTL_SECONDS = 3600;
const SITEMAP_CACHE_VERSION = "species-slugs-v1";

interface Env {
  ASSETS?: { fetch(request: Request): Promise<Response> };
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SITE_URL: string;
}

interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

interface SpeciesCacheRow {
  scientific_name: string;
  image_url: string | null;
  has_image: boolean;
  description_pt: string | null;
  family: string | null;
}

interface PublicProfile {
  username: string;
  name: string;
  avatar_url: string | null;
}

interface ListDetail {
  title: string;
  description: string | null;
  cover_image_url: string | null;
  user_username: string;
  species_count: number;
}

type Locale = "pt" | "en" | "es";
type StructuredData = Record<string, unknown> | Record<string, unknown>[];

type MetaInfo = {
  title: string;
  description: string;
  image: string;
  canonicalPath?: string;
  structuredData?: StructuredData;
} | null;

function slugifyPathSegment(
  value: string | null | undefined,
  fallback: string,
): string {
  const slug = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function slugifyScientificName(value: string | null | undefined): string {
  return slugifyPathSegment(value, "species");
}

function getSpeciesPath(scientificName: string | null | undefined, key: string) {
  return `/species/${slugifyScientificName(scientificName)}-${key}`;
}

function getListPath(username: string, title: string | null | undefined) {
  return `/${username}/lists/${slugifyPathSegment(title, "list")}`;
}

function getGbifKeyFromSpeciesPath(pathname: string): string | null {
  const speciesMatch = pathname.match(/^\/species\/[a-z0-9-]+-(\d+)$/);
  if (speciesMatch) return speciesMatch[1];

  const legacyMatch = pathname.match(/^\/specie-detail\/(\d+)$/);
  return legacyMatch?.[1] ?? null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeJsonForHtml(data: StructuredData): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function absoluteUrl(siteUrl: string, pathname: string): string {
  return `${siteUrl}${pathname}`;
}

function detectLocale(header: string | null): Locale {
  const value = (header ?? "").toLowerCase();
  if (value.includes("es")) return "es";
  if (value.includes("en")) return "en";
  return "pt";
}

function getOgLocale(locale: Locale): string {
  switch (locale) {
    case "en":
      return "en_US";
    case "es":
      return "es_ES";
    default:
      return "pt_BR";
  }
}

function getSiteText(locale: Locale) {
  switch (locale) {
    case "en":
      return {
        homeTitle:
          "Treevera | Explore the Tree of Life with Interactive Taxonomy",
        homeDescription:
          "Discover thousands of species through an Interactive Taxonomic Tree. Explore details, curiosities, conservation status, and challenges across the kingdoms of life.",
        websiteDescription:
          "Interactive platform for exploring the tree of life and the taxonomic classification of species.",
        speciesFallback: "Species on Treevera",
        familyLabel: "Family",
        profileDescription: (name: string) => `${name}'s profile on Treevera`,
        listWithCount: (count: number) => `List with ${count} species`,
        aboutTitle: "About | Treevera",
        aboutDescription:
          "Treevera organizes species into an interactive taxonomic tree with photos, descriptions, occurrence maps, conservation status, challenges, and lists.",
        listsTitle: "Lists | Treevera",
        listsDescription:
          "Explore public species lists created by the Treevera community.",
        challengesTitle: "Challenges | Treevera",
        challengesDescription:
          "Play Treevera taxonomy challenges and test your knowledge of species classification.",
        treeTitle: "Taxonomic Tree | Treevera",
        treeDescription:
          "Browse the interactive taxonomic tree and discover species across the kingdoms of life.",
      };
    case "es":
      return {
        homeTitle:
          "Treevera | Explora el Árbol de la Vida con Taxonomía Interactiva",
        homeDescription:
          "Descubre miles de especies a través de un Árbol Taxonómico Interactivo. Explora detalles, curiosidades, estado de conservación y desafíos sobre los reinos de la vida.",
        websiteDescription:
          "Plataforma interactiva para explorar el árbol de la vida y la clasificación taxonómica de las especies.",
        speciesFallback: "Especie en Treevera",
        familyLabel: "Familia",
        profileDescription: (name: string) => `Perfil de ${name} en Treevera`,
        listWithCount: (count: number) => `Lista con ${count} especies`,
        aboutTitle: "Acerca de | Treevera",
        aboutDescription:
          "Treevera organiza las especies en un árbol taxonómico interactivo con fotos, descripciones, mapas de ocurrencia, estado de conservación, desafíos y listas.",
        listsTitle: "Listas | Treevera",
        listsDescription:
          "Explora listas públicas de especies creadas por la comunidad de Treevera.",
        challengesTitle: "Desafíos | Treevera",
        challengesDescription:
          "Juega los desafíos taxonómicos de Treevera y pon a prueba tu conocimiento sobre clasificación de especies.",
        treeTitle: "Árbol Taxonómico | Treevera",
        treeDescription:
          "Explora el árbol taxonómico interactivo y descubre especies de los reinos de la vida.",
      };
    default:
      return {
        homeTitle:
          "Treevera | Explore a Árvore da Vida com Taxonomia Interativa",
        homeDescription:
          "Descubra milhares de espécies através de uma Árvore Taxonômica Interativa. Visualize detalhes, curiosidades, status de conservação e desafios sobre os reinos da vida.",
        websiteDescription:
          "Plataforma interativa para explorar a árvore da vida e a classificação taxonômica das espécies.",
        speciesFallback: "Espécie na Treevera",
        familyLabel: "Família",
        profileDescription: (name: string) => `Perfil de ${name} na Treevera`,
        listWithCount: (count: number) => `Lista com ${count} espécies`,
        aboutTitle: "Sobre | Treevera",
        aboutDescription:
          "O Treevera organiza espécies em uma árvore taxonômica interativa com fotos, descrições, mapas de ocorrência, status de conservação, desafios e listas.",
        listsTitle: "Listas | Treevera",
        listsDescription:
          "Explore listas públicas de espécies criadas pela comunidade do Treevera.",
        challengesTitle: "Desafios | Treevera",
        challengesDescription:
          "Jogue os desafios taxonômicos do Treevera e teste seus conhecimentos sobre classificação das espécies.",
        treeTitle: "Árvore Taxonômica | Treevera",
        treeDescription:
          "Explore a árvore taxonômica interativa e descubra espécies dos reinos da vida.",
      };
  }
}

function buildSitemapXml(urls: { loc: string; priority: string }[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of urls) {
    xml += `  <url>\n    <loc>${escapeHtml(u.loc)}</loc>\n    <priority>${u.priority}</priority>\n  </url>\n`;
  }
  xml += `</urlset>`;
  return xml;
}

async function generateDynamicSitemap(env: Env): Promise<string> {
  const siteUrl = env.SITE_URL || "https://treevera.org";

  const staticUrls = [
    { loc: `${siteUrl}/`, priority: "1.0" },
    { loc: `${siteUrl}/tree`, priority: "0.9" },
    { loc: `${siteUrl}/lists`, priority: "0.8" },
    { loc: `${siteUrl}/challenges`, priority: "0.8" },
    { loc: `${siteUrl}/challenges/daily`, priority: "0.7" },
    { loc: `${siteUrl}/challenges/random`, priority: "0.7" },
    { loc: `${siteUrl}/challenges/custom`, priority: "0.6" },
    { loc: `${siteUrl}/about`, priority: "0.6" },
  ];

  const dynamicUrls: { loc: string; priority: string }[] = [];

  try {
    const pageSize = 1000;
    for (let offset = 0; ; offset += pageSize) {
      const speciesRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/species_data_cache?select=gbif_key,scientific_name&or=(has_image.eq.true,description_pt.not.is.null)&order=gbif_key&limit=${pageSize}&offset=${offset}`,
        {
          headers: {
            apikey: env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
            Accept: "application/json",
          },
        },
      );
      if (!speciesRes.ok) break;

      const species = (await speciesRes.json()) as {
        gbif_key: number;
        scientific_name: string | null;
      }[];
      for (const s of species) {
        dynamicUrls.push({
          loc: `${siteUrl}${getSpeciesPath(s.scientific_name, String(s.gbif_key))}`,
          priority: "0.7",
        });
      }

      if (species.length < pageSize) break;
    }
  } catch {
    //
  }

  try {
    const listsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/get_public_lists`,
      {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          p_limit: 1000,
          p_offset: 0,
          p_sort: "popular",
          p_search: null,
        }),
      },
    );
    if (listsRes.ok) {
      const lists = (await listsRes.json()) as {
        user_username: string;
        title: string;
        slug: string;
      }[];
      for (const l of lists) {
        dynamicUrls.push({
          loc: `${siteUrl}${getListPath(l.user_username, l.title)}`,
          priority: "0.6",
        });
      }
    }
  } catch {
    //
  }

  try {
    const profilesRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?select=username&username=not.is.null&limit=5000`,
      {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
      },
    );
    if (profilesRes.ok) {
      const profiles = (await profilesRes.json()) as { username: string }[];
      for (const p of profiles) {
        dynamicUrls.push({
          loc: `${siteUrl}/${p.username}`,
          priority: "0.5",
        });
      }
    }
  } catch {
    //
  }

  return buildSitemapXml([...staticUrls, ...dynamicUrls]);
}

function buildSitemapResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${SITEMAP_CACHE_TTL_SECONDS}, s-maxage=${SITEMAP_CACHE_TTL_SECONDS}`,
    },
  });
}

function getCacheApi(): Cache | null {
  return ((globalThis as unknown as { caches?: { default?: Cache } }).caches
    ?.default ?? null);
}

function getSitemapCacheKey(request: Request): Request {
  const url = new URL(request.url);
  url.search = `?v=${SITEMAP_CACHE_VERSION}`;
  return new Request(url.toString(), { method: "GET" });
}

async function getSitemapResponse(
  request: Request,
  env: Env,
  ctx?: WorkerExecutionContext,
): Promise<Response> {
  const cache = getCacheApi();
  const cacheKey = getSitemapCacheKey(request);

  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        return request.method === "HEAD" ? toHeadResponse(cached) : cached;
      }
    } catch {
      //
    }
  }

  const response = buildSitemapResponse(await generateDynamicSitemap(env));

  if (cache) {
    const cacheWrite = cache.put(cacheKey, response.clone()).catch(() => {});
    if (ctx) {
      ctx.waitUntil(cacheWrite);
    } else {
      await cacheWrite;
    }
  }

  return request.method === "HEAD" ? toHeadResponse(response) : response;
}

const NOINDEX_PATTERNS = [
  /^\/login$/,
  /^\/auth-callback$/,
  /^\/settings(\/|$)/,
  /^\/search\//,
  /^\/[a-z0-9_]+\/species-gallery$/,
  /^\/[a-z0-9_]+\/liked-lists$/,
  /^\/specie-detail\/\d+\/likes$/,
  /^\/specie-detail\/\d+\/lists$/,
];

function shouldNoindex(pathname: string): boolean {
  return NOINDEX_PATTERNS.some((re) => re.test(pathname));
}

function shouldTrySpaFallback(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;

  const url = new URL(request.url);
  const lastSegment = url.pathname.split("/").pop() ?? "";
  if (lastSegment.includes(".")) return false;

  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html") || accept.includes("*/*") || !accept;
}

function toGetRequest(request: Request): Request {
  if (request.method !== "HEAD") return request;
  return new Request(request, { method: "GET" });
}

function toHeadResponse(response: Response): Response {
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

async function fetchAsset(request: Request, env: Env): Promise<Response> {
  if (!env.ASSETS?.fetch) {
    return new Response("ASSETS binding not configured", { status: 500 });
  }

  try {
    const assetRequest = toGetRequest(request);
    let response = await env.ASSETS.fetch(assetRequest);

    if (response.status === 404 && shouldTrySpaFallback(request)) {
      const fallbackUrl = new URL("/", request.url);
      response = await env.ASSETS.fetch(
        new Request(fallbackUrl.toString(), assetRequest),
      );
    }

    return request.method === "HEAD" ? toHeadResponse(response) : response;
  } catch {
    return new Response("Asset fetch failed", { status: 500 });
  }
}

function buildMetaHtml(
  html: string,
  meta: {
    title: string;
    description: string;
    image: string;
    url: string;
    locale?: string;
    lang?: string;
    robots?: string;
    structuredData?: StructuredData;
  },
): string {
  const e = {
    title: escapeHtml(meta.title),
    description: escapeHtml(meta.description),
    image: escapeHtml(meta.image),
    url: escapeHtml(meta.url),
    locale: escapeHtml(meta.locale ?? "pt_BR"),
    robots: escapeHtml(
      meta.robots ??
        "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    ),
  };

  let result = html;

  if (meta.lang) {
    result = result.replace(
      /<html lang="[^"]*">/,
      `<html lang="${escapeHtml(meta.lang)}">`,
    );
  }

  result = result.replace(
    /<meta\s+property="og:title"[^>]*\/>/,
    `<meta property="og:title" content="${e.title}" />`,
  );
  result = result.replace(
    /<meta\s+property="og:description"[^>]*\/>/,
    `<meta property="og:description" content="${e.description}" />`,
  );
  result = result.replace(
    /<meta\s+property="og:image"[^>]*\/>/,
    `<meta property="og:image" content="${e.image}" />`,
  );
  result = result.replace(
    /<meta\s+property="og:url"[^>]*\/>/,
    `<meta property="og:url" content="${e.url}" />`,
  );
  result = result.replace(
    /<meta\s+property="og:locale"[^>]*\/>/,
    `<meta property="og:locale" content="${e.locale}" />`,
  );
  result = result.replace(
    /<meta\s+name="robots"[^>]*\/>/,
    `<meta name="robots" content="${e.robots}" />`,
  );
  result = result.replace(
    /<meta\s+name="twitter:title"[^>]*\/>/,
    `<meta name="twitter:title" content="${e.title}" />`,
  );
  result = result.replace(
    /<meta\s+name="twitter:description"[^>]*\/>/,
    `<meta name="twitter:description" content="${e.description}" />`,
  );
  result = result.replace(
    /<meta\s+name="twitter:image"[^>]*\/>/,
    `<meta name="twitter:image" content="${e.image}" />`,
  );
  result = result.replace(
    /<meta\s+name="description"[^>]*\/>/,
    `<meta name="description" content="${e.description}" />`,
  );
  result = result.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${e.url}" />`,
  );
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${e.title}</title>`);

  if (meta.structuredData) {
    result = result.replace(
      /<script id="structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script id="structured-data" type="application/ld+json">${escapeJsonForHtml(meta.structuredData)}</script>`,
    );
  }

  return result;
}

async function supabaseGet<T>(env: Env, path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length === 0) return null;
    return Array.isArray(data) ? data[0] : data;
  } catch {
    return null;
  }
}

async function supabaseRpc<T>(
  env: Env,
  fnName: string,
  params: Record<string, unknown>,
): Promise<T | null> {
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length === 0) return null;
    return Array.isArray(data) ? data[0] : data;
  } catch {
    return null;
  }
}

async function supabaseRpcArray<T>(
  env: Env,
  fnName: string,
  params: Record<string, unknown>,
): Promise<T[]> {
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getSpeciesCanonicalPath(
  gbifKey: string,
  env: Env,
): Promise<string | null> {
  const row = await supabaseGet<{ scientific_name: string | null }>(
    env,
    `species_data_cache?gbif_key=eq.${gbifKey}&select=scientific_name`,
  );
  if (!row) return null;
  return getSpeciesPath(row.scientific_name, gbifKey);
}

async function getListDetailBySlug(
  env: Env,
  username: string,
  slug: string,
): Promise<ListDetail | null> {
  return supabaseRpc<ListDetail>(env, "get_list_detail_by_slug", {
    p_username: username,
    p_slug: slug,
  });
}

async function getListDetailForPath(
  env: Env,
  username: string,
  slug: string,
): Promise<ListDetail | null> {
  const exact = await getListDetailBySlug(env, username, slug);
  if (exact) return exact;

  const search = slug.replace(/-/g, " ").trim();
  if (!search) return null;

  const lists = await supabaseRpcArray<{
    user_username: string;
    title: string;
    slug: string;
  }>(env, "get_public_lists", {
    p_limit: 20,
    p_offset: 0,
    p_sort: "recent",
    p_search: search,
  });
  const candidate = lists.find(
    (list) =>
      list.user_username === username &&
      getListPath(list.user_username, list.title) ===
        `/${username}/lists/${slug}`,
  );

  if (!candidate?.slug || candidate.slug === slug) return null;
  return getListDetailBySlug(env, username, candidate.slug);
}

async function getListCanonicalPath(
  pathname: string,
  env: Env,
): Promise<string | null> {
  const listMatch = pathname.match(
    /^\/([a-z0-9_]{3,30})\/lists\/([a-z0-9-]+)$/,
  );
  if (!listMatch) return null;

  const [, username, slug] = listMatch;
  const list = await getListDetailForPath(env, username, slug);
  if (!list) return null;

  return getListPath(username, list.title);
}

async function getMetaForRoute(
  pathname: string,
  env: Env,
  locale: Locale,
): Promise<MetaInfo> {
  const siteUrl = env.SITE_URL || "https://treevera.org";
  const text = getSiteText(locale);

  if (pathname === "/") {
    return {
      title: text.homeTitle,
      description: text.homeDescription,
      image: `${siteUrl}/og-image.png`,
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: "Treevera",
            url: `${siteUrl}/`,
            inLanguage: locale,
            description: text.websiteDescription,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/search/{search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@type": "Organization",
            name: "Treevera",
            url: `${siteUrl}/`,
            logo: `${siteUrl}/og-image.png`,
          },
        ],
      },
    };
  }

  if (pathname === "/about") {
    return {
      title: text.aboutTitle,
      description: text.aboutDescription,
      image: `${siteUrl}/og-image.png`,
    };
  }

  if (pathname === "/lists") {
    return {
      title: text.listsTitle,
      description: text.listsDescription,
      image: `${siteUrl}/og-image.png`,
    };
  }

  if (
    pathname === "/challenges" ||
    pathname === "/challenges/daily" ||
    pathname === "/challenges/random" ||
    pathname === "/challenges/custom"
  ) {
    return {
      title: text.challengesTitle,
      description: text.challengesDescription,
      image: `${siteUrl}/og-image.png`,
    };
  }

  if (pathname === "/tree" || pathname.startsWith("/tree/")) {
    return {
      title: text.treeTitle,
      description: text.treeDescription,
      image: `${siteUrl}/og-image.png`,
    };
  }

  const gbifKey = getGbifKeyFromSpeciesPath(pathname);
  if (gbifKey) {
    const row = await supabaseGet<SpeciesCacheRow>(
      env,
      `species_data_cache?gbif_key=eq.${gbifKey}&select=scientific_name,image_url,has_image,description_pt,family`,
    );
    if (!row) return null;
    const canonicalPath = getSpeciesPath(row.scientific_name, gbifKey);
    const description =
      row.description_pt?.slice(0, 160) ??
      (row.family
        ? `${text.familyLabel}: ${row.family}`
        : text.speciesFallback);
    const url = absoluteUrl(siteUrl, canonicalPath);

    return {
      title: `${row.scientific_name} | Treevera`,
      description,
      image: row.has_image && row.image_url ? row.image_url : "",
      canonicalPath,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: row.scientific_name,
        url,
        description,
        about: {
          "@type": "Thing",
          name: row.scientific_name,
        },
      },
    };
  }

  const profileMatch = pathname.match(/^\/([a-z0-9_]{3,30})$/);
  if (profileMatch) {
    const username = profileMatch[1];
    const reserved = [
      "tree",
      "lists",
      "login",
      "settings",
      "search",
      "challenges",
      "auth-callback",
      "specie-detail",
      "about",
    ];
    if (reserved.includes(username)) return null;

    const profile = await supabaseRpc<PublicProfile>(
      env,
      "get_public_profile",
      { p_username: username },
    );
    if (!profile) return null;
    const url = absoluteUrl(siteUrl, pathname);

    return {
      title: `${profile.name} (@${profile.username}) | Treevera`,
      description: text.profileDescription(profile.name),
      image: profile.avatar_url ?? "",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: `${profile.name} (@${profile.username})`,
        url,
        mainEntity: {
          "@type": "Person",
          name: profile.name,
          identifier: profile.username,
          image: profile.avatar_url ?? undefined,
          url,
        },
      },
    };
  }

  const listMatch = pathname.match(
    /^\/([a-z0-9_]{3,30})\/lists\/([a-z0-9-]+)$/,
  );
  if (listMatch) {
    const [, username, slug] = listMatch;
    const list = await getListDetailForPath(env, username, slug);
    if (!list) return null;
    const description =
      list.description?.slice(0, 160) ?? text.listWithCount(list.species_count);
    const canonicalPath = getListPath(username, list.title);
    const url = absoluteUrl(siteUrl, canonicalPath);

    return {
      title: `${list.title} | Treevera`,
      description,
      image: list.cover_image_url ?? "",
      canonicalPath,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: list.title,
        url,
        description,
        mainEntity: {
          "@type": "ItemList",
          name: list.title,
          numberOfItems: list.species_count,
        },
      },
    };
  }

  return null;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx?: WorkerExecutionContext,
  ): Promise<Response> {
    try {
      const url = new URL(request.url);
      const locale = detectLocale(request.headers.get("accept-language"));

      if (url.hostname.startsWith("www.")) {
        url.hostname = url.hostname.slice(4);
        return Response.redirect(url.toString(), 301);
      }

      if (
        url.pathname === "/sitemap.xml" &&
        env.SUPABASE_URL &&
        env.SUPABASE_ANON_KEY
      ) {
        return getSitemapResponse(request, env, ctx);
      }

      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        const legacySpecieMatch = url.pathname.match(/^\/specie-detail\/(\d+)$/);
        if (legacySpecieMatch) {
          const canonicalPath = await getSpeciesCanonicalPath(
            legacySpecieMatch[1],
            env,
          );
          if (canonicalPath && canonicalPath !== url.pathname) {
            url.pathname = canonicalPath;
            return Response.redirect(url.toString(), 301);
          }
        }

        const canonicalListPath = await getListCanonicalPath(url.pathname, env);
        if (canonicalListPath && canonicalListPath !== url.pathname) {
          url.pathname = canonicalListPath;
          return Response.redirect(url.toString(), 301);
        }
      }

      const userAgent = request.headers.get("user-agent") ?? "";
      if (!CRAWLERS.test(userAgent)) {
        return fetchAsset(request, env);
      }

      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        return fetchAsset(request, env);
      }

      const meta = await getMetaForRoute(url.pathname, env, locale);
      if (!meta) {
        return fetchAsset(request, env);
      }

      const robots = shouldNoindex(url.pathname) ? "noindex,follow" : undefined;

      const assetResponse = await fetchAsset(request, env);
      const contentType = assetResponse.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html")) {
        return assetResponse;
      }

      const html = await assetResponse.text();
      const siteUrl = env.SITE_URL || url.origin;
      const fullImage =
        meta.image && !meta.image.startsWith("http")
          ? `${siteUrl}${meta.image}`
          : meta.image;

      const langMap: Record<Locale, string> = {
        pt: "pt-BR",
        en: "en",
        es: "es",
      };

      const injected = buildMetaHtml(html, {
        title: meta.title,
        description: meta.description,
        image: fullImage || `${siteUrl}/og-image.png`,
        url: `${siteUrl}${meta.canonicalPath ?? url.pathname}`,
        locale: getOgLocale(locale),
        lang: langMap[locale],
        robots,
        structuredData: meta.structuredData,
      });

      const headers = new Headers(assetResponse.headers);
      headers.delete("content-length");

      return new Response(injected, {
        status: assetResponse.status,
        headers,
      });
    } catch {
      return fetchAsset(request, env);
    }
  },
};
