const getDefaultStyles = () => {
  return {
    bg: "transparent",
    color: "fg.default",
    _selected: {
      bg: "blue.500",
      color: "white",
      _hover: { bg: "blue.600" },
    },
    _today: {
      border: "2px solid",
    },
    _hover: {
      bg: "bg.muted",
      color: "fg.default",
      cursor: "pointer",
    },
    opacity: 1,
    pointerEvents: "auto" as const,
  };
};

const getDefaultNotCurrentMonthStyles = () => {
  return {
    color: "fg.muted",
    opacity: 0.7,
    pointerEvents: "auto" as const,
    _hover: {
      bg: "bg.muted",
      color: "fg.muted",
      cursor: "pointer",
    },
    _selected: {
      bg: "bg.emphasized",
      color: "white",
      _hover: { bg: "blue.600" },
    },
  };
};

const getDefaultDisabledStyles = () => {
  return {
    color: "fg.subtle",
    cursor: "not-allowed",
    opacity: 0.15,
    pointerEvents: "none" as const,
    _hover: {},
    _selected: {},
  };
};

const getDefaultHighlightedStyles = (highlightedBg = "green.600") => {
  return {
    bg: highlightedBg,
    color: "white",
    fontWeight: "bold" as const,
    _hover: {
      bg: highlightedBg,
      filter: "brightness(0.9)",
      cursor: "pointer",
    },
    _selected: {
      bg: highlightedBg,
      filter: "brightness(0.8)",
      border: "2px solid",
      borderColor: "white",
    },
  };
};

type DefaultDateCellStyles = {
  getStyles: () => Record<string, unknown>;
  getNotCurrentMonthStyles: () => Record<string, unknown>;
  getDisabledStyles: () => Record<string, unknown>;
  getHighlightedStyles: (highlightedBg?: string) => Record<string, unknown>;
};

export const defaultDateCellStyles: DefaultDateCellStyles = {
  getStyles: getDefaultStyles,
  getNotCurrentMonthStyles: getDefaultNotCurrentMonthStyles,
  getDisabledStyles: getDefaultDisabledStyles,
  getHighlightedStyles: getDefaultHighlightedStyles,
};

export type GetDefaultDateCellStylesProps = {
  isDisabled?: boolean;
  isHighlighted?: boolean;
  isCurrentMonth?: boolean;
};

export function getDefaultDateCellStyles({
  isDisabled,
  isHighlighted,
  isCurrentMonth,
}: GetDefaultDateCellStylesProps) {
  if (isDisabled) {
    return defaultDateCellStyles.getDisabledStyles();
  }

  if (isHighlighted) {
    return defaultDateCellStyles.getHighlightedStyles();
  }

  if (!isCurrentMonth) {
    return defaultDateCellStyles.getNotCurrentMonthStyles();
  }

  return defaultDateCellStyles.getStyles();
}
