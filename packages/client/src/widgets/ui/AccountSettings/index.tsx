import { useTranslation } from "~/shared/hooks";
import {
  Box,
  ChevronRightIcon,
  Flex,
  Link,
  List,
  SafeLockIcon,
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
      p="0.5rem"
    >
      <Text textStyle="xl" fontWeight="bold">
        {t("widgets.accountSettings.title")}
      </Text>
      <List.Root>
        <List.Item display="flex" alignItems="center" gap="0.5rem">
          <Flex
            asChild
            width="full"
            display="grid"
            gap="0.3rem"
            py="0.5rem"
            gridTemplateColumns={"min-content 1fr min-content"}
          >
            <Link to="/settings/profile">
              <UserCircleIcon />
              <Text textStyle="md" as="span">
                Edit Profile
              </Text>
              <ChevronRightIcon />
            </Link>
          </Flex>
        </List.Item>

        <List.Item display="flex" alignItems="center" gap="0.5rem">
          <Flex
            asChild
            width="full"
            display="grid"
            gap="0.3rem"
            py="0.5rem"
            gridTemplateColumns={"min-content 1fr min-content"}
          >
            <Link to="/settings">
              <SafeLockIcon />
              <Text textStyle="md" as="span">
                Security & Password
              </Text>
              <ChevronRightIcon />
            </Link>
          </Flex>
        </List.Item>
      </List.Root>
    </Box>
  );
};
