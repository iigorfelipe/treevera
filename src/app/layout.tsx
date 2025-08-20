import { Image } from "@/common/components/image";
import { Outlet } from "@tanstack/react-router";
import Logo from "@/assets/images/avif-new-logo.avif";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/common/utils/cn";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth";

export const Layout = () => {
  const { isMobile } = useResponsive();
  const status = useAtomValue(authStore.states.authStatus);
  const user = useAtomValue(authStore.states.authUser);

  console.log("-- STATUS: ", status);
  console.log("-- USER: ", user);

  return (
    <div className="relative">
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
      <Outlet />
    </div>
  );
};
