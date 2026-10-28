import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig, type Alias, type PluginOption } from "vite";
import { defineMain } from "@storybook/react-vite/node";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(root, "../src");

const APP_PLUGIN_NAMES = [
  "vite-plugin-pwa",
  "sitemap",
  "tanstack",
  "visualizer",
];

const isAppPlugin = (plugin: PluginOption): boolean => {
  if (!plugin || plugin instanceof Promise) return false;
  if (Array.isArray(plugin)) return plugin.some(isAppPlugin);

  const name = "name" in plugin ? plugin.name : "";
  return APP_PLUGIN_NAMES.some((token) => name.includes(token));
};

export default defineMain({
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: "@storybook/react-vite",
  // hide chakra-ui components
  refs: {
    "@chakra-ui/react": { disable: true },
  },
  viteFinal: async (config) => {
    const alias: Alias[] = [{ find: "~", replacement: src }];
    const current = config.resolve?.alias;

    if (Array.isArray(current)) {
      alias.unshift(...current);
    } else if (current) {
      alias.unshift(
        ...Object.entries(current).map(([find, replacement]) => ({
          find,
          replacement,
        })),
      );
    }

    config.resolve ??= {};
    config.resolve.alias = alias;
    config.plugins = config.plugins?.filter((plugin) => !isAppPlugin(plugin));

    if (config.server) config.server.open = false;

    return mergeConfig(config, {
      define: {
        "import.meta.env.VITE_STORYBOOK": JSON.stringify("true"),
      },
    });
  },
});
