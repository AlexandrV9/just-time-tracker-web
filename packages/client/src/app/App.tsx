import { ChakraProvider } from "@chakra-ui/react";

import "~/shared/config/i18n";
import "~/shared/config/axios";

import "~/shared/styles/variable.css";
import "./styles/normalize.css";
import "./styles/index.css";

// PWA IOS
import "./styles/css-ios-pwa-viewport.css";

import { ThemeProvider } from "~/shared/theme";
import { chakraConfig } from "~/shared/config";
import { TanstackProvider, RouterProvider } from "./providers";
import { useDisableZoom } from "~/shared/ui/PageLayout/useDisableZoom";

export const App = () => {
  useDisableZoom();

  return (
    <TanstackProvider>
      <ThemeProvider>
        <ChakraProvider value={chakraConfig}>
          <RouterProvider />
        </ChakraProvider>
      </ThemeProvider>
    </TanstackProvider>
  );
};
