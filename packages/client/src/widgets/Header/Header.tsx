import { Box } from "~/shared/ui";
import { useHeaderStore } from "./useHeaderStore";

export type HeaderProps = Record<string, never>;

export const Header = () => {
  const { leftContent, centerContent, rightContent } = useHeaderStore();

  return (
    <Box
      as="header"
      width="full"
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
      h="var(--top-bar-height)"
    >
      <Box position="absolute" left={0} top="50%" transform="translateY(-50%)">
        {leftContent}
      </Box>
      {centerContent}
      <Box position="absolute" right={0} top="50%" transform="translateY(-50%)">
        {rightContent}
      </Box>
    </Box>
  );
};
