import { LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlaceholderScreen } from "./PlaceholderScreen";

export function AppHome() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t(($) => $.nav.app)} Icon={LayoutDashboard} />;
}

export default AppHome;
