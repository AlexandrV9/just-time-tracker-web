import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Box,
  Button,
  CloseButton,
  DatePicker,
  Dialog,
  Field,
  IconButton,
  Input,
  PlusIcon,
  Portal,
  useForm,
} from "~/shared/ui";

const formSchema = z.object({
  name: z.string(),
  login: z.string(),
  password: z
    .string()
    .min(6, "The password is short, the minimum length of 8 symbols"),
});

type FormSchema = z.infer<typeof formSchema>;

export const CreateTaskDialog = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({ resolver: zodResolver(formSchema) });

  return (
    <Dialog.Root size="xs">
      <Dialog.Trigger asChild>
        <IconButton variant="outline" borderRadius="8px" size="md">
          <PlusIcon />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create New Task</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Box as="form" display="flex" flexDirection="column" gap="1rem">
                <Field.Root invalid={!!errors.login}>
                  <Field.Label color="fg">Name</Field.Label>
                  <Input color="fg" truncate {...register("name")} />
                  <Field.ErrorText color="fg.error">
                    {errors.name?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.login}>
                  <Field.Label color="fg">Description</Field.Label>
                  <Input color="fg" truncate {...register("name")} />
                  <Field.ErrorText color="fg.error">
                    {errors.name?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.login}>
                  <Field.Label color="fg">Start Date</Field.Label>
                  <DatePicker onChange={() => {}} selected={undefined} />
                  {/* <Input color="fg" truncate {...register("name")} /> */}
                  <Field.ErrorText color="fg.error">
                    {errors.name?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.login}>
                  <Field.Label color="fg">End Date</Field.Label>
                  <DatePicker onChange={() => {}} selected={undefined} />
                  {/* <Input color="fg" truncate {...register("name")} /> */}
                  <Field.ErrorText color="fg.error">
                    {errors.name?.message}
                  </Field.ErrorText>
                </Field.Root>
              </Box>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
