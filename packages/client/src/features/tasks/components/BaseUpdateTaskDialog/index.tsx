import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  EditIcon,
  Field,
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
import { useController, type SubmitHandler } from "react-hook-form";
import dayjs from "dayjs";
import { applyTimeObjectToDate } from "~/shared/ui/TimePicker";
import { useTranslation } from "~/shared/hooks";
import { type Task } from "~/entities/Task";
import { IOSDatePicker } from "~/shared/components";
import {
  getCorrectInitialDate,
  getCorrectInitialTime,
  prepareDateToRequest,
} from "./utils";

type OpenAccordion = "start" | "end" | null;

const timeSchema = z.object({
  hours: z.number(),
  minutes: z.number(),
  seconds: z.number(),
});

const updateTaskFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: timeSchema,
  startDate: z.date(),
  endTime: timeSchema,
  endDate: z.date(),
});

export type UpdateTaskFormSchema = z.infer<typeof updateTaskFormSchema>;

export type BaseUpdateTaskDialogProps = Partial<Task> & {
  mode?: "add" | "edit";
  onSubmit?: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => Promise<Task>;
};

export const BaseUpdateTaskDialog = ({
  mode = "add",
  title,
  description,
  startDate: _startDate,
  endDate: _endDate,
  onSubmit: _onSubmit,
}: BaseUpdateTaskDialogProps) => {
  const { t } = useTranslation();

  const baseLocale = `features.tasks.${mode === "add" ? "create" : "update"}`;

  const [isOpen, setIsOpen] = useState(false);

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
    defaultValues: {
      title: title || "",
      description: description || "",
      startDate: getCorrectInitialDate(_startDate),
      startTime: getCorrectInitialTime(_startDate, dayjs()),
      endDate: getCorrectInitialDate(_endDate),
      endTime: getCorrectInitialTime(_endDate, dayjs().add(10, "minute")),
    },
  });

  const [openAccordion, setOpenAccordion] = useState<OpenAccordion>(null);

  const startDateConfig = useController({ control, name: "startDate" });
  const startDate = startDateConfig.field.value;

  const endDateConfig = useController({ control, name: "endDate" });
  const endDate = endDateConfig.field.value;

  const startTimeConfig = useController({ control, name: "startTime" });
  const startTime = startTimeConfig.field.value;

  const endTimeConfig = useController({ control, name: "endTime" });
  const endTime = endTimeConfig.field.value;

  const onSubmit: SubmitHandler<UpdateTaskFormSchema> = (formData) => {
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
      startDate: prepareDateToRequest(formData.startTime, formData.startDate),
      endDate: prepareDateToRequest(formData.endTime, formData.endDate),
    };

    setIsPendingRequest(true);

    _onSubmit?.(requestData).finally(() => {
      setIsPendingRequest(false);
      reset();
      setIsOpen(false);
    });
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

  const isTimeRangeValid = useMemo(() => {
    if (!startDate || !startTime || !endDate || !endTime) {
      return true;
    }

    const _startDate = applyTimeObjectToDate(startTime, startDate);
    const _endDate = applyTimeObjectToDate(endTime, endDate);

    if (!dayjs(_startDate).isSame(_endDate, "day")) {
      return true;
    }

    return _endDate.isAfter(_startDate) || _endDate.isSame(_startDate);
  }, [startDate, startTime, endDate, endTime]);

  const dialogTrigger = renderDialogTrigger();

  const disableSubmitButton =
    !isValid ||
    (mode === "add" && !isDirty) ||
    !isTimeRangeValid ||
    isPendingRequest;

  return (
    <Dialog.Root
      size="full"
      lazyMount
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
    >
      <Dialog.Trigger asChild>{dialogTrigger}</Dialog.Trigger>
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

                      <IOSDatePicker
                        label={t(`${baseLocale}.startDate.label`)}
                        time={startTime}
                        onChangeTime={startTimeConfig.field.onChange}
                        date={startDate}
                        onChangeDate={startDateConfig.field.onChange}
                        isExpanded={openAccordion === "start"}
                        onExpandedChange={(isExpanded) => {
                          setOpenAccordion(isExpanded ? "start" : null);
                        }}
                        maxDate={endDateConfig.field.value}
                        isValidTime={isTimeRangeValid}
                      />

                      <IOSDatePicker
                        label={t(`${baseLocale}.endDate.label`)}
                        time={endTime}
                        onChangeTime={endTimeConfig.field.onChange}
                        date={endDate}
                        onChangeDate={endDateConfig.field.onChange}
                        isExpanded={openAccordion === "end"}
                        onExpandedChange={(isExpanded) => {
                          setOpenAccordion(isExpanded ? "end" : null);
                        }}
                        isValidTime={isTimeRangeValid}
                        minDate={startDateConfig.field.value}
                      />
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
    </Dialog.Root>
  );
};
