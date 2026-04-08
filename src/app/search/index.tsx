import { useParams } from "@tanstack/react-router";
import { SearchResultsPage } from "@/modules/search/search-results-page";

export const SearchPage = () => {
  const { query } = useParams({ strict: false }) as { query: string };
  return <SearchResultsPage query={query ?? ""} />;
};
