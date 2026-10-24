import React, { useRef } from "react";
import clsx from "clsx";

import styles from "./SpotlightCard.module.css";
import { Box, type BoxProps } from "~/shared/ui";

export interface SpotlightCardProps extends BoxProps {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.25)",
}: SpotlightCardProps) => {
  const boxRef = useRef<HTMLDivElement>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!boxRef.current) return;

    const rect = boxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    boxRef.current.style.setProperty("--mouse-x", `${x}px`);
    boxRef.current.style.setProperty("--mouse-y", `${y}px`);
    boxRef.current.style.setProperty("--spotlight-color", spotlightColor);
  };

  return (
    <Box
      ref={boxRef}
      onMouseMove={handleMouseMove}
      className={clsx(styles.container, className)}
    >
      {children}
    </Box>
  );
};

export default SpotlightCard;
