import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import type { MouseEvent, ReactNode } from "react";
import { Controller } from "react-hook-form";
import z from "zod";
import { authManager } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import shineStyles from "~/shared/styles/shineRing.module.css";
import {
  Box,
  Button,
  Checkbox,
  Field,
  Input,
  Link,
  Stack,
  Text,
  toast,
  useForm,
} from "~/shared/ui";

import {
  maxLengthPassword,
  minLengthPassword,
  signUpFormSchema,
} from "./constants";

const baseLocale = "features.auth.signUpForm";

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;

export const SignUpForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const signUpMutatuin = useMutation({
    mutationFn: ({ firstName, login, password }: SignUpFormSchema) =>
      authManager.signUp({ firstName, login, password }),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.errorToast`), {
          position: "top-center",
          draggable: true,
          toastId: "error_sign_up",
        });
        return;
      }

      toast.success(t(`${baseLocale}.successToast`), {
        position: "top-center",
        draggable: true,
        toastId: "success_sign_up",
      });
      reset();
      navigate({ to: "/signup-email" });
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errorToast`), {
        position: "top-center",
        draggable: true,
        toastId: "error_sign_up",
      });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      login: "",
      password: "",
      repeatPassword: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const submitHandler = handleSubmit((data) => {
    signUpMutatuin.mutate(data);
  });

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
        m={0}
        fontWeight="semibold"
        className={shineStyles.shineTextWhenHeaderHidden}
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
          showVisibilityButton={false}
          autoComplete="off"
          placeholder={t(`${baseLocale}.repeatPasswordInput.placeholder`)}
          {...register("repeatPassword")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.repeatPassword?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Stack.VStack align="stretch" gap={3} mt="0.25rem">
        <Controller
          name="acceptTerms"
          control={control}
          render={({ field: { value, onChange, onBlur, ref, name } }) => (
            <ConsentCheckbox
              name={name}
              checked={value}
              invalid={!!errors.acceptTerms}
              disabled={signUpMutatuin.isPending}
              inputRef={ref}
              onBlur={onBlur}
              onCheckedChange={onChange}
            >
              {t(`${baseLocale}.acceptTerms.prefix`)}{" "}
              <ConsentLink to="/terms-of-service">
                {t(`${baseLocale}.acceptTerms.link`)}
              </ConsentLink>
            </ConsentCheckbox>
          )}
        />

        <Controller
          name="acceptPrivacy"
          control={control}
          render={({ field: { value, onChange, onBlur, ref, name } }) => (
            <ConsentCheckbox
              name={name}
              checked={value}
              invalid={!!errors.acceptPrivacy}
              disabled={signUpMutatuin.isPending}
              inputRef={ref}
              onBlur={onBlur}
              onCheckedChange={onChange}
            >
              {t(`${baseLocale}.acceptPrivacy.prefix`)}{" "}
              <ConsentLink to="/privacy-policy">
                {t(`${baseLocale}.acceptPrivacy.link`)}
              </ConsentLink>
            </ConsentCheckbox>
          )}
        />
      </Stack.VStack>

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
          <Text asChild color="fg.info" fontWeight="600">
            <Link to="/signin">{t(`${baseLocale}.linkText`)}</Link>
          </Text>
        </Text>
      </Stack.HStack>
    </Box>
  );
};

type ConsentCheckboxProps = {
  name: string;
  checked: boolean;
  invalid: boolean;
  disabled?: boolean;
  inputRef: (instance: HTMLInputElement | null) => void;
  onBlur: () => void;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
};

function ConsentCheckbox({
  name,
  checked,
  invalid,
  disabled,
  inputRef,
  onBlur,
  onCheckedChange,
  children,
}: ConsentCheckboxProps) {
  return (
    <Checkbox.Root
      name={name}
      size="sm"
      alignItems="flex-start"
      checked={checked}
      invalid={invalid}
      disabled={disabled}
      colorPalette={invalid ? "red" : "gray"}
      onBlur={onBlur}
      onCheckedChange={(details) => onCheckedChange(Boolean(details.checked))}
    >
      <Checkbox.HiddenInput ref={inputRef} />
      <Checkbox.Control mt="2px">
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Label
        fontWeight="normal"
        lineHeight="1.45"
        color={invalid ? "fg.error" : "fg.muted"}
        css={{ textWrap: "pretty" }}
      >
        {children}
      </Checkbox.Label>
    </Checkbox.Root>
  );
}

function ConsentLink({
  to,
  children,
}: {
  to: "/terms-of-service" | "/privacy-policy";
  children: ReactNode;
}) {
  return (
    <Text
      as="span"
      color="fg"
      fontWeight="600"
      textDecoration="underline"
      textUnderlineOffset="3px"
      _hover={{ opacity: 0.8 }}
    >
      <Link
        to={to}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          event.stopPropagation();
        }}
      >
        {children}
      </Link>
    </Text>
  );
}

function getTranslatedError(
  t: TFunction<"translation", undefined>,
  errorMessage: string | undefined,
) {
  if (!errorMessage) return undefined;

  switch (errorMessage) {
    case "firstName.error.required":
      return t(`${baseLocale}.firstNameInput.errors.required`);
    case "login.error.required":
      return t(`${baseLocale}.loginInput.errors.required`);
    case "login.error.minLength":
      return t(`${baseLocale}.loginInput.errors.minLength`);
    case "login.error.maxLength":
      return t(`${baseLocale}.loginInput.errors.maxLength`);
    case "login.error.invalidFormat":
      return t(`${baseLocale}.loginInput.errors.invalidFormat`);
    case "login.error.isEmail":
      return t(`${baseLocale}.loginInput.errors.isEmail`);
    case "password.error.minLength":
      return t(`${baseLocale}.passwordInput.errors.minLength`, {
        count: minLengthPassword,
      });
    case "password.error.maxLength":
      return t(`${baseLocale}.passwordInput.errors.maxLength`, {
        count: maxLengthPassword,
      });
    case "password.error.noLetter":
      return t(`${baseLocale}.passwordInput.errors.noLetter`);
    case "password.error.noDigit":
      return t(`${baseLocale}.passwordInput.errors.noDigit`);
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
