import type { ComponentProps } from "react";
import { Dialog as BaseDialog } from "@chakra-ui/react";
import { Z_INDEX } from "~/shared/constants/zIndex";
import { SafeContent } from "./SafeContent";

const modalLayerStyle = { zIndex: Z_INDEX.modal } as const;

export const Dialog = Object.assign({}, BaseDialog, {
  SafeContent,
  Backdrop: (props: ComponentProps<typeof BaseDialog.Backdrop>) => (
    <BaseDialog.Backdrop {...props} style={{ ...modalLayerStyle, ...props.style }} />
  ),
  Positioner: (props: ComponentProps<typeof BaseDialog.Positioner>) => (
    <BaseDialog.Positioner
      {...props}
      style={{ ...modalLayerStyle, ...props.style }}
    />
  ),
});
