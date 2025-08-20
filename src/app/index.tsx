import { useEffect, useState } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import queryClient, { persistOptions } from "@/services/queryClient";
import { router } from "@/routes";

export const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreCache = async () => {
      const [, restorePromise] = persistQueryClient(persistOptions);
      await restorePromise;
      setIsReady(true);
    };

    restoreCache();
  }, []);

  if (!isReady) {
    return <p>Restaurando cache...</p>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
