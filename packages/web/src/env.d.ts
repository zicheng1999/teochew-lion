interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare namespace NodeJS {
  interface ProcessEnv {
    API_BASE_URL: string;

    APP_MODE: 'development' | 'production';
    APP_TITLE: string;
    APP_DESCRIPTION: string;
    APP_VERSION: string;
  }
}
