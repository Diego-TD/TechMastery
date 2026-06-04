import { UserButton } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Onboarding placeholder. Reachable only when the user's status is
 * NEEDS_ONBOARDING; the route gate enforces that. The onboarding mutation is
 * out of scope — flip `users.status` in Convex to test the onboarded flow.
 */
export function OnboardingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-end gap-2 p-4">
        <LanguageSwitcher variant="compact" />
        <ThemeToggle variant="compact" />
        <UserButton />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t(($) => $.onboarding.title)}
          </h1>
          <p className="text-muted-foreground text-balance">
            {t(($) => $.onboarding.subtitle)}
          </p>
        </div>
      </main>
    </div>
  );
}

export default OnboardingPage;
