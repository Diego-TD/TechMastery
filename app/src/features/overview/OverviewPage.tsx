import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  ArrowRight,
  MonitorSmartphone,
  Network,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useInventory, useReadiness } from "@/lib/mock/store";
import { readinessLevel, scoreColor } from "@/features/shared/display";
import { AddAccountPanel } from "@/features/inventory/AddAccountPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";

type Level = ReturnType<typeof readinessLevel>;

const LEVEL_ICON: Record<Level, LucideIcon> = {
  notReady: ShieldAlert,
  inProgress: TrendingUp,
  ready: ShieldCheck,
  mastered: Sparkles,
};

export function OverviewPage() {
  const { t } = useTranslation();
  const { accounts, devices } = useInventory();
  const readiness = useReadiness();
  const [adding, setAdding] = useState(false);

  if (accounts.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Network className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t(($) => $.overview.emptyTitle)}</EmptyTitle>
            <EmptyDescription>{t(($) => $.overview.emptyDesc)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setAdding(true)}>
              <Plus className="size-4" />
              {t(($) => $.overview.emptyCta)}
            </Button>
          </EmptyContent>
        </Empty>
        <AddAccountPanel open={adding} onOpenChange={setAdding} />
      </div>
    );
  }

  const level = readinessLevel(readiness.score);
  const LevelIcon = LEVEL_ICON[level];
  const topActions = readiness.actions.slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <header>
        <h1 className="font-serif text-2xl font-semibold">{t(($) => $.overview.welcome)}</h1>
        <p className="text-sm text-muted-foreground">{t(($) => $.overview.subtitle)}</p>
      </header>

      {/* Hero — how you're doing, in words first. */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div
            className={`flex size-16 shrink-0 items-center justify-center rounded-full bg-muted ${scoreColor(readiness.score)}`}
          >
            <LevelIcon className="size-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t(($) => $.overview.readinessTitle)}
            </div>
            <div className={`font-serif text-3xl font-semibold ${scoreColor(readiness.score)}`}>
              {t(($) => $.readiness[level])}
            </div>
            <p className="mt-1 text-sm text-muted-foreground text-balance">
              {t(($) => $.readiness.levelMessage[level])}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Progress value={readiness.score} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground">
                {t(($) => $.readiness.scoreCaption, { score: readiness.score })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Friendly inventory line instead of big number cards. */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <UserRound className="size-4" />
          <span className="font-medium text-foreground">{accounts.length}</span>
          {t(($) => $.overview.statsAccounts)}
        </span>
        <span className="flex items-center gap-1.5">
          <MonitorSmartphone className="size-4" />
          <span className="font-medium text-foreground">{devices.length}</span>
          {t(($) => $.overview.statsDevices)}
        </span>
        {readiness.actions.length > 0 && (
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-4" />
            <span className="font-medium">{readiness.actions.length}</span>
            {t(($) => $.overview.statsRisks)}
          </span>
        )}
      </div>

      {/* What to do next. */}
      {topActions.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-sm font-medium text-muted-foreground">
            {t(($) => $.overview.nextActionsTitle)}
          </h2>
          {topActions.map((a) => {
            const name =
              accounts.find((x) => x.id === a.targetId)?.name ??
              devices.find((d) => d.id === a.targetId)?.name ??
              "";
            return (
              <Card key={a.id} className="gap-0 p-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                      a.severity === "high"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <ArrowRight className="size-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {t(($) => $.actions[a.kind].title, { name })}
                  </span>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {/* Map invite. */}
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-background shadow-sm">
              <Network className="size-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">{t(($) => $.overview.mapPreviewTitle)}</div>
              <div className="text-xs text-muted-foreground">{t(($) => $.map.subtitle)}</div>
            </div>
          </div>
          <Button asChild>
            <Link to="/app/map">{t(($) => $.overview.viewMap)}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
