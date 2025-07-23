import { QueryClient } from "@tanstack/react-query";
import { type PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

export const persistOptions: PersistQueryClientOptions = {
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60,
};

export default queryClient;
