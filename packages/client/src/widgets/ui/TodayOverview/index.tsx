import { Box, CalendarIcon, Flex, Text } from "~/shared/ui";
import robotPath from "~/shared/assets/images/robot.png";
import { useQuery } from "@tanstack/react-query";
import { taskApiService } from "~/shared/api/services/task";
import { formatDateWithMonth, getDayInterval } from "~/shared/utils";
import { useTranslation } from "~/shared/hooks";
import { Trans } from "react-i18next";

// https://www.kittl.com/tools/svg-converter?utm_medium=paid&utm_source=google&utm_campaign=All&utm_term=advanced&utm_content=DSA&gad_source=1&gad_campaignid=22773485503&gbraid=0AAAAAohBaMph8GTWVeWCANOnsUOEZyk8M&gclid=CjwKCAiAu67KBhAkEiwAY0jAlVcNNJv73Bmn3Gj7UboOpy167VgpNchk-bEAy9N946ioQY5TIrfoSRoCgK4QAvD_BwE

export const TodayOverview = () => {
  const { t, i18n } = useTranslation();
  const { fromDate, toDate } = getDayInterval();

  const { data } = useQuery({
    queryKey: ["count_today_tasks", fromDate, toDate],
    queryFn: () =>
      taskApiService.getTasksCount({
        fromDate,
        toDate,
      }),
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      border={10}
      bg="bg.muted"
      p={5}
      minH="180px"
      borderRadius={20}
      bgImage={`url(${robotPath})`}
      bgRepeat="no-repeat"
      bgPos="right bottom"
      bgSize="contain"
    >
      <Flex direction="column" gap={3} pr="130px">
        <Flex align="center" gap={1}>
          <CalendarIcon size={30} textFontSize={7} day={new Date().getDate()} />
          <Text textStyle="xl" fontWeight="semibold">
            {formatDateWithMonth(new Date(), i18n.language)}
          </Text>
        </Flex>
        <Text fontWeight="medium">{t("widgets.todayOverview.title")}</Text>
        <Text textStyle="2xl" fontWeight="semibold">
          <Trans
            i18nKey="widgets.todayOverview.tasksForToday"
            count={data?.success ? data?.data.count : 0}
            components={{
              CountWrapper: <Text as="span" color="#a18ef6" />,
            }}
          />
        </Text>
      </Flex>
    </Box>
  );
};
