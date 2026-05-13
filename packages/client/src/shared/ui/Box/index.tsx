import {
  Box as BaseBox,
  type BoxProps as BaseBoxProps,
} from "@chakra-ui/react";

export type BoxProps = BaseBoxProps;

export const Box = (props: BaseBoxProps) => {
  return <BaseBox {...props} />;
};
