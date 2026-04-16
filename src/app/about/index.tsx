import { Trans, useTranslation } from "react-i18next";
import { SourceReference } from "@/common/components/source-info/source-reference";
import { useDocumentTitle } from "@/hooks/use-document-title";

export const AboutPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t("nav.about"));

  return (
    <div className="min-h-full overflow-auto">
      <div className="bg-card mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12">
        <section className="max-w-3xl space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {t("aboutPage.sourcesTitle")}
            </h1>
            <p className="text-muted-foreground text-[15px] leading-7 md:text-base">
              {t("aboutPage.sourcesHint")}
            </p>
          </div>

          <div className="space-y-7 leading-7 tracking-[-0.01em]">
            <p>
              <Trans
                i18nKey="aboutPage.paragraphs.occurrence"
                components={{
                  gbif: <SourceReference sourceId="gbif">GBIF</SourceReference>,
                }}
              />
            </p>

            <p>
              <Trans
                i18nKey="aboutPage.paragraphs.conservation"
                components={{
                  iucn: (
                    <SourceReference sourceId="iucn-red-list">
                      IUCN Red List
                    </SourceReference>
                  ),
                }}
              />
            </p>

            <p>
              <Trans
                i18nKey="aboutPage.paragraphs.photos"
                components={{
                  inat: (
                    <SourceReference sourceId="inaturalist">
                      iNaturalist
                    </SourceReference>
                  ),
                  commons: (
                    <SourceReference sourceId="wikimedia-commons">
                      Wikimedia Commons
                    </SourceReference>
                  ),
                }}
              />
            </p>

            <p>
              <Trans
                i18nKey="aboutPage.paragraphs.descriptions"
                components={{
                  wikipedia: (
                    <SourceReference sourceId="wikipedia">
                      Wikipedia
                    </SourceReference>
                  ),
                  gbif: <SourceReference sourceId="gbif">GBIF</SourceReference>,
                }}
              />
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
