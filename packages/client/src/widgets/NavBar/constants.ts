import { HomeIcon, LightningIcon, SettingsIcon } from "~/shared/ui";
import type { NavItemProps } from "./types";

export const navItems: NavItemProps[] = [
  {
    id: "nav_item_home",
    title: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    id: "nav_item_calendar",
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
