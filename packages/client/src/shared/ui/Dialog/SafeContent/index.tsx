import type { DialogContentProps } from "@chakra-ui/react";
import { Dialog } from "..";

import { safeAreaStyles } from "../../SafeArea";
import clsx from "clsx";

export type SafeContentProps = DialogContentProps;

export const SafeContent = ({ className, ...props }: SafeContentProps) => {
  return (
    <Dialog.Content
      className={clsx(safeAreaStyles.container, className)}
      height="100dvh"
      {...props}
    />
  );
};
