import { type ReactNode } from "react";
import { List, Box, type IconProps, type BoxProps } from "~/shared/ui";
import { navItems } from "./constants";
import { NavBarItem } from "./Item";
import { useLocation } from "@tanstack/react-router";
import { useTranslation } from "~/shared/hooks";

export type NavBarItemProps = {
  children: ReactNode;
  icon: (props: IconProps) => ReactNode;
};

export interface NavBarProps extends BoxProps {
  isVertical?: boolean;
}

export function NavBar({ isVertical = false, ...props }: NavBarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <Box as="nav" p={1} {...props}>
      <List.Root
        display="grid"
        {...(isVertical
          ? {
              gridTemplateRows: `repeat(${navItems.length}, minmax(40px, 100px))`,
            }
          : {
              gridTemplateColumns: `repeat(${navItems.length}, minmax(40px, 200px))`,
            })}
        listStyleType="none"
        justifyContent="center"
      >
        {navItems.map((item) => (
          <NavBarItem
            key={item.href}
            {...item}
            title={t(`widgets.navbar.menuItems.${item.title}`)}
            isActive={checkIsActive(item.href, location.pathname)}
          />
        ))}
      </List.Root>
    </Box>
  );
}

NavBar.Item = NavBarItem;


function checkIsActive(href: string, path: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}
