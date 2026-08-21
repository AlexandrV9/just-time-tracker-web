import shineStyles from "~/shared/styles/shineRing.module.css";
import { Flex, Text } from "~/shared/ui";

export function HeaderAppTitle() {
  return (
    <Flex alignItems="center" gap={2} display={{ base: "none", md: "flex" }}>
      <Text
        textStyle="xl"
        m={0}
        fontWeight="semibold"
        className={shineStyles.shineText}
      >
        Just Time Tracker
      </Text>
    </Flex>
  );
}
