import cx from "clsx";
import {
  toast as defaultToast,
  ToastContainer as DefaultToastContainer,
  type Id,
  type ToastContainerProps,
  type ToastContentProps,
  type ToastOptions,
  type ToastContent,
} from "react-toastify";

import styles from "./ToastContainer.module.css";
import { Text } from "../Text";
import { CloseButton } from "../controls";

const defaultOptions: ToastOptions = {
  closeButton: false,
  autoClose: 4000,
  icon: false,
  hideProgressBar: true,
};

const updateToastFn =
  (method: (content: ToastContent, options?: ToastOptions) => Id) =>
  (content: React.ReactNode, options?: ToastOptions) => {
    return method(
      (props) => (
        <ToastContent {...props} {...options}>
          {content}
        </ToastContent>
      ),
      {
        ...defaultOptions,
        ...options,
      },
    );
  };

function ToastContent({
  closeToast,
  children,
}: ToastContentProps & { children: React.ReactNode }) {
  return (
    <div className={styles.toast}>
      <Text fontSize={{ base: "sm", md: "md" }} className={styles.message}>
        {children}
      </Text>
      <CloseButton
        variant="subtle"
        size="xs"
        position="static"
        onClick={closeToast}
        className={styles.closeButton}
      />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- imperative toast API alongside ToastContainer
export const toast = Object.assign(updateToastFn(defaultToast), {
  success: updateToastFn(defaultToast.success),
  error: updateToastFn(defaultToast.error),
});

export const ToastContainer = ({
  className,
  limit = 5,
  ...props
}: Omit<ToastContainerProps, "stacked">) => {
  return (
    <DefaultToastContainer
      className={cx(styles.container, className)}
      limit={limit}
      {...props}
    />
  );
};
