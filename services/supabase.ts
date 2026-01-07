import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Substitua as strings abaixo pelas suas chaves do Supabase (Project Settings -> API)
// Se estiver usando Vite/CreateReactApp, use process.env ou import.meta.env
const supabaseUrl = process.env.SUPABASE_URL || 'https://ktctqqtfgoghrihxhorn.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y3RxcXRmZ29naHJpaHhob3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzI2NjgsImV4cCI6MjA4Mjk0ODY2OH0.ZlRV8V-MdNJ8BsR8BNwfKJe02nFbjNZt8a84LRA0FGU';

export const supabase = createClient(supabaseUrl, supabaseKey);