const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env variables in .env.local", { supabaseUrl, supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*, user:profiles(id, name, avatar_url), product:products(id, name, slug)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching reviews:", error);
    return;
  }
  
  console.log("=== APPROVED REVIEWS ===");
  console.log(reviews.filter(r => r.is_approved));
  console.log("=== ALL REVIEWS ===");
  console.log(reviews);
}

check();
