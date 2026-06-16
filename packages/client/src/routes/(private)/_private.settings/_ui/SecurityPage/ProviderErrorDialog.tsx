import { useTranslation } from "~/shared/hooks";
import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Text,
} from "~/shared/ui";

const baseLocale = "pages.settings.security.errorDialog";

type ProviderErrorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
};

export function ProviderErrorDialog({
  open,
  onOpenChange,
  message,
}: ProviderErrorDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog.Root
      size="xs"
      lazyMount
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="sm" w="full" mx={4} borderRadius="xl">
            <Dialog.Header>
              <Dialog.Title fontSize="lg">{t(`${baseLocale}.title`)}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack align="stretch">
                <Text fontSize="sm" color="fg.muted">
                  {message}
                </Text>
              </Stack.VStack>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
            >
              <Button type="button" onClick={() => onOpenChange(false)}>
                {t(`${baseLocale}.okButton`)}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="2xl" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
