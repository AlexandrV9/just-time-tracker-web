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
        <Toast {...props} {...options}>
          {content}
        </Toast>
      ),
      {
        ...defaultOptions,
        ...options,
      }
    );
  };

const Toast = ({
  closeToast,
  children,
}: ToastContentProps & { children: React.ReactNode }) => {
  return (
    <div className={styles.toast}>
      <Text fontSize="md" className={styles.message}>
        {children}
      </Text>
      <CloseButton
        variant="subtle"
        size="xs"
        onClick={closeToast}
        className={styles.closeButton}
      />
    </div>
  );
};

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
