import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dvpxrybauvofgxurvtai.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cHhyeWJhdXZvZmd4dXJ2dGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NzY3NjQsImV4cCI6MjA1MjI1Mjc2NH0.E9x6KslOwWxXd8IBeWpWdR8QAE2uMdSW6LOxzmlet6E"

// Simple, clean config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
