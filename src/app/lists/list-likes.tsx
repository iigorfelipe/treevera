import { useParams } from "@tanstack/react-router";
import { useGetListLikers } from "@/hooks/queries/useGetLists";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Skeleton } from "@/common/components/ui/skeleton";

export const ListLikesPage = () => {
  const { t } = useTranslation();
  const { username, listSlug } = useParams({ strict: false }) as {
    username: string;
    listSlug: string;
  };

  const { data: likers = [], isLoading } = useGetListLikers(username, listSlug);

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b"
      >
        <div className="py-4">
          <div className="min-w-0">
            <h1 className="text-base leading-tight font-bold">
              {t("lists.likesTitle")}
            </h1>
            {!isLoading && (
              <span className="text-muted-foreground text-xs">
                {likers.length} {t("lists.people")}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : likers.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground text-center">
              <Heart className="mx-auto mb-3 size-16 opacity-30" />
              <p className="text-sm">{t("lists.noLikesYet")}</p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {likers.map((liker, i) => (
              <motion.div
                key={liker.user_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
              >
                <Link
                  to="/$username"
                  params={{ username: liker.user_username }}
                  className="hover:bg-muted/50 flex items-center gap-3 py-3 transition-colors"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={liker.user_avatar_url ?? undefined}
                      alt={liker.user_name}
                    />
                    <AvatarFallback className="bg-green-600 text-sm text-white">
                      {liker.user_name?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {liker.user_name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      @{liker.user_username}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
