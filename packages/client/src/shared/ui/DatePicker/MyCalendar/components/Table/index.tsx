import type { ReactNode } from "react";

export type TableProps = {
  children: ReactNode;
};

export const Table = ({ children }: TableProps) => {
  return children;
};
