import type { ReactNode } from "react";

export type TableRowProps = {
  children: ReactNode;
};

export const TableRow = ({ children }: TableRowProps) => {
  return <tr>{children}</tr>;
};
