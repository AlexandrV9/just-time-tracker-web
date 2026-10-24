import { useTranslation } from "~/shared/hooks";
import { Button, Link } from "~/shared/ui";

export function AboutUsButton() {
  const { t } = useTranslation();

  return (
    <Button asChild size="sm" variant="outline" borderRadius="xl">
      <Link to="/landing">{t("pages.landing.aboutAppButton")}</Link>
    </Button>
  );
}
