import { SignInByLoginForm } from "~/features/auth";
import { useSeo } from "~/shared/seo";
import { Box, Flex, Stack } from "~/shared/ui";

export function SignInPage() {
  useSeo({
    description:
      "Sign in to Just Time Tracker — track time, manage activities, and review your day.",
    path: "/signin",
  });

  return (
    <Box position="relative" w="full" minH="100%">
      <Flex
        direction="column"
        align="center"
        w="full"
        pt={{ base: "1.5rem", md: "2rem" }}
        pb="2rem"
        px="1rem"
        position="relative"
        zIndex={1}
      >
        <Box
          padding="1.5rem"
          borderRadius="xl"
          width="full"
          minW={0}
          maxW={400}
        >
          <Stack.VStack gap="1rem">
            <SignInByLoginForm />
          </Stack.VStack>
        </Box>
      </Flex>
    </Box>
  );
}
