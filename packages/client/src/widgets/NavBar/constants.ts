import { BookIcon, HomeIcon, LightningIcon, SettingsIcon } from "~/shared/ui";
import type { NavBarItemProps } from "./Item";

export const navItems: NavBarItemProps[] = [
  {
    id: "nav_item_home",
    title: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    id: "nav_item_history",
    title: "History",
    href: "/history",
    icon: BookIcon,
  },
  {
    id: "nav_item_activities",
    title: "Activities",
    href: "/activities",
    icon: LightningIcon,
  },
  {
    id: "nav_item_settings",
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];
