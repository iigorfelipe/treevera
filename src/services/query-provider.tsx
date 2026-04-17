import {
  IsRestoringProvider,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";

import { enableQueryPersistence, queryClient } from "@/services/queryClient";

export function AppQueryProvider({ children }: PropsWithChildren) {
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    void enableQueryPersistence()
      .then(async ([cleanup, restorePromise]) => {
        unsubscribe = cleanup;
        await restorePromise;
      })
      .catch(() => {
        //
      })
      .finally(() => {
        if (isMounted) {
          setIsRestoring(false);
        }
      });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <IsRestoringProvider value={isRestoring}>{children}</IsRestoringProvider>
    </QueryClientProvider>
  );
}
