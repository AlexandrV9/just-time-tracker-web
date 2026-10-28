import { useRouterState } from "@tanstack/react-router";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  ChartLineIcon,
  CheckIcon,
  ClockIcon,
  Calendar2Icon,
  Flex,
  LightningIcon,
  Text,
  TimerDial,
  OrbitDecoration,
} from "~/shared/ui";

const timelineSegments = [
  { flex: 1, bg: "appPrimary.solid" },
  { flex: 0.15, bg: "appSecondary.hover" },
  { flex: 1, bg: "appPrimary.solid" },
  { flex: 0.15, bg: "appSecondary.hover" },
  { flex: 0.55, bg: "appAccent.text" },
] as const;

export function AuthStory() {
  const { t } = useTranslation();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const variant = pathname.startsWith("/signup")
    ? "signUp"
    : pathname.startsWith("/recover-account")
      ? "recover"
      : "signIn";

  return (
    <Box
      as="aside"
      minW="0"
      py="14px"
      pb="18px"
      display={{ base: "none", lg: "block" }}
    >
      <Flex
        as="p"
        display="inline-flex"
        align="center"
        gap="7px"
        px="11px"
        py="6px"
        border="1px solid"
        borderColor="appAccent.borderSoft"
        borderRadius="99px"
        color="appAccent.text"
        bg="appAccent.chipGradient"
        fontSize="10px"
        lineHeight="1.5"
        m="0"
      >
        <LightningIcon size={13} aria-hidden="true" />
        {t(`pages.auth.${variant}.eyebrow`)}
      </Flex>

      <Text
        as="h2"
        mt="23px"
        mb="0"
        fontSize={{ base: "39px", xl: "clamp(36px, 3.65vw, 48px)" }}
        fontWeight="600"
        lineHeight="1.18"
        letterSpacing="-0.055em"
        textWrap="balance"
      >
        {t(`pages.auth.${variant}.title`)}
        <Text
          as="span"
          display="block"
          bg="appAccent.titleGradient"
          backgroundClip="text"
          color="transparent"
          css={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t(`pages.auth.${variant}.accent`)}
        </Text>
      </Text>

      <Text
        mt="20px"
        maxW="370px"
        color="appMuted.text"
        fontSize="13px"
        lineHeight="1.9"
        textWrap="pretty"
      >
        {t(`pages.auth.${variant}.description`)}
      </Text>

      <Box
        aria-hidden="true"
        position="relative"
        w="min(100%, 370px)"
        mt="28px"
        py="48px"
        px={{ base: "22px", xl: "28px" }}
        isolation="isolate"
        _before={{
          content: '""',
          zIndex: -1,
          position: "absolute",
          pointerEvents: "none",
          inset: "-40px -70px -25px",
          bg: "appAccent.spotlight",
        }}
      >
        <Box position="absolute" inset="2px -15px -8px" zIndex={-1}>
          <OrbitDecoration
            style={{
              position: "absolute",
              top: "50%",
              left: "56%",
              width: "88%",
              height: "auto",
              maxWidth: "none",
              aspectRatio: "1",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Box>

        <Box
          position="relative"
          border="1px solid"
          borderColor="appMuted.border"
          borderRadius="17px"
          bg="appSecondary.cardGradient"
          px="20px"
          pt="18px"
          pb="15px"
          boxShadow="appSecondary.cardShadow"
          transform="rotate(-5deg)"
        >
          <Flex align="center" gap="7px" fontSize="10px" color="appAccent.text">
            <ClockIcon size={14} />
            <Text as="span" fontSize="inherit">
              {t("pages.auth.focus")}
            </Text>
            <Box
              w="5px"
              h="5px"
              bg="appSuccess.solid"
              borderRadius="50%"
              ml="auto"
              boxShadow="appSuccess.dotShadow"
            />
          </Flex>

          <TimerDial
            compact
            title={t("pages.auth.activity")}
            time="00:42:18"
            label={t("pages.auth.focus")}
            caption={t("pages.auth.focusCaption")}
            progress={68}
          />

          <Flex gap="4px" h="6px" mt="10px">
            {timelineSegments.map((segment, index) => (
              <Box
                key={index}
                flex={segment.flex}
                bg={segment.bg}
                borderRadius="2px"
              />
            ))}
          </Flex>

          <Flex
            justify="space-between"
            color="appMuted.subtle"
            fontSize="7px"
            mt="5px"
          >
            <Text as="span" fontSize="inherit">
              09:00
            </Text>
            <Text as="span" fontSize="inherit">
              10:00
            </Text>
            <Text as="span" fontSize="inherit">
              11:00
            </Text>
          </Flex>
        </Box>

        <Flex
          align="center"
          gap="9px"
          position="absolute"
          right={{ base: "-8px", xl: "-15px" }}
          bottom="28px"
          px="16px"
          py="12px"
          border="1px solid"
          borderColor="appMuted.borderSoft"
          borderRadius="9px"
          bg="appSecondary.chipGradient"
          boxShadow="appSecondary.chipShadow"
          transform="rotate(4deg)"
        >
          <Flex
            as="span"
            align="center"
            justify="center"
            w="27px"
            h="27px"
            borderRadius="50%"
            color="appSuccess.solid"
            bg="appSecondary.hoverSoft"
            border="1px solid"
            borderColor="appInfo.border"
          >
            <CheckIcon size={15} />
          </Flex>
          <Box>
            <Text
              as="strong"
              display="block"
              color="appAccent.text"
              fontSize="10px"
              fontWeight="500"
            >
              {t("pages.auth.progressTitle")}
            </Text>
            <Text
              as="small"
              display="block"
              mt="3px"
              color="appMuted.text"
              fontSize="8px"
            >
              {t("pages.auth.progressCaption")}
            </Text>
          </Box>
        </Flex>

        <Text
          as="span"
          position="absolute"
          top="5px"
          right="-5px"
          color="appAccent.text"
          fontSize="34px"
          lineHeight="1"
          textShadow="appAccent.textShadow"
        >
          ✧
        </Text>
      </Box>

      <Flex
        wrap="wrap"
        align="center"
        gap={{ base: "13px", xl: "20px" }}
        mt="30px"
        color="appMuted.text"
        fontSize="10px"
      >
        <Flex as="span" align="center" gap="6px">
          <Box as="span" color="appAccent.text">
            <ClockIcon size={15} aria-hidden="true" />
          </Box>
          {t("pages.auth.timer")}
        </Flex>
        <Flex as="span" align="center" gap="6px">
          <Box as="span" color="appAccent.text">
            <Calendar2Icon size={15} aria-hidden="true" />
          </Box>
          {t("pages.auth.plan")}
        </Flex>
        <Flex as="span" align="center" gap="6px">
          <Box as="span" color="appAccent.text">
            <ChartLineIcon size={15} aria-hidden="true" />
          </Box>
          {t("pages.auth.analytics")}
        </Flex>
      </Flex>
    </Box>
  );
}
