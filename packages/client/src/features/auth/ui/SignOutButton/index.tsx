import { useCallback } from "react";
import { Button } from "~/shared/ui";
import { authManager } from "../../AuthManager";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "~/shared/hooks";

export const SignOutButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = useCallback(async () => {
    const responseData = await authManager.signOut();

    if (responseData?.success) {
      navigate({ to: "/signin" });
    }
  }, [navigate]);

  return (
    <Button variant="outline" borderRadius="100px" px="2rem" size="md" borderColor="red.500" onClick={handleClick} color="red.500">
      {t("features.auth.signOutButton")}
    </Button>
  );
};
