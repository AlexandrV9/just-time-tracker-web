import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
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
import { useEffect, useMemo, useState } from "react";
import { useController, type SubmitHandler } from "react-hook-form";
import dayjs from "dayjs";
import { useTranslation } from "~/shared/hooks";
import {
  getDayInterval,
  getInitialFormValues,
  isStartDateBeforeEndDate,
  isTimeSlotAvailable,
} from "./utils";
import type { TaskDTO } from "@to-do-list/shared";
import type { RequestResponse } from "~/shared/api/services/types";
import type { UseDialogReturn } from "@ark-ui/react";
import { formDefaultValues, updateTaskFormSchema } from "./constants";
import { IOSRangeDatePickers } from "~/shared/components";
import { useQuery } from "@tanstack/react-query";
import { taskApiService } from "~/shared/api/services/task";
import type { ValidationResult } from "~/shared/types";

export type UpdateTaskFormSchema = z.infer<typeof updateTaskFormSchema>;

export type BaseUpdateTaskDialogProps = {
  dialog: UseDialogReturn;
  task?: TaskDTO | null;
  mode?: "add" | "edit";
  showTrigger?: boolean;
  initialStartDate?: Date | null;
  onSubmit?: (data: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
  }) => Promise<RequestResponse<TaskDTO>> | undefined;
};

export const BaseUpdateTaskDialog = ({
  dialog,
  mode = "add",
  task,
  onSubmit: _onSubmit,
  initialStartDate,
  showTrigger = false,
}: BaseUpdateTaskDialogProps) => {
  const { t } = useTranslation();

  const isEdit = mode === "edit";

  const baseLocale = `features.tasks.${isEdit ? "update" : "create"}`;

  const [isPendingRequest, setIsPendingRequest] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid, isDirty },
  } = useForm<UpdateTaskFormSchema>({
    mode: "onChange",
    resolver: zodResolver(updateTaskFormSchema),
    defaultValues: formDefaultValues,
  });

  useEffect(() => {
    if (dialog.open) {
      reset(
        getInitialFormValues(
          isEdit
            ? task
            : {
                startDate: dayjs(initialStartDate)
                  .hour(10)
                  .minute(0)
                  .second(0)
                  .millisecond(0)
                  .toISOString(),
              }
        )
      );
    }
  }, [dialog.open, reset, task, initialStartDate, mode, isEdit]);

  const [openAccordion, setOpenAccordion] = useState(true);

  const startDateConfig = useController({ control, name: "startDate" });
  const startDate = startDateConfig.field.value;

  const startTimeConfig = useController({ control, name: "startTime" });
  const startTime = startTimeConfig.field.value;

  const endTimeConfig = useController({ control, name: "endTime" });
  const endTime = endTimeConfig.field.value;

  const startDateWithTime = applyTimeObjectToDayjsDate(
    startTime,
    startDate
  ).toDate();

  const endDateWithTime = applyTimeObjectToDayjsDate(
    endTime,
    startDate
  ).toDate();

  const { data: response } = useQuery({
    queryKey: ["tasks", "free-slots", startDate?.toISOString()],
    queryFn: () =>
      taskApiService.getFreeSlots({
        ...getDayInterval(startDate),
        excludeTaskIds: isEdit ? [task!.id] : undefined,
      }),
    retry: false,
  });

  const availableTimeIntervals = response?.success ? response.data : [];

  const onSubmit: SubmitHandler<UpdateTaskFormSchema> = async (formData) => {
    if (!formData.title || formData.title.length < 2) {
      setError("title", {
        type: "min",
        message: "Минимальная длина - 3 символа",
      });

      return;
    }

    const requestData = {
      title: formData.title,
      description: formData.description,
      startDate: convertDayjsDateToDate(
        applyTimeObjectToDayjsDate(formData.startTime, formData.startDate)
      ),
      endDate: convertDayjsDateToDate(
        applyTimeObjectToDayjsDate(formData.endTime, formData.startDate)
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

  const isValidTimeRange: ValidationResult = useMemo(() => {
    if (!isStartDateBeforeEndDate(startDateWithTime, endDateWithTime)) {
      return {
        isValid: false,
        error: "Время начала позже времени окончания",
      };
    }

    if (
      !isTimeSlotAvailable(
        {
          startDate: startDateWithTime,
          endDate: endDateWithTime,
        },
        availableTimeIntervals
      )
    ) {
      return {
        isValid: false,
        error:
          "В заданном промежутке времени уже есть задача, выберите другое время или день",
      };
    }

    return {
      isValid: true,
    };
  }, [availableTimeIntervals, endDateWithTime, startDateWithTime]);

  const dialogTrigger = renderDialogTrigger();

  const disableSubmitButton =
    !isValid ||
    (!isEdit && !isDirty) ||
    !isValidTimeRange.isValid ||
    isPendingRequest;

  return (
    <Dialog.RootProvider size="full" lazyMount value={dialog}>
      {showTrigger && <Dialog.Trigger asChild>{dialogTrigger}</Dialog.Trigger>}
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.SafeContent
            overflow="auto"
            display="flex"
            flexDirection="column"
          >
            <Dialog.Header>
              <Dialog.Title fontSize="2xl">
                {t(`${baseLocale}.dialogTitle`)}
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
                            `${baseLocale}.inputTitle.placeholder`
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
                            `${baseLocale}.inputDescription.placeholder`
                          )}
                        />
                        <Field.ErrorText color="fg.error">
                          {errors.description?.message}
                        </Field.ErrorText>
                      </Field.Root>
                      <Flex direction="column" gap={1}>
                        {/* <div>
                          <Text>Свободные слоты</Text>
                          {response?.success &&
                            response.data.map((item, index) => {
                              return (
                                <Flex key={index} gap={2}>
                                  <div>
                                    С {dayjs(item.startDate).format("HH:mm")}
                                  </div>
                                  <div>
                                    по {dayjs(item.endDate).format("HH:mm")}
                                  </div>
                                </Flex>
                              );
                            })}
                        </div> */}
                        <Flex alignItems="center" gap={1}>
                          <IOSRangeDatePickers
                            label="Duration"
                            isExpanded={openAccordion}
                            date={startDate}
                            onChangeDate={startDateConfig.field.onChange}
                            startTime={startTime}
                            onChangeStartTime={startTimeConfig.field.onChange}
                            endTime={endTime}
                            onChangeEndTime={endTimeConfig.field.onChange}
                            onExpandedChange={setOpenAccordion}
                            isValidTime={isValidTimeRange.isValid}
                            errorMessage={isValidTimeRange.error}
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  </ScrollArea.Content>
                </ScrollArea.Viewport>
                {/* <ScrollArea.Scrollbar>
                  <ScrollArea.Thumb />
                </ScrollArea.Scrollbar> */}
                <ScrollArea.Corner />
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
