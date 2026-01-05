import { Button, type UseDialogReturn } from "@chakra-ui/react";
import { useCallback } from "react";
import { TaskCard, useDeleteTask } from "~/entities/Task";
import type { Task } from "~/shared/api/services/task";
import { CloseButton, Dialog, Portal } from "~/shared/ui";

export type ConfirmDeleteTaskDialogProps = {
  dialog: UseDialogReturn;
  task: Task | null;
};

export const ConfirmDeleteTaskDialog = ({
  dialog,
  task,
}: ConfirmDeleteTaskDialogProps) => {
  const deleteTaskMutation = useDeleteTask();

  const handleDeleteTask = useCallback(() => {
    if (!task) return;

    deleteTaskMutation.mutate({
      id: task?.id,
    });

    dialog.setOpen(false);
  }, [deleteTaskMutation, dialog, task]);

  return (
    <Dialog.RootProvider size="xs" placement="center" lazyMount value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title fontSize="2xl">
                Вы точно хотите удалить таску
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {task && <TaskCard task={task} withTimeAxis={false} />}
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
            >
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Отмена</Button>
              </Dialog.ActionTrigger>
              <Button
                disabled={deleteTaskMutation.isPending}
                onClick={handleDeleteTask}
              >
                Удалить
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
};
