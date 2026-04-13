import { Suspense } from "react";
import { Image } from "@/common/components/image";
import { ErrorBoundary } from "@/common/components/error-boundary";
import { Outlet, useRouterState } from "@tanstack/react-router";
import Logo from "@/assets/images/avif-logo.avif";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/common/utils/cn";
import { AppHeader } from "@/modules/header/app-header";

export const Layout = () => {
  const { isMobile } = useResponsive();
  const { pathname, currentRoutePath } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      currentRoutePath: s.matches[s.matches.length - 1]?.fullPath ?? "/",
    }),
  });

  const errorBoundaryKey = (() => {
    if (currentRoutePath.startsWith("/tree")) return "tree";

    if (currentRoutePath.startsWith("/challenges")) {
      const parts = currentRoutePath.split("/").filter(Boolean);
      return `challenges/${parts[1] ?? ""}`;
    }

    return pathname;
  })();

  const isHomeRoute =
    currentRoutePath === "/" ||
    currentRoutePath.startsWith("/tree") ||
    currentRoutePath.startsWith("/challenges") ||
    currentRoutePath === "/login" ||
    currentRoutePath === "/auth-callback";

  return (
    <div className="flex h-screen flex-col">
      {!isHomeRoute && <AppHeader />}
      <div className="relative min-h-0 flex-1">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          {!isMobile && (
            <Image
              src={Logo}
              alt="Logo"
              className="absolute -top-16 -left-16 -z-50 w-64 max-w-3xl rotate-12 transform-gpu opacity-10 sm:w-80 md:w-96 lg:w-md xl:w-lg 2xl:w-full"
            />
          )}
          <Image
            src={Logo}
            alt="Logo"
            className={cn(
              "absolute -right-16 -bottom-16 -z-50 w-64 max-w-3xl scale-x-[-1] rotate-45 transform-gpu opacity-10 sm:w-80 md:w-96 lg:w-md xl:w-lg 2xl:w-full",
              isMobile && "fixed -right-6 bottom-50",
            )}
          />
        </div>
        <ErrorBoundary key={errorBoundaryKey}>
          <Suspense>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};
