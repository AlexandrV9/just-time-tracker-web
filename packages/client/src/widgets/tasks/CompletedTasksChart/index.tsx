import { Flex, Stack, Text } from "~/shared/ui";

import { Chart, useChart } from "@chakra-ui/charts";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { AbsoluteCenter, ProgressCircle } from "@chakra-ui/react";
import { useTranslation } from "~/shared/hooks";
import { useQuery } from "@tanstack/react-query";
import { taskApiService } from "~/shared/api/services/task";

export const CompletedTasksChart = () => {
  const { t } = useTranslation();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 6);

  const toDate = new Date(today);
  toDate.setHours(23, 59, 59, 999);

  const { data } = useQuery({
    queryKey: [
      "completed-tasks-count",
      fromDate.toISOString(),
      toDate.toISOString(),
    ],
    queryFn: () =>
      taskApiService.getTasksCount({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        status: "done",
      }),
  });

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(fromDate);
    d.setDate(fromDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);

    return {
      type: key.slice(8),
      allocation: data?.success ? data.data[key] ?? 0 : 0,
    };
  });

  console.log("chartData", chartData);

  const chart = useChart({
    data: chartData,
    series: [{ name: "allocation", color: "teal.solid" }],
  });

  return (
    <Stack.HStack
      bg="bg.muted"
      p={5}
      borderRadius="4xl"
      flexDirection="column"
      align="start"
    >
      <Flex gap={2}>
        <ProgressCircle.Root value={5} colorPalette="teal">
          <ProgressCircle.Circle>
            <ProgressCircle.Track />
            <ProgressCircle.Range />
          </ProgressCircle.Circle>
          <AbsoluteCenter>
            <ProgressCircle.ValueText />
          </AbsoluteCenter>
        </ProgressCircle.Root>
        <Stack.VStack align="start">
          <Text>{t("widgets.completedTasksChart.title")}</Text>
          <Text textStyle="sm" color="fg.muted" lineHeight={1}>
            22 / 72
          </Text>
        </Stack.VStack>
      </Flex>
      <Chart.Root maxH="sm" chart={chart}>
        <BarChart data={chart.data} barSize={40}>
          <CartesianGrid
            stroke={chart.color("border.muted")}
            vertical={false}
          />
          <XAxis
            axisLine={false}
            tickLine={false}
            dataKey={chart.key("type")}
          />
          {chart.series.map((item) => (
            <Bar
              key={item.name}
              isAnimationActive={false}
              dataKey={chart.key(item.name)}
              fill={chart.color(item.color)}
              radius={10}
            />
          ))}
        </BarChart>
      </Chart.Root>
    </Stack.HStack>
  );
};
