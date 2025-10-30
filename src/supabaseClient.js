// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zxoixayrgjxacygusyvn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b2l4YXlyZ2p4YWN5Z3VzeXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTIzNTUsImV4cCI6MjA3NDc4ODM1NX0.P3EuWzhASa-fYZLoarvVU7UDV9Ils-JMy_aDrr-9ocA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
