import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  AuthMethodType,
  LifeArea,
  RecoveryMethodType,
  TwoFactorStatus,
} from "@shared/enums";
import { LIFE_AREAS } from "@shared/enums";
import type { Account, Device, Importance } from "@/lib/mock/types";
import type { NewAccountInput } from "@/lib/mock/store";
import {
  AUTH_METHODS,
  IMPORTANCES,
  RECOVERY_METHODS,
  TWO_FACTORS,
} from "@/features/shared/options";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const NONE = "__none__";

type Props = {
  accounts: Account[];
  devices: Device[];
  initial?: Account;
  /** When set (onboarding), the life area is fixed and its picker hidden. */
  lockedLifeArea?: LifeArea;
  onSubmit: (input: NewAccountInput) => void;
  onCancel?: () => void;
};

export function AccountForm({
  accounts,
  devices,
  initial,
  lockedLifeArea,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation();

  const [name, setName] = useState(initial?.name ?? "");
  const [provider, setProvider] = useState(initial?.provider ?? "");
  const [lifeArea, setLifeArea] = useState<LifeArea>(
    lockedLifeArea ?? initial?.lifeArea ?? "social",
  );
  const [importance, setImportance] = useState<Importance>(initial?.importance ?? "medium");
  const [authMethod, setAuthMethod] = useState<AuthMethodType>(initial?.authMethod ?? "password");
  const [twoFactor, setTwoFactor] = useState<TwoFactorStatus>(initial?.twoFactor ?? "none");
  const [recovery, setRecovery] = useState<RecoveryMethodType>(initial?.recovery ?? "email");
  const [recoveryEmailAccountId, setRecoveryEmailAccountId] = useState(
    initial?.recoveryEmailAccountId ?? NONE,
  );
  const [recoveryPhoneNumber, setRecoveryPhoneNumber] = useState(
    initial?.recoveryPhoneNumber ?? "",
  );
  const [socialLoginAccountId, setSocialLoginAccountId] = useState(
    initial?.socialLoginAccountId ?? NONE,
  );
  const [deviceIds, setDeviceIds] = useState<string[]>(initial?.deviceIds ?? []);
  const [hasBackupCodes, setHasBackupCodes] = useState(initial?.hasBackupCodes ?? false);
  const [backupCodesLocation, setBackupCodesLocation] = useState(
    initial?.backupCodesLocation ?? "",
  );
  const [keyFileLabel, setKeyFileLabel] = useState(initial?.keyFile?.label ?? "");
  const [keyFileLocation, setKeyFileLocation] = useState(initial?.keyFile?.location ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const otherAccounts = accounts.filter((a) => a.id !== initial?.id);

  const toggleDevice = (id: string) =>
    setDeviceIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      provider: provider.trim() || undefined,
      lifeArea,
      importance,
      authMethod,
      twoFactor,
      recovery,
      recoveryEmailAccountId:
        recoveryEmailAccountId === NONE ? undefined : recoveryEmailAccountId,
      recoveryPhoneNumber: recoveryPhoneNumber.trim() || undefined,
      socialLoginAccountId:
        authMethod === "social_login" && socialLoginAccountId !== NONE
          ? socialLoginAccountId
          : undefined,
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
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Field label={t(($) => $.accountForm.name)}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(($) => $.accountForm.namePlaceholder)}
          autoFocus
          required
        />
      </Field>

      <Field label={t(($) => $.accountForm.provider)} optional>
        <Input
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder={t(($) => $.accountForm.providerPlaceholder)}
        />
      </Field>

      {!lockedLifeArea && (
        <Field label={t(($) => $.accountForm.lifeArea)}>
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
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label={t(($) => $.accountForm.importance)}>
          <Select value={importance} onValueChange={(v) => setImportance(v as Importance)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMPORTANCES.map((i) => (
                <SelectItem key={i} value={i}>
                  {t(($) => $.account.importance[i])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t(($) => $.accountForm.authMethod)}>
          <Select value={authMethod} onValueChange={(v) => setAuthMethod(v as AuthMethodType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUTH_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {t(($) => $.account.authMethods[m])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {authMethod === "social_login" && (
        <Field label={t(($) => $.accountForm.socialLogin)}>
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
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label={t(($) => $.accountForm.twoFactor)}>
          <Select value={twoFactor} onValueChange={(v) => setTwoFactor(v as TwoFactorStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TWO_FACTORS.map((f) => (
                <SelectItem key={f} value={f}>
                  {t(($) => $.account.twoFactor[f])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t(($) => $.accountForm.recovery)}>
          <Select value={recovery} onValueChange={(v) => setRecovery(v as RecoveryMethodType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECOVERY_METHODS.map((r) => (
                <SelectItem key={r} value={r}>
                  {t(($) => $.account.recoveryMethods[r])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label={t(($) => $.accountForm.recoveryEmail)} optional>
        <Select value={recoveryEmailAccountId} onValueChange={setRecoveryEmailAccountId}>
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
      </Field>

      <Field label={t(($) => $.accountForm.recoveryPhone)} optional>
        <Input
          value={recoveryPhoneNumber}
          onChange={(e) => setRecoveryPhoneNumber(e.target.value)}
          placeholder={t(($) => $.accountForm.recoveryPhonePlaceholder)}
          inputMode="tel"
        />
      </Field>

      {devices.length > 0 && (
        <Field label={t(($) => $.accountForm.devices)} optional>
          <div className="flex flex-col gap-2 rounded-md border p-3">
            {devices.map((d) => (
              <label key={d.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={deviceIds.includes(d.id)}
                  onCheckedChange={() => toggleDevice(d.id)}
                />
                {d.name}
              </label>
            ))}
          </div>
        </Field>
      )}

      <div className="flex items-center justify-between rounded-md border p-3">
        <Label htmlFor="backup-switch" className="font-normal">
          {t(($) => $.accountForm.hasBackupCodes)}
        </Label>
        <Switch id="backup-switch" checked={hasBackupCodes} onCheckedChange={setHasBackupCodes} />
      </div>
      {hasBackupCodes && (
        <Field label={t(($) => $.accountForm.backupCodesLocation)} optional>
          <Input
            value={backupCodesLocation}
            onChange={(e) => setBackupCodesLocation(e.target.value)}
            placeholder={t(($) => $.accountForm.backupCodesPlaceholder)}
          />
        </Field>
      )}

      <Field label={t(($) => $.accountForm.keyFileLabel)} optional>
        <Input
          value={keyFileLabel}
          onChange={(e) => setKeyFileLabel(e.target.value)}
          placeholder={t(($) => $.accountForm.keyFilePlaceholder)}
        />
      </Field>
      {keyFileLabel.trim() && (
        <Field label={t(($) => $.accountForm.keyFileLocation)} optional>
          <Input
            value={keyFileLocation}
            onChange={(e) => setKeyFileLocation(e.target.value)}
            placeholder={t(($) => $.accountForm.keyFileLocationPlaceholder)}
          />
        </Field>
      )}

      <Field label={t(($) => $.accountForm.notes)} optional>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t(($) => $.accountForm.notesPlaceholder)}
          rows={2}
        />
      </Field>

      <div className="flex gap-2 pt-1">
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

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm">
        {label}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            ({t(($) => $.common.optional)})
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}
