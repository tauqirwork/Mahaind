import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hmlwigaejtwcyxttlevp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbHdpZ2FlanR3Y3l4dHRsZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzA2MDUsImV4cCI6MjA5MjAwNjYwNX0.HIll-46jFjtqTlEBIriGQKRtNNhaA9DVfgusGmTfEZA';

// Only warn if they are missing and we are not in placeholder mode
if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn("⚠️ Supabase Credentials missing! Running in Mock Mode. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
