import { MonitorSmartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlaceholderScreen } from "./PlaceholderScreen";

export function DevicesPage() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen title={t(($) => $.nav.devices)} Icon={MonitorSmartphone} />
  );
}

export default DevicesPage;
