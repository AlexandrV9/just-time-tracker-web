import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Flex, Text } from "~/shared/ui";

type TokenKind = "color" | "gradient" | "shadow";

type ColorToken = {
  name: string;
  token: string;
  kind: TokenKind;
};

type ColorGroup = {
  title: string;
  tokens: ColorToken[];
};

const appColorGroups: ColorGroup[] = [
  {
    title: "Background",
    tokens: [
      { name: "appPage.bg", token: "appPage.bg", kind: "color" },
      { name: "appSecondary.bg", token: "appSecondary.bg", kind: "color" },
      {
        name: "appSecondary.hover",
        token: "appSecondary.hover",
        kind: "color",
      },
      {
        name: "appSecondary.hoverSoft",
        token: "appSecondary.hoverSoft",
        kind: "color",
      },
      { name: "appAccent.softBg", token: "appAccent.softBg", kind: "color" },
      { name: "appMuted.hoverBg", token: "appMuted.hoverBg", kind: "color" },
      { name: "appInputAccent.bg", token: "appInputAccent.bg", kind: "color" },
      {
        name: "appInputAccent.autofillBg",
        token: "appInputAccent.autofillBg",
        kind: "color",
      },
      { name: "appPrimary.solid", token: "appPrimary.solid", kind: "color" },
      { name: "appSuccess.solid", token: "appSuccess.solid", kind: "color" },
      { name: "appInfo.solid", token: "appInfo.solid", kind: "color" },
    ],
  },
  {
    title: "Text",
    tokens: [
      { name: "appPage.fg", token: "appPage.fg", kind: "color" },
      { name: "appAccent.text", token: "appAccent.text", kind: "color" },
      { name: "appMuted.text", token: "appMuted.text", kind: "color" },
      { name: "appMuted.subtle", token: "appMuted.subtle", kind: "color" },
      {
        name: "appInputAccent.text",
        token: "appInputAccent.text",
        kind: "color",
      },
      {
        name: "appInputAccent.placeholder",
        token: "appInputAccent.placeholder",
        kind: "color",
      },
    ],
  },
  {
    title: "Border",
    tokens: [
      {
        name: "appPage.headerBorder",
        token: "appPage.headerBorder",
        kind: "color",
      },
      {
        name: "appAccent.softBorder",
        token: "appAccent.softBorder",
        kind: "color",
      },
      { name: "appAccent.border", token: "appAccent.border", kind: "color" },
      {
        name: "appAccent.borderStrong",
        token: "appAccent.borderStrong",
        kind: "color",
      },
      {
        name: "appAccent.borderSoft",
        token: "appAccent.borderSoft",
        kind: "color",
      },
      { name: "appMuted.border", token: "appMuted.border", kind: "color" },
      {
        name: "appMuted.borderSoft",
        token: "appMuted.borderSoft",
        kind: "color",
      },
      { name: "appInfo.border", token: "appInfo.border", kind: "color" },
      {
        name: "appInputAccent.border",
        token: "appInputAccent.border",
        kind: "color",
      },
      {
        name: "appInputAccent.focusBorder",
        token: "appInputAccent.focusBorder",
        kind: "color",
      },
      {
        name: "appInputAccent.invalid",
        token: "appInputAccent.invalid",
        kind: "color",
      },
    ],
  },
  {
    title: "Gradient",
    tokens: [
      {
        name: "appSecondary.cardGradient",
        token: "appSecondary.cardGradient",
        kind: "gradient",
      },
      {
        name: "appSecondary.chipGradient",
        token: "appSecondary.chipGradient",
        kind: "gradient",
      },
      {
        name: "appSecondary.formGradient",
        token: "appSecondary.formGradient",
        kind: "gradient",
      },
      {
        name: "appAccent.titleGradient",
        token: "appAccent.titleGradient",
        kind: "gradient",
      },
      {
        name: "appAccent.chipGradient",
        token: "appAccent.chipGradient",
        kind: "gradient",
      },
      {
        name: "appAccent.spotlight",
        token: "appAccent.spotlight",
        kind: "gradient",
      },
      { name: "appPage.stars", token: "appPage.stars", kind: "gradient" },
    ],
  },
  {
    title: "Shadow",
    tokens: [
      {
        name: "appSecondary.formShadow",
        token: "appSecondary.formShadow",
        kind: "shadow",
      },
      {
        name: "appSecondary.cardShadow",
        token: "appSecondary.cardShadow",
        kind: "shadow",
      },
      {
        name: "appSecondary.chipShadow",
        token: "appSecondary.chipShadow",
        kind: "shadow",
      },
      {
        name: "appAccent.textShadow",
        token: "appAccent.textShadow",
        kind: "shadow",
      },
      {
        name: "appSuccess.dotShadow",
        token: "appSuccess.dotShadow",
        kind: "shadow",
      },
    ],
  },
];

