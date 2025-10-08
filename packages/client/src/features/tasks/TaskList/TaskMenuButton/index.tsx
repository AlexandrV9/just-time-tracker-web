import {
  EditIcon,
  IconButton,
  Menu,
  MoreVerticalIcon,
  Portal,
  Text,
  TrashIcon,
} from "~/shared/ui";

export const TaskMenuButton = () => {
  return (
    <Menu.Root>
      <Menu.Trigger>
        <IconButton variant="outline" borderRadius="8px" size="xs">
          <MoreVerticalIcon />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="edit-menu">
              <EditIcon />
              <Text>Edit</Text>
            </Menu.Item>
            <Menu.Item value="delte-menu">
              <TrashIcon />
              <Text>Delete</Text>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
