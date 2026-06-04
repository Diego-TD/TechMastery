import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  KeyRound,
  Laptop,
  MailX,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type { SimulationKind } from "@/lib/mock/types";
import { useInventory, useSimulation } from "@/lib/mock/store";
import { topHub } from "@/lib/mock/derive";
import { SEVERITY_CLASS, type Severity } from "@/features/shared/display";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SEVERITY_ORDER: Record<Severity, number> = { blocked: 0, at_risk: 1, ok: 2 };

type SimulationScenario = {
  id: string;
  kind: SimulationKind;
  targetId?: string;
  title: string;
  question: string;
  Icon: LucideIcon;
};

export function SimulationsPage() {
  const { t } = useTranslation();
  const { accounts, devices, phoneNumbers } = useInventory();
  const [scenario, setScenario] = useState<SimulationScenario | null>(null);

  const hub = topHub(accounts);
  const hubAccount = hub ? accounts.find((a) => a.id === hub.id) : undefined;
  const passwordManager = accounts.find((a) => a.isPasswordManager);
  const scenarioDevices = devices.filter((d) => ["phone", "laptop", "desktop"].includes(d.kind));
  const deviceTargets = (scenarioDevices.length > 0 ? scenarioDevices : devices).slice(0, 2);
  const scenarios: SimulationScenario[] = [
    ...deviceTargets.map((device) => ({
      id: `device-${device.id}`,
      kind: "lose_device" as const,
      targetId: device.id,
      title: t(($) => $.sim.scenarios.lose_device.title, { name: device.name }),
      question: t(($) => $.sim.scenarios.lose_device.question, { name: device.name }),
      Icon: device.kind === "phone" ? Smartphone : Laptop,
    })),
    ...phoneNumbers.map((phone) => ({
      id: `phone-${phone.id}`,
      kind: "lose_phone_number" as const,
      targetId: phone.id,
      title: t(($) => $.sim.scenarios.lose_phone_number.title, { name: phone.label }),
      question: t(($) => $.sim.scenarios.lose_phone_number.question, { name: phone.label }),
      Icon: Smartphone,
    })),
    ...(hubAccount
      ? [
          {
            id: `email-${hubAccount.id}`,
            kind: "email_locked" as const,
            targetId: hubAccount.id,
            title: t(($) => $.sim.scenarios.email_locked.title, { name: hubAccount.name }),
            question: t(($) => $.sim.scenarios.email_locked.question, { name: hubAccount.name }),
            Icon: MailX,
          },
        ]
      : []),
    ...(passwordManager
      ? [
          {
            id: `password-manager-${passwordManager.id}`,
            kind: "password_manager_unavailable" as const,
            targetId: passwordManager.id,
            title: t(($) => $.sim.scenarios.password_manager_unavailable.title, {
              name: passwordManager.name,
            }),
            question: t(($) => $.sim.scenarios.password_manager_unavailable.question, {
              name: passwordManager.name,
            }),
            Icon: KeyRound,
          },
        ]
      : []),
    {
      id: "card-stolen",
      kind: "card_stolen",
      title: t(($) => $.sim.scenarios.card_stolen.title),
      question: t(($) => $.sim.scenarios.card_stolen.question),
      Icon: CreditCard,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header>
        <h1 className="font-serif text-2xl font-semibold">{t(($) => $.sim.title)}</h1>
        <p className="text-sm text-muted-foreground">{t(($) => $.sim.subtitle)}</p>
      </header>

      {scenario === null ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {scenarios.map((nextScenario) => {
            const { id, title, question, Icon } = nextScenario;
            return (
              <Card
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => setScenario(nextScenario)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && setScenario(nextScenario)
                }
                className="cursor-pointer gap-0 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{title}</div>
                    <div className="text-xs text-muted-foreground">{question}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <SimulationResultView scenario={scenario} onBack={() => setScenario(null)} />
      )}
    </div>
  );
}

function SimulationResultView({
  scenario,
  onBack,
}: {
  scenario: SimulationScenario;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const result = useSimulation(scenario.kind, scenario.targetId);
  const { accounts } = useInventory();
  const nameOf = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  const impacts = [...result.impacts].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
  const nothingBreaks = result.blockedCount === 0 && result.atRiskCount === 0;

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-1 p-5">
        <h2 className="font-serif text-lg font-semibold">{scenario.question}</h2>
        <div className="mt-1 flex flex-wrap gap-2 text-sm">
          {nothingBreaks ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              {t(($) => $.sim.summaryNone)}
            </span>
          ) : (
            <>
              {result.blockedCount > 0 && (
                <span className="font-medium text-destructive">
                  {t(($) => $.sim.summaryBlocked, { count: result.blockedCount })}
                </span>
              )}
              {result.atRiskCount > 0 && (
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {t(($) => $.sim.summaryAtRisk, { count: result.atRiskCount })}
                </span>
              )}
            </>
          )}
        </div>
      </Card>

      {impacts.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t(($) => $.sim.affectedTitle)}
          </h3>
          {impacts.map((impact) => (
            <Card
              key={impact.accountId}
              className={`gap-0 border p-3 ${SEVERITY_CLASS[impact.severity]}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {nameOf(impact.accountId)}
                  </div>
                  <div className="text-xs">{t(($) => $.sim.reasons[impact.reason])}</div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {t(($) => $.sim.severity[impact.severity])}
                </span>
              </div>
            </Card>
          ))}
        </section>
      )}

      <Button variant="outline" onClick={onBack} className="w-fit">
        {t(($) => $.sim.runAgain)}
      </Button>
    </div>
  );
}
