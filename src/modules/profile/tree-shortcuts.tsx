import { Image } from "@/common/components/image";
import { Button } from "@/common/components/ui/button";
import type { Shortcuts } from "@/common/types/user";
import { getRankIcon } from "@/common/utils/tree/ranks";
import { updateUserShortcut } from "@/common/utils/supabase/add_shortcut";
import { authStore } from "@/store/auth/atoms";
import { useAtom } from "jotai";
import { Zap, Pencil, X, Check } from "lucide-react";
import { useState, useRef, useEffect, Fragment } from "react";
import { KEY_KINGDOM_BY_NAME } from "@/common/constants/tree";
import type { Kingdom } from "@/common/types/api";
import type { PathNode } from "@/common/types/tree-atoms";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import { useTranslation } from "react-i18next";

export const TreeShortcuts = () => {
  const { t } = useTranslation();
  const [userDb, setUserDb] = useAtom(authStore.userDb);
  const { navigateToNodes } = useTreeNavigation();

  const [editName, setEditName] = useState<{
    isEdit: boolean;
    kingdom?: Kingdom;
    index?: number;
    newName: string;
  }>({ isEdit: false, newName: "" });
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editName.isEdit && inputRef.current) inputRef.current.focus();
  }, [editName.isEdit]);

  if (!userDb) return null;

  const treeShortcuts = userDb.game_info?.shortcuts;
  if (!treeShortcuts) return null;

  const handleClick = (pathNode: PathNode[]) => {
    navigateToNodes(pathNode, true);
  };

  const removeShortcut = async (kingdom: keyof Shortcuts, index: number) => {
    if (!userDb) return;
    if (!treeShortcuts) return null;

    const shortcutsOfKingdom = treeShortcuts[kingdom] ?? [];
    const updatedShortcutsOfKingdom = shortcutsOfKingdom.filter(
      (_, i) => i !== index,
    );

    void (async () => {
      const userUpdated = await updateUserShortcut(userDb, (prevShortcuts) => {
        return {
          ...prevShortcuts,
          [kingdom]: updatedShortcutsOfKingdom,
        };
      });

      if (userUpdated) setUserDb(userUpdated);
    })();
  };

  const editShortcutName = async () => {
    if (!editName.isEdit || !userDb || !editName.kingdom) return;
    const { kingdom, index, newName } = editName;
    if (!newName.trim()) return;

    const shortcutsOfKingdom = treeShortcuts[kingdom] ?? [];
    if (!shortcutsOfKingdom[index!]) return;

    const updatedShortcutsOfKingdom = [...shortcutsOfKingdom];
    updatedShortcutsOfKingdom[index!] = {
      ...updatedShortcutsOfKingdom[index!],
      name: newName.trim(),
    };

    void (async () => {
      const userUpdated = await updateUserShortcut(userDb, (prevShortcuts) => {
        return {
          ...prevShortcuts,
          [kingdom]: updatedShortcutsOfKingdom,
        };
      });

      if (userUpdated) setUserDb(userUpdated);
    })();
    cancelEdit();
  };

  const cancelEdit = () => setEditName({ isEdit: false, newName: "" });
  const kingdoms = Object.keys(treeShortcuts) as (keyof Shortcuts)[];

  return (
    <div className="space-y-3">
      <h2 className="border-b">{t("shortcuts.title")}</h2>

      {kingdoms.map((kingdom) => {
        const shortcuts = treeShortcuts[kingdom];
        if (!shortcuts?.length) return null;

        return (
          <div key={kingdom} className="space-y-3">
            {shortcuts.map((shortcut, index) => {
              if (!shortcut?.nodes) return null;

              const isEditing =
                editName.isEdit &&
                editName.kingdom === kingdom &&
                editName.index === index;

              return (
                <div
                  key={index}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-md border py-1 pl-2.5"
                >
                  <div
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
                    onClick={() => !isEditing && handleClick(shortcut.nodes)}
                  >
                    <figure className="flex size-6 shrink-0 items-center">
                      <Image
                        src={getRankIcon(KEY_KINGDOM_BY_NAME[kingdom])}
                        alt={`${kingdom} icon`}
                        className="size-5"
                      />
                    </figure>

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editName.newName}
                          maxLength={52}
                          onChange={(e) =>
                            setEditName((prev) => ({
                              ...prev,
                              newName: e.target.value,
                            }))
                          }
                          className="rounded border px-1 text-sm"
                        />
                      ) : (
                        <p className="truncate text-sm font-medium">
                          {shortcut.name}
                        </p>
                      )}
                      <span className="text-muted-foreground block truncate text-xs leading-tight">
                        {shortcut.nodes.map((node, i) => (
                          <Fragment key={node.key}>
                            {node.name ?? node.rank}
                            {i < shortcut.nodes.length - 1 && " > "}
                          </Fragment>
                        ))}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-px border-l px-1">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-green-600 hover:text-green-800"
                          title={t("shortcuts.saveEdit")}
                          onClick={editShortcutName}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-blue-500 hover:text-blue-800"
                          title={t("shortcuts.cancelEdit")}
                          onClick={cancelEdit}
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground size-6 hover:text-blue-700"
                          title={t("shortcuts.editName")}
                          onClick={() =>
                            setEditName({
                              isEdit: true,
                              kingdom,
                              index,
                              newName: shortcut.name,
                            })
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground size-6 hover:text-red-700"
                          onClick={() => removeShortcut(kingdom, index)}
                          title={t("shortcuts.remove")}
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {kingdoms.every((k) => !treeShortcuts[k]?.length) && (
        <div className="text-muted-foreground py-6 text-center">
          <Zap className="text-muted-foreground/50 mx-auto mb-3 h-10 w-10" />
          <div className="mb-1 text-sm font-medium">{t("shortcuts.empty")}</div>
          <div className="text-xs">{t("shortcuts.emptyHint")}</div>
        </div>
      )}

      <div className="bg-muted text-muted-foreground rounded-lg p-2 text-center text-xs italic">
        {t("shortcuts.tip")}
      </div>
    </div>
  );
};
