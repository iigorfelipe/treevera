import { useState, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Volume2,
  VolumeX,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  Loader,
  LogOut,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  Slider as RadixSlider,
  SliderThumb,
  SliderTrack,
  SliderRange,
} from "@radix-ui/react-slider";
import { authStore } from "@/store/auth/atoms";
import { audioSettingsAtom } from "@/store/audio";
import { useUserSettings } from "@/hooks/user/useUserSettings";
import { useAuth } from "@/hooks/auth/use-auth-profile";
import { useTheme } from "@/context/theme";
import { clearAllCache } from "@/services/queryClient";
import { cn } from "@/common/utils/cn";
import i18n from "@/common/i18n";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import {
  checkUsernameAvailable,
  updateUsername,
} from "@/common/utils/supabase/update-username";

const Toggle = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: () => void;
}) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onCheckedChange}
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none",
      checked ? "bg-green-600" : "bg-input",
    )}
  >
    <span
      className={cn(
        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
        checked ? "translate-x-5" : "translate-x-0",
      )}
    />
  </button>
);

export type SectionId =
  | "account"
  | "tree"
  | "challenges"
  | "theme"
  | "language"
  | "advanced";

const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: "account", label: "Conta" },
  { id: "tree", label: "Árvore Taxonômica" },
  { id: "challenges", label: "Desafios" },
  { id: "theme", label: "Tema" },
  { id: "language", label: "Idioma" },
  { id: "advanced", label: "Avançado" },
];

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function RadioGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="divide-y rounded-xl border">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex w-full items-center justify-between px-5 py-3.5 text-sm transition-colors",
            value === opt.value
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span>{opt.label}</span>
          <span
            className={cn(
              "size-4 rounded-full border-2 transition-colors",
              value === opt.value
                ? "border-green-600 bg-green-600"
                : "border-muted-foreground/30",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && (
        <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
      )}
    </div>
  );
}

type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "invalid";

const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

