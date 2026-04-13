import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { FitBounds } from "@/common/utils/map/fit-bounds";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
import {
  useGetOccurrences,
  type Occurrences,
} from "@/hooks/queries/useGetOccurrences";
import { memo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  specieKey: number;
};

export const OccurrenceMap = memo(({ specieKey }: Props) => {
  const { t, i18n } = useTranslation();
  const { data, isFetching } = useGetOccurrences(specieKey);

  const occurrences = data?.occurrences ?? [];
  const hasResults = data?.hasResults;

  if (isFetching) {
    return (
      <div className="bg-card rounded-xl border p-4 shadow-sm">
        <Loader className="m-auto size-4 animate-spin" />
      </div>
    );
  }

  if (!hasResults) return null;

  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm">
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        {t("specieDetail.geographicOccurrence")}
      </h3>
      <div className="flex w-full flex-col gap-1 pb-4">
        <div style={{ isolation: "isolate" }}>
          <MapContainer
            key={`map-${specieKey}`}
            center={[
              occurrences[0].decimalLatitude,
              occurrences[0].decimalLongitude,
            ]}
            zoom={4}
            style={{
              height: "250px",
              width: "100%",
              borderRadius: "12px",
              border: "none",
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <FitBounds
              bounds={occurrences.map((o) => [
                o.decimalLatitude,
                o.decimalLongitude,
              ])}
            />

            {occurrences.map((o: Occurrences, index: number) => (
              <Marker
                key={index}
                position={[o.decimalLatitude, o.decimalLongitude]}
              >
                <Popup>
                  <div className="text-sm">
                    <p>
                      <strong>{t("occurrenceMap.locality")}:</strong>{" "}
                      {o.locality ?? t("occurrenceMap.notInformed")}
                    </p>
                    <p>
                      <strong>{t("occurrenceMap.country")}:</strong>{" "}
                      {o.country ?? t("occurrenceMap.notInformed")}
                    </p>
                    <p>
                      <strong>{t("occurrenceMap.date")}: </strong>
                      {o.eventDate
                        ? new Date(o.eventDate).toLocaleDateString(
                            i18n.resolvedLanguage ?? i18n.language,
                          )
                        : t("occurrenceMap.noDate")}
                    </p>
                    <p className="wrap-break-word">
                      <strong>{t("occurrenceMap.recordedBy")}:</strong>{" "}
                      {o.recordedBy ?? t("occurrenceMap.unknown")}
                    </p>

                    {o.references && (
                      <p className="mt-2">
                        <a
                          href={o.references}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {t("occurrenceMap.viewReference")}
                        </a>
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="bg-card text-muted-foreground rounded-xl p-2 text-xs">
          {t("occurrenceMap.dataProvidedBy")}
          <a
            href="https://www.gbif.org"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-600 underline"
          >
            GBIF.org
          </a>
          {t("occurrenceMap.dataNote")}
        </div>
      </div>
    </div>
  );
});
