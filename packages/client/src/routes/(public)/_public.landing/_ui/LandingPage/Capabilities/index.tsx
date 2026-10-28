import { useTranslation } from "~/shared/hooks";
import {
  BellIcon,
  Calendar2Icon,
  ChartLineIcon,
  ClockIcon,
  Flex,
  Text,
} from "~/shared/ui";

export const Capabilities = () => {
  const { t } = useTranslation();

  return (
    <Flex
      as="ul"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      gap="1rem"
      mt="1rem"
      aria-label={t("pages.landing.design.capabilities")}
    >
      <Flex as="li" align="center" gap="0.3rem">
        <ClockIcon size={17} aria-hidden="true" />
        <Text fontSize="xs" color="landingMuted.text">
          {t("pages.landing.design.timerLabel")}
        </Text>
      </Flex>
      <Flex as="li" align="center" gap="0.3rem">
        <Calendar2Icon size={17} aria-hidden="true" />
        <Text fontSize="xs" color="landingMuted.text">
          {t("pages.landing.design.planLabel")}
        </Text>
      </Flex>
      <Flex as="li" align="center" gap="0.3rem">
        <ChartLineIcon size={17} aria-hidden="true" />
        <Text fontSize="xs" color="landingMuted.text">
          {t("pages.landing.design.insightsLabel")}
        </Text>
      </Flex>
      <Flex as="li" align="center" gap="0.3rem">
        <BellIcon size={17} aria-hidden="true" />
        <Text fontSize="xs" color="landingMuted.text">
          {t("pages.landing.design.remindersLabel")}
        </Text>
      </Flex>
    </Flex>
  );
};
