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
  IOSTimePicker,
  PlusIcon,
  Portal,
  Stack,
  useForm,
} from "~/shared/ui";

import styles from "./CreateTaskDialog.module.css";

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

type FormSchema = z.infer<typeof formSchema>;

export const CreateTaskDialog = () => {
  const {
    register,
    // handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({ resolver: zodResolver(formSchema) });

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

            <Dialog.Body>
              <Box as="form" display="flex" flexDirection="column" gap="1rem">
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
                  <Input
                    color="fg"
                    truncate
                    {...register("description")}
                    placeholder="Please enter description new task"
                  />
                  <Field.ErrorText color="fg.error">
                    {errors.description?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Stack.HStack>
                  {/* <Field.Root invalid={!!errors.startDate}>
                    <Field.Label color="fg">Start Date</Field.Label>
                    <DatePicker onChange={() => {}} value={null} />
                    <Field.ErrorText color="fg.error">
                      {errors.startDate?.message}
                    </Field.ErrorText>
                  </Field.Root> */}

                  <IOSTimePicker loop/>

                  {/* <Field.Root invalid={!!errors.endDate}>
                    <Field.Label color="fg">End Date</Field.Label>
                    <DatePicker onChange={() => {}} value={null} />
                    <Field.ErrorText color="fg.error">
                      {errors.endDate?.message}
                    </Field.ErrorText>
                  </Field.Root> */}
                </Stack.HStack>
              </Box>
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
