import { FitBounds } from "@/common/utils/map/fit-bounds";
import {
  useGetOccurrences,
  type Occurrences,
} from "@/hooks/queries/useGetOccurrences";
import { memo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Loader } from "lucide-react";

type Props = {
  specieKey: number;
};

export const OccurrenceMap = memo(({ specieKey }: Props) => {
  const { data, isFetching } = useGetOccurrences(specieKey);

  const occurrences = data?.occurrences ?? [];
  const hasResults = data?.hasResults;

  if (isFetching) return <Loader className="m-auto size-4 animate-spin" />;
  if (!isFetching && !hasResults) return null;

  return (
    <div className="flex w-full flex-col gap-1 pb-4">
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
                  <strong>Local:</strong> {o.locality ?? "Não informado"}
                </p>
                <p>
                  <strong>País:</strong> {o.country ?? "Não informado"}
                </p>
                <p>
                  <strong>Data: </strong>
                  {o.eventDate
                    ? new Date(o.eventDate).toLocaleDateString()
                    : "Sem data"}
                </p>
                <p className="wrap-break-word">
                  <strong>Registrado por:</strong>{" "}
                  {o.recordedBy ?? "Desconhecido"}
                </p>

                {o.references && (
                  <p className="mt-2">
                    <a
                      href={o.references}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Ver referência
                    </a>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="bg-card text-muted-foreground rounded-xl p-2 text-xs">
        Dados de ocorrência fornecidos por
        <a
          href="https://www.gbif.org"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-blue-600 underline"
        >
          GBIF.org
        </a>
        . Os pontos representam registros globais de diversas bases de dados,
        que podem ser diferentes da fonte da imagem acima.
      </div>
    </div>
  );
});
