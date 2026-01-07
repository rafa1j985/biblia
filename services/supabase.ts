import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Substitua as strings abaixo pelas suas chaves do Supabase (Project Settings -> API)
// Se estiver usando Vite/CreateReactApp, use process.env ou import.meta.env
const supabaseUrl = process.env.SUPABASE_URL || 'https://ktctqqtfgoghrihxhorn.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_YuuYIZ3mXVKRvbQ2F5lrLQ_DjGHIB6X';

export const supabase = createClient(supabaseUrl, supabaseKey);