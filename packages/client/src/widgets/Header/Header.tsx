import { Box } from "~/shared/ui";
import { useHeaderStore } from "./useHeaderStore";
import { TOP_CONTAINER_HEIGHT_PX } from "~/shared/ui/PageLayout/components";

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
      h={TOP_CONTAINER_HEIGHT_PX}
      minH="60px"
    >
      <Box
        position="absolute"
        left="10px"
        top="50%"
        transform="translateY(-50%)"
      >
        {leftContent}
      </Box>
      {centerContent}
      <Box
        position="absolute"
        right="10px"
        top="50%"
        transform="translateY(-50%)"
      >
        {rightContent}
      </Box>
    </Box>
  );
};
