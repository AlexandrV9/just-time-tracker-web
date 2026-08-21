import { useDialog } from "@ark-ui/react";
import { useCallback } from "react";

import { useTranslation } from "~/shared/hooks";
import { Button, CloseButton, Dialog, Portal, Stack, Text } from "~/shared/ui";

export type DeleteSessionDialogProps = {
  dialog: ReturnType<typeof useDialog>;
  sessionLabel: string;
  sessionDurationLabel: string;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function DeleteSessionDialog({
  dialog,
  sessionLabel,
  sessionDurationLabel,
  isDeleting,
  onConfirm,
}: DeleteSessionDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = useCallback(() => {
    onConfirm();
    dialog.setOpen(false);
  }, [onConfirm, dialog]);

  return (
    <Dialog.RootProvider size="sm" placement="center" lazyMount value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md" w="full" mx={4} borderRadius="xl">
            <Dialog.Header>
              <Dialog.Title fontSize="lg">
                {t("widgets.activityAnalytics.deleteSession.title")}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack gap={3} align="stretch">
                <Text textStyle="sm" color="fg.muted">
                  {t("widgets.activityAnalytics.deleteSession.description")}
                </Text>
                <Stack.VStack gap={1} align="stretch">
                  <Text fontWeight="semibold">{sessionLabel}</Text>
                  <Text textStyle="sm" color="fg.muted">
                    {sessionDurationLabel}
                  </Text>
                </Stack.VStack>
              </Stack.VStack>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
              display="flex"
              gap={3}
              justifyContent="flex-end"
            >
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" type="button" disabled={isDeleting}>
                  {t("widgets.activityAnalytics.deleteSession.cancel")}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette="red"
                onClick={handleConfirm}
                disabled={isDeleting}
                loading={isDeleting}
              >
                {t("widgets.activityAnalytics.deleteSession.confirm")}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="2xl" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}
