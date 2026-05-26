import {
  Text as BaseText,
  type TextProps as BaseTextProps,
} from "@chakra-ui/react";

export type TextProps = BaseTextProps;

export const Text = (props: TextProps) => {
  return <BaseText {...props} />;
};
