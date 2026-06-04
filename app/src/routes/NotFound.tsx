import { Compass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6">
      <Empty className="border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Compass className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t(($) => $.notFound.title)}</EmptyTitle>
          <EmptyDescription>{t(($) => $.notFound.description)}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/">{t(($) => $.notFound.backHome)}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

export default NotFound;
