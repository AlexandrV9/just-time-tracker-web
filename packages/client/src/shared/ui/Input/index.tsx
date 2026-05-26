import {
  Input as BaseInput,
  type InputProps as BaseInputProps,
} from "@chakra-ui/react";
import { PasswordInput } from "./Password";

export type InputProps = BaseInputProps;

export function Input(props: InputProps) {
  return <BaseInput {...props} />;
}

Input.Password = PasswordInput;
