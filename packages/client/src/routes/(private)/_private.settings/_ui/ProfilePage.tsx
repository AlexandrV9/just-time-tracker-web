import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import z from "zod";
import { authActions, useAuthStore } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import { userApiService } from "~/shared/api/services";
import {
  BackButton,
  Box,
  CheckIcon,
  CloseIcon,
  EditIcon,
  Field,
  Flex,
  IconButton,
  Input,
  Stack,
  toast,
  useForm,
} from "~/shared/ui";
import { AuthUserInfo, useHeaderLeftContent } from "~/widgets";

const baseLocale = "pages.settings.profile";

type ProfileFormValues = {
  name: string;
  email: string;
};

export function ProfilePage() {
  useHeaderLeftContent(<BackButton />);

  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const profileFormSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, t(`${baseLocale}.errors.nameRequired`))
          .max(255),
        email: z
          .string()
          .trim()
          .max(255)
          .refine(
            (value) => value === "" || z.email().safeParse(value).success,
            t(`${baseLocale}.errors.emailInvalid`),
          ),
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
      email: user?.email ?? "",
    },
  });

  useEffect(() => {
    if (isEditing) return;

    reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
    });
  }, [isEditing, user?.email, user?.name, reset]);

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

  useEffect(() => {
    if (!isEditing) return;
    setFocus("name");
  }, [isEditing, setFocus]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = useCallback(() => {
    reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
    });
    setIsEditing(false);
  }, [reset, user?.email, user?.name]);

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      const { name, email } = getValues();
      const isUnchanged =
        name.trim() === (user?.name ?? "") &&
        email.trim() === (user?.email ?? "");

      if (isUnchanged) {
        handleCancelEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getValues, handleCancelEdit, isEditing, user?.email, user?.name]);

  const submitHandler = handleSubmit((data) => {
    updateProfile({
      name: data.name.trim(),
      email: data.email.trim(),
    });
  });

  return (
    <Stack.VStack
      alignItems="stretch"
      p={4}
      w="full"
      maxW="520px"
      mx="auto"
      gap="1rem"
    >
      <AuthUserInfo />
      <Stack.VStack alignItems="stretch" gap="1rem">
        <Box
          as="form"
          width="full"
          display="flex"
          flexDirection="column"
          gap="1rem"
          onSubmit={submitHandler}
        >
          <Flex justifyContent="flex-end" gap="0.5rem">
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
          </Flex>

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

          <Field.Root invalid={!!errors.email}>
            <Field.Label color="fg">
              {t(`${baseLocale}.emailInput.label`)}
            </Field.Label>
            <Input
              truncate
              placeholder={t(`${baseLocale}.emailInput.placeholder`)}
              autoComplete="off"
              {...register("email")}
            />
            <Field.ErrorText color="fg.error">
              {errors.email?.message}
            </Field.ErrorText>
          </Field.Root>
        </Box>
      </Stack.VStack>
    </Stack.VStack>
  );
}
