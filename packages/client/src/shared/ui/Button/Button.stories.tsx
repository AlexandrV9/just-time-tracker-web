import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flex } from "../Flex";
import { Button, IconButton } from ".";
import { MoonIcon, SunIcon } from "../icons";

const VARIANTS = [
  "solid",
  "subtle",
  "surface",
  "outline",
  "ghost",
  "plain",
  "accent",
] as const;

const SIZES = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;

const meta = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: VARIANTS,
    },
    size: {
      control: "select",
      options: SIZES,
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Button",
    variant: "solid",
    size: "md",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Accent: Story = {
  args: {
    variant: "accent",
    children: "Начать",
  },
};

export const Variants: Story = {
  render: (args) => (
    <Flex gap="12px" wrap="wrap" align="center">
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </Flex>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Flex gap="12px" wrap="wrap" align="center">
      {SIZES.map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </Flex>
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Saving",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const WithIconButton: Story = {
  render: () => (
    <Flex gap="12px" align="center">
      <IconButton aria-label="Light theme" variant="outline" size="sm">
        <SunIcon />
      </IconButton>
      <IconButton aria-label="Dark theme" variant="subtle" size="sm">
        <MoonIcon />
      </IconButton>
      <IconButton aria-label="Solid" variant="solid" size="md">
        <SunIcon />
      </IconButton>
    </Flex>
  ),
};
