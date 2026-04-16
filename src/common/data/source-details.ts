export type SourceId =
  | "gbif"
  | "iucn-red-list"
  | "inaturalist"
  | "wikimedia-commons"
  | "wikipedia";

export type SourceDetail = {
  id: SourceId;
  url: string;
};

export const SOURCE_DETAILS: Record<SourceId, SourceDetail> = {
  gbif: {
    id: "gbif",
    url: "https://www.gbif.org/",
  },
  "iucn-red-list": {
    id: "iucn-red-list",
    url: "https://www.iucnredlist.org/",
  },
  inaturalist: {
    id: "inaturalist",
    url: "https://www.inaturalist.org/",
  },
  "wikimedia-commons": {
    id: "wikimedia-commons",
    url: "https://commons.wikimedia.org/",
  },
  wikipedia: {
    id: "wikipedia",
    url: "https://www.wikipedia.org/",
  },
};
