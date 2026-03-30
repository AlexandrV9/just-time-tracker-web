import type { UseDialogReturn } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TimeEntryDTO } from "@to-do-list/shared";
import { useCallback } from "react";
import { timeEntryApiService } from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { Button, CloseButton, Dialog, Flex, Portal, toast } from "~/shared/ui";
import { TimeEntryCard } from "../TimeEntryList/TimeEntryCard";

export type ConfirmDeleteTimeEntryDialogProps = {
  dialog: UseDialogReturn;
  timeEntry: TimeEntryDTO;
  onClose?: () => void;
};

export const ConfirmDeleteTimeEntryDialog = ({
  dialog,
  timeEntry,
  onClose,
}: ConfirmDeleteTimeEntryDialogProps) => {
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const сloseHandler = useCallback(() => {
    if (onClose) {
      onClose?.();
      return;
    }

    dialog.setOpen(false);
  }, [dialog, onClose]);

  const { mutate: deleteTimeEntry, isPending } = useMutation({
    mutationFn: () => timeEntryApiService.deleteTimeEntry({ id: timeEntry.id }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
    },
    onSuccess: () => {
      toast.success("Удаление прошло успешно", {
        position: "top-center",
        draggable: true,
        toastId: "success_delete_time_entry",
      });
      сloseHandler();
    },
    onError: () => {
      toast.error("Ошибка удаления записи", {
        position: "top-center",
        draggable: true,
        toastId: "error_delete_time_entry",
      });
    },
  });

  return (
    <Dialog.RootProvider size="full" lazyMount value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner zIndex={3}>
          <Dialog.SafeContent
            overflow="auto"
            display="flex"
            flexDirection="column"
          >
            <Dialog.Header>
              <Dialog.Title fontSize="xl">
                {t(
                  "widgets.timeEntryHistory.confirmDeleteTimeEntryDialog.title",
                )}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Flex direction="column" gap={4}>
                <Dialog.Description>
                  {t(
                    "widgets.timeEntryHistory.confirmDeleteTimeEntryDialog.description",
                  )}
                </Dialog.Description>
                <TimeEntryCard {...timeEntry} />
              </Flex>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={сloseHandler}
                >
                  {t(
                    "widgets.timeEntryHistory.confirmDeleteTimeEntryDialog.cancelButtonText",
                  )}
                </Button>
              </Dialog.ActionTrigger>
              <Button disabled={isPending} onClick={() => deleteTimeEntry()}>
                {t(
                  "widgets.timeEntryHistory.confirmDeleteTimeEntryDialog.submitButtonText",
                )}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="2xl" />
            </Dialog.CloseTrigger>
          </Dialog.SafeContent>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
};
