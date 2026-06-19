import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  GetGroupedActivitiesResponseDTO,
  GetGroupedActivityItemsResponseDTO,
} from "@time-tracker/shared";
import { useTranslation } from "~/shared/hooks";
import { activityApiService } from "~/shared/api/services";
import {
  ACTIVITY_HISTORY_GROUPS_LIMIT,
  ACTIVITY_HISTORY_GROUP_ITEMS_LIMIT,
  ACTIVITY_HISTORY_QUERY_KEY,
} from "./constants";
import { formatActivityGroups } from "./utils";
import { useAuthStore } from "~/features/auth";

type InfiniteGroupsData = {
  pages: Array<{ success: boolean; data: GetGroupedActivitiesResponseDTO }>;
  pageParams: Array<string | null>;
};

type AppendItemsVars = {
  groupDateStart: string;
  cursor: string;
};

export const useActivityHistory = () => {
  const { user } = useAuthStore();
  const userId = user?.id;

  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const queryKey = [ACTIVITY_HISTORY_QUERY_KEY, userId];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      activityApiService.getGroupedActivities({
        groupBy: "day",
        groupLimit: ACTIVITY_HISTORY_GROUPS_LIMIT,
        itemsLimit: ACTIVITY_HISTORY_GROUP_ITEMS_LIMIT,
        groupCursor: pageParam ?? undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.success) return undefined;
      return lastPage.data.groupsPagination.nextCursor ?? undefined;
    },
    enabled: !!userId,
  });

  const appendMutation = useMutation<
    { success: boolean; data: GetGroupedActivityItemsResponseDTO },
    Error,
    AppendItemsVars
  >({
    mutationFn: ({ cursor }) =>
      activityApiService.getGroupedActivityItems({
        cursor,
        limit: ACTIVITY_HISTORY_GROUP_ITEMS_LIMIT,
      }) as Promise<{
        success: boolean;
        data: GetGroupedActivityItemsResponseDTO;
      }>,

    onSuccess: (res, { groupDateStart }) => {
      if (!res.success) return;

      queryClient.setQueryData<InfiniteGroupsData>(queryKey, (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          pages: prev.pages.map((page) => {
            if (!page.success) return page;

            const updatedGroups = page.data.groups.map((group) => {
              if (group.groupDateStart !== groupDateStart) return group;

              return {
                ...group,
                items: [...group.items, ...res.data.items],
                itemsPagination: {
                  hasNext: res.data.pagination.hasNext,
                  nextCursor: res.data.pagination.nextCursor,
                },
              };
            });

            return {
              ...page,
              data: { ...page.data, groups: updatedGroups },
            };
          }),
        };
      });
    },
  });

  const groupsFormatted = formatActivityGroups(
    query.data?.pages.flatMap((page) =>
      page.success ? page.data.groups : [],
    ) ?? [],
    i18n.language,
  );

  const loadMoreGroupItems = (groupDateStart: string) => {
    const group = groupsFormatted.find((g) => g.key === groupDateStart);
    if (!group?.itemsNextCursor) return;
    appendMutation.mutate({ groupDateStart, cursor: group.itemsNextCursor });
  };

  const isLoadingMoreGroupItems = (groupDateStart: string): boolean =>
    appendMutation.isPending &&
    appendMutation.variables?.groupDateStart === groupDateStart;

  return {
    groups: groupsFormatted,
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    loadMoreGroupItems,
    isLoadingMoreGroupItems,
  };
};
