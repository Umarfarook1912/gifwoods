const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('pg');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your Supabase Database Password: ', (password) => {
  if (!password.trim()) {
    console.error('Password cannot be empty.');
    process.exit(1);
  }

  const connectionString = `postgresql://postgres:${encodeURIComponent(password.trim())}@db.vtjitcdljzzcyqvihcki.supabase.co:5432/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  console.log('Connecting to remote database...');
  
  const migrationPath = path.join(__dirname, '../supabase/migrations/20260728000000_add_rbac_fields.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  client.connect()
    .then(() => {
      console.log('Connected successfully! Running migration script...');
      return client.query(sql);
    })
    .then(() => {
      console.log('Migration queries executed successfully! Reloading schema cache...');
      return client.query("NOTIFY pgrst, 'reload schema';");
    })
    .then(() => {
      console.log('Schema cache reload triggered successfully!');
      client.end();
      rl.close();
      console.log('\nDatabase sync complete. RBAC fields added!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\nDatabase operations failed:', err.message);
      client.end();
      rl.close();
      process.exit(1);
    });
});
