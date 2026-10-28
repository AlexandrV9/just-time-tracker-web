import type { SelectHTMLAttributes } from "react";
import styles from "./Design.module.css";

export function LanguageSelect({
  label,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <select className={styles.language} aria-label={label} {...props}>
      <option value="en">EN</option>
      <option value="ru">RU</option>
      <option value="zh">中文</option>
    </select>
  );
}
