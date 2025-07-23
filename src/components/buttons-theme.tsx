import { useTheme } from "@/hooks/theme";

export const ButtonsTheme = () => {
  const { changeTheme } = useTheme();

  return (
    <>
      <button
        onClick={() => changeTheme("light")}
        className="rounded-md border border-gray-300 p-2 font-medium"
      >
        Claro
      </button>
      <button
        onClick={() => changeTheme("dark")}
        className="rounded-md border border-gray-300 p-2 font-medium"
      >
        Escuro
      </button>
      <button
        onClick={() => changeTheme("system")}
        className="rounded-md border border-gray-300 p-2 font-medium"
      >
        Sistema
      </button>
    </>
  );
};
