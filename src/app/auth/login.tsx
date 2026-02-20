import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { useTranslation } from "react-i18next";
import { useRouter } from "@tanstack/react-router";
import { benefits } from "@/common/utils/game/benefits";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth/use-auth-profile";
import { authStore } from "@/store/auth/atoms";

const GoogleLogo = (
  <svg className="mr-3 size-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const Login = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();

  const isLoggingIn = useAtomValue(authStore.loginStatus) === "loading";
  const authError = useAtomValue(authStore.error);
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.navigate({ to: "/profile" });
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    const result = await login("google");

    if (result.success) {
      router.navigate({ to: "/profile" });
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <section className="relative z-10 mx-auto w-full max-w-lg">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("welcome")}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Entre com sua conta Google para desbloquear todos os recursos e
              salvar seu progresso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {authError && (
              <div className="bg-accent rounded-lg p-3 text-sm text-red-600">
                <p className="font-medium">Erro ao fazer login</p>
                <p className="mt-1 text-xs">{authError?.message}</p>
              </div>
            )}
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="h-12 w-full border border-gray-300 text-base font-medium shadow-sm hover:bg-gray-50"
              variant="outline"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  {GoogleLogo}
                  Continuar com Google
                </>
              )}
            </Button>

            <div className="space-y-4 border-t pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Recursos exclusivos ao entrar
                </p>
              </div>
              <ul className="grid h-48 grid-cols-1 overflow-auto 2xl:h-full">
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <li
                      key={index}
                      className={`flex items-start space-x-3 rounded-lg px-2 py-3`}
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${benefit.bgColor} ${benefit.color}`}
                      >
                        <IconComponent className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-sm font-medium ${benefit.color}`}>
                          {benefit.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {benefit.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>

          <div className="space-y-4 border-t border-slate-200 p-6 pb-1 text-gray-400">
            <p className="text-center text-sm leading-relaxed">
              Você pode continuar sem fazer login, mas não terá acesso aos
              recursos listados acima.
            </p>

            <Button
              className="h-11 w-full border border-slate-200 font-medium transition-all duration-200"
              variant="outline"
              aria-label="Voltar para página anterior"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
              Voltar
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
};
