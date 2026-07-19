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
  console.error("Missing Supabase env variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // 1. Insert Categories
  const categoriesToInsert = [
    {
      name: 'Housewarming',
      slug: 'housewarming',
      description: 'Charming and custom gifts to turn a house into a warm home.',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'
    },
    {
      name: 'Baby Shower',
      slug: 'baby-shower',
      description: 'Adorable personalized keepsakes for the little ones and new parents.',
      image_url: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=800'
    }
  ];

  for (const cat of categoriesToInsert) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .maybeSingle();

    if (!existing) {
      console.log(`Inserting category: ${cat.name}`);
      const { data, error } = await supabase
        .from('categories')
        .insert(cat)
        .select()
        .single();
      
      if (error) {
        console.error(`Error inserting category ${cat.name}:`, error);
      } else {
        console.log(`Inserted category: ${cat.name} with ID: ${data.id}`);
      }
    } else {
      console.log(`Category: ${cat.name} already exists.`);
    }
  }

  // 2. Fetch category IDs to insert sample products
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug');

  const catMap = {};
  categories.forEach(c => {
    catMap[c.slug] = c.id;
  });

  // 3. Insert sample products for Housewarming
  const housewarmingProducts = [
    {
      name: 'Custom Wooden Coaster Set',
      slug: 'custom-wooden-coaster-set',
      description: 'Set of 6 handcrafted cedar wood coasters engraved with family initials. Complete with a matching holder.',
      price: 1499,
      original_price: 1999,
      category_id: catMap['housewarming'],
      images: ['https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800'],
      tags: ['wood', 'coasters', 'housewarming', 'personalized'],
      stock: 100,
      is_featured: true,
      badge: 'Personalize',
      status: 'active'
    },
    {
      name: 'Monogrammed Welcome Mat',
      slug: 'monogrammed-welcome-mat',
      description: 'Durable coir fiber door mat customized with your family name. Heavy-duty rubber backing for longevity.',
      price: 1999,
      original_price: 2499,
      category_id: catMap['housewarming'],
      images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800'],
      tags: ['decor', 'mat', 'housewarming', 'personalized'],
      stock: 50,
      is_featured: false,
      badge: 'Bestseller',
      status: 'active'
    }
  ];

  // 4. Insert sample products for Baby Shower
  const babyShowerProducts = [
    {
      name: 'Personalized Silver Baby Rattle',
      slug: 'personalized-silver-baby-rattle',
      description: 'Sterling silver heirloom-quality rattle engraved with baby\'s initials or birthdate. A timeless baby shower gift.',
      price: 2799,
      original_price: 3499,
      category_id: catMap['baby-shower'],
      images: ['https://images.unsplash.com/photo-1515488042361-404e9250afef?w=800'],
      tags: ['baby', 'silver', 'rattle', 'keepsake'],
      stock: 35,
      is_featured: true,
      badge: 'New',
      status: 'active'
    },
    {
      name: 'Engraved Milestone Wooden Blocks',
      slug: 'engraved-milestone-wooden-blocks',
      description: 'Wooden blocks set engraved with numbers, days, weeks, months, and years to document baby\'s growth beautifully.',
      price: 1699,
      original_price: 2199,
      category_id: catMap['baby-shower'],
      images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800'],
      tags: ['baby', 'wood', 'blocks', 'milestone'],
      stock: 80,
      is_featured: true,
      badge: 'Personalize',
      status: 'active'
    }
  ];

  const allProducts = [...housewarmingProducts, ...babyShowerProducts];

  for (const prod of allProducts) {
    if (!prod.category_id) {
      console.warn(`Category slug for ${prod.name} not found, skipping.`);
      continue;
    }
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', prod.slug)
      .maybeSingle();

    if (!existing) {
      console.log(`Inserting product: ${prod.name}`);
      const { data, error } = await supabase
        .from('products')
        .insert(prod)
        .select()
        .single();
      
      if (error) {
        console.error(`Error inserting product ${prod.name}:`, error);
      } else {
        console.log(`Inserted product: ${prod.name} with ID: ${data.id}`);
      }
    } else {
      console.log(`Product: ${prod.name} already exists.`);
    }
  }

  console.log("Seeding complete!");
}

seed();
