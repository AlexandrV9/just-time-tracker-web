import { SettingsLink } from "~/shared/components";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  BellIcon,
  List,
  // SafeLockIcon,
  Text,
  UserCircleIcon,
} from "~/shared/ui";

export const AccountSettings = () => {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      gap="0.5rem"
      flexDirection="column"
      border="1px solid"
      borderRadius="xl"
      borderColor="border.emphasized"
      p="1rem"
    >
      <Text textStyle="xl" fontWeight="bold">
        {t("widgets.accountSettings.title")}
      </Text>
      <List.Root>
        <SettingsLink
          to="/settings/profile"
          icon={<UserCircleIcon />}
          label={t("widgets.accountSettings.options.profile")}
        />
        <SettingsLink
          to="/settings/notifications"
          icon={<BellIcon />}
          label={t("widgets.accountSettings.options.notifications")}
        />
        {/* <SettingsLink
          to="/settings/security"
          icon={<SafeLockIcon />}
          label={t("widgets.accountSettings.options.security")}
        /> */}
      </List.Root>
    </Box>
  );
};
