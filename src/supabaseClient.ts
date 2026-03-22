import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzwlsxghmihvvzpzlpqx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6d2xzeGdobWlodnZ6cHpscHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTE2MDksImV4cCI6MjA4OTc4NzYwOX0.x9JrY1k4vM4HY3eMre2qlJnmLEg5Zj-dzqthWkzu26o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);