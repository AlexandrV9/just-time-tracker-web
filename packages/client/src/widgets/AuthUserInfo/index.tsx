import { UserAvatar } from "~/entities";
import { useAuthStore } from "~/features/auth";
import { Stack, Text } from "~/shared/ui";

export const AuthUserInfo = () => {
  const { user } = useAuthStore(); // TODO: user не может быть равен null

  const userName = user?.name ?? "Unknown";

  return (
    <Stack.VStack>
      <UserAvatar
        variant="subtle"
        userName={userName}
        src={user?.avatar}
        size="2xl"
      />
      <Stack.VStack>
        <Text>{userName}</Text>
      </Stack.VStack>
    </Stack.VStack>
  );
};
