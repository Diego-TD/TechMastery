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
import { ChipChoice } from "@/features/shared/ChipChoice";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

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
  const { authenticatorApps, addAuthenticatorApp, addAccount } = useInventory();

  const [name, setName] = useState(initial?.name ?? "");
  const [lifeArea, setLifeArea] = useState<LifeArea>(lockedLifeArea ?? initial?.lifeArea ?? "social");
  const [importance, setImportance] = useState<Importance>(initial?.importance ?? "medium");

  const [identifierType, setIdentifierType] = useState<IdentifierType>(initial?.identifierType ?? "email");
  const [identifier, setIdentifier] = useState(initial?.identifier ?? "");
  const [identifierAccountId, setIdentifierAccountId] = useState(initial?.identifierAccountId ?? NONE);
  const [identifierPhoneId, setIdentifierPhoneId] = useState<string | undefined>(initial?.identifierPhoneId);
  const [addingEmail, setAddingEmail] = useState(false);
  const [newEmailName, setNewEmailName] = useState("");

  const createEmailAccount = () => {
    if (!newEmailName.trim()) return;
    const id = addAccount({
      name: newEmailName.trim(),
      lifeArea: "email",
      importance: "medium",
      identifierType: "email",
      loginMethods: ["password"],
      mfaMethods: ["unknown"],
      recoveryOptions: [],
      deviceIds: [],
      hasBackupCodes: false,
    });
    setIdentifierAccountId(id);
    setNewEmailName("");
    setAddingEmail(false);
  };

  const [loginMethods, setLoginMethods] = useState<LoginMethod[]>(initial?.loginMethods ?? ["password"]);
  const [socialLoginAccountId, setSocialLoginAccountId] = useState(initial?.socialLoginAccountId ?? NONE);

  const [mfaMethods, setMfaMethods] = useState<TwoFactorStatus[]>(initial?.mfaMethods ?? ["unknown"]);
  const [authenticatorAppId, setAuthenticatorAppId] = useState(initial?.authenticatorAppId ?? NONE);

  // MFA: "none" and "unknown" are exclusive; real methods can combine.
  const toggleMfa = (m: TwoFactorStatus) => {
    setMfaMethods((prev) => {
      if (m === "none" || m === "unknown") return [m];
      const real = prev.filter((x) => x !== "none" && x !== "unknown");
      const next = real.includes(m) ? real.filter((x) => x !== m) : [...real, m];
      return next.length === 0 ? ["unknown"] : next;
    });
  };
  const usesAuthApp = mfaMethods.includes("authenticator_app");
  const [newAppName, setNewAppName] = useState("");
  const [addingApp, setAddingApp] = useState(false);

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
    setAddingApp(false);
  };

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      lifeArea,
      importance,
      identifierType,
      identifier: identifierType === "username" ? identifier.trim() || undefined : undefined,
      identifierAccountId:
        identifierType === "email" && identifierAccountId !== NONE ? identifierAccountId : undefined,
      identifierPhoneId: identifierType === "phone" ? identifierPhoneId : undefined,
      loginMethods,
      socialLoginAccountId: usesSocial && socialLoginAccountId !== NONE ? socialLoginAccountId : undefined,
      mfaMethods,
      authenticatorAppId: usesAuthApp && authenticatorAppId !== NONE ? authenticatorAppId : undefined,
      recoveryOptions: recoveryOptions.map((r) => ({
        ...r,
        targetAccountId: r.type === "email" ? r.targetAccountId : undefined,
        phoneId: r.type === "phone" ? r.phoneId : undefined,
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
      <Section icon={Tag} title={t(($) => $.accountForm.sectionBasics)} divider={false}>
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
        {!lockedLifeArea && (
          <div className="flex flex-col gap-1.5">
            <Label>{t(($) => $.accountForm.lifeArea)}</Label>
            <Select value={lifeArea} onValueChange={(v) => setLifeArea(v as LifeArea)}>
              <SelectTrigger className="w-full">
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
          <ChipChoice
            value={importance}
            onChange={(v) => setImportance(v as Importance)}
            options={IMPORTANCES.map((i) => ({ value: i, label: t(($) => $.account.importance[i]) }))}
          />
        </div>
      </Section>

      {/* Identifier — what you log in as */}
      <Section icon={UserRound} title={t(($) => $.accountForm.sectionIdentifier)} hint={t(($) => $.accountForm.identifierHint)}>
        <ChipChoice
          value={identifierType}
          onChange={(v) => setIdentifierType(v as IdentifierType)}
          options={IDENTIFIER_TYPES.map((i) => ({ value: i, label: t(($) => $.account.identifierTypes[i]) }))}
        />
        {/* Email/phone are linked (derived), not retyped. Username is free text. */}
        {identifierType === "email" && (
          <div className="flex flex-col gap-2">
            <Select
              value={identifierAccountId}
              onValueChange={(v) => {
                if (v === ADD_NEW) setAddingEmail(true);
                else setIdentifierAccountId(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t(($) => $.accountForm.identifierEmailLink)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t(($) => $.accountForm.identifierEmailSelf)}</SelectItem>
                {otherAccounts
                  .filter((a) => a.identifierType === "email")
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                <SelectItem value={ADD_NEW}>+ {t(($) => $.accountForm.createEmailAccount)}</SelectItem>
              </SelectContent>
            </Select>
            {addingEmail && (
              <div className="flex gap-2">
                <Input
                  value={newEmailName}
                  onChange={(e) => setNewEmailName(e.target.value)}
                  placeholder={t(($) => $.accountForm.newEmailAccountPlaceholder)}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={createEmailAccount}
                  disabled={!newEmailName.trim()}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
        {identifierType === "phone" && (
          <PhonePicker value={identifierPhoneId} onChange={setIdentifierPhoneId} />
        )}
        {identifierType === "username" && (
          <Input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t(($) => $.accountForm.identifierPlaceholder)}
          />
        )}
      </Section>

      {/* Login — how you prove it's you */}
      <Section icon={LogIn} title={t(($) => $.accountForm.sectionLogin)} optional>
        <ChipChoice
          multiple
          value={loginMethods}
          onToggle={(v) =>
            setLoginMethods((prev) =>
              prev.includes(v as LoginMethod)
                ? prev.filter((x) => x !== v)
                : [...prev, v as LoginMethod],
            )
          }
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

      {/* MFA — can combine methods */}
      <Section icon={ShieldCheck} title={t(($) => $.accountForm.sectionMfa)} hint={t(($) => $.accountForm.mfaHint)} optional>
        <ChipChoice
          multiple
          value={mfaMethods}
          onToggle={(v) => toggleMfa(v as TwoFactorStatus)}
          options={TWO_FACTORS.map((f) => ({ value: f, label: t(($) => $.account.twoFactor[f]) }))}
        />
        {usesAuthApp && (
          <div className="flex flex-col gap-2">
            <Select
              value={authenticatorAppId}
              onValueChange={(v) => {
                if (v === ADD_NEW) setAddingApp(true);
                else setAuthenticatorAppId(v);
              }}
            >
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
                <SelectItem value={ADD_NEW}>+ {t(($) => $.accountForm.addAuthApp)}</SelectItem>
              </SelectContent>
            </Select>
            {addingApp && (
              <div className="flex gap-2">
                <Input
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder={t(($) => $.accountForm.newAuthAppPlaceholder)}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button type="button" variant="outline" size="sm" onClick={createApp} disabled={!newAppName.trim()}>
                  <Plus className="size-3.5" />
                </Button>
              </div>
            )}
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
              <div className="flex-1">
                <PhonePicker
                  value={r.phoneId}
                  onChange={(id) => updateRecovery(r.id, { phoneId: id })}
                />
              </div>
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
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t(($) => $.accountForm.backupCodesLocation)}</Label>
            <p className="text-xs text-muted-foreground">{t(($) => $.accountForm.backupCodesHint)}</p>
            <Input
              value={backupCodesLocation}
              onChange={(e) => setBackupCodesLocation(e.target.value)}
              placeholder={t(($) => $.accountForm.backupCodesPlaceholder)}
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">{t(($) => $.accountForm.keyFileLabel)}</Label>
          <p className="text-xs text-muted-foreground">{t(($) => $.accountForm.keyFileHint)}</p>
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

const ADD_NEW = "__add_new__";

/** Link an existing phone number, or reveal a field to create one inline. */
function PhonePicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (id: string | undefined) => void;
}) {
  const { t } = useTranslation();
  const { phoneNumbers, addPhoneNumber } = useInventory();
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const create = () => {
    if (!newLabel.trim()) return;
    const id = addPhoneNumber({ label: newLabel.trim() });
    onChange(id);
    setNewLabel("");
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={value ?? NONE}
        onValueChange={(v) => {
          if (v === ADD_NEW) setAdding(true);
          else onChange(v === NONE ? undefined : v);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={t(($) => $.accountForm.phonePlaceholder)} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{t(($) => $.accountForm.noneOption)}</SelectItem>
          {phoneNumbers.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.label}
            </SelectItem>
          ))}
          <SelectItem value={ADD_NEW}>+ {t(($) => $.accountForm.addPhone)}</SelectItem>
        </SelectContent>
      </Select>
      {adding && (
        <div className="flex gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={t(($) => $.accountForm.newPhonePlaceholder)}
            className="h-8 text-sm"
            inputMode="tel"
            autoFocus
          />
          <Button type="button" variant="outline" size="sm" onClick={create} disabled={!newLabel.trim()}>
            <Plus className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  hint,
  optional,
  divider = true,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  optional?: boolean;
  divider?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col gap-2.5">
      {divider && <Separator className="mb-1.5" />}
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

