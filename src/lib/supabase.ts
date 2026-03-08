import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Anon Key is missing. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
