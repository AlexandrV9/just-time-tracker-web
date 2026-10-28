import { zodResolver } from "@hookform/resolvers/zod";
import { useSearch } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import z from "zod";
import { useTranslation } from "~/shared/hooks";

import {
  ActionButton,
  Field,
  Input,
  Stack,
  Link,
  Box,
  useForm,
  Text,
  RetryAfterMessage,
} from "~/shared/ui";
import { useSignInByLogin } from "./useSignInByLogin";
import { StyledFormWrapper } from "../components/StyledFormWrapper";

const minLengthPassword = 1;
const baseLocale = "features.auth.signInByLoginForm";
const signInFormSchema = z.object({
  login: z.string().min(minLengthPassword, "login.error.required"),
  password: z.string().min(minLengthPassword, "password.error.minLength"),
});

type SignInFormSchema = z.infer<typeof signInFormSchema>;

export const SignInByLoginForm = () => {
  const { t } = useTranslation();

  const { redirect = "/" } = useSearch({ from: "/(auth)/_auth/signin/" });

  const { signInFn, retrySecondsLeft, isRetryBlocked, isPending } =
    useSignInByLogin({
      successRedirectUrl: redirect,
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
    disabled: isPending || isRetryBlocked,
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const submitHandler = handleSubmit((data) => signInFn(data));

  return (
    <StyledFormWrapper>
      <Box
        as="form"
        display="flex"
        flexDirection="column"
        gap={{ base: "0.75rem", lg: "1rem" }}
        width="full"
        onSubmit={submitHandler}
      >
        <Text as="h1" textStyle="4xl" m={0} fontWeight="semibold">
          {t(`${baseLocale}.title`)}
        </Text>
        <Text
          color="fg.muted"
          textStyle={{ base: "xs", lg: "sm" }}
          lineHeight="1.8"
        >
          {t("pages.auth.signIn.formDescription")}
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
        <RetryAfterMessage secondsLeft={retrySecondsLeft} />

        <ActionButton
          mt="0.5rem"
          type="submit"
          fontSize={{ base: "14px", lg: "12px" }}
          loading={isPending}
          disabled={isRetryBlocked}
          loadingText={t(`${baseLocale}.submitButtonLoadingText`)}
        >
          {t(`${baseLocale}.submitButton`)}
        </ActionButton>

        <Stack.HStack justify="center">
          <Text
            fontWeight="medium"
            color="fg"
            fontSize={{ base: "12px", lg: "14px" }}
          >
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
    </StyledFormWrapper>
  );
};

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
