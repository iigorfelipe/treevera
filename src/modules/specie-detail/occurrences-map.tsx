import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { memo, useEffect, useMemo, useState } from "react";
import { Expand, Loader, Shrink } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/common/utils/cn";
import { inatImageUrl } from "@/common/utils/image-size";
import { FitBounds } from "@/common/utils/map/fit-bounds";
import {
  useGetOccurrences,
  type Occurrences,
} from "@/hooks/queries/useGetOccurrences";
import { useGetOccurrenceStats } from "@/hooks/queries/useGetOccurrenceStats";
import { SourceReference } from "@/common/components/source-info/source-reference";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

type Props = {
  specieKey: number;
};

const HEADER_HEIGHT_CLASS = "top-14";
const HEADER_HEIGHT_VALUE = "3.5rem";
const HEXAGON_CLIP_PATH =
  "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)";
const DENSITY_COLORS = ["#f6dd4e", "#f59a45", "#e65a4f"];
const DEFAULT_MAP_CENTER: [number, number] = [20, 0];
const EMPTY_OCCURRENCES: Occurrences[] = [];

const InvalidateMapSize = ({ trigger }: { trigger: string }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map, trigger]);

  return null;
};

const SampleMarkerIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 shrink-0">
    <path
      d="M8 1.25A4.75 4.75 0 0 0 3.25 6c0 3.46 4.75 8.23 4.75 8.23S12.75 9.46 12.75 6A4.75 4.75 0 0 0 8 1.25Z"
      fill={active ? "#3b82f6" : "transparent"}
      stroke={active ? "#3b82f6" : "currentColor"}
      strokeWidth="1.4"
    />
    <circle
      cx="8"
      cy="6"
      r="1.7"
      fill={active ? "#ffffff" : "currentColor"}
      opacity={active ? 1 : 0.55}
    />
  </svg>
);

const getCountryName = (code: string, lang: string): string => {
  try {
    return (
      new Intl.DisplayNames([lang, "en"], { type: "region" }).of(code) ?? code
    );
  } catch {
    return code;
  }
};

const CONTINENT_LABELS: Record<string, Record<string, string>> = {
  AFRICA: { pt: "Africa", en: "Africa", es: "Africa" },
  ANTARCTICA: { pt: "Antartida", en: "Antarctica", es: "Antartida" },
  ASIA: { pt: "Asia", en: "Asia", es: "Asia" },
  EUROPE: { pt: "Europa", en: "Europe", es: "Europa" },
  NORTH_AMERICA: {
    pt: "America do Norte",
    en: "North America",
    es: "Norteamerica",
  },
  OCEANIA: { pt: "Oceania", en: "Oceania", es: "Oceania" },
  SOUTH_AMERICA: {
    pt: "America do Sul",
    en: "South America",
    es: "Sudamerica",
  },
};

const formatContinent = (code: string, lang = "pt"): string => {
  const langKey = lang.startsWith("pt")
    ? "pt"
    : lang.startsWith("es")
      ? "es"
      : "en";
  return CONTINENT_LABELS[code]?.[langKey] ?? code;
};

