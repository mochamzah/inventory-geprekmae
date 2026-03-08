import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl.startsWith('https://')) {
    console.error("CRITICAL: Invalid NEXT_PUBLIC_SUPABASE_URL! Current value:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
