import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useInventory, useReadiness } from "@/lib/mock/store";
import type { ReadinessCategory, RecommendedAction } from "@/lib/mock/types";
import { readinessLevel, scoreColor } from "@/features/shared/display";
import { TargetDetail } from "@/features/inventory/TargetDetail";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ReadinessPage() {
  const { t } = useTranslation();
  const readiness = useReadiness();
  const level = readinessLevel(readiness.score);
  const [targetId, setTargetId] = useState<string | undefined>();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header>
        <h1 className="font-serif text-2xl font-semibold">{t(($) => $.readiness.title)}</h1>
        <p className="text-sm text-muted-foreground">{t(($) => $.readiness.subtitle)}</p>
      </header>

      {/* Lead with how it feels (calm vs not), not the number. */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-baseline justify-between gap-3">
            <span className={`font-serif text-3xl font-semibold ${scoreColor(readiness.score)}`}>
              {t(($) => $.readiness[level])}
            </span>
            <span className="text-xs text-muted-foreground">
              {t(($) => $.readiness.scoreCaption, { score: readiness.score })}
            </span>
          </div>
          <Progress value={readiness.score} className="h-1.5" />
          <p className="text-sm text-muted-foreground text-balance">
            {t(($) => $.readiness.levelMessage[level])}
          </p>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t(($) => $.readiness.categoriesTitle)}
        </h2>
        {readiness.categories.map((c) => (
          <CategoryRow key={c.key} category={c} onSelect={setTargetId} />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t(($) => $.readiness.actionsTitle)}
        </h2>
        {readiness.actions.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            {t(($) => $.readiness.noActions)}
          </p>
        ) : (
          readiness.actions.slice(0, 6).map((a) => (
            <ActionRow key={a.id} action={a} onSelect={setTargetId} />
          ))
        )}
      </section>

      <TargetDetail targetId={targetId} onClose={() => setTargetId(undefined)} />
    </div>
  );
}

function CategoryRow({
  category,
  onSelect,
}: {
  category: ReadinessCategory;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { accounts, devices } = useInventory();
  const [open, setOpen] = useState(false);
  const hasWeak = category.weakItemIds.length > 0;
  const nameOf = (id: string) =>
    accounts.find((a) => a.id === id)?.name ?? devices.find((d) => d.id === id)?.name ?? id;

  return (
    // The whole card toggles open (not just the header).
    <Card
      role="button"
      tabIndex={0}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)}
      className="cursor-pointer gap-0 p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">
            {t(($) => $.readiness.categories[category.key].title)}
          </div>
          <div className="text-xs text-muted-foreground">
            {t(($) => $.readiness.categories[category.key].desc)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${scoreColor(category.score)}`}>
            {category.score}
          </span>
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </div>
      </div>
      <Progress value={category.score} className="mt-2 h-1.5" />
      {hasWeak && !open && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          {t(($) => $.readiness.weakItems)}: {category.weakItemIds.length}
        </div>
      )}
      {open && (
        <div className="mt-3">
          {hasWeak ? (
            <ul className="flex flex-wrap gap-1.5">
              {category.weakItemIds.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(id);
                    }}
                    className="rounded-full border border-amber-500/40 px-2.5 py-0.5 text-xs text-amber-700 transition-colors hover:bg-amber-500/10 dark:text-amber-400"
                  >
                    {nameOf(id)}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {t(($) => $.readiness.allCovered)}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function ActionRow({
  action,
  onSelect,
}: {
  action: RecommendedAction;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { accounts, devices } = useInventory();
  const name =
    accounts.find((a) => a.id === action.targetId)?.name ??
    devices.find((d) => d.id === action.targetId)?.name ??
    "";
  const severityVariant =
    action.severity === "high" ? "destructive" : action.severity === "medium" ? "secondary" : "outline";

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(action.targetId)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(action.targetId)}
      className="cursor-pointer gap-0 p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start gap-3">
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {t(($) => $.actions[action.kind].title, { name })}
            </span>
            <Badge variant={severityVariant}>{t(($) => $.actions.severity[action.severity])}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t(($) => $.actions[action.kind].why)}</p>
        </div>
      </div>
    </Card>
  );
}
