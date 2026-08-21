/* eslint-disable react-refresh/only-export-components */

import { Link, Text, type TextProps } from "~/shared/ui";
import { useAuthStore } from "../../useAuthStore";
import { UserAvatar, type UserAvatarProps } from "~/entities";

type AuthUserNameProps = TextProps;

const AuthUserName = (props: AuthUserNameProps) => {
  const { user } = useAuthStore();
  if (!user) return;

  return <Text {...props}>{user.name}</Text>;
};

type AuthUserAvatarProps = Omit<UserAvatarProps, "userName" | "src">;

const AuthUserAvatar = (props: AuthUserAvatarProps) => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <Link to="/settings">
      <UserAvatar userName={user.name} src={user?.avatar} {...props} />
    </Link>
  );
};

export const AuthUser = {
  Avatar: AuthUserAvatar,
  Name: AuthUserName,
};
