import { useEffect } from "react";

export const AuthCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("📡 [Popup] Iniciando callback...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("✅ [Popup] Tempo de processamento concluído");

        try {
          const bc = new BroadcastChannel("supabase-auth");
          bc.postMessage("oauth_complete");
          bc.close();
          console.log("✅ [Popup] BroadcastChannel enviado");
        } catch (e) {
          console.warn("⚠️ [Popup] BroadcastChannel falhou:", e);
        }

        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(
              { type: "OAUTH_COMPLETE" },
              window.location.origin,
            );
            console.log("✅ [Popup] postMessage enviado");
          } catch (e) {
            console.warn("⚠️ [Popup] postMessage falhou:", e);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("🔒 [Popup] Fechando janela...");
        window.close();
      } catch (error) {
        console.error("❌ [Popup] Erro:", error);

        console.log("🔒 [Popup] Fechando mesmo com erro...");
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
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
        <h1 className="mb-2 text-xl font-semibold text-slate-800">
          Finalizando autenticação...
        </h1>
        <p className="text-sm text-slate-600">Aguarde alguns segundos.</p>
      </div>
    </div>
  );
};
