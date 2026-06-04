import { Gauge } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlaceholderScreen } from "./PlaceholderScreen";

export function ReadinessPage() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t(($) => $.nav.readiness)} Icon={Gauge} />;
}

export default ReadinessPage;
