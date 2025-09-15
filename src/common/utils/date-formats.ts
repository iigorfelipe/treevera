import i18next from "i18next";

// #region UserSince
export const formatUserSinceDate = (dateString: string | Date): string => {
  if (!dateString) return "";

  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  const formatted = new Intl.DateTimeFormat(i18next.language, {
    month: "long",
    year: "numeric",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// #region UserActivity
export const formatActivityDate = (dateString: string | Date): string => {
  if (!dateString) return "";

  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  // menos de 1 minuto
  if (diffSec < 60) {
    return i18next.t("time.now", "Agora mesmo");
  }

  // até 59 minutos → arredonda de 5 em 5 min
  if (diffMin < 60) {
    const rounded = Math.floor(diffMin / 5) * 5 || 1;
    return i18next.t("time.minutesAgo", {
      count: rounded,
      defaultValue: "{{count}}m atrás",
    });
  }

  if (diffHours < 24) {
    return i18next.t("time.hoursAgo", {
      count: diffHours,
      defaultValue: "{{count}}h atrás",
    });
  }

  if (diffDays === 1) {
    return i18next.t("time.yesterday", "Ontem");
  }
  if (diffDays <= 3) {
    return i18next.t("time.daysAgo", {
      count: diffDays,
      defaultValue: "{{count}} dias atrás",
    });
  }

  // fallback → data dd/mm/yyyy
  return new Intl.DateTimeFormat(i18next.language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};
