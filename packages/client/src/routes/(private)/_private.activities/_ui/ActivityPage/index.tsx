import { useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import {
  ArrowLeftIcon,
  Box,
  EditIcon,
  Flex,
  List,
  Text,
  TrashIcon,
} from "~/shared/ui";
import { activityApiService } from "~/shared/api/services";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import { useTranslation } from "~/shared/hooks";
import type { ActivityDTO } from "@to-do-list/shared";

/** Total wall time tracked across all sessions (active + pause intervals). */
const getTotalTrackedSeconds = (item: ActivityDTO): number =>
  Math.floor((item.activeDurationMs + item.pauseDurationMs) / 1000);

const formatDuration = (seconds: number) =>
  convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));

export const ActivityPage = () => {
  const { t } = useTranslation();
  const { activityId } = useParams({
    from: "/(private)/_private/activities/$activityId",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["activities", activityId],
    queryFn: () => activityApiService.getActivity({ id: activityId }),
  });

  const activity = data?.success ? data.data : null;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setDescription(activity.description ?? "");
      setTitleError(null);
    }
  }, [activity]);

  const { data: historyResponse } = useQuery({
    queryKey: [
      "activities",
      "history",
      activityId,
      activity?.title,
      activity?.createdById,
    ],
    queryFn: () =>
      activityApiService.getActivities({
        createdById: activity!.createdById,
        exactTitle: activity!.title,
        limit: 100,
        page: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: !!activity?.createdById && !!activity?.title,
  });

  const historyItems = useMemo(() => {
    if (!historyResponse?.success) return [];
    return historyResponse.data.data;
  }, [historyResponse]);

  const { mutateAsync: updateActivityAsync, isPending: isUpdating } =
    useMutation({
      mutationFn: activityApiService.updateActivity,
    });

  const { mutate: deleteActivity, isPending: isDeleting } = useMutation({
    mutationFn: activityApiService.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      navigate({ to: "/activities" });
    },
  });

  const hasChanges = useMemo(() => {
    if (!activity) return false;
    return (
      title.trim() !== activity.title ||
      (description.trim() || null) !== (activity.description?.trim() || null)
    );
  }, [activity, title, description]);

  const handleToggleEdit = useCallback(() => {
    if (isEditing) {
      if (activity) {
        setTitle(activity.title);
        setDescription(activity.description ?? "");
      }
      setTitleError(null);
    }
    setIsEditing((v) => !v);
  }, [isEditing, activity]);

  const handleSave = useCallback(async () => {
    if (!activity) return;
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      setTitleError(t("pages.activities.detail.titleRequiredError"));
      return;
    }

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    const res = await updateActivityAsync({
      id: activity.id,
      title: trimmed,
      description: description.trim() || null,
    });

    if (!res.success) {
      setTitleError(res.message || t("pages.activities.detail.saveError"));
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["activities"] });
    queryClient.invalidateQueries({ queryKey: ["activities", activityId] });
    queryClient.invalidateQueries({ queryKey: ["activities", "history"] });

    setTitleError(null);
    setIsEditing(false);
  }, [
    activity,
    title,
    description,
    hasChanges,
    updateActivityAsync,
    queryClient,
    activityId,
    t,
  ]);

  const handleDelete = useCallback(() => {
    if (!activity) return;
    if (!window.confirm(t("pages.activities.detail.deleteConfirm"))) return;
    deleteActivity({ id: activity.id });
  }, [activity, deleteActivity, t]);

  const handleBack = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

  if (isPending) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
        py={10}
      >
        <Text color="fg.muted">{t("pages.activities.detail.loading")}</Text>
      </Box>
    );
  }

  if (!activity) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
        py={10}
      >
        <Text color="fg.muted">{t("pages.activities.detail.notFound")}</Text>
      </Box>
    );
  }

  const durationSeconds = getTotalTrackedSeconds(activity);
  const durationDisplay = formatDuration(durationSeconds);

  const createdAtDisplay = new Date(activity.createdAt).toLocaleString();
  const updatedAtDisplay = new Date(activity.updatedAt).toLocaleString();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="1rem"
      p="1rem"
      maxWidth="100vw"
    >
      <Flex justifyContent="space-between" alignItems="center" minH="40px">
        <IconButton variant="outline" onClick={handleBack} size="xs">
          <ArrowLeftIcon size={20} />
        </IconButton>
        <Flex alignItems="center" gap="0.5rem">
          <IconButton
            size="xs"
            variant="outline"
            onClick={handleToggleEdit}
            disabled={isDeleting || isUpdating}
            aria-label={t("pages.activities.detail.edit")}
          >
            <EditIcon size={20} />
          </IconButton>
          <IconButton
            size="xs"
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            aria-label={t("pages.activities.detail.delete")}
          >
            <TrashIcon size={20} />
          </IconButton>
        </Flex>
      </Flex>

      <Flex alignItems="flex-start" gap="2" justifyContent="space-between">
        <Text textStyle="lg">{title}</Text>
        {description && <Text>{description}</Text>}
      </Flex>

      <Box display="flex" flexDirection="column" gap="0.5rem" px={1}>
        <Flex justifyContent="space-between" gap={4}>
          <Text textStyle="sm" color="fg.muted">
            {t("pages.activities.detail.createdAtLabel")}
          </Text>
          <Text textStyle="sm" fontWeight="medium" textAlign="right">
            {createdAtDisplay}
          </Text>
        </Flex>
        <Flex justifyContent="space-between" gap={4}>
          <Text textStyle="sm" color="fg.muted">
            {t("pages.activities.detail.updatedAtLabel")}
          </Text>
          <Text textStyle="sm" fontWeight="medium" textAlign="right">
            {updatedAtDisplay}
          </Text>
        </Flex>
      </Box>

      <Box px={1} pt={2}>
        <Text textStyle="sm" fontWeight="bold" color="fg.muted" mb={2}>
          {t("pages.activities.detail.historyTitle")}
        </Text>
        <List.Root
          listStyleType="none"
          display="flex"
          flexDirection="column"
          gap={3}
        >
          {historyItems.map((item) => {
            const secs = getTotalTrackedSeconds(item);
            const isCurrent = item.id === activityId;
            return (
              <List.Item key={item.id}>
                <Flex gap={2} alignItems="flex-start">
                  <Box flex="1" minW={0}>
                    <Flex
                      flexWrap="wrap"
                      gap={2}
                      alignItems="baseline"
                      justifyContent="space-between"
                    >
                      <Text textStyle="xs" color="fg.muted">
                        {t("pages.activities.detail.createdAtLabel")}:{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                      {isCurrent && (
                        <Text
                          textStyle="xs"
                          color="purple.500"
                          fontWeight="semibold"
                        >
                          {t("pages.activities.detail.currentBadge")}
                        </Text>
                      )}
                    </Flex>
                    <Text textStyle="xs" color="fg.muted" mt={1}>
                      {t("pages.activities.detail.updatedAtLabel")}:{" "}
                      {new Date(item.updatedAt).toLocaleString()}
                    </Text>
                    <Text
                      textStyle="sm"
                      fontWeight="medium"
                      mt={1}
                      fontFamily="Roboto Mono, monospace"
                    >
                      {t("pages.activities.detail.duration")}:{" "}
                      {formatDuration(secs)}
                    </Text>
                  </Box>
                </Flex>
              </List.Item>
            );
          })}
        </List.Root>
      </Box>
    </Box>
  );
};
