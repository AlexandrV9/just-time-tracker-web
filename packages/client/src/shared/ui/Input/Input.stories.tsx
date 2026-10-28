import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "../Field";
import type { ComponentProps } from "react";
import { INPUT_VARIANTS } from "./constants";
import { Input } from "./Input";

const meta = {
  title: "UI/Input",
  component: Input,
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(INPUT_VARIANTS),
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

const InputComponent = ({
  label,
  helperText,
  ...props
}: ComponentProps<typeof Input> & { label?: string; helperText?: string }) => {
  return (
    <Field.Root>
      {label && <Field.Label>{label}</Field.Label>}
      {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      <Input {...props} />
    </Field.Root>
  );
};

export const Primary: Story = {
  args: {
    variant: INPUT_VARIANTS.primary,
    placeholder: "placeholder",
  },
  render: ({ ...args }) => (
    <InputComponent {...args} label="Primary" helperText="Helper text" />
  ),
};

export const Accent: Story = {
  args: {
    variant: INPUT_VARIANTS.accent,
    placeholder: "placeholder",
  },
  render: ({ ...args }) => (
    <InputComponent {...args} label="Accent" helperText="Helper text" />
  ),
};

export const Time: Story = {
  args: {
    step: 1,
    width: "150px",
    defaultValue: "03:30:00",
    fontFamily: "Roboto Mono, monospace",
  },
  render: ({ ...args }) => (
    <InputComponent
      {...args}
      type="time"
      label="Duration"
      helperText="Hours, minutes and seconds"
    />
  ),
};

export const Password: Story = {
  args: {
    placeholder: "Enter password",
  },
  render: ({ ...args }) => (
    <Field.Root>
      <Field.Label>Password</Field.Label>
      <Field.HelperText>Toggle visibility with the eye button</Field.HelperText>
      <Input.Password {...args} />
    </Field.Root>
  ),
};
