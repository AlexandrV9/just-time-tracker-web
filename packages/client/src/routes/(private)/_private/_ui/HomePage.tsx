import { useState } from "react";
import clsx from "clsx";
import { Box, Button, ChevronUpIcon, Stack } from "~/shared/ui";
import { useCurrentActivity } from "~/features";
import { useTranslation } from "~/shared/hooks";
import { TodayActivityList } from "~/widgets";
import { STOPWATCH_COLLAPSED_KEY } from "~/shared/constants";
import { Stopwatch } from "./Stopwatch";
import { GlowFrame } from "./GlowFrame";
import { useFlipLayout } from "./useFlipLayout";

import styles from "./HomePage.module.css";

const readCollapsed = () =>
  localStorage.getItem(STOPWATCH_COLLAPSED_KEY) === "1";

export function HomePage() {
  const { t } = useTranslation();
  const { status } = useCurrentActivity();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const { scopeRef, run } = useFlipLayout();

  const toggleCollapsed = () => {
    run(() => {
      setCollapsed((value) => {
        const next = !value;
        localStorage.setItem(STOPWATCH_COLLAPSED_KEY, next ? "1" : "0");
        return next;
      });
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="0.5rem"
      maxWidth="100vw"
    >
      <Box ref={scopeRef} w="full">
        <Stack.VStack p="0.5rem" align="center">
          <GlowFrame
            active={status === "active"}
            collapsed={collapsed}
          >
            <Stopwatch collapsed={collapsed} />
          </GlowFrame>
          <Button
            variant="outline"
            size="xs"
            borderRadius="30px"
            h="24px"
            aria-expanded={!collapsed}
            aria-label={
              collapsed
                ? t("pages.home.expandStopwatch")
                : t("pages.home.collapseStopwatch")
            }
            onClick={toggleCollapsed}
          >
            <ChevronUpIcon
              className={clsx(
                styles.chevron,
                collapsed && styles.chevronCollapsed,
              )}
            />
          </Button>
        </Stack.VStack>
      </Box>
      <TodayActivityList />
    </Box>
  );
}
