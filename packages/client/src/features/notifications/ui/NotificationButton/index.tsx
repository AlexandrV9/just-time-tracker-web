import { Popover } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { useTranslation } from "~/shared/hooks";
import {
  Accordion,
  BellIcon,
  Box,
  CloseIcon,
  EmptyBox,
  EmptyState,
  Flex,
  IconButton,
  ScrollArea,
  Stack,
  Text,
} from "~/shared/ui";
import type { Notification, NotificationStatus } from "./types";
import { notificationStatusConfig, triggerButtonProps } from "./constants";

function NotificationStatusIcon({ status }: { status: NotificationStatus }) {
  const { Icon, color } = notificationStatusConfig[status];

  return (
    <Flex as="span" color={color} flexShrink={0} display="inline-flex">
      <Icon size={20} />
    </Flex>
  );
}

export const NotificationButton = () => {
  const { t } = useTranslation();

  const notifications: Notification[] = [];

  return (
    <Popover.Root positioning={{ placement: "bottom-end", gutter: 8 }}>
      <Popover.Trigger asChild>
        <IconButton aria-label="Notifications" {...triggerButtonProps}>
          <BellIcon />
        </IconButton>
      </Popover.Trigger>
      <Popover.Positioner style={{ zIndex: 10 }}>
        <Popover.Content
          display="flex"
          flexDirection="column"
          gap="0.5rem"
          w="calc(100vw - 2rem)"
          maxW="320px"
          p="0.8rem"
          pr="0.3rem"
          border="1px solid"
          borderColor="border.emphasized"
          borderRadius="12px"
          bg="bg.subtle"
          sm={{ w: "320px" }}
        >
          <Text color="fg" textStyle="lg" fontWeight="medium">
            {t("features.notifications.title")}
          </Text>
          <Box
            height="1px"
            width="calc(100% - 0.5rem)"
            bg="border.emphasized"
          />
          <ScrollArea.Root maxH="300px" overflow="hidden" size="xs">
            <ScrollArea.Viewport>
              {notifications.length === 0 ? (
                <EmptyState.Root py={6}>
                  <EmptyState.Content>
                    <EmptyState.Indicator>
                      <EmptyBox size={60} />
                    </EmptyState.Indicator>
                    <Stack.VStack textAlign="center">
                      <EmptyState.Title>
                        {t("features.notifications.empty")}
                      </EmptyState.Title>
                      <EmptyState.Description>
                        {t("features.notifications.emptyDescription")}
                      </EmptyState.Description>
                    </Stack.VStack>
                  </EmptyState.Content>
                </EmptyState.Root>
              ) : (
                <Accordion.Root
                  collapsible
                  display="flex"
                  flexDirection="column"
                  gap="0.5rem"
                  pr={2}
                >
                  {notifications.map(({ id, title, description, status }) => (
                    <Accordion.Item
                      key={id}
                      value={id}
                      border="none"
                      p={2}
                      bg="bg.muted"
                      borderRadius="8px"
                    >
                      <Accordion.ItemTrigger
                        px={0}
                        py={0}
                        _hover={{ bg: "transparent", cursor: "pointer" }}
                      >
                        <Flex
                          w="full"
                          alignItems="center"
                          justifyContent="space-between"
                          gap={2}
                        >
                          <Flex alignItems="center" gap={2} flex={1} minW={0}>
                            <NotificationStatusIcon status={status} />
                            <Text
                              color="fg"
                              textStyle="sm"
                              fontWeight="medium"
                              truncate
                            >
                              {title}
                            </Text>
                          </Flex>
                          <Flex alignItems="center" gap={1} flexShrink={0}>
                            <Accordion.ItemIndicator
                              color="fg.muted"
                              display="inline-flex"
                            >
                              <LuChevronDown size={18} />
                            </Accordion.ItemIndicator>
                            <IconButton
                              aria-label="Dismiss notification"
                              size="sm"
                              variant="ghost"
                              borderRadius="full"
                              minW="auto"
                              h="auto"
                              p={1}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <CloseIcon size={16} />
                            </IconButton>
                          </Flex>
                        </Flex>
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Accordion.ItemBody px={0} pt={2} pb={0} pl="36px">
                          <Text color="fg.muted" textStyle="sm">
                            {description}
                          </Text>
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              )}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};
