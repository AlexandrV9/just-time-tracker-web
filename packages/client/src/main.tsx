import { createRoot } from "react-dom/client";
import { App } from "./app";

const reloadOnceOnChunkError = () => {
  const reloadKey = "chunk-reload";

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();

    if (sessionStorage.getItem(reloadKey)) {
      return;
    }

    sessionStorage.setItem(reloadKey, "1");
    window.location.reload();
  });

  window.addEventListener("load", () => {
    sessionStorage.removeItem(reloadKey);
  });
};

reloadOnceOnChunkError();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
