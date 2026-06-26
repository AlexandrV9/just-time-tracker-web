import type { ReactNode } from "react";
import {
  Box,
  Card,
  CheckIcon,
  CloseIcon,
  IconButton,
  Stack,
  Text,
} from "~/shared/ui";

export type SettingsCardProps = {
  title: ReactNode;
  isSaving?: boolean;
  withActions?: boolean;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
};

export const SettingsCard = ({
  title,
  withActions = true,
  isSaving,
  onCancel,
  onSave,
  children,
}: SettingsCardProps) => {
  return (
    <Card.Root borderRadius="1rem">
      <Card.Header
        p="0.8rem"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        gap="0.5rem"
        minHeight="60px"
      >
        {typeof title === "string" ? (
          <Text fontWeight="semibold" textStyle="lg" alignSelf="center">
            {title}
          </Text>
        ) : (
          title
        )}
        {withActions && (
          <Stack.HStack gap="0.5rem" flexShrink={0}>
            <IconButton
              aria-label="Cancel settings card action"
              variant="outline"
              size="xs"
              onClick={onCancel}
              disabled={isSaving}
            >
              <CloseIcon size={18} />
            </IconButton>
            <IconButton
              aria-label="Save settings card action"
              variant="outline"
              size="xs"
              onClick={onSave}
              loading={isSaving}
            >
              <CheckIcon size={18} />
            </IconButton>
          </Stack.HStack>
        )}
      </Card.Header>
      <Box h="1px" bg="border.emphasized" />
      <Card.Body display="flex" flexDirection="column" gap="1rem" p="0.8rem">
        {children}
      </Card.Body>
    </Card.Root>
  );
};
