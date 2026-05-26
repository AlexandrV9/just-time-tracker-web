import { BarSegment, useChart } from "@chakra-ui/charts";

import type { ReactNode } from "react";
import { useTranslation } from "~/shared/hooks";

import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import { Box, Flex, Text } from "~/shared/ui";

type ChartSegment = {
  name: string;
  value: number;
  color: string;
};

type SessionChart = {
  chartData: ChartSegment[];
  activeSecs: number;
  pauseSecs: number;
  label: string;
};

const formatDuration = (seconds: number) =>
  convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));

export const ActivitySessionBar = ({
  data,
  rightSlot,
}: {
  data: SessionChart;
  rightSlot?: ReactNode;
}) => {
  const { t } = useTranslation();

  const chart = useChart({ data: data.chartData });

  return (
    <Box>
      <Flex justifyContent="space-between" gap={4} mb={1}>
        <Text textStyle="xs" color="fg.muted" fontWeight="medium">
          {data.label}
        </Text>
        <Flex gap={2} alignItems="center" flexShrink={0}>
          {rightSlot}
          <Text
            textStyle="xs"
            color="fg.muted"
            fontFamily="Roboto Mono, monospace"
          >
            {formatDuration(data.activeSecs + data.pauseSecs)}
          </Text>
        </Flex>
      </Flex>

      <BarSegment.Root chart={chart}>
        <BarSegment.Content>
          <BarSegment.Bar />
        </BarSegment.Content>
      </BarSegment.Root>

      <Flex flexDirection="column" gap={1} mt={2}>
        {data.activeSecs > 0 && (
          <Flex gap={2} alignItems="center">
            <Box
              w="10px"
              h="10px"
              borderRadius="full"
              bg="teal.500"
              flexShrink={0}
            />
            <Text textStyle="xs" color="fg.muted" flex={1}>
              {t("widgets.activityAnalytics.active")}
            </Text>
            <Text textStyle="xs" fontFamily="Roboto Mono, monospace">
              {formatDuration(data.activeSecs)}
            </Text>
          </Flex>
        )}
        {data.pauseSecs > 0 && (
          <Flex gap={2} alignItems="center">
            <Box
              w="10px"
              h="10px"
              borderRadius="full"
              bg="orange.500"
              flexShrink={0}
            />
            <Text textStyle="xs" color="fg.muted" flex={1}>
              {t("widgets.activityAnalytics.pause")}
            </Text>
            <Text textStyle="xs" fontFamily="Roboto Mono, monospace">
              {formatDuration(data.pauseSecs)}
            </Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
