import dayjs from "dayjs";
import { Box, Flex, Text } from "~/shared/ui";

export type TimeAxisProps = {
  startDate: string;
  endDate: string;
};

export const TimeAxis = ({ startDate, endDate }: TimeAxisProps) => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      px="0.8rem"
      position="relative"
      gapY="10px"
    >
      <Text>{dayjs(startDate).format("HH:mm")}</Text>
      <Box position="relative" w="7px" h="40px" flexGrow={1}>
        <Box
          position="absolute"
          top="0"
          left="50%"
          transform="translate(-50%, -50%)"
          w="7px"
          h="7px"
          borderRadius="full"
          bg="gray.solid"
        />
        <Box
          css={{ "--color": "colors.gray.solid" }}
          position="absolute"
          top="7px"
          bottom="7px"
          left="50%"
          transform="translateX(-50%)"
          w="1px"
          opacity={0.6}
          bgRepeat="repeat-y"
          bgSize="1px 8px"
          bgImage={`linear-gradient(var(--color) 0 60%, transparent 60% 100%)`}
        />
        <Box
          position="absolute"
          bottom="0"
          left="50%"
          transform="translate(-50%, 50%)"
          w="7px"
          h="7px"
          borderRadius="full"
          bg="gray.solid"
        />
      </Box>
      <Text>{dayjs(endDate).format("HH:mm")}</Text>
    </Flex>
  );
};
