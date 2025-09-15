import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes";
import { useAuth } from "@/hooks/auth/use-auth-profile";
import { useIsRestoring } from "@tanstack/react-query";

export const App = () => {
  useAuth();

  const isRestoring = useIsRestoring();

  if (isRestoring) {
    return <div>Restaurando cache...</div>;
  }

  return <RouterProvider router={router} />;
};
