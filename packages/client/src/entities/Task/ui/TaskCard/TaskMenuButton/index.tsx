import {
  EditIcon,
  Menu,
  MoreVerticalIcon,
  Portal,
  ShareForwardIcon,
  Text,
  TrashIcon,
} from "~/shared/ui";

export type TaskMenuButtonProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const TaskMenuButton = ({
  onEdit,
  onDelete,
  onView,
}: TaskMenuButtonProps) => {
  return (
    <Menu.Root>
      <Menu.Trigger>
        <MoreVerticalIcon />
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="view" onClick={onView}>
              <ShareForwardIcon />
              <Text textStyle="md">View</Text>
            </Menu.Item>
            <Menu.Item value="edit" onClick={onEdit}>
              <EditIcon />
              <Text textStyle="md">Edit</Text>
            </Menu.Item>
            <Menu.Item value="delte" onClick={onDelete}>
              <TrashIcon />
              <Text textStyle="md">Delete</Text>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
