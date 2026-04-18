import { ButtonGroup } from "@chakra-ui/react";
import { useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  PauseIcon,
  PlayIcon,
  Stack,
  StopIcon,
  Text,
  type TimeObject,
} from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";

import type { StopwatchStatus } from "./useStopwatch";

export type StopwatchSelectedTemplate = {
  title: string;
  description?: string | null;
} | null;

type StopwatchProps = {
  seconds: number;
  status: StopwatchStatus;
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
  selectedActivity?: StopwatchSelectedTemplate;
};

export function Stopwatch({
  seconds,
  status,
  onStart,
  onPause,
  onFinish,
  selectedActivity,
}: StopwatchProps) {
  const { t } = useTranslation();

  const timeObject = useMemo(
    (): TimeObject => convertSecondsToTimeObject(seconds),
    [seconds],
  );

  const displayedTime = useMemo(() => {
    return convertTimeObjectToTimeString(timeObject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeObject.hours, timeObject.minutes, timeObject.seconds]);

  return (
    <Stack.VStack
      w="full"
      backdropFilter="blur(20px)"
      p="1rem"
      gap="0.8rem"
      overflow="hidden"
      maxWidth="500px"
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="1rem"
        alignItems="center"
        w="full"
        justifyContent="center"
        position="relative"
      >
        <Text
          style={{
            fontSize: 40,
            fontFamily: "Roboto Mono, monospace",
          }}
        >
          {displayedTime}
        </Text>
      </Box>
    </Stack.VStack>
  );
}
