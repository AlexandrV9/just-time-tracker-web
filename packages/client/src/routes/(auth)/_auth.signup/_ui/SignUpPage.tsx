import { SignUpForm } from "~/features/auth";
import { useSeo } from "~/shared/seo";
import { Box, Flex } from "~/shared/ui";

export function SignUpPage() {
  useSeo({
    description:
      "Create a Just Time Tracker account and start tracking your daily activities.",
    path: "/signup",
  });

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
        <SignUpForm />
      </Box>
    </Flex>
  );
}
