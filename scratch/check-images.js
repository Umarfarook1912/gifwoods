const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, status: err.message });
    });
  });
}

async function check() {
  const { data: products } = await supabase.from('products').select('id, name, images');
  console.log("=== CHECKING PRODUCT IMAGES ===");
  for (const p of products) {
    for (const img of p.images || []) {
      const res = await checkUrl(img);
      console.log(`${p.name} | ${res.status} | ${img}`);
    }
  }
  const { data: categories } = await supabase.from('categories').select('id, name, image_url');
  console.log("=== CHECKING CATEGORY IMAGES ===");
  for (const c of categories) {
    if (c.image_url) {
      const res = await checkUrl(c.image_url);
      console.log(`${c.name} | ${res.status} | ${c.image_url}`);
    }
  }
}

check();
