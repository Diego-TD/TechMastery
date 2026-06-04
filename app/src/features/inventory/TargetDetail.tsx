import { useInventory } from "@/lib/mock/store";
import { AccountDetailPanel } from "./AccountDetailPanel";
import { DeviceDetailPanel } from "./DeviceDetailPanel";

/**
 * Opens the correct detail panel for a recommended-action / weak-item target,
 * whether it points at an account or a device. Lets the Overview and Readiness
 * pages make "next steps" tappable and land on the thing that needs work.
 */
export function TargetDetail({ targetId, onClose }: { targetId?: string; onClose: () => void }) {
  const { accounts } = useInventory();
  if (!targetId) return null;
  const isAccount = accounts.some((a) => a.id === targetId);

  return isAccount ? (
    <AccountDetailPanel accountId={targetId} open onOpenChange={(o) => !o && onClose()} />
  ) : (
    <DeviceDetailPanel deviceId={targetId} open onOpenChange={(o) => !o && onClose()} />
  );
}
