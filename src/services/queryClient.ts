import { QueryClient, type Query } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import localforage from "localforage";

const PERSIST_KEYS = new Set([
  "kingdoms",
  "children",
  "parents",
  "specie",
  "species-cache",
]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24h
      staleTime: 1000 * 60 * 5, // 5min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const forageStore = localforage.createInstance({
  name: "treevera-db",
  storeName: "react-query-cache",
});

export const indexedDbPersister = createAsyncStoragePersister({
  storage: forageStore,
  key: "treevera-react-query-cache",
  throttleTime: 1000,
});

export const persistDehydrateOptions = {
  shouldDehydrateQuery: (query: Query) => {
    const key = query.queryKey[0] as string;
    return PERSIST_KEYS.has(key) && query.state.status === "success";
  },
};
