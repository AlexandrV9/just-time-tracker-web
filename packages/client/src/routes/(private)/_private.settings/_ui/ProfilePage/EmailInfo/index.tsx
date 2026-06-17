import { useDialog } from "@ark-ui/react";
import { useAuthStore } from "~/features/auth";
import { EmailVerificationDialog } from "~/features/emailVerification";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Card,
  EditIcon,
  Field,
  Flex,
  IconButton,
  Input,
  Text,
} from "~/shared/ui";

const baseLocale = "pages.settings.profile";

export const EmailInfo = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const updateUserEmailDialog = useDialog();

  return (
    <>
      <Card.Root borderRadius="1rem">
        <Card.Body p="0.8rem">
          <Field.Root>
            <Field.Label color="fg">
              {t(`${baseLocale}.emailInput.label`)}
            </Field.Label>
            <Flex w="full" gap={2} align="center">
              <Input
                w="full"
                truncate
                value={user?.email ?? ""}
                placeholder={t(`${baseLocale}.emailInput.emptyPlaceholder`)}
                readOnly
                disabled
                flex={1}
              />
              <IconButton
                size="sm"
                variant="outline"
                type="button"
                onClick={() => updateUserEmailDialog.setOpen(true)}
              >
                <EditIcon size={18} />
              </IconButton>
            </Flex>
          </Field.Root>
        </Card.Body>
      </Card.Root>
      {!user?.email ? (
        <Box
          p={3}
          borderRadius="md"
          bg="bg.muted"
          borderWidth="1px"
          borderColor="border.emphasized"
        >
          <Text color="fg.muted" textStyle="sm">
            {t(`${baseLocale}.emailRecoveryWarning`)}
          </Text>
        </Box>
      ) : null}
      <EmailVerificationDialog
        dialog={updateUserEmailDialog}
        initialEmail={user?.email ?? ""}
        currentEmail={user?.email ?? ""}
      />
    </>
  );
};
