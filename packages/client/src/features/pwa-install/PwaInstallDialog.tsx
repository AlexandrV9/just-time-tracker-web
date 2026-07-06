import { useState } from "react";
import { useTranslation } from "~/shared/hooks";
import {
  Button,
  Checkbox,
  Dialog,
  Flex,
  Link,
  Portal,
  Stack,
  Text,
} from "~/shared/ui";
import { usePwaInstallDialogStore } from "./usePwaInstallDialogStore";
import { dismissPwaInstallDialog } from "./utils";

const baseLocale = "features.pwaInstall.dialog";

export function PwaInstallDialog() {
  const { t } = useTranslation();

  const { open, setOpen } = usePwaInstallDialogStore();

  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      dismissPwaInstallDialog();
    }

    setDontShowAgain(false);
    setOpen(false);
  };

  const handleInstallLinkClick = () => {
    handleClose();
  };

  const handleOnOpenChange = (details: { open: boolean }) => {
    if (!details.open) {
      handleClose();
      return;
    }

    setOpen(true);
  };

  return (
    <Dialog.Root
      size="sm"
      lazyMount
      open={open}
      onOpenChange={handleOnOpenChange}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="sm" w="full" mx={4} borderRadius="xl">
            <Dialog.Header>
              <Dialog.Title fontSize="lg">
                {t(`${baseLocale}.title`)}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack align="stretch" gap={3}>
                <Text fontSize="sm" color="fg.muted">
                  {t(`${baseLocale}.description`)}
                </Text>
                <Stack.VStack align="stretch" gap={1}>
                  <Text fontSize="sm" color="fg.muted">
                    {t(`${baseLocale}.benefitsIntro`)}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {t(`${baseLocale}.benefit1`)}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {t(`${baseLocale}.benefit2`)}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {t(`${baseLocale}.benefit3`)}
                  </Text>
                </Stack.VStack>
                <Text asChild color="fg.info" fontWeight="600" textStyle="sm">
                  <Link
                    to="/settings/pwa-install"
                    onClick={handleInstallLinkClick}
                  >
                    {t(`${baseLocale}.installLink`)}
                  </Link>
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  {t(`${baseLocale}.laterHintPrefix`)}
                  <Text as="span" fontWeight="semibold">
                    {t(`${baseLocale}.laterHintBold`)}
                  </Text>
                  {t(`${baseLocale}.laterHintSuffix`, { defaultValue: "" })}
                </Text>
              </Stack.VStack>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
            >
              <Flex w="full" align="center" justify="space-between" gap={3}>
                <Checkbox.Root
                  checked={dontShowAgain}
                  onCheckedChange={(details) =>
                    setDontShowAgain(Boolean(details.checked))
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label fontSize="sm">
                    {t(`${baseLocale}.dontShowAgain`)}
                  </Checkbox.Label>
                </Checkbox.Root>
                <Button type="button" onClick={handleClose}>
                  {t(`${baseLocale}.okButton`)}
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
