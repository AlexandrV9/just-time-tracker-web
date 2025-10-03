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
import { useState } from "react";
import { DateTimePicker } from "./DateTimePicker";
import { useController, type SubmitHandler } from "react-hook-form";
import dayjs from "dayjs";

type OpenAccordion = "start" | "end" | null;

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: z.string(),
  startDate: z.string(),
  endTime: z.string(),
  endDate: z.string(),
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
      startDate: dayjs().format("YYYY-MM-DD"),
      startTime: dayjs().format("HH:mm:ss"),
      endDate: dayjs().format("YYYY-MM-DD"),
      endTime: dayjs().format("HH:mm:ss"),
    },
  });

  const [openAccordion, setOpenAccordion] = useState<OpenAccordion>(null);

  const startDateConfig = useController({ control, name: "startDate" });
  const endDateConfig = useController({ control, name: "endDate" });

  const startTimeConfig = useController({ control, name: "startTime" });
  const endTimeConfig = useController({ control, name: "endTime" });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    alert(JSON.stringify(data));
  };

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
                        time={startTimeConfig.field.value}
                        date={startDateConfig.field.value}
                        onChangeDate={(value) => {
                          startDateConfig.field.onChange(value);
                        }}
                        onChangeTime={(value) => {
                          startTimeConfig.field.onChange(value);
                        }}
                        isExpanded={openAccordion === "start"}
                        onExpandedChange={(isExpanded) => {
                          setOpenAccordion(isExpanded ? "start" : null);
                        }}
                      />

                      <DateTimePicker
                        label="End"
                        time={endTimeConfig.field.value}
                        date={endDateConfig.field.value}
                        onChangeDate={endDateConfig.field.onChange}
                        onChangeTime={(value) => {
                          endTimeConfig.field.onChange(value);
                        }}
                        isExpanded={openAccordion === "end"}
                        onExpandedChange={(isExpanded) => {
                          setOpenAccordion(isExpanded ? "end" : null);
                        }}
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
              <Button onClick={handleSubmit(onSubmit)}>Save</Button>
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
