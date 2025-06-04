import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Kid = {
  id: string
  nickname: string
  age: number
  sex: "boy" | "girl" | "other"
  registration_number: string
  created_at: string
}
