const CRAWLERS =
  /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|whatsapp|telegram|discord/i;

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SITE_URL: string;
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildMetaHtml(
  html: string,
  meta: { title: string; description: string; image: string; url: string },
): string {
  const e = {
    title: escapeHtml(meta.title),
    description: escapeHtml(meta.description),
    image: escapeHtml(meta.image),
    url: escapeHtml(meta.url),
  };

  const tags = [
    `<meta property="og:title" content="${e.title}" />`,
    `<meta property="og:description" content="${e.description}" />`,
    `<meta property="og:image" content="${e.image}" />`,
    `<meta property="og:url" content="${e.url}" />`,
    `<meta name="twitter:title" content="${e.title}" />`,
    `<meta name="twitter:description" content="${e.description}" />`,
    `<meta name="twitter:image" content="${e.image}" />`,
    `<title>${e.title}</title>`,
  ];

  let result = html;

  result = result.replace(
    /<meta property="og:title"[^>]*\/>/,
    tags[0],
  );
  result = result.replace(
    /<meta property="og:description"[^>]*\/>/,
    tags[1],
  );
  result = result.replace(
    /<meta property="og:image"[^>]*\/>/,
    tags[2],
  );
  result = result.replace(
    /<meta property="og:url"[^>]*\/>/,
    tags[3],
  );
  result = result.replace(
    /<meta name="twitter:title"[^>]*\/>/,
    tags[4],
  );
  result = result.replace(
    /<meta name="twitter:description"[^>]*\/>/,
    tags[5],
  );
  result = result.replace(
    /<meta name="twitter:image"[^>]*\/>/,
    tags[6],
  );
  result = result.replace(/<title>[^<]*<\/title>/, tags[7]);

  return result;
}

async function supabaseGet<T>(
  env: Env,
  path: string,
): Promise<T | null> {
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
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/${fnName}`,
      {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(params),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length === 0) return null;
    return Array.isArray(data) ? data[0] : data;
  } catch {
    return null;
  }
}

type MetaInfo = { title: string; description: string; image: string } | null;

async function getMetaForRoute(
  pathname: string,
  env: Env,
): Promise<MetaInfo> {
  const specieMatch = pathname.match(/^\/specie-detail\/(\d+)/);
  if (specieMatch) {
    const gbifKey = specieMatch[1];
    const row = await supabaseGet<SpeciesCacheRow>(
      env,
      `species_data_cache?gbif_key=eq.${gbifKey}&select=scientific_name,image_url,has_image,description_pt,family`,
    );
    if (!row) return null;
    const desc =
      row.description_pt?.slice(0, 160) ??
      (row.family ? `Família: ${row.family}` : "Espécie na Treevera");
    return {
      title: `${row.scientific_name} — Treevera`,
      description: desc,
      image: row.has_image && row.image_url ? row.image_url : "",
    };
  }

  const profileMatch = pathname.match(/^\/([a-z0-9_]{3,30})$/);
  if (profileMatch) {
    const username = profileMatch[1];
    const reserved = [
      "tree", "lists", "login", "settings", "search",
      "challenges", "auth-callback", "specie-detail",
    ];
    if (reserved.includes(username)) return null;

    const profile = await supabaseRpc<PublicProfile>(env, "get_public_profile", {
      p_username: username,
    });
    if (!profile) return null;
    return {
      title: `${profile.name} (@${profile.username}) — Treevera`,
      description: `Perfil de ${profile.name} na Treevera`,
      image: profile.avatar_url ?? "",
    };
  }

  const listMatch = pathname.match(
    /^\/([a-z0-9_]{3,30})\/lists\/([a-z0-9-]+)$/,
  );
  if (listMatch) {
    const [, username, slug] = listMatch;
    const list = await supabaseRpc<ListDetail>(env, "get_list_detail_by_slug", {
      p_username: username,
      p_slug: slug,
    });
    if (!list) return null;
    const desc =
      list.description?.slice(0, 160) ??
      `Lista com ${list.species_count} espécies`;
    return {
      title: `${list.title} — Treevera`,
      description: desc,
      image: list.cover_image_url ?? "",
    };
  }

  return null;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env } = context;
  const userAgent = request.headers.get("user-agent") ?? "";

  if (!CRAWLERS.test(userAgent)) {
    return next();
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  const meta = await getMetaForRoute(pathname, env);

  if (!meta) {
    return next();
  }

  const response = await next();
  const html = await response.text();
  const siteUrl = env.SITE_URL || url.origin;
  const fullImage =
    meta.image && !meta.image.startsWith("http")
      ? `${siteUrl}${meta.image}`
      : meta.image;

  const injected = buildMetaHtml(html, {
    title: meta.title,
    description: meta.description,
    image: fullImage || `${siteUrl}/og-image.png`,
    url: `${siteUrl}${pathname}`,
  });

  return new Response(injected, {
    status: response.status,
    headers: response.headers,
  });
};
