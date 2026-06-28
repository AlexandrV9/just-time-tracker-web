import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { authActions, useAuthStore } from "~/features/auth";
import {
  registerPushSubscription,
  unregisterPushSubscription,
} from "~/features/notifications/usePushNotifications";
import { userApiService } from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import {
  getPushPermission,
  isPushSupported,
} from "~/shared/services/pushNotifications";
import { BackButton, Box, Flex, Stack, Switch, Text } from "~/shared/ui";
import { useHeaderLeftContent } from "~/widgets";

export function NotificationsSettingsPage() {
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);

  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const pushSupported = isPushSupported();

  useHeaderLeftContent(<BackButton to="/settings" />);

  useEffect(() => {
    setPermission(getPushPermission());
  }, [user?.pushNotificationsEnabled]);

  const updatePushMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      userApiService.updatePushNotifications({ enabled }),
    onSuccess: (response) => {
      if (!response.success || !user) return;

      authActions.setUser({
        ...user,
        pushNotificationsEnabled: response.data.pushNotificationsEnabled,
      });
    },
  });

  const handleToggle = useCallback(
    async (enabled: boolean) => {
      const response = await updatePushMutation.mutateAsync(enabled);
      if (!response.success) return;

      if (enabled) {
        try {
          await registerPushSubscription();
          setPermission(getPushPermission());
        } catch (error) {
          console.warn("Failed to enable push notifications:", error);
        }
        return;
      }

      try {
        await unregisterPushSubscription();
      } catch (error) {
        console.warn("Failed to unregister push subscription:", error);
      }
    },
    [updatePushMutation],
  );

  return (
    <Stack.VStack
      alignItems="stretch"
      p={4}
      w="full"
      maxW="520px"
      mx="auto"
      gap="1rem"
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="0.5rem"
        border="1px solid"
        borderRadius="xl"
        borderColor="border.emphasized"
        p="1rem"
      >
        <Text textStyle="xl" fontWeight="bold">
          {t("pages.settings.notifications.title")}
        </Text>
        <Text color="fg.muted" textStyle="sm">
          {t("pages.settings.notifications.description")}
        </Text>

        {!pushSupported ? (
          <Text color="fg.muted" textStyle="sm">
            {t("pages.settings.notifications.unsupported")}
          </Text>
        ) : (
          <>
            <Flex alignItems="center" justifyContent="space-between" gap={3}>
              <Text textStyle="md">
                {t("pages.settings.notifications.pushEnabled.label")}
              </Text>
              <Switch.Root
                checked={user?.pushNotificationsEnabled ?? false}
                disabled={updatePushMutation.isPending}
                onCheckedChange={(event) => handleToggle(event.checked)}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </Flex>

            {permission === "denied" && (
              <Text color="fg.muted" textStyle="sm">
                {t("pages.settings.notifications.permissionDenied")}
              </Text>
            )}
          </>
        )}
      </Box>
    </Stack.VStack>
  );
}
