import { Box } from "~/shared/ui";
import { useCurrentActivity } from "~/features";
import { TodayActivityList } from "~/widgets";
import { Stopwatch } from "./Stopwatch";
import { GlowFrame } from "./GlowFrame";

export function HomePage() {
  const { status } = useCurrentActivity();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="0.5rem"
      maxWidth="100vw"
    >
      <GlowFrame active={status === "active"}>
        <Stopwatch />
      </GlowFrame>
      <TodayActivityList />
    </Box>
  );
}
