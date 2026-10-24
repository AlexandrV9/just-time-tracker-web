import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { Controller } from "react-hook-form";
import {
  activitySettingsSchema,
  DEFAULT_ACTIVITY_SETTINGS,
} from "@time-tracker/shared";
import { DurationField } from "~/features/form";
import { SettingsCard } from "~/shared/components";
import {
  ACTIVITY_SETTINGS_QUERY_KEY,
  activityApiService,
  type ActivitySettingsDTO,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { Flex, Stack, Switch, Text, toast, useForm } from "~/shared/ui";
import { NotificationsBlockSkeleton } from "./Skeleton";

export type NotificationSettings = Pick<
  ActivitySettingsDTO,
  | "notifyOnGoalReached"
  | "notifyOnLongPause"
  | "longPauseThresholdSeconds"
  | "notifyOnLongActivity"
  | "longActivityThresholdSeconds"
>;

const baseLocale = "pages.activities.settings";

const notificationSettingsSchema = activitySettingsSchema.pick({
  notifyOnGoalReached: true,
  notifyOnLongPause: true,
  longPauseThresholdSeconds: true,
  notifyOnLongActivity: true,
  longActivityThresholdSeconds: true,
});

const pickNotificationSettings = (
  settings: ActivitySettingsDTO,
): NotificationSettings => ({
  notifyOnGoalReached: settings.notifyOnGoalReached,
  notifyOnLongPause: settings.notifyOnLongPause,
  longPauseThresholdSeconds: settings.longPauseThresholdSeconds,
  notifyOnLongActivity: settings.notifyOnLongActivity,
  longActivityThresholdSeconds: settings.longActivityThresholdSeconds,
});

export type NotificationsBlockProps = {
  activityId: string;
};

export const NotificationsBlock = ({ activityId }: NotificationsBlockProps) => {
  const { data: settings, isPending } = useQuery({
    queryKey: [ACTIVITY_SETTINGS_QUERY_KEY, activityId],
    queryFn: () => activityApiService.getActivitySettings({ activityId }),
    select: (data) => (data.success ? data.data : undefined),
    enabled: !!activityId,
  });

  if (isPending && !settings) {
    return <NotificationsBlockSkeleton />;
  }

  if (!settings) {
    return null;
  }

  return (
    <NotificationsBlockContent activityId={activityId} settings={settings} />
  );
};

type NotificationsBlockContentProps = {
  activityId: string;
  settings: ActivitySettingsDTO;
};

const NotificationsBlockContent = ({
  activityId,
  settings,
}: NotificationsBlockContentProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: pickNotificationSettings(settings),
  });

  const notifyOnLongPause = watch("notifyOnLongPause");
  const notifyOnLongActivity = watch("notifyOnLongActivity");

  useEffect(() => {
    reset(pickNotificationSettings(settings));
  }, [settings, reset]);

  const handleCancel = useCallback(() => {
    reset(pickNotificationSettings(settings));
  }, [settings, reset]);

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: activityApiService.updateActivitySettings,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message ?? t(`${baseLocale}.saveError`));
        return;
      }

      reset(pickNotificationSettings(response.data));
      queryClient.setQueryData(
        [ACTIVITY_SETTINGS_QUERY_KEY, activityId],
        response,
      );
      toast.success(t(`${baseLocale}.saveSuccess`));
    },
    onError: () => {
      toast.error(t(`${baseLocale}.saveError`));
    },
  });

  const handleSave = handleSubmit((data) => {
    saveSettings({
      activityId,
      ...DEFAULT_ACTIVITY_SETTINGS,
      ...settings,
      ...data,
    });
  });

  return (
    <SettingsCard
      title={t(`${baseLocale}.notifications.title`)}
      withActions={isDirty}
      isSaving={isPending}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      <Controller
        name="notifyOnGoalReached"
        control={control}
        render={({ field: { value, onChange } }) => (
          <NotificationToggleRow
            label={t(`${baseLocale}.notifications.goalReached.label`)}
            checked={value}
            onCheckedChange={onChange}
          />
        )}
      />

      <Stack.VStack alignItems="stretch" gap="0.75rem">
        <Controller
          name="notifyOnLongPause"
          control={control}
          render={({ field: { value, onChange } }) => (
            <NotificationToggleRow
              label={t(`${baseLocale}.notifications.longPause.label`)}
              checked={value}
              onCheckedChange={onChange}
            />
          )}
        />
        {notifyOnLongPause ? (
          <Controller
            name="longPauseThresholdSeconds"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DurationField
                label={t(
                  `${baseLocale}.notifications.longPause.thresholdLabel`,
                )}
                valueSeconds={value}
                onChange={onChange}
              />
            )}
          />
        ) : null}
      </Stack.VStack>

      <Stack.VStack alignItems="stretch" gap="0.75rem">
        <Controller
          name="notifyOnLongActivity"
          control={control}
          render={({ field: { value, onChange } }) => (
            <NotificationToggleRow
              label={t(`${baseLocale}.notifications.longActivity.label`)}
              checked={value}
              onCheckedChange={onChange}
            />
          )}
        />
        {notifyOnLongActivity ? (
          <Controller
            name="longActivityThresholdSeconds"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DurationField
                label={t(
                  `${baseLocale}.notifications.longActivity.thresholdLabel`,
                )}
                valueSeconds={value}
                onChange={onChange}
              />
            )}
          />
        ) : null}
      </Stack.VStack>
    </SettingsCard>
  );
};

type NotificationToggleRowProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const NotificationToggleRow = ({
  label,
  checked,
  onCheckedChange,
}: NotificationToggleRowProps) => (
  <Flex alignItems="center" gap={3}>
    <Switch.Root
      checked={checked}
      onCheckedChange={(event) => onCheckedChange(!!event.checked)}
    >
      <Switch.HiddenInput />
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch.Root>
    <Text textStyle="sm">{label}</Text>
  </Flex>
);
