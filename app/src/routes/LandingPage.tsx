import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

/**
 * Unauthenticated entry screen (TEC-13). Shown only when signed out; the route
 * gate redirects authenticated users away. No product data before auth.
 */
export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-end gap-2 p-4">
        <LanguageSwitcher variant="compact" />
        <ThemeToggle variant="compact" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {t(($) => $.shell.title)}
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              {t(($) => $.landing.valueProp)}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:max-w-xs">
            <SignUpButton mode="modal">
              <Button size="lg" className="w-full">
                {t(($) => $.auth.signUp)}
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" variant="outline" className="w-full">
                {t(($) => $.auth.signIn)}
              </Button>
            </SignInButton>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
