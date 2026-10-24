import { useSearch } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useTranslation } from "~/shared/hooks";
import { useSeo } from "~/shared/seo";
import {
  Box,
  BookIcon,
  Button,
  Calendar2Icon,
  ChartLineIcon,
  ClockIcon,
  Flex,
  Grid,
  LightningIcon,
  Link,
  SettingsIcon,
  Stack,
  Text,
  type IconProps,
} from "~/shared/ui";

type FeatureCard = {
  title: string;
  body: string;
};

const FEATURE_ICONS: ComponentType<IconProps>[] = [
  ClockIcon,
  Calendar2Icon,
  BookIcon,
  ChartLineIcon,
  SettingsIcon,
];

export const LandingPage = () => {
  const { t } = useTranslation();
  const { redirect } = useSearch({ from: "/(public)/_public/landing/" });
  const redirectPath = redirect?.trim();

  useSeo({
    description: t("pages.landing.subtitle"),
    path: "/landing",
  });

  const authSearch = {
    redirect: redirectPath && redirectPath.length > 0 ? redirectPath : "/",
  };

  const features = t("pages.landing.features", {
    returnObjects: true,
  }) as FeatureCard[];

  const list = Array.isArray(features) ? features : [];

  return (
    <Box position="relative" w="full" minH="100%">
      <Flex
        direction="column"
        align="center"
        w="full"
        minH="100vh"
        pt={{ base: "1.5rem", md: "2rem" }}
        pb="3rem"
        px={{ base: "1rem", md: "1.5rem" }}
        position="relative"
        zIndex={1}
        gap={{ base: 8, md: 10 }}
      >
        <Box
          w="full"
          maxW="640px"
          p={{ base: "1.5rem", md: "2rem" }}
          borderRadius="2xl"
        >
          <Stack.VStack align="stretch" gap={5}>
            <Flex align="flex-start" gap={3}>
              <LightningIcon
                size={28}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <Stack.VStack align="stretch" gap={3}>
                <Text
                  as="h1"
                  textStyle={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                  lineHeight="1.2"
                  css={{ textWrap: "pretty" }}
                >
                  {t("pages.landing.title")}
                </Text>
                <Text
                  color="fg.muted"
                  fontSize={{ base: "md", md: "lg" }}
                  lineHeight={1.65}
                  css={{ textWrap: "pretty" }}
                >
                  {t("pages.landing.subtitle")}
                </Text>
              </Stack.VStack>
            </Flex>

            <Flex gap={3} flexWrap="wrap">
              <Link
                to="/signup"
                search={authSearch}
                style={{ textDecoration: "none" }}
              >
                <Button
                  borderRadius="xl"
                  size="md"
                  bg="fg"
                  color="bg"
                  _hover={{ opacity: 0.9 }}
                >
                  {t("pages.landing.signUpButton")}
                </Button>
              </Link>
              <Link
                to="/signin"
                search={authSearch}
                style={{ textDecoration: "none" }}
              >
                <Button variant="outline" borderRadius="xl" size="md">
                  {t("pages.landing.signInButton")}
                </Button>
              </Link>
            </Flex>
          </Stack.VStack>
        </Box>

        <Box w="full" maxW="960px" scrollMarginTop="5rem">
          <Text
            as="h2"
            textStyle="sm"
            fontWeight="semibold"
            color="fg.muted"
            mb={5}
            mt={2}
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            {t("pages.landing.featuresTitle")}
          </Text>

          <Grid
            gap={4}
            gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          >
            {list.map((item, idx) => {
              const Icon = FEATURE_ICONS[idx] ?? LightningIcon;

              return (
                <Grid.Item key={`landing-feature-${idx}`}>
                  <Box p={5} borderRadius="xl" h="full">
                    <Flex align="flex-start" gap={3}>
                      <Box flexShrink={0} mt="2px" color="fg.muted" aria-hidden>
                        <Icon size={20} />
                      </Box>
                      <Box minW={0}>
                        <Text
                          fontWeight="semibold"
                          textStyle="md"
                          mb={1.5}
                          css={{ textWrap: "pretty" }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          color="fg.muted"
                          textStyle="sm"
                          lineHeight={1.65}
                          css={{ textWrap: "pretty" }}
                        >
                          {item.body}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                </Grid.Item>
              );
            })}
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
};
