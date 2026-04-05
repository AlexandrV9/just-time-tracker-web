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
      position="relative"
      w="full"
      boxShadow="0 4px 24px rgba(0, 0, 0, 0.35)"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="border"
      borderRadius="2xl"
      p="1rem"
      gap="0.8rem"
      overflow="hidden"
    >
      {selectedActivity ? (
        <Badge variant="outline" size="lg" rounded="full" borderStyle="dotted">
          <Box w="8px" h="8px" bgColor="green.focusRing" rounded="full" />
          {selectedActivity.title}
        </Badge>
      ) : (
        <Badge variant="outline" size="lg" rounded="full" borderStyle="dotted">
          {t("pages.home.selectActivity")}
        </Badge>
      )}
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
      <ButtonGroup
        justifyContent="center"
        display="grid"
        alignItems="center"
        gridTemplateColumns="repeat(2, 1fr)"
        gap={4}
        w="full"
      >
        <Button
          onClick={onFinish}
          variant="outline"
          size="lg"
          disabled={seconds === 0}
          borderRadius="2xl"
          gap="0.4rem"
        >
          <StopIcon />
          Finish
        </Button>
        {status !== "running" ? (
          <Button
            onClick={onStart}
            size="lg"
            variant="outline"
            borderRadius="2xl"
            gap="0.4rem"
          >
            <PlayIcon />
            Start
          </Button>
        ) : (
          <Button
            onClick={onPause}
            size="lg"
            variant="outline"
            borderRadius="2xl"
            gap="0.4rem"
          >
            <PauseIcon />
            Pause
          </Button>
        )}
      </ButtonGroup>
    </Stack.VStack>
  );
}
