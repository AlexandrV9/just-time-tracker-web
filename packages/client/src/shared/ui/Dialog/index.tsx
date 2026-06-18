import type { ComponentProps } from "react";
import { Dialog as BaseDialog } from "@chakra-ui/react";
import { Z_INDEX } from "~/shared/constants/zIndex";
import { SafeContent } from "./SafeContent";

const modalLayerStyle = { zIndex: Z_INDEX.modal } as const;

type DialogRootProps = ComponentProps<typeof BaseDialog.Root>;
type DialogRootProviderProps = ComponentProps<typeof BaseDialog.RootProvider>;

const DialogRoot = ({ placement = "center", ...props }: DialogRootProps) => (
  <BaseDialog.Root placement={placement} {...props} />
);

const DialogRootProvider = ({
  placement = "center",
  ...props
}: DialogRootProviderProps) => (
  <BaseDialog.RootProvider placement={placement} {...props} />
);

export const Dialog = Object.assign({}, BaseDialog, {
  Root: DialogRoot,
  RootProvider: DialogRootProvider,
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
