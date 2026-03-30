import { useMemo, type RefObject } from "react";
import {
  convertSecondsToTimeObject,
  getTotalSecondsFromDay,
} from "~/shared/libs";
import { useCounter } from "~/shared/hooks";
import { Box, Text } from "~/shared/ui";

interface CurrentTimePointerProps {
  hourHeight?: number;
  showTimeLabel?: boolean;
  lineColor?: string;
  lineWidth?: string;
  ref?: RefObject<HTMLDivElement | null>;
}

export const CurrentTimePointer = ({
  hourHeight = 60,
  ref,
}: CurrentTimePointerProps) => {
  const { value } = useCounter({ autoStart: true });

  const currentTime = useMemo(() => {
    const { minutes, hours } = convertSecondsToTimeObject(
      getTotalSecondsFromDay(),
    );

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
    ].join(":");
  }, [value]);

  const pointerTop = useMemo(() => {
    return (getTotalSecondsFromDay() / 3600) * hourHeight;
  }, [hourHeight, value]);

  return (
    <div ref={ref}>
      <Box
        position="absolute"
        left={0}
        w="full"
        h="20px"
        display="grid"
        gridTemplateColumns="min-content 1fr"
        gap={0}
        alignItems="center"
        pl={2.5}
        style={{
          top: pointerTop,
        }}
      >
        <Box px={1.5} bg="red.solid" borderRadius="12px">
          <Text textStyle="sm" color="fg" textAlign="right">
            {currentTime}
          </Text>
        </Box>
        <Box h="2px" width="100%" bg="red.solid" />
      </Box>
    </div>
  );
};
