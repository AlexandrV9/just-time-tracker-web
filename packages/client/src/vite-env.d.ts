/// <reference types="vite/client" />

declare module "*.PNG" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
