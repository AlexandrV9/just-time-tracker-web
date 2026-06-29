import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Card,
  EditIcon,
  Flex,
  IconButton,
  Text,
  TrashIcon,
} from "~/shared/ui";
import { EditActivityDialog } from "./EditActivityDialog";
import { DeleteActivityDialog } from "./DeleteActivityDialog";
import { useDialog } from "@ark-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

type MainInfoProps = {
  activityId: string;
};

export const MainInfo = ({ activityId }: MainInfoProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const editDialog = useDialog();
  const deleteDialog = useDialog();

  const { data: activity, isPending } = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, activityId],
    queryFn: () => activityApiService.getActivity({ id: activityId }),
    select: (data) => (data.success ? data.data : null),
  });

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

      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITIES_QUERY_KEY, activityId],
      });
      editDialog.setOpen(false);
      return { success: true as const };
    },
    [activity, updateActivityAsync, queryClient, activityId, t, editDialog],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!activity) return;
    deleteActivity({ id: activity.id });
  }, [activity, deleteActivity]);

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
    <>
      <Card.Root borderRadius="1rem">
        <Card.Header
          p="0.8rem"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          gap="0.5rem"
          minHeight="60px"
        >
          <Text fontWeight="semibold" textStyle="lg" alignSelf="center">
            {t("pages.activities.detail.mainInfoTitle")}
          </Text>
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
        </Card.Header>

        <Box h="1px" bg="border.emphasized" />

        <Card.Body display="flex" flexDirection="column" gap="1rem" p="0.8rem">
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

            {activity.description && (
              <Flex flexDirection="column" gap={1}>
                <Text textStyle="sm" color="fg.muted">
                  {t("pages.activities.detail.descriptionLabel")}
                </Text>
                <Text textStyle="sm" fontWeight="medium">
                  {activity.description}
                </Text>
              </Flex>
            )}
          </Box>
        </Card.Body>
      </Card.Root>

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
    </>
  );
};
