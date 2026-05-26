import { UserAvatar } from "~/entities";
import { useAuthStore } from "~/features/auth";
import { Flex, Stack, Text } from "~/shared/ui";

export const AuthUserInfo = () => {
  const { user } = useAuthStore(); // TODO: user не может быть равен null

  return (
    <Flex width="full" justifyContent="center">
      <Stack.VStack>
        <UserAvatar userName={user!.name} src={user?.avatar} size="2xl" />
        <Stack.VStack>
          <Text>{user!.name}</Text>
          {user?.email && <Text>{user?.email}</Text>}
        </Stack.VStack>
      </Stack.VStack>
    </Flex>
  );
};
