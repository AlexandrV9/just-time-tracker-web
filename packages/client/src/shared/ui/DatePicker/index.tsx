import BaseDatePicker from "react-datepicker";
// Ananlog - react-day-picker
// https://daypicker.dev/start

import { ru } from "date-fns/locale";

import { Input, Box } from "@chakra-ui/react";

import "react-datepicker/dist/react-datepicker.css";

interface ChakraDatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}

// https://reactdatepicker.com/
export const DatePicker = ({
  label,
  value,
  onChange,
}: ChakraDatePickerProps) => {
  return (
    <div>
      {label && <label>{label}</label>}
      <Box>
        <BaseDatePicker
          locale={ru}
          selected={value}
          onChange={(date) => {
            console.log(date);
            onChange(date);
          }}
          customInput={
            <Input
              variant="outline"
              size="lg"
              _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
            />
          }
          dateFormat="dd/MM/yyyy"
          showPopperArrow={false}
          popperPlacement="bottom-start"
        />
      </Box>
    </div>
  );
};
