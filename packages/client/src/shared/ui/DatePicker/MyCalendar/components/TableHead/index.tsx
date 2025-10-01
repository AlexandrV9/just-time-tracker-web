import { SimpleGrid } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type TableHeadProps = {
  children: ReactNode;
};

export const TableHead = ({ children }: TableHeadProps) => {
  return (
    <SimpleGrid
      columns={7}
      gap={0}
      px={4}
      py={2}
      borderBottom="1px solid"
      // borderColor={borderColor}
    >
      {children}
    </SimpleGrid>
  );
};
