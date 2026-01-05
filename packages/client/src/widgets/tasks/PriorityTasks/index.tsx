import {
  ArrowRightIcon,
  Box,
  CheckCircleIcon,
  CircleIcon,
  Link,
  List,
  Text,
} from "~/shared/ui";
import { Flex } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { taskApiService } from "~/shared/api/services/task";
import { useTranslation } from "~/shared/hooks";

export const PriorityTasks = () => {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskApiService.getTasks({ priority: "high" }),
  });
  const tasks = data?.success ? data.data.data : [];

  return (
    <Box
      display="flex"
      flexDirection="column"
      border={10}
      bg="bg.muted"
      p={5}
      borderRadius={20}
      gap={3}
    >
      <Text textStyle="xl" fontWeight="semibold">
        {t("widgets.priorityTasks.title")}
      </Text>
      <List.Root
        listStyleType="none"
        overflow="hidden"
        gap={3}
        justifyContent="center"
        flexGrow={1}
      >
        {tasks.length > 0 ? (
          tasks.map((item) => (
            <List.Item key={item.id} display="flex">
              <List.Indicator asChild color="green.500">
                {item.status === "done" ? <CheckCircleIcon /> : <CircleIcon />}
                <CheckCircleIcon />
              </List.Indicator>
              <Text fontWeight="medium" textStyle="md" lineClamp="2">
                {item.title}
              </Text>
            </List.Item>
          ))
        ) : (
          <Text>{t("widgets.priorityTasks.notTasks")}</Text>
        )}
      </List.Root>
      <Link to="/tasks">
        <Flex align="center" gap={1}>
          <Text textStyle="md" fontWeight="medium">
            {t("widgets.priorityTasks.goToAllTasks")}
          </Text>
          <ArrowRightIcon size={16} />
        </Flex>
      </Link>
    </Box>
  );
};
