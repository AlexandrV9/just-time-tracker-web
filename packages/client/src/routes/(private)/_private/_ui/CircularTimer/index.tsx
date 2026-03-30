import { ButtonGroup } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  Stack,
  type TimeObject,
} from "~/shared/ui";

import "./CircularTimer.module.css";

// https://animate-ui.com/docs/components/radix/checkbox

type CircularTimerProps = {
  size?: number;
  segments?: number;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: (durationInSeconds: number) => void;
};

type Status = "idle" | "running" | "paused";

export function CircularTimer({
  size = 300,
  segments = 60,
  onStart,
  onPause,
  onStop,
}: CircularTimerProps) {
  const radius = size / 2 - 10;
  const center = size / 2;
  const lineLength = 20;

  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status !== "running") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  const timeObject = useMemo(
    (): TimeObject => convertSecondsToTimeObject(seconds),
    [seconds]
  );

  const displayedTime = useMemo(() => {
    return convertTimeObjectToTimeString(timeObject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeObject.hours, timeObject.minutes, timeObject.seconds]);

  const svgSegments = useMemo(
    () =>
      Array.from({ length: segments }).map((_, i) => {
        const angle = (360 / segments) * i;

        return (
          <line
            key={i}
            x1={center}
            y1={center - radius}
            x2={center}
            y2={center - radius + lineLength}
            stroke="#c4b5fd"
            strokeWidth={6}
            strokeLinecap="round"
            transform={`rotate(${angle} ${center} ${center})`}
            opacity={0.35}
          />
        );
      }),
    [segments, center, radius]
  );

  const handleStart = useCallback(() => {
    setStatus("running");
    onStart?.();
  }, [onStart]);

  const handlePause = useCallback(() => {
    setStatus("paused");
    onPause?.();
  }, [onPause]);

  const handleStop = useCallback(() => {
    setStatus("idle");
    setSeconds(0);
    onStop?.(seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onStop, timeObject.hours, timeObject.minutes, timeObject.seconds]);

  return (
    <Stack.VStack position="relative" w="full">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {svgSegments}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          style={{
            fontSize: 40,
            fontFamily: "Roboto Mono, monospace",
          }}
        >
          {displayedTime}
        </text>
      </svg>

      <ButtonGroup
        display="grid"
        gridTemplateColumns="1fr 1fr"
        gap={4}
        w="full"
      >
        <Button
          onClick={handleStop}
          variant="outline"
          size="lg"
          disabled={seconds === 0}
        >
          Finish
        </Button>
        {status !== "running" ? (
          <Button onClick={handleStart} variant="outline" size="lg">
            Start
          </Button>
        ) : (
          <Button onClick={handlePause} variant="outline" size="lg">
            Pause
          </Button>
        )}
      </ButtonGroup>
    </Stack.VStack>
  );
}
