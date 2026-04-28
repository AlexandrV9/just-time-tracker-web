import { useDialog } from "@ark-ui/react";
import { useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { IconButton } from "@chakra-ui/react";
import {
  ArrowLeftIcon,
  Box,
  EditIcon,
  Flex,
  Text,
  TrashIcon,
} from "~/shared/ui";
import { activityApiService } from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { ActivityAnalytics } from "~/widgets";

import { DeleteActivityDialog } from "./DeleteActivityDialog";
import { EditActivityDialog } from "./EditActivityDialog";

export const ActivityPage = () => {
  const { t } = useTranslation();
  const { activityId } = useParams({
    from: "/(private)/_private/activities/$activityId",
  });

  const navigate = useNavigate();

  const router = useRouter();

  const queryClient = useQueryClient();

  const editDialog = useDialog();
  const deleteDialog = useDialog();

  const { data, isPending } = useQuery({
    queryKey: ["activities", activityId],
    queryFn: () => activityApiService.getActivity({ id: activityId }),
  });

  const activity = data?.success ? data.data : null;

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

  const handleEditSave = useCallback(
    async (data: { title: string; description: string | null }) => {
      if (!activity) {
        return { success: false as const, message: undefined };
      }

      const res = await updateActivityAsync({
        id: activity.id,
        title: data.title,
        description: data.description,
      });

      if (!res.success) {
        return {
          success: false as const,
          message: res.message ?? t("pages.activities.detail.saveError"),
        };
      }

      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["activities", activityId] });
      // History is intentionally NOT invalidated on rename — the list must stay
      // stable and continue showing activities under the original title.

      editDialog.setOpen(false);
      return { success: true as const };
    },
    [activity, updateActivityAsync, queryClient, activityId, t, editDialog],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!activity) return;
    deleteActivity({ id: activity.id });
  }, [activity, deleteActivity]);

  const handleBack = useCallback(() => {
    router.history.back();
  }, [router.history]);

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
            onClick={() => editDialog.setOpen(true)}
            disabled={isDeleting || isUpdating}
            aria-label={t("pages.activities.detail.edit")}
          >
            <EditIcon size={20} />
          </IconButton>
          <IconButton
            size="xs"
            variant="outline"
            onClick={() => deleteDialog.setOpen(true)}
            disabled={isDeleting || isUpdating}
            aria-label={t("pages.activities.detail.delete")}
          >
            <TrashIcon size={20} />
          </IconButton>
        </Flex>
      </Flex>

      <Flex alignItems="flex-start" gap="2" justifyContent="space-between">
        <Text textStyle="lg">{activity.title}</Text>
        {activity.description ? <Text>{activity.description}</Text> : null}
      </Flex>

      <Box display="flex" flexDirection="column" gap="0.5rem">
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
      <ActivityAnalytics activityId={activity.id} />
      <EditActivityDialog
        dialog={editDialog}
        activity={activity}
        isSaving={isUpdating}
        onSave={handleEditSave}
      />
      <DeleteActivityDialog
        dialog={deleteDialog}
        activityTitle={activity.title}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};
