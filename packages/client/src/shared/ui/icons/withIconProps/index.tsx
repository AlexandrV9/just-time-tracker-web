import cn from "clsx";

import styles from "./Icon.module.css";

export type BaseIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

export const withIconProps = <T,>(
  WrappedComponent: React.ComponentType<BaseIconProps &T>
) => {
  const Component = ({
    size = 24,
    style,
    className,
    ...props
  }: BaseIconProps &T) => {
    return (
      <WrappedComponent
        {...(props as T)}
        className={cn(styles.icon, className)}
        style={{
          ...{
            "--icon-size": `${size}px`,
          },
          ...style,
        }}
        {...props}
      />
    );
  };

  return Component;
};
