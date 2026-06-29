import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import z from "zod";
import { authManager } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import shineStyles from "~/shared/styles/shineRing.module.css";

import {
  Button,
  Field,
  Input,
  Stack,
  Link,
  Box,
  useForm,
  toast,
  Text,
} from "~/shared/ui";

const minLengthPassword = 1;
const baseLocale = "features.auth.signInByLoginForm";
const signInFormSchema = z.object({
  login: z.string().min(minLengthPassword, "login.error.required"),
  password: z.string().min(minLengthPassword, "password.error.minLength"),
});

type SignInFormSchema = z.infer<typeof signInFormSchema>;

export const SignInByLoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/(auth)/_auth/signin/" });

  const { isPending, mutate } = useMutation({
    mutationFn: (data: SignInFormSchema) => authManager.signInByLogin(data),
    onSuccess: (response) => {
      if (response.success) {
        navigate({ to: redirect || "/" });
        return;
      }

      showSignInErrorToast(t, response.message);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : undefined;
      showSignInErrorToast(t, message);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
    disabled: isPending,
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const submitHandler = handleSubmit((data) => mutate(data));

  return (
    <Box
      as="form"
      display="flex"
      flexDirection="column"
      gap="1rem"
      width="full"
      onSubmit={submitHandler}
    >
      <Text
        as="h1"
        textStyle="4xl"
        m={0}
        fontWeight="semibold"
        className={shineStyles.shineTextWhenHeaderHidden}
      >
        {t(`${baseLocale}.title`)}
      </Text>
      <Field.Root invalid={!!errors.login}>
        <Field.Label color="fg">
          {t(`${baseLocale}.loginInput.label`)}
        </Field.Label>
        <Input
          color="fg"
          truncate
          placeholder={t(`${baseLocale}.loginInput.placeholder`)}
          autoComplete="on"
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
          placeholder={t(`${baseLocale}.passwordInput.placeholder`)}
          paddingRight="52px !important" // TODO: убрать это и сделать иначе
          {...register("password")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.password?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Text asChild color="fg.info" fontWeight="600" textStyle="sm">
        <Link disabled={isPending} to="/recover-account">
          {t(`${baseLocale}.forgotPasswordLink`)}
        </Link>
      </Text>

      <Button
        mt="0.5rem"
        type="submit"
        loading={isPending}
        loadingText={t(`${baseLocale}.submitButtonLoadingText`)}
      >
        {t(`${baseLocale}.submitButton`)}
      </Button>

      <Stack.HStack justify="center">
        <Text fontWeight="medium" color="fg">
          <Text as="span" mr="5px">
            {t(`${baseLocale}.subtitleText`)}
          </Text>
          <Text asChild color="fg.info" fontWeight="600">
            <Link disabled={isPending} to="/signup">
              {t(`${baseLocale}.linkText`)}
            </Link>
          </Text>
        </Text>
      </Stack.HStack>
    </Box>
  );
};

function getSignInErrorMessage(
  t: TFunction<"translation", undefined>,
  message?: string,
) {
  switch (message) {
    case "Login or password is not correct":
      return t(`${baseLocale}.errors.invalidCredentials`);
    default:
      return t(`${baseLocale}.errors.unknown`);
  }
}

function showSignInErrorToast(
  t: TFunction<"translation", undefined>,
  message?: string,
) {
  toast.error(getSignInErrorMessage(t, message), {
    position: "top-center",
    draggable: true,
    toastId: "error_sign_in",
  });
}

function getTranslatedError(
  t: TFunction<"translation", undefined>,
  errorMessage: string | undefined,
) {
  if (!errorMessage) return undefined;

  switch (errorMessage) {
    case "login.error.required":
      return t(`${baseLocale}.loginInput.errors.required`);
    case "password.error.minLength":
      return t(`${baseLocale}.passwordInput.errors.minLength`, {
        count: minLengthPassword,
      });
    default: {
      return null;
    }
  }
}
