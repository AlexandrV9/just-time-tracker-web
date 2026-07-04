import { ChipIcon, MoonIcon, Select, SunIcon } from "~/shared/ui";

import { THEMES, useTheme, type Theme } from "~/shared/theme";
import { useCallback, type ReactNode } from "react";
import { createListCollection } from "~/shared/utils";

const themeListCollection = createListCollection({
  items: Object.keys(THEMES).map((item) => ({ label: item, value: item })),
});

const themeIconList: Record<Theme, ReactNode> = {
  dark: <MoonIcon />,
  light: <SunIcon />,
  system: <ChipIcon />,
};

export type ThemeSwitcherProps = Record<string, never>;

export const ThemeSwitcher = () => {
  const { theme: currentTheme, changeTheme } = useTheme();

  const handleChangeTheme = useCallback(
    (theme: Theme) => {
      changeTheme(theme);
    },
    [changeTheme],
  );

  return (
    <Select.Root
      value={[currentTheme]}
      collection={themeListCollection}
      onValueChange={(e) => handleChangeTheme(e.value[0] as Theme)}
      width="40px"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger
          p={0}
          cursor="pointer"
          justifyContent="center"
          borderRadius={12}
          _hover={{ cursor: "pointer", bg: "bg.muted" }}
        >
          <Select.ValueText color="fg" fontWeight="semibold">
            {themeIconList[currentTheme]}
          </Select.ValueText>
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {themeListCollection.items.map(({ label, value }) => (
            <Select.Item
              item={label}
              key={value}
              color="fg"
              _hover={{ cursor: "pointer" }}
              maxWidth="32px"
              maxHeight="32px"
            >
              {themeIconList[value as Theme]}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
};
