import { BellIcon, IconButton } from "~/shared/ui";

export const NotificationButton = () => {
  return (
    <IconButton variant="outline" borderRadius={12} disabled>
      <BellIcon />
    </IconButton>
  );
};
