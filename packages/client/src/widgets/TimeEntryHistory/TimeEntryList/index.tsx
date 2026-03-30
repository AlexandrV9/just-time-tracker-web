import { useInfiniteQuery } from "@tanstack/react-query";
import { timeEntryApiService } from "~/shared/api/services";
import { List } from "~/shared/ui";
import { TimeEntryCard } from "./TimeEntryCard";
import type { TimeEntryDTO } from "@to-do-list/shared";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export type TimeEntryListProps = {
  onUpdate?: (timeEntry: TimeEntryDTO) => void;
  onDelete?: (timeEntry: TimeEntryDTO) => void;
};

export const TimeEntryList = ({ onUpdate, onDelete }: TimeEntryListProps) => {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["time_entries"],
    queryFn: (ctx) =>
      timeEntryApiService.getTimeEntries({
        page: ctx.pageParam,
        limit: 10
      }),
    initialPageParam: 0,
    getNextPageParam: (lastGroup) => {
      if (lastGroup?.success && lastGroup.data.pagination.hasNext) {
        return lastGroup.data.pagination.page + 1;
      }
    },
  });

  const { ref: fetchRef, inView: isLastWalletInView } = useInView();

  const timeEntries = data?.pages.flatMap((d) =>
    d.success ? d.data.data : [],
  );

  useEffect(() => {
    if (isLastWalletInView && hasNextPage) {
      fetchNextPage();
    }
  }, [isLastWalletInView, fetchNextPage, hasNextPage]);

  return (
    <List.Root listStyleType="none" w="full" gap={2}>
      {timeEntries?.map((timeEntry) => (
        <List.Item key={timeEntry.id}>
          <TimeEntryCard
            {...timeEntry}
            onUpdate={() => onUpdate?.(timeEntry)}
            onDelete={() => onDelete?.(timeEntry)}
          />
        </List.Item>
      ))}
      <List.Item ref={fetchRef} h="1px" w="full" />
    </List.Root>
  );
};
