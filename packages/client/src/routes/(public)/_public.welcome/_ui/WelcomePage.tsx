import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Button,
  CheckCircleIcon,
  Flex,
  Link,
  List,
  Text,
} from "~/shared/ui";

const featureList = Array.from({ length: 5 });

export function WelcomePage() {
  const { t } = useTranslation();

  return (
    <Box
      padding="1rem"
      bg="bg"
      borderRadius="xl"
      width="full"
      minWidth={320}
      maxWidth={400}
    >
      <Text
        as="h1"
        textStyle="4xl"
        fontWeight="semibold"
        bg="linear-gradient(135deg, #7ea670ff 20%, #8307fe 40%, #07fe66ff 70%)"
        bgClip="text"
        mb={5}
      >
        {t("pages.welcome.title")}
      </Text>
      <Text
        color="gray.400"
        mb={2}
        css={{
          textWrap: "pretty",
          hyphens: "auto",
        }}
      >
        {t("pages.welcome.description")}
      </Text>
      <Text
        fontSize="l"
        color="gray.400"
        mb={4}
        css={{
          textWrap: "pretty",
          hyphens: "auto",
        }}
      >
        {t("pages.welcome.featureListTitle")}
      </Text>

      <List.Root listStyleType="none" gap={1.5} mb={4}>
        {featureList.map((_, index) => (
          <List.Item
            key={`featureItemList_${index}`}
            display="grid"
            gridTemplateColumns="min-content 1fr"
            color="gray.400"
          >
            <List.Indicator asChild color="green.500">
              <CheckCircleIcon size={20} />
            </List.Indicator>
            {t(`pages.welcome.featureList.${index}`)}
          </List.Item>
        ))}
      </List.Root>

      <Flex justify="center">
        <Button size="md" variant="outline" borderRadius={12}>
          <Text asChild color="purple.500" fontWeight="600">
            <Link to="/signin">{t("pages.welcome.goToSignInButton")}</Link>
          </Text>
        </Button>
      </Flex>
    </Box>
  );
}
