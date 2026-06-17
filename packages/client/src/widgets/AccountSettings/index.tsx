import type { ReactNode } from "react";
import type { FileRouteTypes } from "~/routeTree.gen";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  ChevronRightIcon,
  Flex,
  Link,
  List,
  // SafeLockIcon,
  Text,
  UserCircleIcon,
} from "~/shared/ui";

type SettingsLinkProps = {
  to: FileRouteTypes["to"];
  icon: ReactNode;
  label: string;
};

const SettingsLink = ({ to, icon, label }: SettingsLinkProps) => (
  <List.Item display="flex" alignItems="center" gap="0.5rem">
    <Flex
      asChild
      width="full"
      display="grid"
      gap="0.3rem"
      py="0.5rem"
      gridTemplateColumns="min-content 1fr min-content"
      alignItems="center"
    >
      <Link to={to}>
        {icon}
        <Text textStyle="md" as="span">
          {label}
        </Text>
        <ChevronRightIcon />
      </Link>
    </Flex>
  </List.Item>
);

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
        {/* <SettingsLink
          to="/settings/security"
          icon={<SafeLockIcon />}
          label={t("widgets.accountSettings.options.security")}
        /> */}
      </List.Root>
    </Box>
  );
};
