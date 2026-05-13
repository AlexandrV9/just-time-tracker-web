import {
  IconButton as BaseIconButton,
  type IconButtonProps as BaseIconButtonProps,
} from "@chakra-ui/react";

export type IconButtonProps = BaseIconButtonProps;

export const IconButton = (props: IconButtonProps) => {
  return <BaseIconButton {...props} />;
};
