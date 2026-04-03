import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const AuthCallback = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
          const bc = new BroadcastChannel("supabase-auth");
          bc.postMessage("oauth_complete");
          bc.close();
        } catch (e) {
          console.warn("BroadcastChannel failed:", e);
        }

        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(
              { type: "OAUTH_COMPLETE" },
              window.location.origin,
            );
          } catch (e) {
            console.warn("postMessage failed:", e);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        window.close();
      } catch (error) {
        console.error("[Popup] Error:", error);

        setTimeout(() => {
          window.close();
        }, 1000);
      }
    };

    void handleCallback();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 animate-spin text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-semibold">
          {t("auth.finalizingAuth")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("auth.waitSeconds")}
        </p>
      </div>
    </div>
  );
};
