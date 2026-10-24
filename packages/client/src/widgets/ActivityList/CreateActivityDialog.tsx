import { useDialog } from "@ark-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "~/shared/hooks";
import { activityApiService } from "~/shared/api/services";
import {
  Button,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  TextArea,
} from "~/shared/ui";

type CreateActivityDialogProps = {
  dialog: ReturnType<typeof useDialog>;
};

export const CreateActivityDialog = ({ dialog }: CreateActivityDialogProps) => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
  }, []);

  const closeDialog = useCallback(() => {
    dialog.setOpen(false);
    resetForm();
  }, [dialog, resetForm]);

  const { mutateAsync: createActivity, isPending } = useMutation({
    mutationFn: activityApiService.createActivity,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const isSubmitDisabled = title.trim().length === 0 || isPending;

  const handleSubmit = async () => {
    const response = await createActivity({
      title: title.trim(),
      description: description.trim() || undefined,
    });

    if (!response.success) return;

    closeDialog();
  };

  return (
    <Dialog.RootProvider size="md" lazyMount value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxW="md"
            w="full"
            mx={4}
            borderRadius="xl"
            display="flex"
            flexDirection="column"
            minH="320px"
            maxH="min(85dvh, 560px)"
            overflow="hidden"
          >
            <Dialog.Header>
              <Dialog.Title fontSize="xl">
                {t("widgets.activityList.createDialog.title")}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack gap={4} align="stretch">
                <Field.Root>
                  <Field.Label>
                    {t("widgets.activityList.createDialog.nameLabel")}
                  </Field.Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t(
                      "widgets.activityList.createDialog.namePlaceholder",
                    )}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>
                    {t("widgets.activityList.createDialog.descriptionLabel")}
                  </Field.Label>
                  <TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t(
                      "widgets.activityList.createDialog.descriptionPlaceholder",
                    )}
                  />
                </Field.Root>
              </Stack.VStack>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
            >
              <Button variant="outline" onClick={closeDialog}>
                {t("widgets.activityList.createDialog.cancelButton")}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
                {t("widgets.activityList.createDialog.submitButton")}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Dialog.CloseButton />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
};
