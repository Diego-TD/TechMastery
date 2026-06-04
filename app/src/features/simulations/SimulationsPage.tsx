import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudOff,
  CreditCard,
  KeyRound,
  Laptop,
  MailX,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type { SimulationKind } from "@/lib/mock/types";
import { useInventory, useSimulation } from "@/lib/mock/store";
import { SEVERITY_CLASS, type Severity } from "@/features/shared/display";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SCENARIOS: { kind: SimulationKind; Icon: LucideIcon }[] = [
  { kind: "lose_phone", Icon: Smartphone },
  { kind: "laptop_dies", Icon: Laptop },
  { kind: "email_locked", Icon: MailX },
  { kind: "card_stolen", Icon: CreditCard },
  { kind: "cloud_unavailable", Icon: CloudOff },
  { kind: "password_manager_unavailable", Icon: KeyRound },
];

const SEVERITY_ORDER: Record<Severity, number> = { blocked: 0, at_risk: 1, ok: 2 };

export function SimulationsPage() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<SimulationKind | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header>
        <h1 className="font-serif text-2xl font-semibold">{t(($) => $.sim.title)}</h1>
        <p className="text-sm text-muted-foreground">{t(($) => $.sim.subtitle)}</p>
      </header>

      {kind === null ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SCENARIOS.map(({ kind: k, Icon }) => (
            <Card
              key={k}
              role="button"
              tabIndex={0}
              onClick={() => setKind(k)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setKind(k)}
              className="cursor-pointer gap-0 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t(($) => $.sim.scenarios[k].title)}</div>
                  <div className="text-xs text-muted-foreground">
                    {t(($) => $.sim.scenarios[k].question)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <SimulationResultView kind={kind} onBack={() => setKind(null)} />
      )}
    </div>
  );
}

function SimulationResultView({ kind, onBack }: { kind: SimulationKind; onBack: () => void }) {
  const { t } = useTranslation();
  const result = useSimulation(kind);
  const { accounts } = useInventory();
  const nameOf = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  const impacts = [...result.impacts].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
  const nothingBreaks = result.blockedCount === 0 && result.atRiskCount === 0;

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-1 p-5">
        <h2 className="font-serif text-lg font-semibold">{t(($) => $.sim.scenarios[kind].question)}</h2>
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
