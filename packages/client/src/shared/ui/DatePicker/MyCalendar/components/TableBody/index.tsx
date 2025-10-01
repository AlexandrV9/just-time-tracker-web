import { SimpleGrid } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type TableBodyProps = {
  children: ReactNode;
};

export const TableBody = ({ children }: TableBodyProps) => {
  return (
    <SimpleGrid columns={7} gap={0} p={4}>
      {children}
    </SimpleGrid>
  );
};
