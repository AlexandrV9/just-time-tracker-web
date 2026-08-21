import { useTranslation } from "~/shared/hooks";
import { useHeaderLeftContent } from "~/widgets";
import {
  BackButton,
  Box,
  Button,
  Card,
  CheckIcon,
  List,
  Stack,
  Text,
} from "~/shared/ui";
import {
  LangFlag,
  LANGUAGES_CONFIG,
  useLanguage,
  type Language,
} from "~/features";
import { Spinner } from "@chakra-ui/react";

export const LanguagePage = () => {
  const { t } = useTranslation();
  useHeaderLeftContent(<BackButton to="/settings" />);
  const { onChangeLang, lang: currentLang, isPending } = useLanguage();

  return (
    <Stack.VStack
      w="full"
      maxW="520px"
      mx="auto"
      p="1rem"
      gap="1rem"
      alignItems="stretch"
    >
      <Text textStyle="xs" fontWeight="semibold" color="fg.muted" px="0.5rem">
        {t("pages.settings.language.sectionTitle")}
      </Text>
      <Card.Root borderRadius="1rem">
        <Card.Body
          width="full"
          display="flex"
          flexDirection="column"
          gap="1rem"
          p="0.8rem"
        >
          <List.Root>
            {Object.entries(LANGUAGES_CONFIG).map(
              ([lang, langConfig], index) => {
                const isActive = currentLang === lang;

                return (
                  <List.Item
                    key={lang}
                    py="0.5rem"
                    listStyleType="none"
                    borderTop={index > 0 ? "1px solid" : undefined}
                    borderColor="border.emphasized"
                  >
                    <Button
                      variant="plain"
                      w="full"
                      display="flex"
                      gap="0.5rem"
                      alignItems="center"
                      justifyContent="space-between"
                      disabled={isActive}
                      bg={isActive ? "bg.subtle" : "transparent"}
                      _hover={{ bg: "bg.subtle", cursor: "pointer" }}
                      onClick={() => onChangeLang(lang)}
                    >
                      <LangFlag code={lang as Language} size={24} />
                      <Stack.VStack
                        gap="0"
                        alignItems="flex-start"
                        flexGrow={1}
                      >
                        <Text textStyle="md" fontWeight="medium">
                          {langConfig.englishName}
                        </Text>
                        <Text textStyle="sm" color="fg.muted">
                          {langConfig.nativeName}
                        </Text>
                      </Stack.VStack>
                      {lang === currentLang && isPending ? (
                        <Spinner />
                      ) : (
                        isActive && (
                          <Box flexShrink={0} asChild>
                            <CheckIcon size={20} color="purple.400" />
                          </Box>
                        )
                      )}
                    </Button>
                  </List.Item>
                );
              },
            )}
          </List.Root>
        </Card.Body>
      </Card.Root>
    </Stack.VStack>
  );
};
