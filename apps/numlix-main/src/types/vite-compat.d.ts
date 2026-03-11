interface ImportMetaEnv {
  [key: string]: string | undefined;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
