import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes";
import { useAuth } from "@/hooks/auth-user2";
import { useIsRestoring } from "@tanstack/react-query";

export const App = () => {
  useAuth();

  const isRestoring = useIsRestoring();

  if (isRestoring) {
    return <div>Restaurando cache...</div>;
  }

  return <RouterProvider router={router} />;
};