const landingColorGroups: ColorGroup[] = [
  {
    title: "Background",
    tokens: [
      { name: "landingPage.bg", token: "landingPage.bg", kind: "color" },
      {
        name: "landingSecondary.bg",
        token: "landingSecondary.bg",
        kind: "color",
      },
      {
        name: "landingSecondary.elevated",
        token: "landingSecondary.elevated",
        kind: "color",
      },
      {
        name: "landingSecondary.deep",
        token: "landingSecondary.deep",
        kind: "color",
      },
      {
        name: "landingSecondary.hover",
        token: "landingSecondary.hover",
        kind: "color",
      },
      {
        name: "landingSecondary.mutedBg",
        token: "landingSecondary.mutedBg",
        kind: "color",
      },
      {
        name: "landingPrimary.solid",
        token: "landingPrimary.solid",
        kind: "color",
      },
      {
        name: "landingPrimary.bright",
        token: "landingPrimary.bright",
        kind: "color",
      },
      {
        name: "landingPrimary.deep",
        token: "landingPrimary.deep",
        kind: "color",
      },
      {
        name: "landingSuccess.solid",
        token: "landingSuccess.solid",
        kind: "color",
      },
      {
        name: "landingInfo.solid",
        token: "landingInfo.solid",
        kind: "color",
      },
      {
        name: "landingPage.bright",
        token: "landingPage.bright",
        kind: "color",
      },
    ],
  },
  {
    title: "Text",
    tokens: [
      { name: "landingPage.fg", token: "landingPage.fg", kind: "color" },
      {
        name: "landingPage.contrastFg",
        token: "landingPage.contrastFg",
        kind: "color",
      },
      {
        name: "landingAccent.text",
        token: "landingAccent.text",
        kind: "color",
      },
      {
        name: "landingAccent.strong",
        token: "landingAccent.strong",
        kind: "color",
      },
      {
        name: "landingMuted.text",
        token: "landingMuted.text",
        kind: "color",
      },
      {
        name: "landingMuted.subtle",
        token: "landingMuted.subtle",
        kind: "color",
      },
      {
        name: "landingMuted.soft",
        token: "landingMuted.soft",
        kind: "color",
      },
    ],
  },
  {
    title: "Border",
    tokens: [
      {
        name: "landingPage.border",
        token: "landingPage.border",
        kind: "color",
      },
    ],
  },
  {
    title: "Shadow",
    tokens: [
      {
        name: "landingPage.shadow",
        token: "landingPage.shadow",
        kind: "color",
      },
    ],
  },
];

function TokenSwatch({
  token,
  surfaceBg,
  borderColor,
}: {
  token: ColorToken;
  surfaceBg: string;
  borderColor: string;
}) {
  if (token.kind === "shadow") {
    return (
      <Box
        h="56px"
        borderRadius="md"
        bg={surfaceBg}
        border="1px solid"
        borderColor={borderColor}
        boxShadow={token.token}
      />
    );
  }

  if (token.kind === "gradient") {
    return (
      <Box
        h="56px"
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
        bg={token.token}
        bgSize={token.name.endsWith("stars") ? "auto" : undefined}
      />
    );
  }

  return (
    <Box
      h="56px"
      borderRadius="md"
      border="1px solid"
      borderColor={borderColor}
      bg={token.token}
    />
  );
}

function ColorColumn({
  group,
  fg,
  muted,
  surfaceBg,
  borderColor,
}: {
  group: ColorGroup;
  fg: string;
  muted: string;
  surfaceBg: string;
  borderColor: string;
}) {
  return (
    <Flex direction="column" gap="12px" minW="180px" flex="1">
      <Text fontWeight="semibold" fontSize="sm" color={fg}>
        {group.title}
      </Text>
      {group.tokens.map((token) => (
        <Flex key={token.token} direction="column" gap="6px">
          <TokenSwatch
            token={token}
            surfaceBg={surfaceBg}
            borderColor={borderColor}
          />
          <Text fontSize="2xs" color={muted} fontFamily="mono">
            {token.name}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

function PaletteSection({
  title,
  description,
  groups,
  bg,
  fg,
  muted,
  surfaceBg,
  borderColor,
}: {
  title: string;
  description: string;
  groups: ColorGroup[];
  bg: string;
  fg: string;
  muted: string;
  surfaceBg: string;
  borderColor: string;
}) {
  return (
    <Box bg={bg} color={fg} p="8px" mb="32px">
      <Text fontSize="lg" fontWeight="semibold" mb="4px">
        {title}
      </Text>
      <Text fontSize="sm" color={muted} mb="20px">
        {description}
      </Text>
      <Flex gap="20px" align="flex-start" overflowX="auto" pb="8px">
        {groups.map((group) => (
          <ColorColumn
            key={group.title}
            group={group}
            fg={fg}
            muted={muted}
            surfaceBg={surfaceBg}
            borderColor={borderColor}
          />
        ))}
      </Flex>
    </Box>
  );
}

function ColorsPalette() {
  return (
    <Box>
      <PaletteSection
        title="App (--app-*)"
        description="Application UI tokens. Switch theme in the toolbar."
        groups={appColorGroups}
        bg="appPage.bg"
        fg="appPage.fg"
        muted="appMuted.text"
        surfaceBg="appSecondary.bg"
        borderColor="appMuted.borderSoft"
      />
      <PaletteSection
        title="Landing (--landing-*)"
        description="Marketing / landing page tokens only."
        groups={landingColorGroups}
        bg="landingPage.bg"
        fg="landingPage.fg"
        muted="landingMuted.text"
        surfaceBg="landingSecondary.bg"
        borderColor="landingPage.border"
      />
    </Box>
  );
}

const meta = {
  title: "Theme/Colors",
  component: ColorsPalette,
  parameters: {
    containerMaxWidth: "none",
    layout: "fullscreen",
  },
} satisfies Meta<typeof ColorsPalette>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ByUsage: Story = {};
