import { useAuthStore } from "~/features/auth";
import { BackButton, Box, Input, Stack } from "~/shared/ui";
import { AuthUserInfo, useHeaderLeftContent } from "~/widgets";

export function ProfilePage() {
  useHeaderLeftContent(<BackButton />);

  const { user } = useAuthStore();

  return (
    <Stack.VStack alignItems="stretch" gap="2rem">
      <AuthUserInfo />
      <Stack.VStack>
        <Box
          as="form"
          width="full"
          display="flex"
          flexDirection="column"
          gap="1rem"
        >
          <Input placeholder="Имя" value={user!.name} disabled />
          <Input placeholder="Почта" disabled />
          <Input placeholder="Дата рождения" disabled />
        </Box>
      </Stack.VStack>
    </Stack.VStack>
  );
}
