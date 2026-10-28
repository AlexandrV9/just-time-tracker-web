import type { ReactNode } from "react";
import { Box } from "~/shared/ui";

export function StyledFormWrapper({ children }: { children: ReactNode }) {
  return (
    <Box
      border="1px solid var(--design-border)"
      p={{ base: "16px", sm: "22px", lg: "22px" }}
      borderRadius={{ base: "20px", lg: "var(--design-radius)" }}
      position="relative"
      bg={{
        base: "linear-gradient(145deg, color-mix(in srgb, var(--design-panel) 78%, transparent), color-mix(in srgb, var(--design-panel) 60%, transparent))",
        lg: "var(--design-panel)",
      }}
      backdropFilter={{ base: "blur(6px) saturate(140%)", lg: "none" }}
      boxShadow={{
        base: "inset 0 1px 0 color-mix(in srgb, var(--design-lavender-light) 9%, transparent), 0 24px 64px color-mix(in srgb, var(--design-shadow) 35%, transparent)",
        lg: "none",
      }}
      css={{
        "& h1": { fontSize: { base: "24px", sm: "28px", lg: "36px" } },
        "& form > .chakra-stack:last-child": { textAlign: "center" },
      }}
      _before={{
        content: "''",
        position: "absolute",
        pointerEvents: "none",
        left: "15%",
        right: "15%",
        top: "-1px",
        h: "1px",
        background:
          "linear-gradient(90deg, transparent, color-mix(in srgb, var(--design-lavender) 53.7%, transparent), transparent)",
        boxShadow:
          "0 0 25px 3px color-mix(in srgb, var(--design-purple) 9%, transparent)",
      }}
    >
      {children}
    </Box>
  );
}
