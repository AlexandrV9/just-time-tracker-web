import { Avatar, type AvatarRootProps } from "~/shared/ui";

export interface UserAvatarProps extends AvatarRootProps {
  userName: string;
  src?: string | null;
}

export const UserAvatar = ({ src, userName, ...props }: UserAvatarProps) => {
  return (
    <Avatar.Root {...props}>
      <Avatar.Fallback name={userName} />
      <Avatar.Image src={src ? src : undefined} />
    </Avatar.Root>
  );
};
