import {
  Input as BaseInput,
  type InputProps as BaseInputProps,
} from "@chakra-ui/react";
import { type Ref } from "react";
import clsx from "clsx";
import { PasswordInput } from "./Password";
import styles from "./Input.module.css";
import { INPUT_VARIANTS } from "./constants";

export type InputVariant = (typeof INPUT_VARIANTS)[keyof typeof INPUT_VARIANTS];

export type InputProps = Omit<BaseInputProps, "variant"> & {
  variant?: InputVariant;
  ref?: Ref<HTMLInputElement>;
};

export function Input({
  variant = INPUT_VARIANTS.primary,
  className,
  ...props
}: InputProps) {
  return (
    <BaseInput
      {...props}
      variant="outline"
      className={clsx(styles.input, styles[`variant_${variant}`], className)}
    />
  );
}

Input.Password = PasswordInput;
