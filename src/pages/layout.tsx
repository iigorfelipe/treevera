import { Outlet } from "@tanstack/react-router";

export const Layout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};
