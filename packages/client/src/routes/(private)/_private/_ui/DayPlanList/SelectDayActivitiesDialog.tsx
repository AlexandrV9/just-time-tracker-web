import { useDialog } from "@ark-ui/react";
import { useCallback, useEffect, useState } from "react";
import type { ActivityDTO } from "@to-do-list/shared";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Text,
} from "~/shared/ui";

type SelectDayActivitiesDialogProps = {
  dialog: ReturnType<typeof useDialog>;
  activities: ActivityDTO[];
  isActivitiesLoading: boolean;
  initialActivityIds: string[];
  onSave: (selectedActivityIds: string[]) => Promise<void>;
  isSaving: boolean;
};

export function SelectDayActivitiesDialog({
  dialog,
  activities,
  isActivitiesLoading,
  initialActivityIds,
  onSave,
  isSaving,
}: SelectDayActivitiesDialogProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialActivityIds),
  );

  useEffect(() => {
    if (!dialog.open) return;
    setSelected(new Set(initialActivityIds));
  }, [dialog.open, initialActivityIds]);

  const toggle = useCallback((activityId: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(activityId);
      } else {
        next.delete(activityId);
      }
      return next;
    });
  }, []);

  const closeDialog = useCallback(() => {
    dialog.setOpen(false);
  }, [dialog]);

  const handleSave = useCallback(async () => {
    await onSave([...selected]);
  }, [onSave, selected]);

  const isAddDisabled =
    isSaving || isActivitiesLoading || activities.length === 0;

  return (
    <Dialog.RootProvider size="full" lazyMount value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner zIndex={3}>
          <Dialog.SafeContent
            overflow="hidden"
            display="flex"
            flexDirection="column"
            maxH="85dvh"
          >
            <Dialog.Header>
              <Dialog.Title fontSize="xl">
                {t("pages.home.dayPlanDialogTitle")}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body flex="1" minH={0} display="flex" flexDirection="column">
              {isActivitiesLoading ? (
                <Text color="fg.muted">{t("pages.home.dayPlanLoadingActivities")}</Text>
              ) : activities.length === 0 ? (
                <Text color="fg.muted" textAlign="center">
                  {t("pages.home.dayPlanNoActivities")}
                </Text>
              ) : (
                <Box maxH="min(50dvh, 360px)" overflowY="auto" pr={1}>
                  <Stack.VStack gap={3} align="stretch">
                    {activities.map((a) => (
                      <Checkbox.Root
                        key={a.id}
                        checked={selected.has(a.id)}
                        onCheckedChange={(e) =>
                          toggle(a.id, e.checked === true)
                        }
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label>{a.title}</Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                  </Stack.VStack>
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
            >
              <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
                {t("pages.home.dayPlanDialogCancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isAddDisabled}
                loading={isSaving}
              >
                {t("pages.home.dayPlanDialogAdd")}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="2xl" />
            </Dialog.CloseTrigger>
          </Dialog.SafeContent>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}
