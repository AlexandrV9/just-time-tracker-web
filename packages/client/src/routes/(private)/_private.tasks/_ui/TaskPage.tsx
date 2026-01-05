import {
  Box,
  Text,
  Heading,
  IconButton,
  ArrowLeftIcon,
  Flex,
} from "~/shared/ui";

import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { taskApiService } from "~/shared/api/services/task";
import { useCallback } from "react";
import { UpdateTaskDialog } from "~/features/tasks";
import { useDialog } from "@ark-ui/react";

export function TaskPage() {
  const { taskId } = useParams({ from: "/(private)/_private/tasks/$taskId" });

  const updateTaskDialog = useDialog();

  const navigate = useNavigate();

  const { data, isError, isPending } = useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => taskApiService.getTaskById({ id: taskId }),
  });

  const handleGoToBackPage = useCallback(() => {
    navigate({ to: "/tasks" });
  }, [navigate]);

  if (isPending) {
    return null;
  }

  if (isError || !data?.success) {
    return null;
  }

  console.log(data.data);

  return (
    <>
      <Box p="md">
        <Flex justify="space-between">
          <IconButton
            onClick={handleGoToBackPage}
            variant="outline"
            borderRadius="full"
            mb="1rem"
          >
            <ArrowLeftIcon />
          </IconButton>
          <UpdateTaskDialog
            task={data.data}
            showTrigger
            dialog={updateTaskDialog}
          />
        </Flex>
        <Heading mb={3}>{data.data.title}</Heading>
        <Box h="1px" w="full" bg="gray.700" mb={3} />
        <Text>{data.data.description}</Text>
      </Box>
    </>
  );
}