export const OccurrenceMap = memo(({ specieKey }: Props) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? "pt";

  const [activeTab, setActiveTab] = useState<"map" | "stats">("map");
  const [showSamples, setShowSamples] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: stats, isLoading: isStatsLoading } =
    useGetOccurrenceStats(specieKey);
  const total = stats?.total ?? 0;
  const priorityCountries =
    stats?.topCountries.slice(0, 7).map((country) => country.code) ?? [];
  const shouldPrefetchSamples = !isStatsLoading && total > 0;
  const { data: occurrenceData, isFetching } = useGetOccurrences(
    specieKey,
    priorityCountries,
    shouldPrefetchSamples,
  );

  const occurrences = occurrenceData?.occurrences ?? EMPTY_OCCURRENCES;
  const occurrenceBounds = useMemo(
    () =>
      occurrences.map(
        (occurrence) =>
          [occurrence.decimalLatitude, occurrence.decimalLongitude] as [
            number,
            number,
          ],
      ),
    [occurrences],
  );
  const gbifTileUrl = `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@2x.png?taxonKey=${specieKey}&bin=hex&hexPerTile=30&style=classic.poly`;
  const hasAnyResults =
    isStatsLoading || total > 0 || occurrenceData?.hasResults;

  if (!hasAnyResults) return null;

  const mapViewportHeight = isExpanded
    ? `calc(100dvh - ${HEADER_HEIGHT_VALUE} - 9rem)`
    : "280px";

  const mapPanel = (
    <div
      className={cn(
        activeTab === "map" &&
          isExpanded &&
          `bg-background/98 fixed inset-x-0 ${HEADER_HEIGHT_CLASS} bottom-0 z-40 border-t shadow-2xl backdrop-blur-sm`,
      )}
    >
      <div
        className={cn(
          "px-4 pb-4",
          isExpanded && "flex h-full flex-col p-4 sm:p-5",
        )}
      >
        <div className="relative" style={{ isolation: "isolate" }}>
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="border-border/80 bg-background/95 text-foreground absolute top-3 right-3 z-1000 flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur transition hover:border-blue-400 hover:text-blue-600"
            aria-label={t(
              isExpanded
                ? "occurrenceMap.collapseMap"
                : "occurrenceMap.expandMap",
            )}
            title={t(
              isExpanded
                ? "occurrenceMap.collapseMap"
                : "occurrenceMap.expandMap",
            )}
          >
            {isExpanded ? (
              <Shrink className="size-3.5 shrink-0" />
            ) : (
              <Expand className="size-3.5 shrink-0" />
            )}
          </button>

          <MapContainer
            center={DEFAULT_MAP_CENTER}
            zoom={2}
            style={{
              height: mapViewportHeight,
              width: "100%",
              borderRadius: "12px",
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <TileLayer url={gbifTileUrl} opacity={0.75} />
            <InvalidateMapSize trigger={isExpanded ? "expanded" : "default"} />

            {showSamples &&
              occurrences.map((occurrence: Occurrences, index: number) => (
                <Marker
                  key={index}
                  position={[
                    occurrence.decimalLatitude,
                    occurrence.decimalLongitude,
                  ]}
                >
                  <Popup minWidth={occurrence.photo ? 260 : 180} maxWidth={320}>
                    <div
                      style={{ display: "flex", flexDirection: "row", gap: 0 }}
                    >
                      {occurrence.photo && (
                        <a
                          href={
                            occurrence.photo.references ??
                            occurrence.photo.identifier
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flexShrink: 0,
                            width: 88,
                            background: "rgba(0,0,0,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            alignSelf: "stretch",
                            borderRadius: "3px 0 0 3px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={inatImageUrl(
                              occurrence.photo.identifier,
                              "small",
                            )}
                            alt=""
                            loading="lazy"
                            style={{
                              maxWidth: 88,
                              maxHeight: 160,
                              width: "auto",
                              height: "auto",
                              display: "block",
                            }}
                          />
                        </a>
                      )}

                      <div
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 2,
                          fontSize: 12,
                          lineHeight: 1.4,
                          minWidth: 0,
                        }}
                      >
                        {(occurrence.locality || occurrence.stateProvince) && (
                          <p
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "100%",
                            }}
                          >
                            {[occurrence.locality, occurrence.stateProvince]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}

                        <p style={{ margin: 0, color: "#6b7280" }}>
                          {[
                            occurrence.country,
                            occurrence.continent
                              ? formatContinent(occurrence.continent, lang)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        {(occurrence.day ||
                          occurrence.month ||
                          occurrence.year ||
                          occurrence.recordedBy ||
                          occurrence.datasetName) && (
                          <div
                            style={{
                              borderTop: "1px solid #e5e7eb",
                              width: "100%",
                              margin: "2px 0",
                            }}
                          />
                        )}

                        {(occurrence.day ||
                          occurrence.month ||
                          occurrence.year) && (
                          <p style={{ margin: 0 }}>
                            {[
                              occurrence.day,
                              occurrence.month
                                ? new Date(
                                    0,
                                    occurrence.month - 1,
                                  ).toLocaleString(lang, {
                                    month: "short",
                                  })
                                : null,
                              occurrence.year,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                        )}

                        {occurrence.recordedBy && (
                          <p
                            style={{
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "100%",
                            }}
                          >
                            {occurrence.recordedBy.split("|")[0]}
                          </p>
                        )}

                        {occurrence.datasetName && (
                          <p
                            style={{
                              margin: 0,
                              color: "#9ca3af",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "100%",
                            }}
                          >
                            {occurrence.datasetName}
                          </p>
                        )}

                        {occurrence.individualCount != null &&
                          occurrence.individualCount > 1 && (
                            <p style={{ margin: 0 }}>
                              {occurrence.individualCount}{" "}
                              {t("occurrenceMap.individuals")}
                            </p>
                          )}

                        {occurrence.coordinateUncertaintyInMeters != null && (
                          <p style={{ margin: 0, color: "#9ca3af" }}>
                            ±
                            {occurrence.coordinateUncertaintyInMeters >= 1000
                              ? `${(
                                  occurrence.coordinateUncertaintyInMeters /
                                  1000
                                ).toFixed(0)} km`
                              : `${occurrence.coordinateUncertaintyInMeters} m`}
                          </p>
                        )}

                        {occurrence.gbifID && (
                          <a
                            href={`https://www.gbif.org/occurrence/${occurrence.gbifID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginTop: 4,
                              color: "#2563eb",
                              textDecoration: "underline",
                              display: "block",
                            }}
                          >
                            {t("occurrenceMap.viewOnGbif")}
                          </a>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {occurrenceBounds.length > 0 && (
              <FitBounds bounds={occurrenceBounds} />
            )}
          </MapContainer>
        </div>

        <div
          className={cn(
            "mt-3 flex items-start justify-between gap-3",
            isExpanded && "mt-4",
          )}
        >
          <div className="text-muted-foreground flex min-w-0 items-start gap-3 text-xs">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1.5">
                {DENSITY_COLORS.map((color) => (
                  <span
                    key={color}
                    className="inline-block size-3.5 shrink-0"
                    style={{
                      clipPath: HEXAGON_CLIP_PATH,
                      backgroundColor: color,
                    }}
                  />
                ))}
              </div>
              <span>{t("occurrenceMap.densityLayer")}</span>
            </div>
          </div>

          <button
            onClick={() => setShowSamples((value) => !value)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all",
              showSamples
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/30"
                : "border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600",
            )}
          >
            {isFetching ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <SampleMarkerIcon active={showSamples} />
            )}
            <span>{t("occurrenceMap.showSamples")}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t("occurrenceMap.title")}
          </h3>
          {isStatsLoading ? (
            <Skeleton className="h-5 w-28 rounded-full" />
          ) : total > 0 ? (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs tabular-nums">
              {total.toLocaleString(lang)}&nbsp;{t("occurrenceMap.records")}
            </span>
          ) : null}
        </div>

        <div className="bg-muted mt-3 flex gap-1 rounded-lg p-1">
          {(["map", "stats"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium transition-all",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(
                tab === "map"
                  ? "occurrenceMap.tabMap"
                  : "occurrenceMap.tabStats",
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "map" && mapPanel}

      {activeTab === "stats" && (
        <div className="space-y-4 px-4 pb-4">
          {!stats ? (
            <div className="flex justify-center py-6">
              <Loader className="text-muted-foreground size-4 animate-spin" />
            </div>
          ) : (
            <>
              {stats.topCountries.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                    {t("occurrenceMap.topCountriesMostRecords")}
                  </p>
                  <div className="space-y-2">
                    {stats.topCountries.map(({ code, count, percentage }) => (
                      <div key={code} className="flex items-center gap-2">
                        <span className="flex-1 truncate text-xs">
                          {getCountryName(code, lang)}
                        </span>
                        <div className="bg-muted h-1 w-20 shrink-0 rounded-full">
                          <div
                            className="bg-primary h-1 rounded-full"
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 shrink-0 text-right text-xs tabular-nums">
                          {count.toLocaleString(lang)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.latestYear && (
                <p className="text-muted-foreground text-xs">
                  {t("occurrenceMap.latestObservation")}:{" "}
                  <span className="text-foreground font-medium">
                    {stats.latestYear}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="border-t px-4 pt-1 pb-3">
        <p className="text-muted-foreground flex flex-wrap items-center gap-1 pt-2 text-xs">
          {t("occurrenceMap.dataProvidedBy")}
          <SourceReference sourceId="gbif">GBIF</SourceReference>
          {t("occurrenceMap.dataNote")}
        </p>
      </div>
    </div>
  );
});
