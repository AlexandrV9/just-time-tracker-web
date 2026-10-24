import { Box } from "~/shared/ui";
import { getVisibleDotCount, shouldShowActivityCountBadge } from "./utils";

export type DayActivityMarkerProps = {
  count?: number;
};

/**
 * Индикатор загруженности дня: до MAX_VISIBLE_DOTS точек,
 * а при большем количестве — компактный бейдж с числом.
 */
export function DayActivityMarker({ count }: DayActivityMarkerProps) {
  if (count === 0 || count === undefined) {
    return null;
  }

  if (shouldShowActivityCountBadge(count)) {
    return (
      <Box
        as="span"
        display="grid"
        placeItems="center"
        minW="20px"
        p="2px"
        fontSize="11px"
        fontWeight="bold"
        lineHeight="1"
        bg="purple.focusRing"
        color="white"
        borderRadius="10px"
      >
        {count}
      </Box>
    );
  }

  const dotCount = getVisibleDotCount(count);

  return (
    <>
      {Array.from({ length: dotCount }, (_, i) => (
        <Box
          key={i}
          as="span"
          w="5px"
          h="5px"
          bg="purple.focusRing"
          borderRadius="full"
          flexShrink={0}
        />
      ))}
    </>
  );
}
