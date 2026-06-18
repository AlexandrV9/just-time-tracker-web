import {
  Button as BaseButton,
  type ButtonProps as BaseButtonProps,
} from "@chakra-ui/react";

export type ButtonProps = BaseButtonProps;

export const Button = (props: ButtonProps) => {
  return <BaseButton {...props} />;
};

export { IconButton, type IconButtonProps } from "./IconButton";
