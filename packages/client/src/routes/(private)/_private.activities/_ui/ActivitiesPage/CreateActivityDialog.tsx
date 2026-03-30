import { useDialog } from "@ark-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "~/shared/hooks";
import { activityApiService } from "~/shared/api/services";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  TextArea,
} from "~/shared/ui";

const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

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
      createdById: DEMO_USER_ID,
    });

    if (!response.success) return;

    closeDialog();
  };

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
                {t("pages.activities.createDialog.title")}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack gap={4} align="stretch">
                <Field.Root>
                  <Field.Label>
                    {t("pages.activities.createDialog.nameLabel")}
                  </Field.Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t(
                      "pages.activities.createDialog.namePlaceholder",
                    )}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>
                    {t("pages.activities.createDialog.descriptionLabel")}
                  </Field.Label>
                  <TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t(
                      "pages.activities.createDialog.descriptionPlaceholder",
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
                {t("pages.activities.createDialog.cancelButton")}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
                {t("pages.activities.createDialog.submitButton")}
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
