import {
  Skeleton as BaseSkeleton,
  type SkeletonProps as BaseSkeletonProps,
} from "@chakra-ui/react";

export type SkeletonProps = BaseSkeletonProps;

export const Skeleton = (props: SkeletonProps) => {
  return <BaseSkeleton {...props} />;
};
