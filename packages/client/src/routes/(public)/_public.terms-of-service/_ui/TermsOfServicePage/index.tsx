import { BackButton, Box, Heading, Stack, Text } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import { useLayoutEffect } from "react";
import { useHeaderStore } from "~/widgets";

export function TermsOfServicePage() {
  const { t } = useTranslation();
  const { setContent } = useHeaderStore();

  const sections = t(`pages.termsOfService.sections`, {
    returnObjects: true,
  }) as { title: string; description: string }[];

  useLayoutEffect(() => {
    setContent(
      "left",
      <BackButton aria-label={t("pages.termsOfService.backButton")} />,
    );
  }, [setContent, t]);

  return (
    <Box w="full" maxW="720px" mx="auto" p="1rem">
      <Heading as="h1" textStyle="xl" fontWeight="semibold" m={0} mb={2}>
        {t(`pages.termsOfService.title`)}
      </Heading>
      <Text textStyle="sm" color="fg.muted" mb={4}>
        {t(`pages.termsOfService.updatedLabel`)}{" "}
        <Text as="span" fontWeight="medium" color="fg">
          {t(`pages.termsOfService.updatedValue`)}
        </Text>
      </Text>
      <Text textStyle="sm" color="fg.muted" mb={4} css={{ textWrap: "pretty" }}>
        {t(`pages.termsOfService.intro`)}
      </Text>
      <Stack gap={6}>
        {sections.map((section, sectionIndex) => (
          <Stack
            key={`termsOfService-${sectionIndex}`}
            gap={2}
            alignItems="stretch"
          >
            <Heading as="h2" textStyle="sm" fontWeight="semibold" color="fg">
              {section.title}
            </Heading>
            {(section.description ?? "")
              .split("\n\n")
              .map((description, descriptionIndex) => (
                <Text
                  key={`termsOfService-${sectionIndex}-${descriptionIndex}`}
                  textStyle="sm"
                  color="fg.muted"
                  css={{ textWrap: "pretty" }}
                  lineHeight="1.65"
                >
                  {descriptionIndex + 1}. {description}
                </Text>
              ))}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
