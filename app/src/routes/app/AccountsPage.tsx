import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlaceholderScreen } from "./PlaceholderScreen";

export function AccountsPage() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t(($) => $.nav.accounts)} Icon={User} />;
}

export default AccountsPage;
