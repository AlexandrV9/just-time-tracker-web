import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, updateProfileSchema } from "@to-do-list/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import z from "zod";
import { authActions, useAuthStore } from "~/features/auth";
import { userApiService } from "~/shared/api";
import { useTranslation } from "~/shared/hooks";
import {
  Card,
  CheckIcon,
  CloseIcon,
  EditIcon,
  Field,
  IconButton,
  Input,
  Stack,
  toast,
  useForm,
} from "~/shared/ui";

const baseLocale = "pages.settings.profile";

type ProfileFormValues = {
  name: string;
  login: string;
};

export const MainInfo = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);

  const profileFormSchema = useMemo(
    () =>
      updateProfileSchema.extend({
        name: z
          .string()
          .trim()
          .min(1, t(`${baseLocale}.errors.nameRequired`))
          .max(255),
        login: loginSchema,
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onBlur",
    disabled: !isEditing,
    defaultValues: {
      name: user?.name ?? "",
      login: user?.login ?? "",
    },
  });

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = useCallback(() => {
    reset({
      name: user?.name ?? "",
      login: user?.login ?? "",
    });
    setIsEditing(false);
  }, [reset, user?.login, user?.name]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: userApiService.updateProfile,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message ?? t(`${baseLocale}.saveError`));
        return;
      }

      authActions.setUser({
        ...response.data,
        id: String(response.data.id),
      });

      setIsEditing(false);
      toast.success(t(`${baseLocale}.saveSuccess`));
    },
    onError: () => {
      toast.error(t(`${baseLocale}.saveError`));
    },
  });

  const submitHandler = handleSubmit((data) => {
    updateProfile({
      name: data.name.trim(),
      login: data.login.trim(),
    });
  });

  useEffect(() => {
    if (!isEditing) return;

    setFocus("name");
  }, [isEditing, setFocus]);

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      const { name, login } = getValues();
      const isUnchanged =
        name.trim() === (user?.name ?? "") &&
        login.trim() === (user?.login ?? "");

      if (isUnchanged) {
        handleCancelEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getValues, handleCancelEdit, isEditing, user?.login, user?.name]);

  const getLoginErrorMessage = (message?: string) => {
    if (!message) return undefined;

    switch (message) {
      case "login.error.minLength":
        return t(`${baseLocale}.loginInput.errors.minLength`);
      case "login.error.maxLength":
        return t(`${baseLocale}.loginInput.errors.maxLength`);
      case "login.error.invalidFormat":
        return t(`${baseLocale}.loginInput.errors.invalidFormat`);
      case "login.error.isEmail":
        return t(`${baseLocale}.loginInput.errors.isEmail`);
      default:
        return message;
    }
  };

  return (
    <Card.Root borderRadius="1rem">
      <Card.Header p="0.8rem">
        <Stack.HStack justifyContent="flex-end" gap="0.5rem">
          {isEditing ? (
            <>
              <IconButton
                aria-label={t(`${baseLocale}.cancelButton`)}
                variant="outline"
                size="sm"
                type="button"
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                <CloseIcon size={18} />
              </IconButton>
              <IconButton
                aria-label={t(`${baseLocale}.saveButton`)}
                variant="outline"
                size="sm"
                type="submit"
                loading={isPending}
              >
                <CheckIcon size={18} />
              </IconButton>
            </>
          ) : (
            <IconButton
              aria-label={t(`${baseLocale}.editButton`)}
              variant="outline"
              size="sm"
              type="button"
              onClick={handleStartEdit}
            >
              <EditIcon size={18} />
            </IconButton>
          )}
        </Stack.HStack>
      </Card.Header>
      <Card.Body
        as="form"
        width="full"
        display="flex"
        flexDirection="column"
        gap="1rem"
        p="0.8rem"
        onSubmit={submitHandler}
      >
        <Field.Root invalid={!!errors.name}>
          <Field.Label color="fg">
            {t(`${baseLocale}.nameInput.label`)}
          </Field.Label>
          <Input
            truncate
            placeholder={t(`${baseLocale}.nameInput.placeholder`)}
            autoComplete="off"
            {...register("name")}
          />
          <Field.ErrorText color="fg.error">
            {errors.name?.message}
          </Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.login}>
          <Field.Label color="fg">
            {t(`${baseLocale}.loginInput.label`)}
          </Field.Label>
          <Input
            truncate
            placeholder={t(`${baseLocale}.loginInput.placeholder`)}
            autoComplete="username"
            {...register("login")}
          />
          <Field.ErrorText color="fg.error">
            {getLoginErrorMessage(errors.login?.message)}
          </Field.ErrorText>
        </Field.Root>
      </Card.Body>
    </Card.Root>
  );
};
