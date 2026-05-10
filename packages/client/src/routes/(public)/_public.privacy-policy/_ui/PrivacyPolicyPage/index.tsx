import { BackButton, Box, Heading, Stack, Text } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import { useLayoutEffect } from "react";
import { useHeaderStore } from "~/widgets";

const prefix = "pages.privacyPolicy" as const;

type Section = {
  heading: string;
  body: string;
};

export function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const { setContent } = useHeaderStore();

  const sections = t(`${prefix}.sections`, {
    returnObjects: true,
  }) as Section[];

  useLayoutEffect(() => {
    setContent("left", <BackButton aria-label={t("pages.legalBackAria")} />);
  }, [setContent, t]);

  return (
    <Box w="full" maxW="720px" mx="auto" p="1rem">
      <Heading as="h1" textStyle="xl" fontWeight="semibold" m={0} mb={2}>
        {t(`${prefix}.title`)}
      </Heading>
      <Text textStyle="sm" color="fg.muted" mb={4}>
        {t(`${prefix}.updatedLabel`)}{" "}
        <Text as="span" fontWeight="medium" color="fg">
          {t(`${prefix}.updatedValue`)}
        </Text>
      </Text>
      <Text textStyle="sm" color="fg.muted" mb={4} css={{ textWrap: "pretty" }}>
        {t(`${prefix}.intro`)}
      </Text>
      <Stack gap={6}>
        {sections.map((section, index) => (
          <Stack key={`privacyPolicy-${index}`} gap={2} alignItems="stretch">
            <Heading as="h2" textStyle="sm" fontWeight="semibold" color="fg">
              {section.heading}
            </Heading>
            {section.body.split("\n\n").map((paragraph, pIdx) => (
              <Text
                key={`${index}-${pIdx}`}
                textStyle="sm"
                color="fg.muted"
                css={{ textWrap: "pretty" }}
                lineHeight="1.65"
              >
                {paragraph}
              </Text>
            ))}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
