import {
  Skeleton as BaseSkeleton,
  type SkeletonProps as BaseSkeletonProps,
} from "@chakra-ui/react";

export interface SkeletonProps extends BaseSkeletonProps {}

export const Skeleton = (props: SkeletonProps) => {
  return <BaseSkeleton {...props} />;
};
