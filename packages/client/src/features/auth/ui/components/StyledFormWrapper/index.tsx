import type { ReactNode } from "react";
import { Box } from "~/shared/ui";

export function StyledFormWrapper({ children }: { children: ReactNode }) {
  return (
    <Box
      border="1px solid"
      borderColor="appAccent.softBorder"
      p={{ base: "16px", sm: "22px", lg: "22px" }}
      borderRadius={{ base: "20px", lg: "var(--app-radius-panel)" }}
      position="relative"
      bg={{
        base: "appSecondary.formGradient",
        lg: "appSecondary.bg",
      }}
      backdropFilter={{ base: "blur(6px) saturate(140%)", lg: "none" }}
      boxShadow={{
        base: "appSecondary.formShadow",
        lg: "none",
      }}
      css={{
        "& h1": { fontSize: { base: "24px", sm: "28px", lg: "36px" } },
      }}
    >
      {children}
    </Box>
  );
}
