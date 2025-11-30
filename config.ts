// Read from environment variables (set in .env file)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Backend URL (FastAPI)
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';