import type { ReactNode } from "react";
import type { IconProps } from "~/shared/ui";

export type NavItemProps = {
  id: string;
  title: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
};
