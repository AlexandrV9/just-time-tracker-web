import {
  BookmarkIcon,
  Calendar2Icon,
  HomeIcon,
  SettingsIcon,
} from "~/shared/ui";
import type { NavItemProps } from "./types";

export const navItems: NavItemProps[] = [
  {
    id: "nav_item_setting",
    title: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    id: "nav_item_tasks",
    title: "Tasks",
    href: "/tasks",
    icon: Calendar2Icon,
  },
  {
    id: "nav_item_notes",
    title: "Notes",
    href: "/notes",
    icon: BookmarkIcon,
  },
  {
    id: "nav_item_more",
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];
