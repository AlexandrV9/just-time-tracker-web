import { useDialog } from "@ark-ui/react";
import { useCallback } from "react";
import { useTranslation } from "~/shared/hooks";
import { Button, CloseButton, Dialog, Portal, Stack, Text } from "~/shared/ui";

export type DeleteActivityDialogProps = {
  dialog: ReturnType<typeof useDialog>;
  activityTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function DeleteActivityDialog({
  dialog,
  activityTitle,
  isDeleting,
  onConfirm,
}: DeleteActivityDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = useCallback(() => {
    onConfirm();
    dialog.setOpen(false);
  }, [onConfirm, dialog]);

  return (
    <Dialog.RootProvider size="sm" placement="center" lazyMount value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner zIndex={3}>
          <Dialog.Content maxW="md" w="full" mx={4} borderRadius="xl">
            <Dialog.Header>
              <Dialog.Title fontSize="lg">
                {t("pages.activities.detail.deleteDialogTitle")}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack gap={3} align="stretch">
                <Text textStyle="sm" color="fg.muted">
                  {t("pages.activities.detail.deleteConfirm")}
                </Text>
                <Text fontWeight="semibold">{activityTitle}</Text>
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
                  {t("pages.activities.detail.deleteDialogCancel")}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette="red"
                onClick={handleConfirm}
                disabled={isDeleting}
                loading={isDeleting}
              >
                {t("pages.activities.detail.deleteDialogConfirm")}
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
