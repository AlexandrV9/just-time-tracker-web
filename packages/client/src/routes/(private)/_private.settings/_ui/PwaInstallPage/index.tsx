import { LuChevronDown } from "react-icons/lu";
import { useTranslation } from "~/shared/hooks";
import { Accordion, BackButton, Box, Flex, Stack, Text } from "~/shared/ui";
import { useHeaderLeftContent } from "~/widgets";
import { pwaInstallSections, type PwaInstallStepImage } from "./constants";

type InstructionStepProps = {
  description: string;
  image?: string;
  images?: PwaInstallStepImage[];
  imageAlt: string;
  stepLabel: string;
  getCaption: (captionKey: string) => string;
};

const StepImages = ({
  image,
  images,
  imageAlt,
  getCaption,
}: Pick<
  InstructionStepProps,
  "image" | "images" | "imageAlt" | "getCaption"
>) => {
  if (images?.length) {
    return (
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap="0.75rem"
        alignItems="stretch"
      >
        {images.map((item) => (
          <Stack.VStack
            key={item.image}
            alignItems="stretch"
            gap="0.35rem"
            flex={1}
          >
            <Text textStyle="xs" fontWeight="medium" color="fg.muted">
              {getCaption(item.captionKey)}
            </Text>
            <Box
              borderRadius="lg"
              border="1px solid"
              borderColor="border.emphasized"
              overflow="hidden"
            >
              <img
                src={item.image}
                alt={`${getCaption(item.captionKey)} — ${imageAlt}`}
                style={{ width: "100%", display: "block" }}
              />
            </Box>
          </Stack.VStack>
        ))}
      </Flex>
    );
  }

  if (!image) return null;

  return (
    <Box
      borderRadius="lg"
      border="1px solid"
      borderColor="border.emphasized"
      overflow="hidden"
    >
      <img
        src={image}
        alt={imageAlt}
        style={{ width: "100%", display: "block" }}
      />
    </Box>
  );
};

const InstructionStep = ({
  description,
  image,
  images,
  imageAlt,
  stepLabel,
  getCaption,
}: InstructionStepProps) => (
  <Stack.VStack alignItems="stretch" gap="0.75rem">
    <Text fontWeight="semibold">{stepLabel}</Text>
    <Text color="fg.muted" textStyle="sm" whiteSpace="pre-line">
      {description}
    </Text>
    <StepImages
      image={image}
      images={images}
      imageAlt={imageAlt}
      getCaption={getCaption}
    />
  </Stack.VStack>
);

export function PwaInstallPage() {
  const { t } = useTranslation();

  useHeaderLeftContent(<BackButton to="/settings" />);

  return (
    <Stack.VStack
      alignItems="stretch"
      p={4}
      w="full"
      maxW="520px"
      mx="auto"
      gap="1rem"
    >
      <Text textStyle="xl" fontWeight="bold">
        {t("pages.settings.pwaInstall.title")}
      </Text>

      <Accordion.Root collapsible w="full">
        {pwaInstallSections.map((section) => {
          const PlatformIcon = section.icon;

          return (
            <Accordion.Item
              key={section.value}
              value={section.value}
              border="none"
              borderBottom="1px solid"
              borderColor="border.emphasized"
            >
              <Accordion.ItemTrigger
                px={0}
                py="1rem"
                _hover={{ bg: "transparent" }}
              >
                <Flex
                  w="full"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                >
                  <Flex alignItems="center" gap={2} flex={1} minW={0}>
                    <Box flexShrink={0}>
                      <PlatformIcon size={20} />
                    </Box>
                    <Text textStyle="md" fontWeight="medium" textAlign="left">
                      {t(section.titleKey)}
                    </Text>
                  </Flex>
                  <Accordion.ItemIndicator
                    color="fg.muted"
                    display="inline-flex"
                  >
                    <LuChevronDown size={18} />
                  </Accordion.ItemIndicator>
                </Flex>
              </Accordion.ItemTrigger>

              <Accordion.ItemContent>
                <Accordion.ItemBody px={0} pt={0} pb="1rem">
                  <Stack.VStack alignItems="stretch" gap="1.5rem">
                    {section.steps.map((step, index) => (
                      <InstructionStep
                        key={step.translationKey}
                        stepLabel={t("pages.settings.pwaInstall.stepLabel", {
                          step: index + 1,
                        })}
                        description={t(step.translationKey)}
                        image={step.image}
                        images={step.images}
                        imageAlt={t("pages.settings.pwaInstall.stepLabel", {
                          step: index + 1,
                        })}
                        getCaption={t}
                      />
                    ))}
                  </Stack.VStack>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </Stack.VStack>
  );
}
