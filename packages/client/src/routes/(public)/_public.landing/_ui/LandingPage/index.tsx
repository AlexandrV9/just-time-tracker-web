import { useSearch } from "@tanstack/react-router";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Button,
  Flex,
  Grid,
  LightningIcon,
  Link,
  Stack,
  Text,
} from "~/shared/ui";

type FeatureCard = {
  title: string;
  body: string;
};

export const LandingPage = () => {
  const { t } = useTranslation();
  const { redirect } = useSearch({ from: "/(public)/_public/landing/" });
  const redirectPath = redirect?.trim();

  const signInSearch = {
    redirect: redirectPath && redirectPath.length > 0 ? redirectPath : "/",
  };

  const features = t("pages.landing.features", {
    returnObjects: true,
  }) as FeatureCard[];

  const list = Array.isArray(features) ? features : [];

  return (
    <Stack.VStack align="stretch" gap={10} p="1rem" mx="auto">
      <Stack.VStack align="stretch" gap={4} maxW="640px">
        <Flex alignItems="center" gap={2}>
          <LightningIcon size={32} style={{ flexShrink: 0 }} />
          <Text
            as="h1"
            textStyle="2xl"
            fontWeight="bold"
            lineHeight="1.15"
            css={{ textWrap: "pretty" }}
          >
            {t("pages.landing.title")}
          </Text>
        </Flex>

        <Text
          color="fg.muted"
          fontSize={{ base: "md", md: "lg" }}
          lineHeight={1.6}
          css={{ textWrap: "pretty" }}
        >
          {t("pages.landing.subtitle")}
        </Text>
      </Stack.VStack>
      <Box>
        <Text
          as="h2"
          textStyle="sm"
          fontWeight="bold"
          color="fg.muted"
          mb={4}
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          {t("pages.landing.featuresTitle")}
        </Text>
        <Grid
          gap={{ base: 4, md: 5 }}
          gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
          md={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          xl={{ gridTemplateColumns: "repeat(4, 1fr)" }}
        >
          {list.map((item, idx) => (
            <Grid.Item key={`landing-feature-${idx}`}>
              <Box
                p={5}
                borderRadius="2xl"
                borderWidth={1}
                borderColor="border.emphasized"
                bg="bg.subtle"
              >
                <Text fontWeight="semibold" textStyle="md" mb={2}>
                  {item.title}
                </Text>
                <Text color="fg.muted" textStyle="sm" lineHeight={1.65}>
                  {item.body}
                </Text>
              </Box>
            </Grid.Item>
          ))}
        </Grid>
      </Box>
      <Flex justify="center">
        <Button asChild variant="outline" borderRadius="xl" size="md">
          <Link to="/signin" search={signInSearch}>
            {t("pages.landing.signInPageLink")}
          </Link>
        </Button>
      </Flex>
    </Stack.VStack>
  );
};
