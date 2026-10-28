import type { BoxProps } from "~/shared/ui";

export const authContentProps = {
  maxW: "none",
  position: "relative",
  mx: "auto",
  display: "grid",
  isolation: "isolate",
  w: {
    base: "100%",
    lg: "min(1120px, calc(100% - 64px))",
  },
  minH: "100%",
  px: { base: "18px", sm: "20px", lg: "0" },
  pt: { base: "44px", sm: "56px", lg: "30px" },
  gridTemplateColumns: {
    base: "minmax(0, 1fr)",
    lg: "minmax(0, 1fr) 410px",
    xl: "minmax(0, 1fr) 440px",
  },
  gap: { base: "0", lg: "36px", xl: "48px" },
  justifyContent: "center",
  alignContent: "start",
  justifyItems: { base: "center", lg: "stretch" },
  overflowX: "clip",
  overflowY: "visible",
  _before: {
    content: '""',
    position: "absolute",
    pointerEvents: "none",
    zIndex: -1,
    inset: "0",
    opacity: 0.6,
    backgroundImage: "appPage.stars",
  },
} satisfies BoxProps;
