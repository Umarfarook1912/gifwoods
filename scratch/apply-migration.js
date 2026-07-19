const readline = require('readline');
const { Client } = require('pg');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt the user for password securely (masked/hidden inputs not natively simple in node without npm packages, but plain text input works perfectly in standard terminal)
rl.question('Enter your Supabase Database Password: ', (password) => {
  if (!password.trim()) {
    console.error('Password cannot be empty.');
    process.exit(1);
  }

  const connectionString = `postgresql://postgres:${encodeURIComponent(password.trim())}@db.vtjitcdljzzcyqvihcki.supabase.co:5432/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for remote Supabase Postgres connections
  });
  
  console.log('Connecting to database...');
  
  client.connect()
    .then(() => {
      console.log('Connected successfully! Running ALTER TABLE statement...');
      return client.query("ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb;");
    })
    .then(() => {
      console.log('Column "specifications" added successfully! Reloading schema cache...');
      return client.query("NOTIFY pgrst, 'reload schema';");
    })
    .then(() => {
      console.log('Schema cache reload triggered successfully!');
      client.end();
      rl.close();
      console.log('\nDatabase sync complete. You can now add products with specifications!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\nDatabase operations failed:', err.message);
      client.end();
      rl.close();
      process.exit(1);
    });
});
