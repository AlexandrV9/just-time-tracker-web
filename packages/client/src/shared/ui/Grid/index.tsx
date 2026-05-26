import {
  Grid as BaseGrid,
  GridItem as BaseGridItem,
  type GridProps as BaseGridProps,
} from "@chakra-ui/react";

export type GridProps = BaseGridProps;

export function Grid(props: GridProps) {
  return <BaseGrid {...props} />;
}

Grid.Item = BaseGridItem;
