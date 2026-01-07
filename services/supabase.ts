import { createClient } from '@supabase/supabase-js';

// Chaves configuradas diretamente para evitar erro "process is not defined" em produção
const supabaseUrl = 'https://ktctqqtfgoghrihxhorn.supabase.co';
// Chave 'anon' / 'public' do projeto Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y3RxcXRmZ29naHJpaHhob3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzI2NjgsImV4cCI6MjA4Mjk0ODY2OH0.ZlRV8V-MdNJ8BsR8BNwfKJe02nFbjNZt8a84LRA0FGU';

export const supabase = createClient(supabaseUrl, supabaseKey);