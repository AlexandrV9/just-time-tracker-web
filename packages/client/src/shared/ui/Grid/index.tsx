import {
  Grid as BaseGrid,
  GridItem as BaseGridItem,
  type GridProps as BaseGridProps,
} from "@chakra-ui/react";

export interface GridProps extends BaseGridProps {}

export function Grid(props: GridProps) {
  return <BaseGrid {...props} />;
}

Grid.Item = BaseGridItem;
