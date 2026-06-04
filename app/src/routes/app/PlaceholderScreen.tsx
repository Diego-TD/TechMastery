import { useTranslation } from "react-i18next";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type PlaceholderScreenProps = {
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
};

/** Minimal placeholder used by the app sub-routes until features land. */
export function PlaceholderScreen({ title, Icon }: PlaceholderScreenProps) {
  const { t } = useTranslation();

  return (
    <Empty className="flex-1 border-none">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{t(($) => $.emptyStates.comingSoon)}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default PlaceholderScreen;
