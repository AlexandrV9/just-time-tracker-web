import { SignInByLoginForm } from "~/features/auth";
import { Box, Flex } from "~/shared/ui";

export function SignInPage() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      gap="1rem"
      w="full"
      minW={0}
      maxW="full"
      py="1rem"
      px="1rem"
      overflowX="hidden"
    >
      <Box
        padding="1.5rem"
        bg="bg"
        borderRadius="xl"
        width="full"
        minW={0}
        maxW={400}
      >
        <SignInByLoginForm />
      </Box>
    </Flex>
  );
}
