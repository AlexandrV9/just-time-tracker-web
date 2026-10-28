import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion } from ".";

const meta = {
  title: "UI/Accordion",
  component: Accordion.Root,
} satisfies Meta<typeof Accordion.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion.Root collapsible defaultValue={["focus"]}>
      <Accordion.Item value="focus">
        <Accordion.ItemTrigger>
          Focus
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <Accordion.ItemBody>
            One activity, one timer, nothing else on the screen.
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
      <Accordion.Item value="plan">
        <Accordion.ItemTrigger>
          Plan
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <Accordion.ItemBody>
            Pick what the day is for before the timer starts.
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
      <Accordion.Item value="history">
        <Accordion.ItemTrigger>
          History
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <Accordion.ItemBody>
            See where the hours actually went.
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  ),
};
