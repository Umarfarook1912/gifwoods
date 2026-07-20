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

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function fix() {
  console.log("=== FIXING DB PRODUCT & CATEGORY DATA ===");

  // 1. Fetch categories
  const { data: categories } = await supabase.from('categories').select('*');
  const catMap = {};
  categories.forEach(c => {
    catMap[c.slug] = c.id;
  });

  console.log("Categories Map:", catMap);

  // 2. Fix broken image URL for Silver Baby Rattle
  const newRattleImg = 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800';
  const isRattleOk = await testUrl(newRattleImg);
  console.log("New rattle image 200 OK?", isRattleOk);

  if (isRattleOk) {
    const { error: updateErr } = await supabase
      .from('products')
      .update({
        images: [newRattleImg],
        category_id: catMap['baby-shower'] || catMap['personalized']
      })
      .eq('slug', 'personalized-silver-baby-rattle');

    if (updateErr) console.error("Error updating rattle:", updateErr);
    else console.log("Updated Personalized Silver Baby Rattle image and category!");
  }

  // Update Engraved Milestone Wooden Blocks category_id to baby-shower if available
  if (catMap['baby-shower']) {
    await supabase
      .from('products')
      .update({ category_id: catMap['baby-shower'] })
      .eq('slug', 'engraved-milestone-wooden-blocks');
    console.log("Updated Engraved Milestone Wooden Blocks category to baby-shower!");
  }

  // 3. Add products for Corporate, Birthdays, Anniversary if empty so all categories have active real products
  const extraProducts = [
    {
      name: 'Custom Branded Corporate Desk Set',
      slug: 'custom-branded-corporate-desk-set',
      description: 'Luxury mahogany desk organizer set with laser engraved company logo and personalized nameplate.',
      price: 3499,
      original_price: 4299,
      category_slug: 'corporate',
      images: ['https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800'],
      tags: ['corporate', 'desk', 'engraved', 'office'],
      stock: 50,
      is_featured: true,
      badge: 'Bestseller',
      status: 'active'
    },
    {
      name: 'Custom Birthday LED Acrylic Lamp',
      slug: 'custom-birthday-led-acrylic-lamp',
      description: 'Warm ambient LED night lamp featuring custom photo laser-etched onto high clarity acrylic.',
      price: 1799,
      original_price: 2299,
      category_slug: 'birthdays',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
      tags: ['birthday', 'lamp', 'photo', 'led'],
      stock: 80,
      is_featured: true,
      badge: 'New',
      status: 'active'
    },
    {
      name: 'Personalized Couple Anniversary Keepsake',
      slug: 'personalized-couple-anniversary-keepsake',
      description: 'Handcrafted teak wood plaque with carved names, wedding anniversary date, and custom quote.',
      price: 2299,
      original_price: 2799,
      category_slug: 'anniversary',
      images: ['https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800'],
      tags: ['anniversary', 'wood', 'carving', 'keepsake'],
      stock: 60,
      is_featured: true,
      badge: 'Personalize',
      status: 'active'
    }
  ];

  for (const prod of extraProducts) {
    const catId = catMap[prod.category_slug];
    if (!catId) continue;

    const { data: existing } = await supabase.from('products').select('id').eq('slug', prod.slug).maybeSingle();
    if (!existing) {
      const { category_slug, ...prodData } = prod;
      const isImgOk = await testUrl(prodData.images[0]);
      if (isImgOk) {
        const { error } = await supabase.from('products').insert({
          ...prodData,
          category_id: catId
        });
        if (error) console.error(`Error inserting ${prod.name}:`, error);
        else console.log(`Inserted product: ${prod.name}`);
      }
    }
  }

  // 4. Update categories image_url for any null category image_url
  const categoryImageUpdates = {
    'valentine': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
    'customized-gifts': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800'
  };

  for (const [slug, imgUrl] of Object.entries(categoryImageUpdates)) {
    if (catMap[slug]) {
      await supabase.from('categories').update({ image_url: imgUrl }).eq('slug', slug);
    }
  }

  console.log("=== DB FIX COMPLETE ===");
}

fix();
