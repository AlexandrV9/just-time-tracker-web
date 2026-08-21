import { Box, Text, type BoxProps } from "~/shared/ui";

import glassStyles from "~/shared/styles/glass.module.css";

export interface MonthYearTriggerProps extends Omit<BoxProps, "children"> {
  label: string;
}

/** Кнопка-заголовок «месяц год», открывающая выбор месяца. */
export const MonthYearTrigger = ({
  label,
  ...props
}: MonthYearTriggerProps) => (
  <Box
    as="button"
    h="34px"
    w="180px"
    display="flex"
    justifyContent="center"
    alignItems="center"
    rounded="20px"
    px="1rem"
    cursor="pointer"
    _hover={{ opacity: 0.92 }}
    {...props}
    className={glassStyles.glass}
  >
    <Text textStyle="md" fontWeight="medium" textTransform="capitalize">
      {label}
    </Text>
  </Box>
);
