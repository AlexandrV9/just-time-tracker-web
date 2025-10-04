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

type OpenAccordion = "start" | "end" | null;

const timeSchema = z.object({
  hours: z.number(),
  minutes: z.number(),
  seconds: z.number(),
});

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: timeSchema,
  startDate: z.date(),
  endTime: timeSchema,
  endDate: z.date(),
});

type FormSchema = z.infer<typeof formSchema>;

export const CreateTaskDialog = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
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

  return (
    <Dialog.Root size="full">
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
              <Dialog.Title fontSize="2xl">Create New Task</Dialog.Title>
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
                        <Field.Label color="fg">Title</Field.Label>
                        <Input
                          color="fg"
                          truncate
                          {...register("title")}
                          placeholder="Please enter name new task"
                        />
                        <Field.ErrorText color="fg.error">
                          {errors.title?.message}
                        </Field.ErrorText>
                      </Field.Root>

                      <Field.Root invalid={!!errors.description}>
                        <Field.Label color="fg">Description</Field.Label>
                        <TextArea
                          color="fg"
                          truncate
                          minH="4rem"
                          {...register("description")}
                          placeholder="Please enter description new task"
                        />
                        <Field.ErrorText color="fg.error">
                          {errors.description?.message}
                        </Field.ErrorText>
                      </Field.Root>

                      <DateTimePicker
                        label="Start"
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
                        label="End"
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
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                disabled={!isTimeRangeValid}
                onClick={handleSubmit(onSubmit)}
              >
                Save
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
