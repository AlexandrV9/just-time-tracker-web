import type { CSSProperties } from "react";
import { withIconProps } from "../withIconProps";

export type CalendarIconProps = {
  day: number;
  textFontSize?: number;
  textFontWeight?: CSSProperties["fontWeight"];
};

export const CalendarIcon = withIconProps<CalendarIconProps>(
  ({ day, textFontSize = 8, textFontWeight = 700, ...props }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        {...props}
      >
        <path
          fill="currentColor"
          d="M18 3a2 2 0 0 1 2 2v2h.191a1.5 1.5 0 0 1 1.342 2.17L20 12.237V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6.764L2.467 9.171A1.5 1.5 0 0 1 3.81 7H4V5a2 2 0 0 1 2-2zm1.382 6H4.618l1.276 2.553c.076.15.11.31.106.467V19h12v-6.98a1 1 0 0 1 .106-.467zM18 5H6v2h12z"
        />
        <text
          style={{ fontSize: textFontSize, fontWeight: textFontWeight }}
          x="12"
          y="15"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
        >
          {day}
        </text>
      </svg>
    );
  }
);
