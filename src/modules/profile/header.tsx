import { useState } from "react";
import { formatUserSinceDate } from "@/common/utils/date-formats";
import { authStore } from "@/store/auth/atoms";
import { useAtomValue } from "jotai";
import { Menu } from "../header/menu";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { AvatarModal } from "@/common/components/avatar-modal";

type PublicProfileHeader = {
  name: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export const HeaderProfile = ({
  publicProfile,
}: {
  publicProfile?: PublicProfileHeader;
}) => {
  const { t } = useTranslation();
  const userDb = useAtomValue(authStore.userDb);
  const isOwner = !publicProfile;
  const data = publicProfile ?? userDb;
  const [photoOpen, setPhotoOpen] = useState(false);

  return (
    <header className="flex flex-col gap-4 rounded-2xl">
      <div className="flex items-center gap-3">
        {isOwner && <Menu isProfilePage />}

        {!isOwner && (
          <button
            className="shrink-0 rounded-full disabled:cursor-default"
            onClick={() => data?.avatar_url && setPhotoOpen(true)}
            disabled={!data?.avatar_url}
          >
            <Avatar className="size-16">
              <AvatarImage
                src={data?.avatar_url ?? undefined}
                alt={data?.name}
              />
              <AvatarFallback className="bg-green-600 text-white">
                {data?.name?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
          </button>
        )}

        {photoOpen && data?.avatar_url && (
          <AvatarModal
            src={data.avatar_url}
            alt={data.name}
            onClose={() => setPhotoOpen(false)}
          />
        )}

        <div className="flex-1">
          <h1 className="text-xl font-bold">{data?.name}</h1>
          {data?.username && (
            <p className="text-muted-foreground text-xs">@{data.username}</p>
          )}
          <span className="mt-0.5 flex items-center gap-1 text-xs">
            {t("profilePage.memberSince")}
            <strong>{formatUserSinceDate(data?.created_at as string)}</strong>
          </span>
        </div>

        {isOwner && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="size-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>{t("profilePage.devNoticeTitle")}</DialogTitle>
                <DialogDescription>
                  {t("profilePage.devNoticeDescription")}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  );
};
