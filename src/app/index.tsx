import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes";
import { useIsRestoring } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/use-auth-profile";

export const App = () => {
  const isRestoring = useIsRestoring();

  const { isInitializing } = useAuth();

  if (isRestoring) {
    return <div>Restaurando cache...</div>;
  }

  if (isInitializing) {
    return <div>Inicializando...</div>;
  }

  return <RouterProvider router={router} />;
};
