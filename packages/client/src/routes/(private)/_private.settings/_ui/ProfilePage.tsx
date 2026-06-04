import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import z from "zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { authActions, useAuthStore } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import { userApiService } from "~/shared/api/services";
import {
  BackButton,
  Badge,
  Box,
  Button,
  CheckIcon,
  CloseIcon,
  EditIcon,
  Field,
  Flex,
  IconButton,
  Input,
  Skeleton,
  Stack,
  Text,
  toast,
  useForm,
} from "~/shared/ui";
import { AuthUserInfo, useHeaderLeftContent } from "~/widgets";

const baseLocale = "pages.settings.profile";

type ProfileFormValues = {
  name: string;
  email: string;
};

const baseProviderLocale = "pages.settings.profile.yandexProvider";

export function ProfilePage() {
  useHeaderLeftContent(<BackButton />);

  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { linked: linkedParam, error: errorParam } = useSearch({
    from: "/(private)/_private/settings/profile",
  });

  useEffect(() => {
    if (!linkedParam && !errorParam) return;

    if (linkedParam === "yandex") {
      toast.success(t(`${baseProviderLocale}.linkSuccess`), {
        toastId: "yandex_linked",
      });
      queryClient.invalidateQueries({ queryKey: ["auth-providers"] });
    }

    if (errorParam) {
      const msg = t(`${baseProviderLocale}.linkError.${errorParam}`, {
        defaultValue: t(`${baseProviderLocale}.linkError.default`),
      });
      toast.error(msg, { toastId: "yandex_link_error" });
    }

    navigate({
      to: "/settings/profile",
      search: {},
      replace: true,
    });
  }, [errorParam, linkedParam, navigate, queryClient, t]);

  const { data: authProviders, isLoading: isAuthProvidersLoading } = useQuery({
    queryKey: ["auth-providers"],
    queryFn: () => userApiService.getAuthProviders(),
    select: (res) => (res.success ? res.data : []),
  });

  const isYandexLinked = authProviders?.some((p) => p.provider === "yandex");

  const { mutate: startYandexLink, isPending: isLinkPending } = useMutation({
    mutationFn: () => userApiService.startYandexLink(),
    onSuccess: (res) => {
      if (res.success) {
        window.location.href = res.data.redirectUrl;
      }
    },
  });

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
        <Stack.VStack alignItems="stretch" gap="0.75rem">
          <Flex align="center" justify="space-between">
            <Text fontSize="sm" fontWeight="medium" color="fg">
              Yandex ID
            </Text>
            {isAuthProvidersLoading ? (
              <Skeleton width="135px" height="30px" />
            ) : isYandexLinked ? (
              <Text fontSize="sm" color="fg.success">
                <Badge size="lg" h="30px">{t(`${baseProviderLocale}.linked`)}</Badge>
              </Text>
            ) : (
              <Button
                size="xs"
                variant="outline"
                loading={isLinkPending}
                onClick={() => startYandexLink()}
                type="button"
              >
                {t(`${baseProviderLocale}.linkButton`)}
              </Button>
            )}
          </Flex>
        </Stack.VStack>
      </Stack.VStack>
    </Stack.VStack>
  );
}
