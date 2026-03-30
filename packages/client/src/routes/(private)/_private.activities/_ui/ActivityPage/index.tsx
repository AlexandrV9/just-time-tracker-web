import { useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import {
  ArrowLeftIcon,
  Box,
  Button,
  EditIcon,
  Flex,
  Input,
  List,
  PauseIcon,
  Text,
  TextArea,
  TrashIcon,
} from "~/shared/ui";
import { activityApiService } from "~/shared/api/services";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import { useTranslation } from "~/shared/hooks";
import type { ActivityDTO } from "@to-do-list/shared";

const getSessionSeconds = (item: ActivityDTO): number => {
  const start = new Date(item.startDate).getTime();
  const end = item.endDate ? new Date(item.endDate).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 1000));
};

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
    queryFn: () => activityApiService.getActivityById({ id: activityId }),
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
        sortBy: "startDate",
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
      setTitleError(t("pages.activities.detail.duplicateTitleError"));
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

  const isTracking = !activity.endDate;
  const durationSeconds = getSessionSeconds(activity);
  const durationDisplay = formatDuration(durationSeconds);

  const startDateDisplay = new Date(activity.startDate).toLocaleString();
  const endDateDisplay = activity.endDate
    ? new Date(activity.endDate).toLocaleString()
    : "—";

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
        <IconButton variant="outline" onClick={handleBack}>
          <ArrowLeftIcon />
        </IconButton>
        <Flex alignItems="center" gap="0.5rem">
          <IconButton
            variant="outline"
            onClick={handleToggleEdit}
            disabled={isDeleting || isUpdating}
            aria-label={t("pages.activities.detail.edit")}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            aria-label={t("pages.activities.detail.delete")}
          >
            <TrashIcon />
          </IconButton>
        </Flex>
      </Flex>

      <Flex alignItems="flex-start" gap="2" justifyContent="space-between">
        <Flex
          direction="column"
          as="form"
          gap="1rem"
          w="full"
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditing) void handleSave();
          }}
        >
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError(null);
            }}
            variant="outline"
            readOnly={!isEditing}
            placeholder={t("pages.activities.detail.titlePlaceholder")}
          />
          {titleError && (
            <Text textStyle="sm" color="red.500" mt={1}>
              {titleError}
            </Text>
          )}
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            readOnly={!isEditing}
            placeholder={t("pages.activities.detail.descriptionPlaceholder")}
            variant="outline"
            rows={2}
          />
          {isEditing && (
            <Flex gap={2} flexWrap="wrap">
              <Button
                type="submit"
                colorPalette="purple"
                loading={isUpdating}
                disabled={isDeleting}
              >
                {t("pages.activities.detail.saveButton")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleEdit}
                disabled={isUpdating || isDeleting}
              >
                {t("pages.activities.detail.cancelEditButton")}
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>

      <Box
        display="flex"
        flexDirection="column"
        gap="0.75rem"
        px={1}
        py={3}
        borderRadius="xl"
        border="1px solid"
        borderColor="border"
      >
        <Text
          textStyle="3xl"
          fontWeight="bold"
          fontFamily="Roboto Mono, monospace"
          textAlign="center"
        >
          {durationDisplay}
        </Text>
        {isTracking && (
          <Flex justifyContent="center">
            <Text textStyle="sm" color="green.500" fontWeight="medium">
              {t("pages.activities.detail.trackingBadge")}
            </Text>
          </Flex>
        )}
      </Box>

      <Box display="flex" flexDirection="column" gap="0.5rem" px={1}>
        <Flex justifyContent="space-between" gap={4}>
          <Text textStyle="sm" color="fg.muted">
            {t("pages.activities.detail.sessionStart")}
          </Text>
          <Text textStyle="sm" fontWeight="medium" textAlign="right">
            {startDateDisplay}
          </Text>
        </Flex>
        <Flex justifyContent="space-between" gap={4}>
          <Text textStyle="sm" color="fg.muted">
            {t("pages.activities.detail.sessionEnd")}
          </Text>
          <Text textStyle="sm" fontWeight="medium" textAlign="right">
            {endDateDisplay}
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
            const secs = getSessionSeconds(item);
            const isCurrent = item.id === activityId;
            return (
              <List.Item key={item.id}>
                <Flex gap={2} alignItems="flex-start">
                  <Box color="fg.muted" pt={0.5}>
                    <PauseIcon size={18} />
                  </Box>
                  <Box flex="1" minW={0}>
                    <Flex
                      flexWrap="wrap"
                      gap={2}
                      alignItems="baseline"
                      justifyContent="space-between"
                    >
                      <Text textStyle="xs" color="fg.muted">
                        {t("pages.activities.detail.sessionStart")}:{" "}
                        {new Date(item.startDate).toLocaleString()}
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
                      {t("pages.activities.detail.sessionEnd")}:{" "}
                      {item.endDate
                        ? new Date(item.endDate).toLocaleString()
                        : t("pages.activities.detail.trackingBadge")}
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
