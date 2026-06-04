import { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Footprints,
  ShieldAlert,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { LifeArea, OnboardingGoal } from "@shared/enums";
import { LIFE_AREAS } from "@shared/enums";
import { api } from "../../convex/_generated/api";
import { useInventory } from "@/lib/inventory/store";
import { AccountForm } from "@/features/inventory/AccountForm";
import { LIFE_AREA_ICON } from "@/features/shared/display";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const GOALS: { key: OnboardingGoal; Icon: LucideIcon }[] = [
  { key: "organize", Icon: Boxes },
  { key: "prepare_device_loss", Icon: ShieldAlert },
  { key: "improve_security", Icon: ShieldCheck },
  { key: "understand_footprint", Icon: Footprints },
  { key: "workshop", Icon: Users },
];

const START_AREAS: LifeArea[] = LIFE_AREAS.filter((a) => a !== "unknown");

type Step = "goal" | "area" | "account" | "success";

export function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const { accounts, devices, addAccount } = useInventory();

  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState<OnboardingGoal | null>(null);
  const [area, setArea] = useState<LifeArea>("social");
  const [finishing, setFinishing] = useState(false);

  const complete = async (to: string) => {
    setFinishing(true);
    try {
      await completeOnboarding({ goal: goal ?? undefined });
      await navigate(to);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between gap-2 p-4">
        <span className="font-serif text-lg font-semibold">{t(($) => $.shell.title)}</span>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <ThemeToggle variant="compact" />
          <UserButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-4">
        <div className="flex w-full max-w-lg flex-col gap-6">
          {step !== "success" && (
            <StepHeader
              current={step === "goal" ? 1 : step === "area" ? 2 : 3}
              title={
                step === "goal"
                  ? t(($) => $.onboarding.goalTitle)
                  : step === "area"
                    ? t(($) => $.onboarding.areaTitle)
                    : t(($) => $.onboarding.firstAccountTitle)
              }
              subtitle={
                step === "goal"
                  ? t(($) => $.onboarding.goalSubtitle)
                  : step === "area"
                    ? t(($) => $.onboarding.areaSubtitle)
                    : t(($) => $.onboarding.firstAccountSubtitle)
              }
            />
          )}

          {step === "goal" && (
            <div className="flex flex-col gap-3">
              {GOALS.map(({ key, Icon }) => (
                <Card
                  key={key}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setGoal(key);
                    setStep("area");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setGoal(key);
                      setStep("area");
                    }
                  }}
                  className="cursor-pointer gap-0 p-4 transition-colors hover:border-primary/60 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t(($) => $.onboarding.goals[key].title)}</div>
                      <div className="text-xs text-muted-foreground">
                        {t(($) => $.onboarding.goals[key].desc)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {step === "area" && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {START_AREAS.map((a) => {
                  const Icon = LIFE_AREA_ICON[a];
                  return (
                    <Card
                      key={a}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setArea(a);
                        setStep("account");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setArea(a);
                          setStep("account");
                        }
                      }}
                      className="cursor-pointer items-center gap-2 p-4 text-center transition-colors hover:border-primary/60 hover:bg-muted/50"
                    >
                      <Icon className="size-6 text-muted-foreground" />
                      <span className="text-xs font-medium">{t(($) => $.lifeAreas[a])}</span>
                    </Card>
                  );
                })}
              </div>
              <BackButton onClick={() => setStep("goal")} />
            </>
          )}

          {step === "account" && (
            <>
              <AccountForm
                accounts={accounts}
                devices={devices}
                lockedLifeArea={area}
                onSubmit={async (input) => {
                  await addAccount(input);
                  setStep("success");
                }}
                onCancel={() => setStep("area")}
              />
              <button
                type="button"
                onClick={() => void complete("/app")}
                disabled={finishing}
                className="text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                {t(($) => $.onboarding.skip)}
              </button>
            </>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </div>
              <h1 className="font-serif text-2xl font-semibold text-balance">
                {t(($) => $.onboarding.successTitle)}
              </h1>
              <p className="text-sm text-muted-foreground text-balance">
                {t(($) => $.onboarding.successSubtitle)}
              </p>
              <Button
                size="lg"
                onClick={() => void complete("/app/map")}
                disabled={finishing}
                className="mt-2"
              >
                {t(($) => $.onboarding.start)}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StepHeader({
  current,
  title,
  subtitle,
}: {
  current: number;
  title: string;
  subtitle: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t(($) => $.onboarding.step, { current, total: 3 })}
      </span>
      <h1 className="font-serif text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      {t(($) => $.common.back)}
    </button>
  );
}
