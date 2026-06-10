import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { userApiService } from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Button,
  Flex,
  Skeleton,
  Stack,
  Text,
  YandexLogoIcon,
  toast,
} from "~/shared/ui";
import { ProviderErrorDialog } from "./ProviderErrorDialog";
import { SetPasswordDialog } from "./SetPasswordDialog";

const baseLocale = "pages.settings.security.loginMethods";
const providersLocale = "pages.settings.security.providers";

type ProviderId = "yandex" | "google" | "github";

type ProviderRow = {
  id: ProviderId;
  label: string;
  icon?: ReactNode;
  /** Whether link/unlink is actually wired up on the backend. */
  enabled: boolean;
};

const PROVIDERS: ProviderRow[] = [
  {
    id: "yandex",
    label: "Yandex",
    icon: <YandexLogoIcon width={20} height={20} />,
    enabled: true,
  },
  // { id: "google", label: "Google", enabled: false },
  // { id: "github", label: "GitHub", enabled: false },
];

export const LoginMethods = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { linked: linkedParam, error: errorParam } = useSearch({
    from: "/(private)/_private/settings/security",
  });

  useEffect(() => {
    if (!linkedParam && !errorParam) return;

    if (linkedParam === "yandex") {
      toast.success(t(`${providersLocale}.yandex.linkSuccess`), {
        toastId: "yandex_link_success",
      });
      queryClient.invalidateQueries({ queryKey: ["auth-providers"] });
    }

    if (errorParam) {
      setErrorMessage(
        t(`${providersLocale}.yandex.linkError.${errorParam}`, {
          defaultValue: t(`${providersLocale}.yandex.linkError.default`),
        }),
      );
    }

    navigate({ to: "/settings/security", search: {}, replace: true });
  }, [errorParam, linkedParam, navigate, queryClient, t]);

  const { data: authProviders, isLoading } = useQuery({
    queryKey: ["auth-providers"],
    queryFn: () => userApiService.getAuthProviders(),
    select: (res) => (res.success ? res.data : []),
  });

  const linkedSet = useMemo(
    () => new Set(authProviders?.map((p) => p.provider)),
    [authProviders],
  );

  const { mutate: startYandexLink, isPending: isLinkPending } = useMutation({
    mutationFn: () => userApiService.startYandexLink(),
    onSuccess: (res) => {
      if (res.success) window.location.href = res.data.redirectUrl;
    },
  });

  const { mutate: unlinkYandex, isPending: isUnlinkPending } = useMutation({
    mutationFn: () => userApiService.unlinkProvider("yandex"),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t(`${providersLocale}.yandex.unlinkSuccess`), {
          toastId: "yandex_unlink_success",
        });
        queryClient.invalidateQueries({ queryKey: ["auth-providers"] });
        return;
      }

      if (res.message === "NEED_PASSWORD_BEFORE_UNLINK") {
        setIsSetPasswordOpen(true);
        return;
      }

      setErrorMessage(t(`${providersLocale}.yandex.unlinkError`));
    },
    onError: () => setErrorMessage(t(`${providersLocale}.yandex.unlinkError`)),
  });

  const yandexBusy = isLinkPending || isUnlinkPending;

  const handleConnect = (id: ProviderId) => {
    if (id === "yandex") startYandexLink();
  };

  const handleDisconnect = (id: ProviderId) => {
    if (id === "yandex") unlinkYandex();
  };

  return (
    <>
      <Box
        border="1px solid"
        borderColor="border.emphasized"
        borderRadius="xl"
        p="1rem"
      >
        <Text textStyle="lg" fontWeight="bold" mb="0.75rem">
          {t(`${baseLocale}.title`)}
        </Text>

        <Stack.VStack alignItems="stretch" gap="1rem">
          {PROVIDERS.map((provider) => {
            const isLinked = linkedSet.has(provider.id);

            return (
              <Flex
                key={provider.id}
                align="center"
                justify="space-between"
                gap="0.5rem"
              >
                <Flex align="center" gap="0.5rem" minW={0}>
                  {provider.icon}
                  <Stack.VStack alignItems="flex-start" gap="0.1rem" minW={0}>
                    <Text fontWeight="medium" color="fg" truncate>
                      {provider.label}
                    </Text>
                    {isLoading ? (
                      <Skeleton width="90px" height="14px" />
                    ) : (
                      <Text
                        fontSize="xs"
                        color={isLinked ? "fg.success" : "fg.muted"}
                      >
                        {isLinked
                          ? t(`${baseLocale}.status.connected`)
                          : t(`${baseLocale}.status.notConnected`)}
                      </Text>
                    )}
                  </Stack.VStack>
                </Flex>

                {isLoading ? (
                  <Skeleton width="110px" height="30px" />
                ) : !provider.enabled ? (
                  <Button size="xs" variant="outline" disabled>
                    {t(`${baseLocale}.connectButton`)}
                  </Button>
                ) : isLinked ? (
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette="red"
                    loading={yandexBusy}
                    onClick={() => handleDisconnect(provider.id)}
                    type="button"
                  >
                    {t(`${baseLocale}.disconnectButton`)}
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    variant="outline"
                    loading={yandexBusy}
                    onClick={() => handleConnect(provider.id)}
                    type="button"
                  >
                    {t(`${baseLocale}.connectButton`)}
                  </Button>
                )}
              </Flex>
            );
          })}
        </Stack.VStack>
      </Box>
      <SetPasswordDialog
        open={isSetPasswordOpen}
        onOpenChange={setIsSetPasswordOpen}
        onSuccess={() => unlinkYandex()}
      />
      <ProviderErrorDialog
        open={errorMessage !== null}
        onOpenChange={(open) => {
          if (!open) setErrorMessage(null);
        }}
        message={errorMessage ?? ""}
      />
    </>
  );
};
