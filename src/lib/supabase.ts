import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection on initialization
supabase.from('agents').select('*').limit(1)
  .then(() => {
    console.log('Supabase connection successful');
  })
  .catch((error) => {
    console.error('Supabase connection error:', error);
  }); 