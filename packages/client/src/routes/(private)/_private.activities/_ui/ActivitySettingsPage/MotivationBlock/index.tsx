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
import { toast, useForm } from "~/shared/ui";
import { MotivationBlockSkeleton } from "./Skeleton";

export type MotivationSettings = Pick<
  ActivitySettingsDTO,
  "sessionGoalSeconds"
>;

const baseLocale = "pages.activities.settings";

const motivationSettingsSchema = activitySettingsSchema.pick({
  sessionGoalSeconds: true,
});

const pickMotivationSettings = (
  settings: ActivitySettingsDTO,
): MotivationSettings => ({
  sessionGoalSeconds: settings.sessionGoalSeconds,
});

export type MotivationBlockProps = {
  activityId: string;
};

export const MotivationBlock = ({ activityId }: MotivationBlockProps) => {
  const { data: settings, isPending } = useQuery({
    queryKey: [ACTIVITY_SETTINGS_QUERY_KEY, activityId],
    queryFn: () => activityApiService.getActivitySettings({ activityId }),
    select: (data) => (data.success ? data.data : undefined),
    enabled: !!activityId,
  });

  if (isPending && !settings) {
    return <MotivationBlockSkeleton />;
  }

  if (!settings) {
    return null;
  }

  return <MotivationBlockContent activityId={activityId} settings={settings} />;
};

type MotivationBlockContentProps = {
  activityId: string;
  settings: ActivitySettingsDTO;
};

const MotivationBlockContent = ({
  activityId,
  settings,
}: MotivationBlockContentProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<MotivationSettings>({
    resolver: zodResolver(motivationSettingsSchema),
    defaultValues: pickMotivationSettings(settings),
  });

  useEffect(() => {
    reset(pickMotivationSettings(settings));
  }, [settings, reset]);

  const handleCancel = useCallback(() => {
    reset(pickMotivationSettings(settings));
  }, [settings, reset]);

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: activityApiService.updateActivitySettings,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message ?? t(`${baseLocale}.saveError`));
        return;
      }

      reset(pickMotivationSettings(response.data));
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
      title={t(`${baseLocale}.motivation.title`)}
      isSaving={isPending}
      withActions={isDirty}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      <Controller
        name="sessionGoalSeconds"
        control={control}
        render={({ field: { value, onChange } }) => (
          <DurationField
            label={t(`${baseLocale}.motivation.sessionGoal.label`)}
            valueSeconds={value}
            onChange={onChange}
          />
        )}
      />
    </SettingsCard>
  );
};
