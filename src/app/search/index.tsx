import { useParams } from "@tanstack/react-router";
import { SearchResultsPage } from "@/modules/search/search-results-page";
import { useDocumentTitle } from "@/hooks/use-document-title";

export const SearchPage = () => {
  const { query } = useParams({ strict: false }) as { query: string };
  useDocumentTitle(query ? `"${query}"` : undefined);
  return <SearchResultsPage query={query ?? ""} />;
};
