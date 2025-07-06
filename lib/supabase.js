import { createClient } from '@supabase/supabase-js'

// Get these from Supabase Dashboard → Settings → API
const supabaseUrl = 'https://dvpxrybauvofgxurvtai.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cHhyeWJhdXZvZmd4dXJ2dGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTAxNDMsImV4cCI6MjA2NzE2NjE0M30.E9x6KslOwWxXd8IBeWpWdR8QAE2uMdSW6LOxzmlet6E' // Copy from Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
