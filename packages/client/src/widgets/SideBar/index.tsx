import { useLocation } from "@tanstack/react-router";
import {
  Brand,
  Box,
  Link,
  NavigationItem,
  Text,
  type BoxProps,
} from "~/shared/ui";
import { navItems } from "../NavBar/constants";
import { useTranslation } from "~/shared/hooks";
import { AuthUser } from "~/features/auth";
import styles from "./SideBar.module.css";

export type SideBarProps = BoxProps;

export const SideBar = (props: SideBarProps) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <Box as="aside" className={styles.sidebar} {...props}>
      <Link to="/" className={styles.brand}>
        <Brand />
      </Link>
      <nav
        className={styles.navigation}
        aria-label={t("pages.dashboard.navigation")}
      >
        {navItems.map((item) => (
          <NavigationItem
            key={item.id}
            asChild
            active={
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            }
          >
            <Link
              to={item.href}
              aria-current={
                (
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                )
                  ? "page"
                  : undefined
              }
            >
              <item.icon size={18} aria-hidden="true" />
              <Text fontSize="inherit">
                {t(`widgets.navbar.menuItems.${item.title}`)}
              </Text>
            </Link>
          </NavigationItem>
        ))}
      </nav>
      <div className={styles.note} aria-hidden="true">
        <span>✧</span>
        <p>{t("pages.dashboard.sidebarNote")}</p>
      </div>
      <div className={styles.profile}>
        <AuthUser.Avatar />
        <div>
          <AuthUser.Name fontSize="sm" lineClamp={1} />
          <Link to="/settings">{t("pages.dashboard.account")}</Link>
        </div>
      </div>
    </Box>
  );
};
