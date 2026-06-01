import { SignUpForm } from "~/features/auth";
import { Box, Flex, Link, Text } from "~/shared/ui";

export function SignUpPage() {
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
      <Text
        color="fg.subtle"
        textStyle="sm"
        textAlign="center"
        maxW="400px"
        lineHeight="1.5"
      >
        Продолжая, вы принимаете{" "}
        <Text
          as="span"
          color="fg"
          textDecoration="underline"
          textUnderlineOffset="3px"
          _hover={{ opacity: 0.8 }}
        >
          <Link to="/terms-of-service">Пользовательское соглашение</Link>
        </Text>{" "}
        и{" "}
        <Text
          as="span"
          color="fg"
          textDecoration="underline"
          textUnderlineOffset="3px"
          _hover={{ opacity: 0.8 }}
        >
          <Link to="/privacy-policy">Политику конфиденциальности</Link>
        </Text>
      </Text>
    </Flex>
  );
}
