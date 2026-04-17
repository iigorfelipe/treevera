import { useParams } from "@tanstack/react-router";
import { useGetSpeciesFavoriters } from "@/hooks/queries/useGetUserSeenSpecies";
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

export const SpecieFavoritersPage = () => {
  const { t } = useTranslation();
  const { specieKey } = useParams({ strict: false }) as {
    specieKey: string;
  };

  const gbifKey = specieKey ? Number(specieKey) : undefined;
  const { data: favoriters = [], isLoading } = useGetSpeciesFavoriters(gbifKey);

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
              {t("specieDetail.favoritersTitle")}
            </h1>
            {!isLoading && (
              <span className="text-muted-foreground text-xs">
                {favoriters.length} {t("lists.people")}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="bg space-y-2 p-4">
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
        ) : favoriters.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground text-center">
              <Heart className="mx-auto mb-3 size-16 opacity-30" />
              <p className="text-sm">{t("specieDetail.noFavoritersYet")}</p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {favoriters.map((user, i) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
              >
                <Link
                  to="/$username"
                  params={{ username: user.user_username }}
                  className="hover:bg-muted/50 flex items-center gap-3 py-3 transition-colors"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={user.user_avatar_url ?? undefined}
                      alt={user.user_name}
                    />
                    <AvatarFallback className="bg-green-600 text-sm text-white">
                      {user.user_name?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user.user_name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      @{user.user_username}
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
