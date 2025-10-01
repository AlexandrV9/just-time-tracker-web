import type { ReactNode } from "react";

export type TableCellProps = {
  children: ReactNode;
  columns?: number[];
  disabled?: boolean;
};

export const TableCell = ({ children }: TableCellProps) => {
  return <td>{children}</td>;
};