function AccountSection({ flat }: { flat?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const [userDb, setUserDb] = useAtom(authStore.userDb);
  const { logout, isLoggingOut } = useAuth();

  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [savingUsername, setSavingUsername] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStartEdit = () => {
    setUsernameInput(userDb?.username ?? "");
    setUsernameStatus("idle");
    setSaveError(null);
    setEditingUsername(true);
  };

  const handleCancelEdit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setEditingUsername(false);
    setUsernameStatus("idle");
    setSaveError(null);
  };

  const handleUsernameChange = (value: string) => {
    const lower = value.toLowerCase();
    setUsernameInput(lower);
    setSaveError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (lower === userDb?.username) {
      setUsernameStatus("idle");
      return;
    }

    if (!USERNAME_REGEX.test(lower)) {
      setUsernameStatus(lower.length === 0 ? "idle" : "invalid");
      return;
    }

    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(lower);
        setUsernameStatus(available ? "available" : "unavailable");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);
  };

  const handleSaveUsername = async () => {
    if (!userDb || usernameStatus !== "available") return;
    setSavingUsername(true);
    setSaveError(null);
    try {
      await updateUsername(userDb.id, usernameInput);
      setUserDb({ ...userDb, username: usernameInput });
      setEditingUsername(false);
      setUsernameStatus("idle");
    } catch {
      setSaveError("Erro ao salvar. Tente novamente.");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm(t("nav.logoutWarning"));
    if (!confirmed) return;
    await logout();
    navigate({ to: "/" });
  };

  const usernameStatusEl = (() => {
    if (usernameStatus === "checking")
      return (
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <Loader className="size-3 animate-spin" /> Verificando…
        </span>
      );
    if (usernameStatus === "available")
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <Check className="size-3" /> Disponível
        </span>
      );
    if (usernameStatus === "unavailable")
      return (
        <span className="text-destructive flex items-center gap-1 text-xs">
          <X className="size-3" /> Já em uso
        </span>
      );
    if (usernameStatus === "invalid")
      return (
        <span className="text-muted-foreground text-xs">
          3–30 caracteres: letras minúsculas, números e _
        </span>
      );
    return null;
  })();

  const usernameBlock = editingUsername ? (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">@</span>
        <input
          value={usernameInput}
          onChange={(e) => handleUsernameChange(e.target.value)}
          placeholder="seu_username"
          maxLength={30}
          autoFocus
          className="border-input bg-background min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-green-600"
        />
        <button
          onClick={handleSaveUsername}
          disabled={usernameStatus !== "available" || savingUsername}
          className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-40"
        >
          {savingUsername ? (
            <Loader className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          Salvar
        </button>
        <button
          onClick={handleCancelEdit}
          className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
      {usernameStatusEl}
      {saveError && <p className="text-destructive text-xs">{saveError}</p>}
    </div>
  ) : (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">@{userDb?.username}</p>
        <p className="text-muted-foreground text-xs">Identificador público</p>
      </div>
      <button
        onClick={handleStartEdit}
        className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
        title="Editar username"
      >
        <Pencil className="size-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <SectionHeading title="Conta" description="Informações da sua conta." />

      {isAuthenticated && userDb ? (
        flat ? (
          <div className="space-y-1">
            <div className="flex items-center gap-4 py-3">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={userDb.avatar_url} alt="User" />
                <AvatarFallback className="bg-green-600 text-sm text-white">
                  {userDb.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userDb.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {userDb.email}
                </p>
              </div>
            </div>
            <div className="py-2">{usernameBlock}</div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive flex items-center gap-2 py-3 text-sm transition-opacity disabled:opacity-60"
            >
              {isLoggingOut ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {t("logout")}
            </button>
          </div>
        ) : (
          <div className="divide-y rounded-xl border">
            <div className="flex items-center gap-4 p-5">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={userDb.avatar_url} alt="User" />
                <AvatarFallback className="bg-green-600 text-sm text-white">
                  {userDb.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userDb.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {userDb.email}
                </p>
              </div>
            </div>
            <div className="px-5 py-3.5">{usernameBlock}</div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive hover:bg-destructive/5 flex w-full items-center gap-3 px-5 py-3.5 text-sm transition-colors disabled:opacity-60"
            >
              {isLoggingOut ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {t("logout")}
            </button>
          </div>
        )
      ) : (
        <p className="text-muted-foreground text-sm">
          Você não está autenticado.{" "}
          <button
            onClick={() => navigate({ to: "/login" })}
            className="text-foreground underline underline-offset-2"
          >
            Fazer login
          </button>
        </p>
      )}
    </div>
  );
}

function TreeSection({
  showEmptyNodes,
  toggleShowEmptyNodes,
  showRankBadge,
  toggleShowRankBadge,
  flat,
}: {
  showEmptyNodes: boolean;
  toggleShowEmptyNodes: () => void;
  showRankBadge: boolean;
  toggleShowRankBadge: () => void;
  flat?: boolean;
}) {
  const rows = (
    <>
      <SettingRow
        title="Exibir nós sem descendentes"
        description="Por padrão, apenas nós com descendentes são exibidos. Ative para mostrar todos os nós."
      >
        <Toggle
          checked={showEmptyNodes}
          onCheckedChange={toggleShowEmptyNodes}
        />
      </SettingRow>
      <SettingRow
        title="Exibir badge de rank"
        description="Sempre exibir o badge de rank (ex: Order, Family) ao lado de cada nó. Quando desativado, o badge aparece apenas ao passar o mouse."
      >
        <Toggle checked={showRankBadge} onCheckedChange={toggleShowRankBadge} />
      </SettingRow>
    </>
  );

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Árvore Taxonômica"
        description="Controle como a árvore taxonômica é exibida."
      />
      {flat ? (
        rows
      ) : (
        <div className="divide-y rounded-xl border px-5">{rows}</div>
      )}
    </div>
  );
}

function ChallengesSection({
  audio,
  setAudio,
  flat,
}: {
  audio: { muted: boolean; volume: number };
  setAudio: (
    fn: (prev: { muted: boolean; volume: number }) => {
      muted: boolean;
      volume: number;
    },
  ) => void;
  flat?: boolean;
}) {
  const volumeRow = (
    <SettingRow
      title="Volume"
      description="Ajuste o volume dos efeitos sonoros durante os desafios."
    >
      <div className="flex items-center gap-2.5">
        <VolumeX className="text-muted-foreground size-4 shrink-0" />
        <RadixSlider
          value={[audio.volume * 100]}
          onValueChange={([v]) =>
            setAudio((prev) => ({ ...prev, volume: v / 100, muted: v === 0 }))
          }
          min={0}
          max={100}
          step={1}
          className="relative flex h-5 w-28 touch-none items-center select-none"
        >
          <SliderTrack className="relative h-1 w-full grow rounded-full bg-gray-200">
            <SliderRange className="absolute h-full rounded-full bg-green-600" />
          </SliderTrack>
          <SliderThumb className="block h-4 w-4 rounded-full bg-green-600 shadow focus:outline-none" />
        </RadixSlider>
        <Volume2 className="text-muted-foreground size-4 shrink-0" />
      </div>
    </SettingRow>
  );

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Desafios"
        description="Configurações de áudio durante os desafios."
      />
      {flat ? (
        volumeRow
      ) : (
        <div className="rounded-xl border px-5">{volumeRow}</div>
      )}
    </div>
  );
}

function ThemeSection() {
  const { t } = useTranslation();
  const { theme, changeTheme } = useTheme();

  return (
    <div className="space-y-4">
      <SectionHeading
        title={t("theme")}
        description="Escolha a aparência do aplicativo."
      />
      <RadioGroup
        value={theme}
        options={[
          { value: "light" as const, label: t("light") },
          { value: "dark" as const, label: t("dark") },
          { value: "system" as const, label: t("system") },
        ]}
        onChange={changeTheme}
      />
    </div>
  );
}

function LanguageSection() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <SectionHeading
        title={t("language")}
        description="Escolha o idioma do aplicativo."
      />
      <RadioGroup
        value={i18n.language}
        options={[
          { value: "pt", label: t("pt") },
          { value: "en", label: t("en") },
          { value: "es", label: t("es") },
        ]}
        onChange={(v) => i18n.changeLanguage(v)}
      />
    </div>
  );
}

function AdvancedSection({
  clearing,
  cleared,
  onClearCache,
  flat,
}: {
  clearing: boolean;
  cleared: boolean;
  onClearCache: () => void;
  flat?: boolean;
}) {
  const inner = (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium">Limpar cache</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Remove dados em cache como informações de espécies já consultadas. Os
          dados serão recarregados na próxima consulta.
        </p>
      </div>
      <button
        onClick={onClearCache}
        disabled={clearing || cleared}
        className="hover:bg-muted flex w-fit shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
      >
        {cleared ? (
          <>
            <CheckCircle2 className="size-3.5 text-green-600" />
            Limpo
          </>
        ) : (
          <>
            <Trash2 className="size-3.5" />
            {clearing ? "Limpando…" : "Limpar cache"}
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Avançado"
        description="Opções de cache e dados do aplicativo."
      />
      {flat ? inner : <div className="rounded-xl border px-5">{inner}</div>}
    </div>
  );
}

const VALID_SECTIONS = new Set<SectionId>([
  "account",
  "tree",
  "challenges",
  "theme",
  "language",
  "advanced",
]);

export const SettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { section } = useParams({ strict: false }) as { section?: string };
  const activeSection: SectionId =
    section && VALID_SECTIONS.has(section as SectionId)
      ? (section as SectionId)
      : "account";

  const {
    showEmptyNodes,
    toggleShowEmptyNodes,
    showRankBadge,
    toggleShowRankBadge,
  } = useUserSettings();
  const [audio, setAudio] = useAtom(audioSettingsAtom);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  async function handleClearCache() {
    setClearing(true);
    await clearAllCache();
    setClearing(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 5000);
  }

  const sharedProps = {
    showEmptyNodes,
    toggleShowEmptyNodes,
    showRankBadge,
    toggleShowRankBadge,
    audio,
    setAudio,
    clearing,
    cleared,
    onClearCache: handleClearCache,
  };

  function renderSection(id: SectionId, flat?: boolean) {
    switch (id) {
      case "account":
        return <AccountSection flat={flat} />;
      case "tree":
        return (
          <TreeSection
            showEmptyNodes={sharedProps.showEmptyNodes}
            toggleShowEmptyNodes={sharedProps.toggleShowEmptyNodes}
            showRankBadge={sharedProps.showRankBadge}
            toggleShowRankBadge={sharedProps.toggleShowRankBadge}
            flat={flat}
          />
        );
      case "challenges":
        return (
          <ChallengesSection
            audio={sharedProps.audio}
            setAudio={sharedProps.setAudio}
            flat={flat}
          />
        );
      case "theme":
        return <ThemeSection />;
      case "language":
        return <LanguageSection />;
      case "advanced":
        return (
          <AdvancedSection
            clearing={sharedProps.clearing}
            cleared={sharedProps.cleared}
            onClearCache={sharedProps.onClearCache}
            flat={flat}
          />
        );
    }
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 py-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" />
          {t("nav.back")}
        </button>
      </div>

      <div className="md:hidden">
        <div className="px-4 pb-2">
          <p className="text-xl font-semibold">Configurações</p>
        </div>
        <div className="divide-y">
          {NAV_ITEMS.map((item) => (
            <div key={item.id} className="px-4 py-6">
              {renderSection(item.id, true)}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto hidden max-w-4xl md:flex">
        <aside className="w-56 shrink-0 py-2 pr-2">
          <p className="text-muted-foreground mb-3 px-3 text-base font-semibold">
            Configurações
          </p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  navigate({
                    to: "/settings/$section",
                    params: { section: item.id },
                  })
                }
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
                  activeSection === item.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-8 py-2">
          {renderSection(activeSection)}
        </main>
      </div>
    </div>
  );
};
