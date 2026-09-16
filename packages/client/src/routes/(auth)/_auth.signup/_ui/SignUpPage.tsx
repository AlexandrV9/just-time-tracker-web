import { SignUpForm } from "~/features/auth";
import { useSeo } from "~/shared/seo";
import { Flex } from "~/shared/ui";

export function SignUpPage() {
  useSeo({
    description:
      "Create a Just Time Tracker account and start tracking your daily activities.",
    path: "/signup",
  });

  return (
    <Flex position="relative" w="full" minH="100%">
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
        <SignUpForm />
      </Flex>
    </Flex>
  );
}
