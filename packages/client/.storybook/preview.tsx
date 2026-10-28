/// <reference types="vite/client" />

import { ChakraProvider } from "@chakra-ui/react";
import type { StoryContext } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, type ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import { chakraConfig } from "../src/shared/config/chakra";
import { i18n } from "../src/shared/config/i18n";
import { isValidTheme, ThemeProvider, useTheme } from "../src/shared/theme";
import "../src/shared/styles/variable.css";

const WithQueryClient = (Story: () => ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

const WithI18next = (Story: () => ReactElement, context: StoryContext) => {
  const { locale } = context.globals;

  useEffect(() => {
    if (typeof locale === "string") {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  return (
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    </Suspense>
  );
};

const ThemeSync = ({
  theme,
  children,
}: {
  theme: string;
  children: ReactElement;
}) => {
  const { changeTheme } = useTheme();

  useEffect(() => {
    if (typeof theme === "string" && isValidTheme(theme)) changeTheme(theme);
  }, [theme, changeTheme]);

  return children;
};

const WithTheme = (Story: () => ReactElement, context: StoryContext) => {
  const maxWidth = context.parameters.containerMaxWidth ?? 420;

  return (
    <ThemeProvider>
      <ThemeSync theme={context.globals.theme}>
        <ChakraProvider value={chakraConfig}>
          <div
            style={{
              maxWidth: maxWidth === "none" ? undefined : maxWidth,
              width: maxWidth === "none" ? "100%" : undefined,
              padding: 24,
              boxSizing: "border-box",
            }}
          >
            <Story />
          </div>
        </ChakraProvider>
      </ThemeSync>
    </ThemeProvider>
  );
};

export const globalTypes = {
  locale: {
    name: "Locale",
    description: "Internationalization locale",
    toolbar: {
      icon: "globe",
      items: [
        { value: "en", title: "English" },
        { value: "ru", title: "Русский" },
        { value: "zh", title: "中文" },
      ],
      dynamicTitle: true,
    },
  },
  theme: {
    name: "Theme",
    description: "Color theme",
    toolbar: {
      icon: "mirror",
      items: [
        { value: "light", icon: "sun", title: "Light" },
        { value: "dark", icon: "moon", title: "Dark" },
        { value: "system", icon: "browser", title: "System" },
      ],
      dynamicTitle: true,
    },
  },
};

export const initialGlobals = {
  locale: "en",
  theme: "system",
};

export const decorators = [WithI18next, WithQueryClient, WithTheme];
