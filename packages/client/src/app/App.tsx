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
import { ToastContainer } from "~/shared/ui";

export const App = () => {
  useDisableZoom();

  return (
    <TanstackProvider>
      <ThemeProvider>
        <ChakraProvider value={chakraConfig}>
          <RouterProvider />
          <ToastContainer limit={3} />
        </ChakraProvider>
      </ThemeProvider>
    </TanstackProvider>
  );
};
