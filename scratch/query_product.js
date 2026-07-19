const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Querying a product...");
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (pError) {
    console.error("Error querying products:", pError);
  } else {
    console.log("Product columns:", products.length > 0 ? Object.keys(products[0]) : "No products found");
    console.log("Sample product:", products[0]);
  }

  console.log("\nQuerying categories...");
  const { data: categories, error: cError } = await supabase
    .from('categories')
    .select('*')
    .limit(5);

  if (cError) {
    console.error("Error querying categories:", cError);
  } else {
    console.log("Category sample:", categories);
  }
}

main();
