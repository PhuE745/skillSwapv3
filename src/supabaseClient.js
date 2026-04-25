import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ldislvvlqazikrijaanw.supabase.co'
const supabaseKey = 'sb_publishable_UxO6p4zr4LOJXZkD6EPRaA_O5D1mWLE'

export const supabase = createClient(supabaseUrl, supabaseKey)