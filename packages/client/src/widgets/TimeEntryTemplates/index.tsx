import type { TimeEntryTemplateDTO } from "@to-do-list/shared";
import { useDialog } from "@ark-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "~/shared/hooks";
import { timeEntryTemplateApiService } from "~/shared/api/services";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  IconButton,
  Input,
  PlusIcon,
  Portal,
  Stack,
  Text,
  TextArea,
} from "~/shared/ui";

import styles from "./TimeEntryTemplates.module.css";

export type SelectedTimeEntryTemplate = Pick<
  TimeEntryTemplateDTO,
  "id" | "title" | "description"
>;

type TimeEntryTemplatesProps = {
  createdById: string;
  selectedTemplate: SelectedTimeEntryTemplate | null;
  onTemplateChange: (template: SelectedTimeEntryTemplate | null) => void;
};

export const TimeEntryTemplates = ({
  createdById,
  selectedTemplate,
  onTemplateChange,
}: TimeEntryTemplatesProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const createDialog = useDialog();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  const { data } = useQuery({
    queryKey: ["time_entry_templates", createdById],
    queryFn: () =>
      timeEntryTemplateApiService.getTimeEntryTemplates({ createdById }),
  });

  const templates = useMemo(() => {
    if (!data?.success) return [];
    return data.data;
  }, [data]);

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, templates.length, selectedTemplate?.id]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  const closeDialog = () => {
    createDialog.setOpen(false);
    resetForm();
  };

  const { mutateAsync: createTemplate, isPending: isCreatingTemplate } =
    useMutation({
      mutationFn: timeEntryTemplateApiService.createTimeEntryTemplate,
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["time_entry_templates", createdById],
        });
      },
    });

  const isSubmitDisabled = title.trim().length === 0 || isCreatingTemplate;

  const handleManualTemplateCreate = async () => {
    const response = await createTemplate({
      title: title.trim(),
      description: description.trim(),
      createdById,
    });

    if (!response.success) return;

    onTemplateChange({
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
    });
    closeDialog();
  };

  return (
    <Stack.VStack align="start" gap={2}>
      <Stack.HStack>
        <Text textStyle="2xl" fontWeight="bold">
          {t("widgets.timeEntryTemplates.title")}
        </Text>
        <IconButton
          variant="outline"
          size="xs"
          onClick={() => createDialog.setOpen(true)}
          disabled={isCreatingTemplate}
        >
          <PlusIcon />
        </IconButton>
      </Stack.HStack>

      {templates.length > 0 ? (
        <Box asChild>
          <div ref={emblaRef} className={styles.viewport}>
            <Box className={styles.container}>
              {templates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                const descriptionText = template.description?.trim();

                return (
                  <Box key={template.id} className={styles.slide}>
                    <Button
                      rounded="xl"
                      variant="outline"
                      w="full"
                      h="6rem"
                      gap={2}
                      p={3}
                      flexDirection="column"
                      justifyContent="start"
                      alignItems="start"
                      borderColor={
                        isSelected ? "purple.solid" : "border.emphasized"
                      }
                      bg="bg.subtle"
                      onClick={() => {
                        onTemplateChange(
                          isSelected
                            ? null
                            : {
                                id: template.id,
                                title: template.title,
                                description: template.description,
                              },
                        );
                      }}
                      aria-pressed={isSelected}
                      aria-label={template.title}
                    >
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        lineClamp={2}
                        color="fg"
                        title={template.title}
                      >
                        {template.title}
                      </Text>
                      <Text
                        fontSize="xs"
                        lineClamp={3}
                        color="fg.muted"
                        title={descriptionText}
                        textAlign="left"
                      >
                        {descriptionText
                          ? descriptionText
                          : t("widgets.timeEntryTemplates.noDescription")}
                      </Text>
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </div>
        </Box>
      ) : (
        <Text color="fg.muted">
          {t("widgets.timeEntryTemplates.notTemplates")}
        </Text>
      )}

      <Dialog.RootProvider size="full" lazyMount value={createDialog}>
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
                  {t("widgets.timeEntryTemplates.createTemplateDialog.title")}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack.VStack gap={4} align="stretch">
                  <Field.Root>
                    <Field.Label>
                      {t(
                        "widgets.timeEntryTemplates.createTemplateDialog.nameLabel",
                      )}
                    </Field.Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t(
                        "widgets.timeEntryTemplates.createTemplateDialog.namePlaceholder",
                      )}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>
                      {t(
                        "widgets.timeEntryTemplates.createTemplateDialog.descriptionLabel",
                      )}
                    </Field.Label>
                    <TextArea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t(
                        "widgets.timeEntryTemplates.createTemplateDialog.descriptionPlaceholder",
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
                  {t(
                    "widgets.timeEntryTemplates.createTemplateDialog.cancelButtonText",
                  )}
                </Button>
                <Button
                  onClick={handleManualTemplateCreate}
                  disabled={isSubmitDisabled}
                >
                  {t(
                    "widgets.timeEntryTemplates.createTemplateDialog.submitButtonText",
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
    </Stack.VStack>
  );
};
