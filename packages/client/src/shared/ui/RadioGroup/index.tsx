import {
  RadioGroup as BaseRadioGroup,
  type RadioGroupRootProps as BaseRadioGroupRootProps,
} from "@chakra-ui/react";
import { Item } from "./Item";

export type RadioGroupProps = BaseRadioGroupRootProps;

export function RadioGroup(props: RadioGroupProps) {
  return <BaseRadioGroup.Root {...props} />;
}

RadioGroup.Item = Item;
