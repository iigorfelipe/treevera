import { SearchForm } from "./search-form";
import { SearchResults } from "./search-results";
import { TaxonDiagnosis } from "./taxon-diagnosis";
import { useSearch } from "./use-search";

export const Search = () => {
  const {
    q,
    setQ,
    kingdom,
    setKingdom,
    rank,
    setRank,
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
    diagnosis,
    inputRef,
  } = useSearch();

  return (
    <div>
      <SearchForm
        q={q}
        setQ={setQ}
        kingdom={kingdom}
        setKingdom={setKingdom}
        rank={rank}
        setRank={setRank}
        loading={loading}
        isKeySearch={isKeySearch}
        hasResults={results !== null}
        onSearch={onSearch}
        onClear={onClear}
        inputRef={inputRef}
      />

      {error && <p className="mt-1.5 px-1 text-xs text-red-500">{error}</p>}

      {results !== null && (
        <SearchResults
          query={q}
          rank={rank}
          results={results}
          selected={selected}
          minimized={minimized}
          setMinimized={setMinimized}
          onPick={onPick}
        />
      )}

      {diagnosis && <TaxonDiagnosis diagnostic={diagnosis} />}
    </div>
  );
};

export default Search;
