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
              {t("aboutPage.title")}
            </h1>
            <p className="text-muted-foreground text-[15px] leading-7 md:text-base">
              {t("aboutPage.hint")}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">
              {t("aboutPage.whatCanYouDo")}
            </h2>
            <ul className="space-y-3 leading-7 tracking-[-0.01em]">
              <li>{t("aboutPage.features.tree")}</li>
              <li>{t("aboutPage.features.species")}</li>
              <li>{t("aboutPage.features.challenges")}</li>
              <li>{t("aboutPage.features.lists")}</li>
              <li>{t("aboutPage.features.profile")}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {t("aboutPage.whoIsItFor")}
            </h2>
            <p className="leading-7 tracking-[-0.01em]">
              {t("aboutPage.audience")}
            </p>
          </div>
        </section>

        <hr className="mt-12 max-w-3xl border-border" />

        <section className="mt-12 max-w-3xl space-y-8">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {t("aboutPage.sourcesTitle")}
            </h2>
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
