import { useParams } from "@tanstack/react-router";
import { SearchResultsPage } from "@/modules/search/search-results-page";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { decodeSearchQuery } from "@/common/utils/decode-search-query";

export const SearchPage = () => {
  const { query } = useParams({ strict: false }) as { query: string };
  const decodedQuery = decodeSearchQuery(query ?? "");

  useDocumentTitle(decodedQuery ? `"${decodedQuery}"` : undefined);
  return <SearchResultsPage query={decodedQuery} />;
};
