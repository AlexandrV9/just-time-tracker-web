import { Flex, Stack, Text } from "~/shared/ui";

import { Chart, useChart } from "@chakra-ui/charts";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { AbsoluteCenter, ProgressCircle } from "@chakra-ui/react";
import { useTranslation } from "~/shared/hooks";

export const CompletedTasksChart = () => {
  const { t } = useTranslation();

  const chart = useChart({
    data: [
      { allocation: 20, type: "01" },
      { allocation: 15, type: "02" },
      { allocation: 20, type: "03" },
      { allocation: 30, type: "04" },
      { allocation: 19, type: "05" },
      { allocation: 12, type: "06" },
    ],
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
