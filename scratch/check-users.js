const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function main() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role');
  
  if (error) {
    console.error('Error fetching profiles:', error.message);
  } else {
    console.log('Profiles currently in DB:');
    console.log(data);
  }
}

main();
