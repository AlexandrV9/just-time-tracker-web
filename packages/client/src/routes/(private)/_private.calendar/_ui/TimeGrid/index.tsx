import { Box, Flex, Text } from "~/shared/ui";
import styles from "./TimeGrid.module.css";
import { CurrentTimePointer } from "./TimePointer";
import { useRef } from "react";
// import { useScrollToAnchor } from "./useScrollToAnchor";

type TimeGridProps = {
  startHour?: number;
  endHour?: number;
  hourHeight?: number;
};

const hours = Array.from({ length: 25 }, (_, index) => index);

export const TimeGrid = ({ hourHeight = 60 }: TimeGridProps) => {
  const currentTimePointerRef = useRef<HTMLDivElement>(null);

  // useScrollToAnchor({
  //   containerRef: mainContainerRef,
  //   targetRef: currentTimePointerRef,
  //   anchor: 0.4,
  //   revalidateKey: hourHeight,
  // });

  return (
    <Box position="relative">
      <ul className={styles.list}>
        {hours.map((hour, index, arr) => {
          const isLast = index === arr.length - 1;

          return (
            <Flex as="li" key={hour} display="grid" h="60px" gap={3}>
              <Box
                h="20px"
                display="grid"
                gridTemplateColumns="50px 1fr"
                gap={3}
                alignItems="center"
              >
                <Text textStyle="sm" color="gray.500" textAlign="right">
                  {String(isLast ? 0 : hour).padStart(2, "0")}:00
                </Text>
                <Box h="2px" w="full" bg="border.muted"></Box>
              </Box>
            </Flex>
          );
        })}

        {/* <DayEventsLayer startHour={8} hourHeight={60} /> */}
      </ul>

      <CurrentTimePointer
        ref={currentTimePointerRef}
        hourHeight={hourHeight}
        lineColor="#ff4d4f"
        showTimeLabel
      />
    </Box>
  );
};
