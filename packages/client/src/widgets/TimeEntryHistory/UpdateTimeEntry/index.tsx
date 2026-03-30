import dayjs from "dayjs";
import { useCallback } from "react";
import { timeEntryApiService } from "~/shared/api/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BaseUpdateTimeEntryDialog,
  type BaseUpdateTimeEntryDialogProps,
} from "~/features/timeEntries";
import type { UpdateTimeEntryDataDTO } from "@to-do-list/shared";
import { toast } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks/i18n";

export type UpdateTaskDialogProps = Omit<
  BaseUpdateTimeEntryDialogProps,
  "mode" | "onSubmit"
>;

export const UpdateTimeEntryDialog = ({
  timeEntry,
  ...props
}: UpdateTaskDialogProps) => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { mutateAsync: updateTimeEntry } = useMutation({
    mutationFn: (data: UpdateTimeEntryDataDTO) =>
      timeEntryApiService.updateTimeEntry(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
    },
    onSuccess: () => {
      toast.success(
        t(
          "widgets.timeEntryHistory.updateTimeEntryDialog.update.successMessage",
        ),
        {
          position: "top-center",
          draggable: true,
          toastId: "success_update_time_entry",
        },
      );
    },
    onError: () => {
      toast.error(
        t("widgets.timeEntryHistory.updateTimeEntryDialog.update.errorMessage"),
        {
          position: "top-center",
          draggable: true,
          toastId: "error_update_time_entry",
        },
      );
    },
  });

  const handleUpdateTimeEntry = useCallback(
    (data: {
      title: string;
      description: string;
      startDate: Date;
      endDate: Date;
    }) => {
      if (!timeEntry?.id) return;

      return updateTimeEntry({
        id: timeEntry.id,
        title: data.title,
        description: data.description,
        startDate: dayjs(data.startDate).second(0).millisecond(0).toISOString(),
        endDate: dayjs(data.endDate).second(0).millisecond(0).toISOString(),
      });
    },
    [timeEntry?.id, updateTimeEntry],
  );

  return (
    <BaseUpdateTimeEntryDialog
      mode="edit"
      timeEntry={timeEntry}
      onSubmit={handleUpdateTimeEntry}
      {...props}
    />
  );
};
