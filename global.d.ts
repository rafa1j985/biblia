export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
      [key: string]: string | undefined;
    }
  }
}
