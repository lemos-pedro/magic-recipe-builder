// Cliente para banco de dados PostgreSQL em localhost
import { createClient } from '@supabase/supabase-js';

// Configuração para usar um banco PostgreSQL local via supabase-js
// ou você pode usar uma biblioteca como 'pg' ou 'postgres' para conexão direta

const DB_URL = import.meta.env.VITE_DATABASE_URL;
const ANON_KEY = import.meta.env.VITE_ANON_KEY;

if (!DB_URL || !ANON_KEY) {
  console.warn(
    'Variáveis de banco de dados não configuradas. Usando valores de fallback para desenvolvimento local.'
  );
}

// Se usando Supabase local (supabase start)
export const supabase = createClient(
  DB_URL || 'http://localhost:54321',
  ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDMyODI4MDAsImV4cCI6MTk0OTM5MDQwMH0.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export default supabase;
