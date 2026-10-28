import clsx from "clsx";
import { Button, type ButtonProps } from "../Button";
import styles from "./Design.module.css";

export function ActionButton({
  tone = "primary",
  pill = false,
  compact = false,
  className,
  ...props
}: ButtonProps & {
  tone?: "primary" | "outline" | "subtle" | "ghost";
  pill?: boolean;
  compact?: boolean;
}) {
  return (
    <Button
      className={clsx(styles.action, className)}
      data-tone={tone}
      data-pill={pill}
      data-size={compact ? "sm" : "md"}
      {...props}
    />
  );
}
