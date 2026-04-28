import { Badge, IconButton } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";

import { useTranslation } from "~/shared/hooks";
import { Accordion, Box, Flex, Skeleton, Text, TrashIcon } from "~/shared/ui";

import { ActivitySessionBar } from "../ActivitySessionBar";
import type { DayChart, SessionChart } from "../useActivityDayCharts";

export type ActivitySessionBarsProps = {
  isLoading: boolean;
  isError: boolean;
  dayChart: DayChart;
  sessions: SessionChart[];
  totalTrackedSecs: number;
  onRequestDeleteSession: (session: SessionChart) => void;
};

export const ActivitySessionBars = ({
  isLoading,
  isError,
  dayChart,
  sessions,
  totalTrackedSecs,
  onRequestDeleteSession,
}: ActivitySessionBarsProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <Skeleton h="40px" borderRadius="lg" />;
  }

  if (isError) {
    return (
      <Text textStyle="sm" color="fg.error">
        {t("widgets.activityAnalytics.error")}
      </Text>
    );
  }

  return (
    <Box>
      <Box>
        <ActivitySessionBar data={dayChart} />
      </Box>

      {sessions.length === 0 && (
        <Flex flexDirection="column" gap={1} mt={3}>
          {totalTrackedSecs === 0 && (
            <Text textStyle="sm" color="fg.muted">
              {t("widgets.activityAnalytics.empty")}
            </Text>
          )}
        </Flex>
      )}

      {sessions.length > 0 && (
        <Accordion.Root collapsible mt={3} defaultValue={["sessions"]}>
          <Accordion.Item value="sessions" border="none">
            <Accordion.ItemTrigger>
              <Flex
                w="full"
                justifyContent="space-between"
                alignItems="center"
                gap={2}
                py={2}
              >
                <Flex alignItems="center" gap={1} flexShrink={0}>
                  <Text textStyle="sm" fontWeight="bold" color="fg.muted">
                    {t("widgets.activityAnalytics.sessionsForDay")}
                  </Text>

                  <Badge size="xs">{sessions.length}</Badge>
                </Flex>
                <Accordion.ItemIndicator color="fg.muted" display="inline-flex">
                  <LuChevronDown size={18} />
                </Accordion.ItemIndicator>
              </Flex>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>
                <Flex as="ul" flexDirection="column" gap={3}>
                  {sessions.map((s) => (
                    <Box as="li" key={s.session.id}>
                      <ActivitySessionBar
                        data={s}
                        rightSlot={
                          s.session.status === "active" ? null : (
                            <IconButton
                              variant="ghost"
                              size="xs"
                              aria-label={t(
                                "widgets.activityAnalytics.deleteSession.ariaLabel",
                              )}
                              onClick={() => onRequestDeleteSession(s)}
                            >
                              <TrashIcon size={16} />
                            </IconButton>
                          )
                        }
                      />
                    </Box>
                  ))}
                </Flex>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      )}
    </Box>
  );
};
