import { createClient } from "@supabase/supabase-js";
import fetch from "cross-fetch";

global.fetch = fetch;

// Debug Supabase Client initialization
console.log("⚡ Initializing Supabase Client...");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log which env variables exist
console.log("SUPABASE_URL exists:", !!supabaseUrl);
console.log("SUPABASE_ANON_KEY exists:", !!supabaseAnonKey);
console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceKey);

// Public client (for frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client (for backend inserts)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
