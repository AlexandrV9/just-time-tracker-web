import { useDialog } from "@ark-ui/react";
import { UpdatePasswordDialog } from "~/features/updatePassword";
import { useTranslation } from "~/shared/hooks";
import { Card, EditIcon, Field, Flex, IconButton, Input } from "~/shared/ui";

const baseLocale = "pages.settings.profile";

export const PasswordInfo = () => {
  const { t } = useTranslation();
  const updatePasswordDialog = useDialog();

  return (
    <>
      <Card.Root borderRadius="1rem">
        <Card.Body p="0.8rem">
          <Field.Root>
            <Field.Label color="fg">
              {t(`${baseLocale}.passwordInput.label`)}
            </Field.Label>
            <Flex w="full" gap={2} align="center">
              <Input.Password
                w="full"
                flex={1}
                visible={false}
                showVisibilityButton={false}
                disabled
                readOnly
                color="fg"
                value={t(`${baseLocale}.passwordInput.placeholder`)}
              />
              <IconButton
                size="sm"
                variant="outline"
                type="button"
                onClick={() => updatePasswordDialog.setOpen(true)}
              >
                <EditIcon size={18} />
              </IconButton>
            </Flex>
          </Field.Root>
        </Card.Body>
      </Card.Root>
      <UpdatePasswordDialog dialog={updatePasswordDialog} />
    </>
  );
};
