import { useState } from "react";
import { formatUserSinceDate } from "@/common/utils/date-formats";
import { authStore } from "@/store/auth/atoms";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { AvatarModal } from "@/common/components/avatar-modal";
import { useGetRecentSeenSpecies } from "@/hooks/queries/useGetUserSeenSpecies";

type PublicProfileHeader = {
  name: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export const HeaderProfile = ({
  publicProfile,
  userId,
}: {
  publicProfile?: PublicProfileHeader;
  userId?: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userDb = useAtomValue(authStore.userDb);
  const data = publicProfile ?? userDb;
  const [photoOpen, setPhotoOpen] = useState(false);

  const targetUserId = userId ?? userDb?.id;
  const { data: recentData } = useGetRecentSeenSpecies(4, targetUserId);
  const totalSpeciesSeen = recentData?.totalCount ?? 0;

  const handleGalleryClick = () => {
    const username = publicProfile?.username ?? userDb?.username;
    if (username) {
      navigate({ to: "/$username/species-gallery", params: { username } });
    }
  };

  return (
    <header className="flex flex-col gap-4 rounded-2xl">
      <div className="flex items-start gap-3">
        <button
          className="shrink-0 rounded-full disabled:cursor-default"
          onClick={() => data?.avatar_url && setPhotoOpen(true)}
          disabled={!data?.avatar_url}
        >
          <Avatar className="size-14">
            <AvatarImage
              src={data?.avatar_url ?? undefined}
              alt={data?.name}
            />
            <AvatarFallback className="bg-green-600 text-white">
              {data?.name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
        </button>

        {photoOpen && data?.avatar_url && (
          <AvatarModal
            src={data.avatar_url}
            alt={data.name}
            onClose={() => setPhotoOpen(false)}
          />
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold leading-tight">{data?.name}</h1>
          {data?.username && (
            <p className="text-muted-foreground text-xs">@{data.username}</p>
          )}
          <span className="text-muted-foreground mt-0.5 block text-xs">
            {t("profilePage.memberSince")}{" "}
            <strong className="text-foreground">
              {formatUserSinceDate(data?.created_at as string)}
            </strong>
          </span>
        </div>

        {totalSpeciesSeen > 0 && (
          <button
            onClick={handleGalleryClick}
            className="text-muted-foreground hover:text-foreground shrink-0 flex flex-col items-center gap-0.5 pt-0.5 transition-colors"
          >
            <span className="text-foreground text-xl font-bold leading-none">
              {totalSpeciesSeen}
            </span>
            <span className="text-muted-foreground max-w-[64px] text-center text-[10px] leading-tight">
              {t("progress.speciesExplored")}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
