import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
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
  ScrollArea,
  TextArea,
  useForm,
} from "~/shared/ui";

import styles from "./CreateTaskDialog.module.css";
import { useMemo, useState } from "react";
import { DateTimePicker } from "./DateTimePicker";
import { useController, type SubmitHandler } from "react-hook-form";
import dayjs from "dayjs";
import {
  convertDayjsDateToTimeObject,
  applyTimeObjectToDate,
} from "~/shared/ui/TimePicker";
import { useTranslation } from "~/shared/hooks";
// import { useTasksStore } from "~/features/tasks/model/useTasksStore";

type OpenAccordion = "start" | "end" | null;

const timeSchema = z.object({
  hours: z.number(),
  minutes: z.number(),
  seconds: z.number(),
});

const formSchema = z.object({
  title: z.string().min(1, "Это поле обязательно"),
  description: z.string(),
  startTime: timeSchema,
  startDate: z.date(),
  endTime: timeSchema,
  endDate: z.date(),
});

type FormSchema = z.infer<typeof formSchema>;

export const CreateTaskDialog = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<FormSchema>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: new Date(),
      startTime: convertDayjsDateToTimeObject(dayjs()),
      endDate: new Date(),
      endTime: convertDayjsDateToTimeObject(dayjs().add(10, "minute")),
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

  // const createTask = useTasksStore((state) => state.createTask);

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    const requestData = {
      title: data.title,
      description: data.description,
      startDate: applyTimeObjectToDate(data.startTime, data.startDate).format(
        "YYYY-MM-DDTHH:mm"
      ),
      endDate: applyTimeObjectToDate(data.endTime, data.endDate).format(
        "YYYY-MM-DDTHH:mm"
      ),
    };

    // createTask(requestData);
    reset();
    setIsOpen(false);

    console.log("requestData", requestData);
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

  const disableSubmitButton = !isValid || !isDirty || !isTimeRangeValid;

  return (
    <Dialog.Root
      size="full"
      lazyMount
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
    >
      <Dialog.Trigger asChild>
        <IconButton variant="outline" borderRadius="8px" size="md">
          <PlusIcon />
        </IconButton>
      </Dialog.Trigger>
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
                {t("features.tasks.create.dialogTitle")}
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
                          {t("features.tasks.create.inputTitle.label")}
                        </Field.Label>
                        <Input
                          autoFocus
                          color="fg"
                          truncate
                          {...register("title")}
                          placeholder={t(
                            "features.tasks.create.inputTitle.placeholder"
                          )}
                        />
                        <Field.ErrorText color="fg.error">
                          {errors.title?.message}
                        </Field.ErrorText>
                      </Field.Root>

                      <Field.Root invalid={!!errors.description}>
                        <Field.Label color="fg">
                          {t("features.tasks.create.inputDescription.label")}
                        </Field.Label>
                        <TextArea
                          color="fg"
                          truncate
                          minH="4rem"
                          {...register("description")}
                          placeholder={t(
                            "features.tasks.create.inputDescription.placeholder"
                          )}
                        />
                        <Field.ErrorText color="fg.error">
                          {errors.description?.message}
                        </Field.ErrorText>
                      </Field.Root>

                      <DateTimePicker
                        label={t("features.tasks.create.startDate.label")}
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

                      <DateTimePicker
                        label={t("features.tasks.create.endDate.label")}
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
                  {t("features.tasks.create.cancelButtonText")}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                disabled={disableSubmitButton}
                onClick={handleSubmit(onSubmit)}
              >
                {t("features.tasks.create.createButtonText")}
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
