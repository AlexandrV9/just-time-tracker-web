import {
  createSystem,
  defaultConfig,
  defineConfig,
  type ThemingConfig,
} from "@chakra-ui/react";

const theme: ThemingConfig = {
  ...defaultConfig,
  semanticTokens: {
    ...defaultConfig.theme?.tokens,
    colors: {
      ...defaultConfig.theme?.tokens?.colors,
      // toastSuccessTextColor: { value: "var(--toast-success-color)" },
    },
  },
};

const config = defineConfig({
  cssVarsRoot: ":where(html)",
  theme,
});

export const chakraConfig = createSystem(defaultConfig, config);

export default chakraConfig;
