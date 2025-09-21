import { List } from "~/shared/ui";
import { mockTasks } from "../../mocks";
import { TaskCard } from "../TaskCard";

export const TaskList = () => {
  return (
    <List.Root display="flex" flexDirection="column" w="full" gap="1rem">
      {mockTasks.map((item) => (
        <li key={item.id}>
          <TaskCard data={item} />
        </li>
      ))}
    </List.Root>
  );
};
