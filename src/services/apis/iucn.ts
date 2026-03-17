import type { StatusCode } from "@/common/components/vulnerability-badge";
import { getSpeciesStatusFromWikidata } from "./wikipedia";

const VALID_CODES = new Set<StatusCode>([
  "EX",
  "EW",
  "CR",
  "EN",
  "VU",
  "NT",
  "LC",
  "DD",
  "NE",
]);

const LEGACY_CODE_MAP: Record<string, StatusCode> = {
  "LR/lc": "LC",
  "LR/nt": "NT",
  "LR/cd": "NT",
};

function extractTrend(raw: unknown): string | null {
  if (typeof raw === "string") return raw || null;
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const val = obj["en"] ?? Object.values(obj)[0];
    return typeof val === "string" ? val : null;
  }
  return null;
}

function normalizeCode(raw: string): StatusCode | null {
  const upper = raw.toUpperCase();
  if (VALID_CODES.has(upper as StatusCode)) return upper as StatusCode;
  return LEGACY_CODE_MAP[raw] ?? null;
}

export type IucnResult = {
  code: StatusCode;
  trend: string | null;
  year: number | null;
};

async function getFromEdgeFunction(
  scientificName: string,
): Promise<IucnResult | null> {
  const parts = scientificName.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const [genus, species] = parts;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !anonKey) return null;

  try {
    const url = `${supabaseUrl}/functions/v1/iucn-status?genus_name=${encodeURIComponent(genus)}&species_name=${encodeURIComponent(species)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${anonKey}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.code) return null;
    const code = normalizeCode(json.code as string);
    if (!code) return null;
    return {
      code,
      trend: extractTrend(json.trend),
      year: json.year != null ? Number(json.year) : null,
    };
  } catch {
    return null;
  }
}

export async function getSpeciesStatusFromIUCN(
  scientificName: string,
): Promise<IucnResult | null> {
  const result = await getFromEdgeFunction(scientificName);
  if (result) return result;

  const code = await getSpeciesStatusFromWikidata(scientificName);
  if (!code) return null;
  return { code, trend: null, year: null };
}
