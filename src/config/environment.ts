// Configurações de ambiente
export const config = {
  serverUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:3001',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://pqeydpgqmkwprjnxgklj.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZXlkcGdxbWt3cHJqbnhna2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NjMzMTksImV4cCI6MjA3NDAzOTMxOX0.d8v273r_iO-ZU4E4Mn8L-BPBibvTM3V9Ie0vbMmuHSM',
  },
} as const;
