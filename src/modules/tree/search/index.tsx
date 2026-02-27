import { SearchForm } from "./search-form";
import { SearchResults } from "./search-results";
import { useSearch } from "./use-search";

export const Search = () => {
  const {
    q,
    setQ,
    kingdom,
    setKingdom,
    loading,
    results,
    error,
    selected,
    minimized,
    setMinimized,
    isKeySearch,
    onSearch,
    onPick,
    onClear,
  } = useSearch();

  return (
    <div>
      <SearchForm
        q={q}
        setQ={setQ}
        kingdom={kingdom}
        setKingdom={setKingdom}
        loading={loading}
        isKeySearch={isKeySearch}
        hasResults={results !== null}
        onSearch={onSearch}
        onClear={onClear}
      />

      {error && <p className="mt-1.5 px-1 text-xs text-red-500">{error}</p>}

      {results !== null && (
        <SearchResults
          results={results}
          selected={selected}
          minimized={minimized}
          setMinimized={setMinimized}
          onPick={onPick}
        />
      )}
    </div>
  );
};

export default Search;
