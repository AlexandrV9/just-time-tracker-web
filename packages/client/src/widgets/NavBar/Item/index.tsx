import { memo, useId, type ReactNode } from "react";
import {
  Box,
  Button,
  Link,
  List,
  Stack,
  Text,
  type IconProps,
} from "~/shared/ui";
import styles from "~/shared/styles/shineRing.module.css";

export type NavBarItemProps = {
  id: string;
  title: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
  isActive?: boolean;
};

export const NavBarItem = memo(
  ({ href, isActive, icon: Icon, title }: NavBarItemProps) => {
    const uid = useId().replace(/\W/g, "");
    const gradientId = `navIconShine_${uid}`;
    const iconWrapId = `navIconWrap_${uid}`;

    const linkContent = (
      <Link to={href}>
        <Stack.VStack gap={1}>
          {isActive ? (
            <>
              <style
                dangerouslySetInnerHTML={{
                  __html: `#${iconWrapId} svg path[fill="currentColor"]{fill:url(#${gradientId});}`,
                }}
              />
              <svg
                width={0}
                height={0}
                style={{ position: "absolute" }}
                aria-hidden
                focusable={false}
              >
                <defs>
                  <linearGradient
                    id={gradientId}
                    gradientUnits="objectBoundingBox"
                    x1="0.5"
                    y1="0"
                    x2="0.5"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8307fe" />
                    <stop offset="8%" stopColor="#8307fe" />
                    <stop offset="22%" stopColor="#7ea670" />
                    <stop offset="35%" stopColor="#63f18d" />
                    <stop offset="48%" stopColor="#7ea670" />
                    <stop offset="82%" stopColor="#8307fe" />
                    <stop offset="100%" stopColor="#8307fe" />
                    <animateTransform
                      attributeName="gradientTransform"
                      attributeType="XML"
                      type="translate"
                      from="0 -0.85"
                      to="0 1.15"
                      dur="10s"
                      repeatCount="indefinite"
                    />
                  </linearGradient>
                </defs>
              </svg>
              <span
                id={iconWrapId}
                style={{ display: "inline-flex", lineHeight: 0 }}
              >
                <Icon size={30} />
              </span>
            </>
          ) : (
            <Icon size={30} />
          )}
          <Text fontSize="xs" fontWeight="semibold">
            {title}
          </Text>
        </Stack.VStack>
      </Link>
    );

    const button = (
      <Button
        variant="ghost"
        height="auto"
        _hover={{
          bg: "transparent",
        }}
        padding={2}
        color={isActive ? "purple.focusRing" : "gray"}
      >
        {linkContent}
      </Button>
    );

    return (
      <List.Item
        alignContent="center"
        justifyContent="center"
        alignItems="center"
      >
        <Box display="flex" justifyContent="center" alignItems="center">
          {isActive ? (
            <Box display="inline-flex">
              <Box bg="bg" className={styles.shineRingInner}>
                {button}
              </Box>
            </Box>
          ) : (
            button
          )}
        </Box>
      </List.Item>
    );
  },
);
