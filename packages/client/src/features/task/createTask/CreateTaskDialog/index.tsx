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
import { DateWithTimeSelect } from "./DateWithTimeSelect";
import { useController } from "react-hook-form";

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
    watch,
    // handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({ resolver: zodResolver(formSchema) });

  const [openAccordion, setOpenAccordion] = useState<OpenAccordion>(null);

  const startTimeConfig = useController({ control, name: "startTime" });
  const endTimeConfig = useController({ control, name: "endTime" });

  const formData = watch();

  console.log("formData", formData);

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

                      <DateWithTimeSelect
                        label="Start"
                        time={startTimeConfig.field.value}
                        onChangeTime={(value) => {
                          startTimeConfig.field.onChange(value);
                        }}
                        isExpanded={openAccordion === "start"}
                        onExpandedChange={(isExpanded) => {
                          setOpenAccordion(isExpanded ? "start" : null);
                        }}
                      />

                      <DateWithTimeSelect
                        label="End"
                        time={endTimeConfig.field.value}
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
                <ScrollArea.Scrollbar>
                  <ScrollArea.Thumb />
                </ScrollArea.Scrollbar>
                <ScrollArea.Corner />
              </ScrollArea.Root>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button>Save</Button>
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
