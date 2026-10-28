import {
  Button as BaseButton,
  type ButtonProps as BaseButtonProps,
} from "@chakra-ui/react";

export type ButtonVariant =
  | NonNullable<BaseButtonProps["variant"]>
  | "accent";

export type ButtonProps = Omit<BaseButtonProps, "variant"> & {
  variant?: ButtonVariant;
};

export const Button = ({ variant, ...props }: ButtonProps) => {
  return (
    <BaseButton {...props} variant={variant as BaseButtonProps["variant"]} />
  );
};

export { IconButton, type IconButtonProps } from "./IconButton";
