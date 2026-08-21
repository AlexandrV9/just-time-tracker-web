import { memo, useMemo } from "react";
import FloatingLines from "~/shared/components/FloatingLines";
import { resolveTheme, useTheme } from "~/shared/theme";
import { Box } from "~/shared/ui";

export const AUTH_FLOATING_LINES_PATHS = new Set([
  "/signin",
  "/signup",
  "/recover-account",
  "/landing",
]);

const DARK_LINES = ["#E8E0FF", "#D9D0FF", "#B8A9F0", "#C8BAFF"];
const LIGHT_LINES = ["#5A52A0", "#6A62B0", "#7A72C0", "#6860AD"];

const DARK_BG = "#050505";
const LIGHT_BG =
  "linear-gradient(165deg, #ffffff 0%, #fefefe 55%, #f8f7fc 100%)";

export const AuthFloatingLinesBackground = memo(function AuthFloatingLinesBackground() {
  const { theme } = useTheme();
  const isLight = resolveTheme(theme) === "light";

  const linesGradient = useMemo(
    () => (isLight ? LIGHT_LINES : DARK_LINES),
    [isLight],
  );

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={0}
      w="100vw"
      h="100dvh"
      overflow="hidden"
      pointerEvents="none"
      aria-hidden
      style={{
        background: isLight ? LIGHT_BG : DARK_BG,
      }}
    >
      <FloatingLines
        linesGradient={linesGradient}
        enabledWaves={["top", "middle", "bottom"]}
        lineCount={isLight ? [4, 3, 4] : [4, 3, 4]}
        lineDistance={isLight ? [5, 4, 5] : [0, 10, 5]}
        animationSpeed={0.35}
        lineIntensity={isLight ? 1 : 1}
        lineSoftness={isLight ? 0.02 : 0.01}
        lineBase={isLight ? 0 : 0.01}
        lineAlphaGamma={isLight ? 1.1 : 1}
        mixBlendMode={isLight ? "darken" : "screen"}
        interactive={false}
        parallax={false}
      />
    </Box>
  );
});
