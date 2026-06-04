import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ArrowRight, Network, Plus } from "lucide-react";
import { useInventory, useReadiness } from "@/lib/mock/store";
import { readinessLevel, scoreColor } from "@/features/shared/display";
import { AddAccountPanel } from "@/features/inventory/AddAccountPanel";
import { Badge } from "@/components/ui/badge";
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
  const topActions = readiness.actions.slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-serif text-2xl font-semibold">{t(($) => $.overview.welcome)}</h1>
        <p className="text-sm text-muted-foreground">{t(($) => $.overview.subtitle)}</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat value={accounts.length} label={t(($) => $.overview.statsAccounts)} />
        <Stat value={devices.length} label={t(($) => $.overview.statsDevices)} />
        <Stat value={readiness.actions.length} label={t(($) => $.overview.statsRisks)} />
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <span className={`font-serif text-4xl font-semibold ${scoreColor(readiness.score)}`}>
            {readiness.score}
          </span>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium">{t(($) => $.overview.readinessTitle)}</span>
              <Badge variant="secondary">{t(($) => $.readiness[level])}</Badge>
            </div>
            <Progress value={readiness.score} className="h-1.5" />
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/readiness">
              {t(($) => $.overview.viewFull)}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t(($) => $.overview.nextActionsTitle)}
        </h2>
        {topActions.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            {t(($) => $.overview.noActions)}
          </p>
        ) : (
          topActions.map((a) => {
            const name =
              accounts.find((x) => x.id === a.targetId)?.name ??
              devices.find((d) => d.id === a.targetId)?.name ??
              "";
            return (
              <Card key={a.id} className="gap-0 p-3">
                <div className="flex items-center gap-3">
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium">
                    {t(($) => $.actions[a.kind].title, { name })}
                  </span>
                  <Badge
                    variant={a.severity === "high" ? "destructive" : "secondary"}
                    className="shrink-0"
                  >
                    {t(($) => $.actions.severity[a.severity])}
                  </Badge>
                </div>
              </Card>
            );
          })
        )}
      </section>

      <Card className="bg-muted/30">
        <CardContent className="flex items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-background">
              <Network className="size-5 text-muted-foreground" />
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

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Card className="gap-0 p-4 text-center">
      <span className="font-serif text-2xl font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Card>
  );
}
