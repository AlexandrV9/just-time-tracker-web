import {
  CloseButton as BaseCloseButton,
  type CloseButton as BaseCloseButtonProps,
} from "@chakra-ui/react";
import type { ComponentProps } from "react";

export type CloseButtonProps = Omit<
  ComponentProps<typeof BaseCloseButtonProps>,
  "rounded"
>;

export const CloseButton = (props: CloseButtonProps) => {
  return (
    <BaseCloseButton
      size="sm"
      variant="solid"
      rounded="full"
      top="0.8rem"
      {...props}
    />
  );
};
