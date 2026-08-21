import { useCallback } from "react";
import { useTranslation } from "~/shared/hooks";
import { useHeaderLeftContent } from "~/widgets";
import {
  BackButton,
  Box,
  Card,
  CheckIcon,
  ChipIcon,
  List,
  MoonIcon,
  Stack,
  SunIcon,
  Text,
} from "~/shared/ui";
import { useTheme, type Theme } from "~/shared/theme";
import type { ReactNode } from "react";

const THEME_OPTIONS: {
  value: Theme;
  labelKey: string;
  descriptionKey: string;
  icon: ReactNode;
}[] = [
  {
    value: "dark",
    labelKey: "pages.settings.theme.dark",
    descriptionKey: "pages.settings.theme.darkDescription",
    icon: <MoonIcon size={22} />,
  },
  {
    value: "light",
    labelKey: "pages.settings.theme.light",
    descriptionKey: "pages.settings.theme.lightDescription",
    icon: <SunIcon size={22} />,
  },
  {
    value: "system",
    labelKey: "pages.settings.theme.system",
    descriptionKey: "pages.settings.theme.systemDescription",
    icon: <ChipIcon size={22} />,
  },
];

export const ThemePage = () => {
  const { t } = useTranslation();
  const { theme: currentTheme, changeTheme } = useTheme();

  useHeaderLeftContent(<BackButton to="/settings" />);

  const handleChange = useCallback(
    (value: Theme) => {
      changeTheme(value);
    },
    [changeTheme],
  );

  return (
    <Stack.VStack
      w="full"
      maxW="520px"
      mx="auto"
      p="1rem"
      gap="1rem"
      alignItems="stretch"
    >
      <Text textStyle="xs" fontWeight="semibold" color="fg.muted" px="0.5rem">
        {t("pages.settings.theme.sectionTitle")}
      </Text>
      <Card.Root borderRadius="1rem">
        <Card.Body
          width="full"
          display="flex"
          flexDirection="column"
          gap="1rem"
          p="0.8rem"
        >
          <List.Root>
            {THEME_OPTIONS.map((option, index) => {
              const isActive = currentTheme === option.value;

              return (
                <List.Item
                  key={option.value}
                  py="0.5rem"
                  listStyleType="none"
                  borderTop={index > 0 ? "1px solid" : undefined}
                  borderColor="border.emphasized"
                >
                  <Box
                    as="button"
                    w="full"
                    display="flex"
                    gap="0.5rem"
                    alignItems="center"
                    justifyContent="space-between"
                    bg={isActive ? "bg.subtle" : "transparent"}
                    _hover={{ bg: "bg.subtle", cursor: "pointer" }}
                    onClick={() => handleChange(option.value)}
                  >
                    <Box flexShrink={0}>{option.icon}</Box>
                    <Stack.VStack
                      gap="0"
                      alignItems="flex-start"
                      flexGrow={1}
                    >
                      <Text textStyle="md" fontWeight="medium">
                        {t(option.labelKey)}
                      </Text>
                      <Text textStyle="sm" color="fg.muted">
                        {t(option.descriptionKey)}
                      </Text>
                    </Stack.VStack>
                    {isActive && (
                      <Box flexShrink={0} asChild>
                        <CheckIcon size={20} color="purple.400" />
                      </Box>
                    )}
                  </Box>
                </List.Item>
              );
            })}
          </List.Root>
        </Card.Body>
      </Card.Root>
    </Stack.VStack>
  );
};
