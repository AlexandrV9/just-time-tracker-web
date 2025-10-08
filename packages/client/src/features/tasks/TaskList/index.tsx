import { TaskCard } from "~/entities/Task";
// import { mockTasks } from "~/entities/Task/mocks";
import {
  EditIcon,
  IconButton,
  List,
  Stack,
  Text,
  TrashIcon,
} from "~/shared/ui";
import { useTasksStore } from "../model/useTasksStore";
import { useEffect } from "react";

export const TaskList = () => {
  const { tasks: data } = useTasksStore();

  useEffect(() => {
    // setTasks(mockTasks);
  }, []);

  console.log("tasks", data);

  console.log("data", data);

  if (!data) {
    return (
      <Stack.VStack flex={1} alignItems="center" justifyContent="center">
        <Text>Список задач пуст </Text>
      </Stack.VStack>
    );
  }

  const tasks = Array.from(data.values());

  return (
    <List.Root display="flex" flexDirection="column" w="full" gap="1rem">
      {tasks.map((item) => (
        <li key={item.id}>
          <TaskCard
            data={item}
            actionSlot={
              <Stack.HStack ml="auto">
                <IconButton variant="outline" size="sm">
                  <EditIcon size={20} />
                </IconButton>
                <IconButton variant="outline" size="sm">
                  <TrashIcon size={20} />
                </IconButton>
              </Stack.HStack>
            }
          />
        </li>
      ))}
    </List.Root>
  );
};
