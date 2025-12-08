import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjfnjbhmlzfgnxaliapu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZm5qYmhtbHpmZ254YWxpYXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjAzMjgsImV4cCI6MjA4MDc5NjMyOH0.XC5lwU3uvSNveoE4unUvXwMSuSV5sNxLVa0V9Wv727M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);