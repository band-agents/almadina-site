/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where the hospital information system is served from. */
  readonly VITE_HIS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
