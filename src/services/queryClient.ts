import { QueryClient, type Query } from "@tanstack/react-query";
import type {
  AsyncStorage,
  Persister,
} from "@tanstack/query-persist-client-core";

const PERSIST_KEYS = new Set([
  "kingdoms",
  "children",
  "parents",
  "specie",
  "species-cache",
]);

const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24 * 3; // 3 dias

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

type LocalForageStore = AsyncStorage<string> & {
  clear: () => Promise<void>;
};

let forageStorePromise: Promise<LocalForageStore> | null = null;
let persisterPromise: Promise<Persister> | null = null;

async function getForageStore() {
  forageStorePromise ??= import("localforage").then(
    (module) =>
      module.default.createInstance({
        name: "treevera-db",
        storeName: "react-query-cache",
      }) as LocalForageStore,
  );

  return forageStorePromise;
}

async function getIndexedDbPersister() {
  persisterPromise ??= Promise.all([
    import("@tanstack/query-async-storage-persister"),
    getForageStore(),
  ]).then(([{ createAsyncStoragePersister }, forageStore]) =>
    createAsyncStoragePersister({
      storage: forageStore,
      key: "treevera-react-query-cache",
      throttleTime: 1000,
    }),
  );

  return persisterPromise;
}

export async function clearAllCache() {
  queryClient.clear();
  const forageStore = await getForageStore();
  await forageStore.clear();
}

export const persistDehydrateOptions = {
  shouldDehydrateQuery: (query: Query) => {
    const key = query.queryKey[0] as string;
    return PERSIST_KEYS.has(key) && query.state.status === "success";
  },
};

export async function enableQueryPersistence() {
  const [{ persistQueryClient }, persister] = await Promise.all([
    import("@tanstack/query-persist-client-core"),
    getIndexedDbPersister(),
  ]);

  return persistQueryClient({
    queryClient,
    persister,
    maxAge: PERSIST_MAX_AGE,
    dehydrateOptions: persistDehydrateOptions,
  });
}
