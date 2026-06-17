import { Button, YandexLogoIcon } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";

type YandexLoginButtonProps = {
  redirect?: string;
};

export const YandexLoginButton = ({
  redirect = "/",
}: YandexLoginButtonProps) => {
  const { t, i18n } = useTranslation();

  const handleClick = () => {
    const encoded = encodeURIComponent(redirect);
    window.location.href = `/api/auth/yandex?redirect=${encoded}`;
  };

  return (
    <Button variant="outline" width="full" onClick={handleClick} type="button">
      <YandexLogoIcon lang={i18n.language as "ru" | "en"} />
      {t("features.auth.yandexLogin.button")}
    </Button>
  );
};
