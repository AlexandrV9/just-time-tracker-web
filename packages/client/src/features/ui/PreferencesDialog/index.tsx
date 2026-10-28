import { useCallback, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  ChipIcon,
  CloseButton,
  Dialog,
  Flex,
  MoonIcon,
  Portal,
  SettingsIcon,
  Stack,
  SunIcon,
  Text,
} from "~/shared/ui";
import { LangSwitcher } from "~/features/ui/LangSwitcher";
import { useTranslation } from "~/shared/hooks";
import { THEMES, useTheme, type Theme } from "~/shared/theme";
import styles from "./PreferencesDialog.module.css";

export const PreferencesButton = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const label = t("pages.landing.design.preferencesTitle");

  return (
    <>
      <Button
        type="button"
        display="flex"
        aria-label={label}
        variant="outline"
        size="xs"
        borderRadius="xl"
        px={{ base: 0, md: "2.5" }}
        color="fg.muted"
        fontWeight="semibold"
        onClick={() => setOpen(true)}
      >
        <SettingsIcon aria-hidden="true" size={18} />
        <Box as="span" display={{ base: "none", md: "inline" }}>
          {label}
        </Box>
      </Button>

      <PreferencesDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

type PreferencesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const THEME_OPTIONS: { value: Theme; icon: ReactNode; labelKey: string }[] = [
  {
    value: THEMES.light,
    icon: <SunIcon size={16} aria-hidden="true" />,
    labelKey: "pages.settings.theme.light",
  },
  {
    value: THEMES.dark,
    icon: <MoonIcon size={16} aria-hidden="true" />,
    labelKey: "pages.settings.theme.dark",
  },
  {
    value: THEMES.system,
    icon: <ChipIcon size={16} aria-hidden="true" />,
    labelKey: "pages.settings.theme.system",
  },
];

export const PreferencesDialog = ({
  open,
  onOpenChange,
}: PreferencesDialogProps) => {
  const { t } = useTranslation();
  const { theme: currentTheme, changeTheme } = useTheme();

  const handleThemeChange = useCallback(
    (theme: Theme) => {
      changeTheme(theme);
    },
    [changeTheme],
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      placement="top"
      motionPreset="slide-in-top"
      size="sm"
      lazyMount
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner paddingTop={{ base: "12px", md: "20px" }}>
          <Dialog.Content className={styles.content} mx={3} boxShadow="none">
            <Dialog.Header className={styles.header}>
              <Dialog.Title className={styles.title}>
                {t("pages.landing.design.preferencesTitle")}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="xs"
                  variant="ghost"
                  top="0.65rem"
                  right="0.65rem"
                />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body className={styles.body}>
              <Stack.VStack gap={3} align="stretch">
                <Box className={styles.row}>
                  <Text className={styles.label}>
                    {t("pages.landing.design.language")}
                  </Text>
                  <LangSwitcher isShort={false} />
                </Box>

                <Box className={styles.row}>
                  <Text className={styles.label}>
                    {t("pages.landing.design.theme")}
                  </Text>
                  <Flex className={styles.themeGroup} role="group">
                    {THEME_OPTIONS.map((option) => {
                      const isActive = currentTheme === option.value;

                      return (
                        <Button
                          key={option.value}
                          type="button"
                          size="sm"
                          variant="ghost"
                          className={styles.themeOption}
                          data-active={isActive || undefined}
                          aria-pressed={isActive}
                          aria-label={t(option.labelKey)}
                          title={t(option.labelKey)}
                          onClick={() => handleThemeChange(option.value)}
                        >
                          {option.icon}
                        </Button>
                      );
                    })}
                  </Flex>
                </Box>
              </Stack.VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
