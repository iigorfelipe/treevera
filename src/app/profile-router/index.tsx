import { useParams } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { Profile } from "@/app/profile";
import { UserProfilePage } from "@/app/user-profile";
import { useDocumentTitle } from "@/hooks/use-document-title";

export const ProfileRouter = () => {
  const { username } = useParams({ strict: false }) as { username: string };
  const userDb = useAtomValue(authStore.userDb);

  useDocumentTitle(`@${username}`);

  if (userDb?.username === username) {
    return <Profile />;
  }

  return <UserProfilePage username={username} />;
};
