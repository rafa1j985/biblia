import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: As variáveis de ambiente são injetadas pelo Vite via 'define' no vite.config.ts
// O TypeScript reconhece 'process' através do arquivo global.d.ts

const supabaseUrl = process.env.SUPABASE_URL || 'https://ktctqqtfgoghrihxhorn.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_YuuYIZ3mXVKRvbQ2F5lrLQ_DjGHIB6X';

export const supabase = createClient(supabaseUrl, supabaseKey);