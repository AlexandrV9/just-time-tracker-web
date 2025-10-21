import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import z from "zod";
import { authManager } from "~/features/auth";
import type { ErrorField, UserDTO } from "~/shared/api";
import type { ApiError } from "~/shared/config/error";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Button,
  Field,
  Input,
  Link,
  Stack,
  Text,
  toast,
  useForm,
} from "~/shared/ui";

const minLengthPassword = 8;
const baseLocale = "features.auth.signUpForm";
const signUpFormSchema = z
  .object({
    firstName: z.string().min(1, "firstName.error.required"),
    login: z.string().min(1, "login.error.required"),
    password: z.string().min(minLengthPassword, "password.error.minLength"),
    repeatPassword: z.string().min(1, "repeatPassword.error.required"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "passwords.mismatch",
    path: ["repeatPassword"],
  });

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;

export const SignUpForm = () => {
  const { t } = useTranslation();

  const signUpMutatuin = useMutation<
    UserDTO,
    ApiError<ErrorField[] | null>,
    SignUpFormSchema
  >({
    mutationFn: (data: SignUpFormSchema) => authManager.signUp(data),
    onSuccess: (data) => {
      console.log(data);
      toast.success("Success", {
        position: "top-center",
        draggable: true,
        toastId: "error_sign_up",
      });
      reset();
    },
    onError: (error) => {
      toast.success("Success", {
        position: "top-center",
        draggable: true,
        toastId: "error_sign_up",
      });
      console.log("error", error);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      login: "",
      password: "",
      repeatPassword: "",
    },
  });

  const submitHandler = handleSubmit((data) => {
    signUpMutatuin.mutate(data);
  });

  // if (true) {
  //   return (
  //     <Box
  //       as="form"
  //       display="flex"
  //       flexDirection="column"
  //       gap="1rem"
  //       onSubmit={submitHandler}
  //     >
  //       <Text
  //         as="h1"
  //         textStyle="4xl"
  //         fontWeight="semibold"
  //         bg="linear-gradient(135deg, #7ea670ff 20%, #8307fe 40%, #07fe66ff 70%)"
  //         bgClip="text"
  //         m={0}
  //       >
  //         {t(`${baseLocale}.title`)}
  //       </Text>

  //       <Text as="h2" fontSize="1.2rem" fontWeight="semibold">
  //         ✅ прошла успешно!
  //       </Text>

  //       <Text as="p" color="gray.400" lineHeight={1.3}>
  //         Через несколько секунд мы перенаправим вас на страницу входа, где вы
  //         сможете начать пользоваться всеми возможностями нашего приложения
  //       </Text>

  //       <Button
  //         mt="1rem"
  //         type="submit"
  //         loading={signUpMutatuin.isPending}
  //         loadingText={t(`${baseLocale}.submitButtonLoadingText`)}
  //       >
  //         Перейти к входу
  //       </Button>
  //     </Box>
  //   );
  // }

  return (
    <Box
      as="form"
      display="flex"
      flexDirection="column"
      gap="1rem"
      onSubmit={submitHandler}
    >
      <Text
        as="h1"
        textStyle="4xl"
        fontWeight="semibold"
        bg="linear-gradient(135deg, #7ea670ff 20%, #8307fe 40%, #07fe66ff 70%)"
        bgClip="text"
      >
        {t(`${baseLocale}.title`)}
      </Text>

      <Field.Root invalid={!!errors.firstName}>
        <Field.Label color="fg">
          {t(`${baseLocale}.firstNameInput.label`)}
        </Field.Label>
        <Input
          truncate
          color="fg"
          placeholder={t(`${baseLocale}.firstNameInput.placeholder`)}
          autoComplete="false"
          {...register("firstName")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.firstName?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.login}>
        <Field.Label color="fg">
          {t(`${baseLocale}.loginInput.label`)}
        </Field.Label>
        <Input
          truncate
          placeholder={t(`${baseLocale}.loginInput.placeholder`)}
          autoComplete="off"
          {...register("login")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.login?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.password}>
        <Field.Label color="fg">
          {t(`${baseLocale}.passwordInput.label`)}
        </Field.Label>
        <Input.Password
          color="fg"
          truncate
          autoComplete="off"
          paddingRight="52px !important" // TODO: убрать это и сделать иначе
          placeholder={t(`${baseLocale}.passwordInput.placeholder`)}
          {...register("password")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.password?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.repeatPassword}>
        <Field.Label color="fg">
          {t(`${baseLocale}.repeatPasswordInput.label`)}
        </Field.Label>
        <Input.Password
          color="fg"
          truncate
          autoComplete="off"
          paddingRight="52px !important" // TODO: убрать это и сделать иначе
          placeholder={t(`${baseLocale}.repeatPasswordInput.placeholder`)}
          {...register("repeatPassword")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.repeatPassword?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Button
        mt="1rem"
        type="submit"
        loading={signUpMutatuin.isPending}
        loadingText={t(`${baseLocale}.submitButtonLoadingText`)}
      >
        {t(`${baseLocale}.submitButton`)}
      </Button>

      <Stack.HStack justify="center">
        <Text fontWeight="medium" color="fg">
          <Text as="span" mr="5px">
            {t(`${baseLocale}.subtitleText`)}
          </Text>
          <Text asChild color="purple.500" fontWeight="600">
            <Link to="/signin">{t(`${baseLocale}.linkText`)}</Link>
          </Text>
        </Text>
      </Stack.HStack>
    </Box>
  );
};

function getTranslatedError(
  t: TFunction<"translation", undefined>,
  errorMessage: string | undefined
) {
  if (!errorMessage) return undefined;

  switch (errorMessage) {
    case "firstName.error.required":
      return t(`${baseLocale}.firstNameInput.errors.required`);
    case "login.error.required":
      return t(`${baseLocale}.loginInput.errors.required`);
    case "password.error.minLength":
      return t(`${baseLocale}.passwordInput.errors.minLength`, {
        count: minLengthPassword,
      });
    case "passwords.mismatch":
      return t(`${baseLocale}.repeatPasswordInput.errors.mismatch`, {
        count: minLengthPassword,
      });
    case "repeatPassword.error.required":
      return t(`${baseLocale}.repeatPasswordInput.errors.required`, {
        count: minLengthPassword,
      });
    default: {
      return undefined;
    }
  }
}
