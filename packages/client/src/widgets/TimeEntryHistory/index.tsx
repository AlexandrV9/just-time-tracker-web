import { Stack, Text } from "~/shared/ui";
import { UpdateTimeEntryDialog } from "./UpdateTimeEntry";
import { useDialog } from "@ark-ui/react";
import { useCallback, useState } from "react";
import type { TimeEntryDTO } from "@to-do-list/shared";
import { ConfirmDeleteTimeEntryDialog } from "./ConfirmDeleteTimeEntryDialog";
import { TimeEntryList } from "./TimeEntryList";
import { useTranslation } from "~/shared/hooks/i18n";

export type TimeEntry = {
  id: string;
  startAt: Date;
  endAt: Date;
  name: string;
  description?: string;
  tags?: string[];
  showInCalendar: boolean;
};

export const TimeEntryHistory = () => {
  const { t } = useTranslation();

  const [selectedTimeEntry, setSelectedTimeEntry] =
    useState<TimeEntryDTO | null>(null);

  const updateTimeEntryDialog = useDialog();
  const confirmDeleteTimeEntryDialog = useDialog();

  const handleOpenUpdateTimeEntryDialog = useCallback(
    (timeEntry: TimeEntryDTO) => {
      setSelectedTimeEntry(timeEntry);
      updateTimeEntryDialog.setOpen(true);
    },
    [updateTimeEntryDialog],
  );

  const handleOpenDeleteTimeEntryDialog = useCallback(
    (timeEntry: TimeEntryDTO) => {
      setSelectedTimeEntry(timeEntry);
      confirmDeleteTimeEntryDialog.setOpen(true);
    },
    [confirmDeleteTimeEntryDialog],
  );

  return (
    <>
      <Stack.VStack align="start" gap={2}>
        <Text textStyle="2xl" fontWeight="bold">
          {t("widgets.timeEntryHistory.title")}
        </Text>
        <TimeEntryList
          onUpdate={handleOpenUpdateTimeEntryDialog}
          onDelete={handleOpenDeleteTimeEntryDialog}
        />
      </Stack.VStack>
      {selectedTimeEntry && (
        <UpdateTimeEntryDialog
          dialog={updateTimeEntryDialog}
          timeEntry={selectedTimeEntry}
        />
      )}
      {selectedTimeEntry && (
        <ConfirmDeleteTimeEntryDialog
          dialog={confirmDeleteTimeEntryDialog}
          timeEntry={selectedTimeEntry}
        />
      )}
    </>
  );
};
