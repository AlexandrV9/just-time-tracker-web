import { useAuthStore } from "~/features/auth";
import { BackButton, Box, Input, Stack } from "~/shared/ui";
import { AuthUserInfo, useHeaderLeftContent } from "~/widgets";
import { useTranslation } from "~/shared/hooks";

export function ProfilePage() {
  useHeaderLeftContent(<BackButton />);

  const { t } = useTranslation();
  const { user } = useAuthStore();

  return (
    <Stack.VStack alignItems="stretch" gap="2rem" p={4}>
      <AuthUserInfo />
      <Stack.VStack>
        <Box
          as="form"
          width="full"
          display="flex"
          flexDirection="column"
          gap="1rem"
        >
          <Input
            placeholder={t("pages.settings.profile.namePlaceholder")}
            value={user!.name}
            disabled
          />
          <Input
            placeholder={t("pages.settings.profile.emailPlaceholder")}
            disabled
          />
          <Input
            placeholder={t("pages.settings.profile.birthDatePlaceholder")}
            disabled
          />
        </Box>
      </Stack.VStack>
    </Stack.VStack>
  );
}
