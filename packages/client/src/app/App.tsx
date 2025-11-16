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
import { useEffect } from "react";
import { taskSyncManager } from "~/shared/services/SyncManager";

export const App = () => {
  useDisableZoom();

  useEffect(() => {
    taskSyncManager.init();
  }, []);

  return (
    <TanstackProvider>
      <ThemeProvider>
        <ChakraProvider value={chakraConfig}>
          <RouterProvider />
          <ToastContainer limit={1} />
        </ChakraProvider>
      </ThemeProvider>
    </TanstackProvider>
  );
};
