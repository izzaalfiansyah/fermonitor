const SUPABASE_URL = "https://oxmfbobxmqldgthethlz.supabase.co";
const SUPABASE_ANON_KEY= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bWZib2J4bXFsZGd0aGV0aGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjQ1NDksImV4cCI6MjAyMzY0MDU0OX0.pTDI9CsiN8wthOWhHjM1dONrRP_Hd7BcbwfKgeKGhtU";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;