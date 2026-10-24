import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Link,
  List,
  ScrollArea,
  Stack,
  Text,
  type BoxProps,
} from "~/shared/ui";
import { navItems } from "../NavBar/constants";
import { useTranslation } from "~/shared/hooks";
import { useLocation } from "@tanstack/react-router";
import { AuthUser } from "~/features/auth";

import shineStyles from "~/shared/styles/shineRing.module.css";

export type SideBarProps = BoxProps;

type IndicatorRect = {
  top: number;
  height: number;
};

export const SideBar = (props: SideBarProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const [canAnimate, setCanAnimate] = useState(false);

  const activeHref = useMemo(
    () =>
      navItems.find((item) => checkIsActive(item.href, location.pathname))
        ?.href ?? null,
    [location.pathname],
  );

  useLayoutEffect(() => {
    if (!activeHref) return;

    const activeEl = itemRefs.current.get(activeHref);
    if (!activeEl) return;

    setIndicator({
      top: activeEl.offsetTop,
      height: activeEl.offsetHeight,
    });

    if (!canAnimate) {
      const id = requestAnimationFrame(() => setCanAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [activeHref, canAnimate]);

  return (
    <Box
      as="aside"
      display="flex"
      gap="0.5rem"
      flexDirection="column"
      h="full"
      {...props}
    >
      <Stack.HStack padding="0px 24px 0 12px">
        <Text
          textStyle="md"
          fontWeight="semibold"
          className={shineStyles.shineText}
        >
          Just Time Tracker
        </Text>
      </Stack.HStack>
      <ScrollArea.Root as="nav" flexGrow={1} {...props}>
        <ScrollArea.Viewport>
          <List.Root
            position="relative"
            listStyleType="none"
            justifyContent="center"
            _before={{
              content: '""',
              position: "absolute",
              left: 0,
              width: "2px",
              bg: "purple.focusRing",
              borderRadius: "12px",
              pointerEvents: "none",
              transition: canAnimate
                ? "top 0.25s ease, height 0.25s ease, opacity 0.2s ease"
                : "none",
              top: `${indicator?.top ?? 0}px`,
              height: `${indicator?.height ?? 0}px`,
              opacity: indicator ? 1 : 0,
            }}
          >
            {navItems.map((item) => {
              const isActive = checkIsActive(item.href, location.pathname);

              return (
                <List.Item
                  key={item.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.href, el);
                    else itemRefs.current.delete(item.href);
                  }}
                >
                  <Box
                    asChild
                    display="flex"
                    alignItems="center"
                    padding="12px 24px 12px 12px"
                    borderRadius="50px"
                    color={isActive ? "purple.focusRing" : "gray"}
                    _hover={{
                      color: "white",
                    }}
                    _focusVisible={{
                      color: "white",
                      outline: "none",
                    }}
                  >
                    <Link to={item.href}>
                      <Stack.HStack gap={{ base: 1, md: 1.5 }}>
                        <item.icon size={24} />
                        <Text
                          fontSize="md"
                          fontWeight="semibold"
                          lineHeight="shorter"
                        >
                          {t(`widgets.navbar.menuItems.${item.title}`)}
                        </Text>
                      </Stack.HStack>
                    </Link>
                  </Box>
                </List.Item>
              );
            })}
          </List.Root>
        </ScrollArea.Viewport>
      </ScrollArea.Root>

      <Box pt="1rem">
        <Stack.HStack>
          <AuthUser.Avatar />
          <AuthUser.Name />
        </Stack.HStack>
      </Box>
    </Box>
  );
};

function checkIsActive(href: string, path: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}
