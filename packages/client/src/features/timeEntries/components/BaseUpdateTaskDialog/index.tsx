import { zodResolver } from "@hookform/resolvers/zod";
import {
  applyTimeObjectToDayjsDate,
  Box,
  Button,
  CloseButton,
  convertDayjsDateToDate,
  Dialog,
  EditIcon,
  Field,
  Flex,
  IconButton,
  Input,
  PlusIcon,
  Portal,
  ScrollArea,
  TextArea,
  useForm,
} from "~/shared/ui";

import styles from "./BaseUpdateTaskDialog.module.css";
import { useMemo, useState } from "react";
import { type SubmitHandler } from "react-hook-form";
import dayjs from "dayjs";
import { useTranslation } from "~/shared/hooks";
import { formatDuration, getInitialFormValues } from "./utils";
import type { TimeEntryDTO } from "@to-do-list/shared";
import type { RequestResponse } from "~/shared/api/services/types";
import type { UseDialogReturn } from "@ark-ui/react";
import {
  createUpdateTimeEntryFormSchema,
  type UpdateTimeEntryFormSchema,
} from "./constants";

export type BaseUpdateTimeEntryDialogProps = {
  dialog: UseDialogReturn;
  timeEntry?: TimeEntryDTO | null;
  mode?: "add" | "edit";
  showTrigger?: boolean;
  onSubmit?: (data: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
  }) => Promise<RequestResponse<TimeEntryDTO>> | undefined;
};

export const BaseUpdateTimeEntryDialog = ({
  dialog,
  mode = "add",
  timeEntry,
  onSubmit: _onSubmit,
  showTrigger = false,
}: BaseUpdateTimeEntryDialogProps) => {
  const { t } = useTranslation();

  const isEdit = mode === "edit";

  const baseLocale = `widgets.timeEntryHistory.updateTimeEntryDialog.${isEdit ? "update" : "create"}`;

  const [isPendingRequest, setIsPendingRequest] = useState(false);

  const updateTimeEntryFormSchema = useMemo(
    () => createUpdateTimeEntryFormSchema(t),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<UpdateTimeEntryFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(updateTimeEntryFormSchema),
    defaultValues: getInitialFormValues(isEdit ? timeEntry : undefined),
  });

  const onSubmit: SubmitHandler<UpdateTimeEntryFormSchema> = async (
    formData,
  ) => {
    const requestData = {
      title: formData.title,
      description: formData.description,
      startDate: convertDayjsDateToDate(
        applyTimeObjectToDayjsDate(formData.startTime, formData.startDate),
      ),
      endDate: convertDayjsDateToDate(
        applyTimeObjectToDayjsDate(formData.endTime, formData.startDate),
      ),
    };

    setIsPendingRequest(true);

    try {
      const response = await _onSubmit?.(requestData);
      if (response === undefined) return;
    } catch (error) {
      console.log(error);
    } finally {
      setIsPendingRequest(false);
      reset();
      dialog.setOpen(false);
    }
  };

  const renderDialogTrigger = () => {
    if (mode === "edit") {
      return (
        <IconButton variant="outline" size="sm">
          <EditIcon size={20} />
        </IconButton>
      );
    }

    return (
      <IconButton variant="outline" borderRadius="8px" size="md">
        <PlusIcon />
      </IconButton>
    );
  };

  const dialogTrigger = renderDialogTrigger();

  const disableSubmitButton = !isValid || !isDirty || isPendingRequest;

  return (
    <Dialog.RootProvider size="full" lazyMount value={dialog}>
      {showTrigger && <Dialog.Trigger asChild>{dialogTrigger}</Dialog.Trigger>}
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
                {t(`${baseLocale}.title`)}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body overflow="auto" p={0}>
              <ScrollArea.Root as="main" p="1rem" display="flex" size="xs">
                <ScrollArea.Viewport>
                  <ScrollArea.Content>
                    <Box
                      as="form"
                      display="flex"
                      flexDirection="column"
                      gap="1rem"
                      px="0.1rem"
                    >
                      <Field.Root invalid={!!errors.title}>
                        <Field.Label color="fg">
                          {t(`${baseLocale}.inputTitle.label`)}
                        </Field.Label>
                        <Input
                          autoFocus
                          color="fg"
                          truncate
                          {...register("title")}
                          placeholder={t(
                            `${baseLocale}.inputTitle.placeholder`,
                          )}
                        />
                        <Field.ErrorText color="fg.error">
                          {errors.title?.message}
                        </Field.ErrorText>
                      </Field.Root>
                      <Field.Root invalid={!!errors.description}>
                        <Field.Label color="fg">
                          {t(`${baseLocale}.inputDescription.label`)}
                        </Field.Label>
                        <TextArea
                          color="fg"
                          truncate
                          minH="4rem"
                          {...register("description")}
                          placeholder={t(
                            `${baseLocale}.inputDescription.placeholder`,
                          )}
                        />
                        <Field.ErrorText color="fg.error">
                          {errors.description?.message}
                        </Field.ErrorText>
                      </Field.Root>
                      <Flex gap={4}>
                        <Field.Root>
                          <Field.Label color="fg">
                            {t(`${baseLocale}.startDateInput.label`)}
                          </Field.Label>
                          <Input
                            readOnly
                            disabled
                            defaultValue={dayjs(timeEntry?.startDate).format(
                              "YYYY-MM-DD",
                            )}
                          />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label color="fg">
                            {t(`${baseLocale}.endDateInput.label`)}
                          </Field.Label>
                          <Input
                            readOnly
                            disabled
                            defaultValue={dayjs(timeEntry?.endDate).format(
                              "YYYY-MM-DD",
                            )}
                          />
                        </Field.Root>
                      </Flex>
                      <Field.Root>
                        <Field.Label color="fg">
                          {t(`${baseLocale}.durationInput.label`)}
                        </Field.Label>
                        <Input
                          readOnly
                          disabled
                          defaultValue={formatDuration(
                            timeEntry?.startDate,
                            timeEntry?.endDate,
                          )}
                        />
                      </Field.Root>
                    </Box>
                  </ScrollArea.Content>
                </ScrollArea.Viewport>
              </ScrollArea.Root>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
            >
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">
                  {t(`${baseLocale}.cancelButtonText`)}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                disabled={disableSubmitButton}
                onClick={handleSubmit(onSubmit)}
              >
                {t(`${baseLocale}.submitButtonText`)}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild className={styles.closeButton}>
              <CloseButton size="2xl" />
            </Dialog.CloseTrigger>
          </Dialog.SafeContent>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
};
