import {
  RadioGroupItem as BaseRadioItem,
  type RadioGroupItemProps as BaseRadioItemProps,
} from "@chakra-ui/react";

export type RadioItemProps = BaseRadioItemProps;

export const Item = (props: RadioItemProps) => (
  <BaseRadioItem {...props} />
);
