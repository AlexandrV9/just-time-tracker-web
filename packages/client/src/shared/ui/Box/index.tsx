import {
  Box as BaseBox,
  type BoxProps as BaseBoxProps,
} from "@chakra-ui/react";
import { forwardRef } from "react";

export type BoxProps = BaseBoxProps;

export const Box = forwardRef<HTMLElement, BaseBoxProps>((props, ref) => {
  return <BaseBox {...props} ref={ref} />;
});

Box.displayName = "Box";
