import {
  Stack as BaseStack,
  HStack,
  VStack,
  type StackProps as BaseStackProps,
} from "@chakra-ui/react";

export type StackProps = BaseStackProps;

export function Stack(props: StackProps) {
  return <BaseStack {...props} />;
}

Stack.VStack = VStack;
Stack.HStack = HStack;
