import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Archive,
  KeyRound,
  LifeBuoy,
  LogIn,
  Plus,
  ShieldCheck,
  StickyNote,
  Tag,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type {
  IdentifierType,
  LifeArea,
  LoginMethod,
  RecoveryMethodType,
  TwoFactorStatus,
} from "@shared/enums";
import { LIFE_AREAS } from "@shared/enums";
import type { Account, Device, Importance, RecoveryOption } from "@/lib/mock/types";
import type { NewAccountInput } from "@/lib/mock/store";
import { useInventory } from "@/lib/mock/store";
import {
  IDENTIFIER_TYPES,
  IMPORTANCES,
  LOGIN_METHODS,
  RECOVERY_TYPES,
  TWO_FACTORS,
} from "@/features/shared/options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const NONE = "__none__";
let rid = 0;
const newRecoveryId = () => `r_${Date.now().toString(36)}_${rid++}`;

type Props = {
  accounts: Account[];
  devices: Device[];
  initial?: Account;
  lockedLifeArea?: LifeArea;
  onSubmit: (input: NewAccountInput) => void;
  onCancel?: () => void;
};

export function AccountForm({ accounts, devices, initial, lockedLifeArea, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const { authenticatorApps, addAuthenticatorApp } = useInventory();

  const [name, setName] = useState(initial?.name ?? "");
  const [lifeArea, setLifeArea] = useState<LifeArea>(lockedLifeArea ?? initial?.lifeArea ?? "social");
  const [importance, setImportance] = useState<Importance>(initial?.importance ?? "medium");

  const [identifierType, setIdentifierType] = useState<IdentifierType>(initial?.identifierType ?? "email");
  const [identifier, setIdentifier] = useState(initial?.identifier ?? "");

  const [loginMethods, setLoginMethods] = useState<LoginMethod[]>(initial?.loginMethods ?? ["password"]);
  const [socialLoginAccountId, setSocialLoginAccountId] = useState(initial?.socialLoginAccountId ?? NONE);

  const [twoFactor, setTwoFactor] = useState<TwoFactorStatus>(initial?.twoFactor ?? "unknown");
  const [authenticatorAppId, setAuthenticatorAppId] = useState(initial?.authenticatorAppId ?? NONE);
  const [newAppName, setNewAppName] = useState("");

  const [recoveryOptions, setRecoveryOptions] = useState<RecoveryOption[]>(initial?.recoveryOptions ?? []);
  const [deviceIds, setDeviceIds] = useState<string[]>(initial?.deviceIds ?? []);

  const [hasBackupCodes, setHasBackupCodes] = useState(initial?.hasBackupCodes ?? false);
  const [backupCodesLocation, setBackupCodesLocation] = useState(initial?.backupCodesLocation ?? "");
  const [keyFileLabel, setKeyFileLabel] = useState(initial?.keyFile?.label ?? "");
  const [keyFileLocation, setKeyFileLocation] = useState(initial?.keyFile?.location ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const otherAccounts = accounts.filter((a) => a.id !== initial?.id);
  const usesSocial = loginMethods.includes("social");

  const addRecovery = () =>
    setRecoveryOptions((prev) => [...prev, { id: newRecoveryId(), type: "email" }]);
  const updateRecovery = (id: string, patch: Partial<RecoveryOption>) =>
    setRecoveryOptions((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRecovery = (id: string) =>
    setRecoveryOptions((prev) => prev.filter((r) => r.id !== id));

  const createApp = () => {
    if (!newAppName.trim()) return;
    const id = addAuthenticatorApp({ name: newAppName.trim() });
    setAuthenticatorAppId(id);
    setNewAppName("");
  };

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      lifeArea,
      importance,
      identifierType,
      identifier: identifier.trim() || undefined,
      loginMethods,
      socialLoginAccountId: usesSocial && socialLoginAccountId !== NONE ? socialLoginAccountId : undefined,
      twoFactor,
      authenticatorAppId:
        twoFactor === "authenticator_app" && authenticatorAppId !== NONE ? authenticatorAppId : undefined,
      recoveryOptions: recoveryOptions.map((r) => ({
        ...r,
        targetAccountId: r.type === "email" ? r.targetAccountId : undefined,
        value: r.type === "phone" ? r.value : undefined,
      })),
      deviceIds,
      hasBackupCodes,
      backupCodesLocation: hasBackupCodes ? backupCodesLocation.trim() || undefined : undefined,
      keyFile: keyFileLabel.trim()
        ? { label: keyFileLabel.trim(), location: keyFileLocation.trim() || undefined }
        : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form
      className="flex flex-col gap-6 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* Basics */}
      <Section icon={Tag} title={t(($) => $.accountForm.sectionBasics)}>
        <div className="flex flex-col gap-1.5">
          <Label>
            {t(($) => $.accountForm.name)} <Req />
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(($) => $.accountForm.namePlaceholder)}
            autoFocus
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {!lockedLifeArea && (
            <div className="flex flex-col gap-1.5">
              <Label>{t(($) => $.accountForm.lifeArea)}</Label>
              <Select value={lifeArea} onValueChange={(v) => setLifeArea(v as LifeArea)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFE_AREAS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {t(($) => $.lifeAreas[a])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label>{t(($) => $.accountForm.importance)}</Label>
            <SingleChoice
              value={importance}
              onChange={(v) => setImportance(v as Importance)}
              options={IMPORTANCES.map((i) => ({ value: i, label: t(($) => $.account.importance[i]) }))}
            />
          </div>
        </div>
      </Section>

      {/* Identifier — what you log in as */}
      <Section icon={UserRound} title={t(($) => $.accountForm.sectionIdentifier)} hint={t(($) => $.accountForm.identifierHint)}>
        <SingleChoice
          value={identifierType}
          onChange={(v) => setIdentifierType(v as IdentifierType)}
          options={IDENTIFIER_TYPES.map((i) => ({ value: i, label: t(($) => $.account.identifierTypes[i]) }))}
        />
        {identifierType !== "unknown" && (
          <Input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t(($) => $.accountForm.identifierPlaceholder)}
          />
        )}
      </Section>

      {/* Login — how you prove it's you */}
      <Section icon={LogIn} title={t(($) => $.accountForm.sectionLogin)} optional>
        <MultiChoice
          value={loginMethods}
          onChange={(v) => setLoginMethods(v as LoginMethod[])}
          options={LOGIN_METHODS.map((m) => ({ value: m, label: t(($) => $.account.loginMethods[m]) }))}
        />
        {usesSocial && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">{t(($) => $.accountForm.socialLogin)}</Label>
            <Select value={socialLoginAccountId} onValueChange={setSocialLoginAccountId}>
              <SelectTrigger>
                <SelectValue placeholder={t(($) => $.accountForm.noneOption)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t(($) => $.accountForm.noneOption)}</SelectItem>
                {otherAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Section>

      {/* 2FA */}
      <Section icon={ShieldCheck} title={t(($) => $.accountForm.sectionTwoFactor)} optional>
        <SingleChoice
          value={twoFactor}
          onChange={(v) => setTwoFactor(v as TwoFactorStatus)}
          options={TWO_FACTORS.map((f) => ({ value: f, label: t(($) => $.account.twoFactor[f]) }))}
        />
        {twoFactor === "authenticator_app" && (
          <div className="flex flex-col gap-2">
            <Select value={authenticatorAppId} onValueChange={setAuthenticatorAppId}>
              <SelectTrigger>
                <SelectValue placeholder={t(($) => $.accountForm.authAppPlaceholder)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t(($) => $.accountForm.noneOption)}</SelectItem>
                {authenticatorApps.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder={t(($) => $.accountForm.newAuthAppPlaceholder)}
                className="h-8 text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={createApp} disabled={!newAppName.trim()}>
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Section>

      {/* Recovery — can add several */}
      <Section icon={LifeBuoy} title={t(($) => $.accountForm.sectionRecovery)} optional>
        {recoveryOptions.length === 0 && (
          <p className="text-xs text-muted-foreground">{t(($) => $.accountForm.recoveryEmpty)}</p>
        )}
        {recoveryOptions.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <Select value={r.type} onValueChange={(v) => updateRecovery(r.id, { type: v as RecoveryMethodType })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECOVERY_TYPES.map((rt) => (
                  <SelectItem key={rt} value={rt}>
                    {t(($) => $.account.recoveryMethods[rt])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {r.type === "email" ? (
              <Select
                value={r.targetAccountId ?? NONE}
                onValueChange={(v) => updateRecovery(r.id, { targetAccountId: v === NONE ? undefined : v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t(($) => $.accountForm.noneOption)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t(($) => $.accountForm.noneOption)}</SelectItem>
                  {otherAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : r.type === "phone" ? (
              <Input
                value={r.value ?? ""}
                onChange={(e) => updateRecovery(r.id, { value: e.target.value })}
                placeholder={t(($) => $.accountForm.recoveryPhonePlaceholder)}
                className="flex-1"
                inputMode="tel"
              />
            ) : (
              <div className="flex-1" />
            )}
            <Button type="button" variant="ghost" size="icon" onClick={() => removeRecovery(r.id)}>
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addRecovery} className="w-fit">
          <Plus className="size-3.5" />
          {t(($) => $.accountForm.addRecovery)}
        </Button>
      </Section>

      {/* Devices */}
      {devices.length > 0 && (
        <Section icon={Archive} title={t(($) => $.accountForm.devices)} optional>
          <div className="flex flex-wrap gap-2">
            {devices.map((d) => {
              const on = deviceIds.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() =>
                    setDeviceIds((prev) => (on ? prev.filter((x) => x !== d.id) : [...prev, d.id]))
                  }
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    on ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Backup & files */}
      <Section icon={KeyRound} title={t(($) => $.accountForm.sectionBackup)} optional>
        <div className="flex items-center justify-between rounded-md border p-3">
          <Label htmlFor="backup-switch" className="font-normal">
            {t(($) => $.accountForm.hasBackupCodes)}
          </Label>
          <Switch id="backup-switch" checked={hasBackupCodes} onCheckedChange={setHasBackupCodes} />
        </div>
        {hasBackupCodes && (
          <Input
            value={backupCodesLocation}
            onChange={(e) => setBackupCodesLocation(e.target.value)}
            placeholder={t(($) => $.accountForm.backupCodesPlaceholder)}
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={keyFileLabel}
            onChange={(e) => setKeyFileLabel(e.target.value)}
            placeholder={t(($) => $.accountForm.keyFilePlaceholder)}
          />
          {keyFileLabel.trim() && (
            <Input
              value={keyFileLocation}
              onChange={(e) => setKeyFileLocation(e.target.value)}
              placeholder={t(($) => $.accountForm.keyFileLocationPlaceholder)}
            />
          )}
        </div>
      </Section>

      {/* Notes */}
      <Section icon={StickyNote} title={t(($) => $.accountForm.notes)} optional>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t(($) => $.accountForm.notesPlaceholder)}
          rows={2}
        />
      </Section>

      <div className="sticky bottom-0 flex gap-2 border-t bg-background py-3">
        <Button type="submit" className="flex-1" disabled={!name.trim()}>
          {t(($) => $.common.save)}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t(($) => $.common.cancel)}
          </Button>
        )}
      </div>
    </form>
  );
}

function Section({
  icon: Icon,
  title,
  hint,
  optional,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">
            ({t(($) => $.common.optional)})
          </span>
        )}
      </div>
      {hint && <p className="-mt-1 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </section>
  );
}

/** Required-field marker. */
function Req() {
  return <span className="text-destructive">*</span>;
}

type Opt = { value: string; label: string };

function SingleChoice({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(v) => v && onChange(v)}
      className="w-full flex-wrap"
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="flex-1 text-xs">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function MultiChoice({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: Opt[];
}) {
  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={value}
      onValueChange={onChange}
      className="w-full flex-wrap"
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="flex-1 text-xs">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
