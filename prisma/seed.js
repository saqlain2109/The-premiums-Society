const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting The Premiums Society Database Seeding ---');

  // 1. Admin User
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@thepremiums.in' },
    update: {},
    create: {
      name: 'The Premiums Society Admin',
      email: 'admin@thepremiums.in',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // 2. Categories
  const categoriesData = [
    {
      name: "Men's Panjabi & Kurta",
      slug: "mens-panjabi-kurta",
      description: "Luxurious embroidered, semi-formal and festive Panjabis crafted from fine cotton and silk.",
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
      displayOrder: 1,
      isActive: true,
    },
    {
      name: "Women's Sarees & Anarkalis",
      slug: "womens-sarees-anarkalis",
      description: "Timeless traditional sarees, bridal silks, and contemporary printed Anarkalis.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      displayOrder: 2,
      isActive: true,
    },
    {
      name: "Casual Shirts & Polos",
      slug: "casual-shirts-polos",
      description: "Everyday smart-casual 100% combed cotton shirts, linens, and pique polos.",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
      displayOrder: 3,
      isActive: true,
    },
    {
      name: "Women's Kurtis & Tunics",
      slug: "womens-kurtis-tunics",
      description: "Comfortable chic everyday kurtis, digital prints, and fusion office-wear wear.",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      displayOrder: 4,
      isActive: true,
    },
    {
      name: "Festive Kids Wear",
      slug: "festive-kids-wear",
      description: "Adorable festive ethnic and party wear for boys and girls made with soft fabrics.",
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
      displayOrder: 5,
      isActive: true,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = createdCat;
  }
  console.log(`Seeded ${categoriesData.length} categories.`);

  // 3. Products with Variants and Colour-Specific Photos
  const sampleProducts = [
    {
      name: "Royal Zari Embroidered Silk Panjabi",
      slug: "royal-zari-embroidered-silk-panjabi",
      description: "Exquisite hand-worked zari embroidery on premium blended silk fabric. Features mandarin collar, concealed placket with metallic buttons, and side slit styling. Perfect for wedding receptions, Eid, and grand festive occasions.",
      categorySlug: "mens-panjabi-kurta",
      sku: "AR-PANJ-001",
      sellingPrice: 3850,
      originalPrice: 4500,
      status: "PUBLISHED",
      isFeatured: true,
      isNewArrival: true,
      mainImage: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80",
      images: [
        // Midnight Black photos
        { url: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80", colour: "Midnight Black" },
        { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80", colour: "Midnight Black" },
        { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80", colour: "Midnight Black" },
        // Royal Maroon photos
        { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80", colour: "Royal Maroon" },
        { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80", colour: "Royal Maroon" },
        // Ivory White photos
        { url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80", colour: "Ivory White" },
        { url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=900&q=80", colour: "Ivory White" },
      ],
      variants: [
        { colour: "Midnight Black", colourCode: "#111827", size: "M (40)", stock: 12, price: 3850 },
        { colour: "Midnight Black", colourCode: "#111827", size: "L (42)", stock: 18, price: 3850 },
        { colour: "Midnight Black", colourCode: "#111827", size: "XL (44)", stock: 8, price: 3950 },
        { colour: "Royal Maroon", colourCode: "#831843", size: "M (40)", stock: 15, price: 3850 },
        { colour: "Royal Maroon", colourCode: "#831843", size: "L (42)", stock: 5, price: 3850 },
        { colour: "Ivory White", colourCode: "#F8FAFC", size: "L (42)", stock: 10, price: 3850 },
      ],
    },
    {
      name: "Handwoven Banarasi Pure Katan Silk Saree",
      slug: "handwoven-banarasi-pure-silk-saree",
      description: "Authentic heritage Banarasi saree featuring intricate floral meenakari motifs across the body and heavy golden pallu. Comes with an unstitched matching designer blouse piece.",
      categorySlug: "womens-sarees-anarkalis",
      sku: "AR-SAR-002",
      sellingPrice: 7200,
      originalPrice: 8900,
      status: "PUBLISHED",
      isFeatured: true,
      isNewArrival: true,
      mainImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      images: [
        // Ruby Crimson photos
        { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80", colour: "Ruby Crimson" },
        { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80", colour: "Ruby Crimson" },
        // Emerald Green photos
        { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80", colour: "Emerald Green" },
        { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80", colour: "Emerald Green" },
        // Deep Peacock Blue photos
        { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80", colour: "Deep Peacock Blue" },
        { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80", colour: "Deep Peacock Blue" },
      ],
      variants: [
        { colour: "Ruby Crimson", colourCode: "#BE123C", size: "Free Size", stock: 8, price: 7200 },
        { colour: "Emerald Green", colourCode: "#047857", size: "Free Size", stock: 12, price: 7200 },
        { colour: "Deep Peacock Blue", colourCode: "#1E3A8A", size: "Free Size", stock: 4, price: 7400 },
      ],
    },
    {
      name: "Premium European Flax Linen Casual Shirt",
      slug: "premium-linen-slim-fit-casual-shirt",
      description: "Breathable pure European flax linen tailored with curved hem, spread collar, and mother-of-pearl buttons. Ideal for warm weather gatherings, casual meetings, and weekend outings.",
      categorySlug: "casual-shirts-polos",
      sku: "AR-SHT-003",
      sellingPrice: 1850,
      originalPrice: 2200,
      status: "PUBLISHED",
      isFeatured: false,
      isNewArrival: true,
      mainImage: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
      images: [
        // Sky Blue photos
        { url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80", colour: "Sky Blue" },
        { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80", colour: "Sky Blue" },
        // Crisp White photos
        { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80", colour: "Crisp White" },
        { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80", colour: "Crisp White" },
        // Olive Green photos
        { url: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80", colour: "Olive Green" },
        { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80", colour: "Olive Green" },
      ],
      variants: [
        { colour: "Sky Blue", colourCode: "#38BDF8", size: "M", stock: 15, price: 1850 },
        { colour: "Sky Blue", colourCode: "#38BDF8", size: "L", stock: 20, price: 1850 },
        { colour: "Sky Blue", colourCode: "#38BDF8", size: "XL", stock: 10, price: 1850 },
        { colour: "Crisp White", colourCode: "#FFFFFF", size: "M", stock: 25, price: 1850 },
        { colour: "Crisp White", colourCode: "#FFFFFF", size: "L", stock: 30, price: 1850 },
        { colour: "Olive Green", colourCode: "#4D7C0F", size: "L", stock: 8, price: 1850 },
      ],
    },
    {
      name: "Embroidered Georgette 3-Piece Salwar Suit",
      slug: "embroidered-georgette-3-piece-salwar-suit",
      description: "Heavy thread embroidery and delicate sequin detailing on premium flowy georgette. Includes printed chiffon dupatta and matching santoon trousers.",
      categorySlug: "womens-kurtis-tunics",
      sku: "AR-SUIT-004",
      sellingPrice: 4600,
      originalPrice: 5500,
      status: "PUBLISHED",
      isFeatured: true,
      isNewArrival: false,
      mainImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      images: [
        // Rose Blush photos
        { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80", colour: "Rose Blush" },
        { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", colour: "Rose Blush" },
        // Teal Green photos
        { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80", colour: "Teal Green" },
        { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80", colour: "Teal Green" },
      ],
      variants: [
        { colour: "Rose Blush", colourCode: "#FB7185", size: "M (38)", stock: 6, price: 4600 },
        { colour: "Rose Blush", colourCode: "#FB7185", size: "L (40)", stock: 9, price: 4600 },
        { colour: "Teal Green", colourCode: "#0D9488", size: "M (38)", stock: 14, price: 4600 },
        { colour: "Teal Green", colourCode: "#0D9488", size: "L (40)", stock: 3, price: 4600 },
      ],
    },
    {
      name: "Pure Cotton Pique Knit Polo Shirt",
      slug: "pure-cotton-pique-knit-polo-shirt",
      description: "Double-knit 220 GSM combed organic cotton polo with ribbed collar and embroidered brand crest. Pre-shrunk and enzyme-washed for maximum softness.",
      categorySlug: "casual-shirts-polos",
      sku: "AR-POLO-005",
      sellingPrice: 1250,
      originalPrice: 1500,
      status: "PUBLISHED",
      isFeatured: false,
      isNewArrival: true,
      mainImage: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=900&q=80",
      images: [
        // Navy Blue photos
        { url: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=900&q=80", colour: "Navy Blue" },
        { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80", colour: "Navy Blue" },
        // Burgundy photos
        { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80", colour: "Burgundy" },
        { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80", colour: "Burgundy" },
      ],
      variants: [
        { colour: "Navy Blue", colourCode: "#1E3A8A", size: "M", stock: 22, price: 1250 },
        { colour: "Navy Blue", colourCode: "#1E3A8A", size: "L", stock: 19, price: 1250 },
        { colour: "Burgundy", colourCode: "#881337", size: "M", stock: 14, price: 1250 },
        { colour: "Burgundy", colourCode: "#881337", size: "L", stock: 8, price: 1250 },
      ],
    },
    {
      name: "Handcrafted Festive Kid's Kurta Pyjama Set",
      slug: "handcrafted-festive-kids-kurta-pyjama-set",
      description: "Soft breathable cotton kurta with delicate neck embroidery paired with elasticated waist churidar pyjama. Hypoallergenic and child-friendly.",
      categorySlug: "festive-kids-wear",
      sku: "AR-KID-006",
      sellingPrice: 1650,
      originalPrice: 1950,
      status: "PUBLISHED",
      isFeatured: false,
      isNewArrival: false,
      mainImage: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80",
      images: [
        // Mustard Gold photos
        { url: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80", colour: "Mustard Gold" },
        { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80", colour: "Mustard Gold" },
        // Royal Blue photos
        { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80", colour: "Royal Blue" },
        { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80", colour: "Royal Blue" },
      ],
      variants: [
        { colour: "Mustard Gold", colourCode: "#CA8A04", size: "Age 4-5Y", stock: 10, price: 1650 },
        { colour: "Mustard Gold", colourCode: "#CA8A04", size: "Age 6-7Y", stock: 12, price: 1650 },
        { colour: "Royal Blue", colourCode: "#2563EB", size: "Age 6-7Y", stock: 7, price: 1650 },
      ],
    },
    {
      name: "Modern Kashmiri Pashmina Shawl [Draft Prototype]",
      slug: "modern-kashmiri-pashmina-shawl-draft",
      description: "Sample prototype in review. Traditional sozni needle embroidery on superfine cashmere pashmina.",
      categorySlug: "womens-sarees-anarkalis",
      sku: "AR-DRF-007",
      sellingPrice: 12500,
      originalPrice: 15000,
      status: "DRAFT", // DRAFT for testing requirement that drafts are hidden from storefront
      isFeatured: false,
      isNewArrival: false,
      mainImage: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=900&q=80",
      images: [
        { url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=900&q=80", colour: "Charcoal Grey" },
      ],
      variants: [
        { colour: "Charcoal Grey", colourCode: "#374151", size: "Standard", stock: 3, price: 12500 },
      ],
    },
  ];

  for (const p of sampleProducts) {
    const cat = categoryMap[p.categorySlug];
    if (!cat) continue;

    const createdProd = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        categoryId: cat.id,
        sku: p.sku,
        sellingPrice: p.sellingPrice,
        originalPrice: p.originalPrice,
        status: p.status,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        mainImage: p.mainImage,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: cat.id,
        sku: p.sku,
        sellingPrice: p.sellingPrice,
        originalPrice: p.originalPrice,
        status: p.status,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        mainImage: p.mainImage,
      },
    });

    // delete old variants & images to avoid duplicates on re-seed
    await prisma.productImage.deleteMany({ where: { productId: createdProd.id } });
    await prisma.productVariant.deleteMany({ where: { productId: createdProd.id } });

    // insert images
    for (let i = 0; i < p.images.length; i++) {
      const img = p.images[i];
      const imgUrl = typeof img === 'string' ? img : img.url;
      const imgColour = typeof img === 'object' ? img.colour : null;
      await prisma.productImage.create({
        data: {
          productId: createdProd.id,
          url: imgUrl,
          colour: imgColour,
          displayOrder: i,
          isMain: i === 0,
        },
      });
    }

    // insert variants
    for (const v of p.variants) {
      await prisma.productVariant.create({
        data: {
          productId: createdProd.id,
          colour: v.colour,
          colourCode: v.colourCode,
          size: v.size,
          stock: v.stock,
          price: v.price,
          sku: `${p.sku}-${v.colour.substring(0, 3).toUpperCase()}-${v.size.replace(/\s+/g, '')}`,
        },
      });
    }
  }
  console.log(`Seeded products & variants.`);

  // 4. Sample Orders
  const sampleOrders = [
    {
      orderNumber: "AR-20261028-1001",
      customerName: "Aarav Sharma",
      customerPhone: "+919820011223",
      deliveryAddress: "Flat 4B, Sunshine Towers, Senapati Bapat Marg, Lower Parel",
      city: "Mumbai",
      postalCode: "400013",
      notes: "Please call before delivery. Evening delivery preferred.",
      internalNotes: "Customer requested evening slot after 6 PM. Assigned to Blue Dart Express.",
      subtotal: 3850,
      shippingCharge: 100,
      total: 3950,
      status: "CONFIRMED",
      createdAt: new Date("2026-10-28T14:30:00Z"),
      items: [
        {
          productName: "Royal Zari Embroidered Silk Panjabi",
          productImage: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
          sku: "AR-PANJ-001",
          colour: "Midnight Black",
          size: "L (42)",
          quantity: 1,
          unitPrice: 3850,
          totalPrice: 3850,
        },
      ],
    },
    {
      orderNumber: "AR-20261029-1002",
      customerName: "Dr. Ananya Iyer",
      customerPhone: "+919876543210",
      deliveryAddress: "Villa 24, Palm Meadows, Whitefield",
      city: "Bengaluru",
      postalCode: "560066",
      notes: "Gift wrap if possible.",
      internalNotes: "Gift wrapping requested with golden ribbon.",
      subtotal: 7200,
      shippingCharge: 0,
      total: 7200,
      status: "PROCESSING",
      createdAt: new Date("2026-10-29T10:15:00Z"),
      items: [
        {
          productName: "Handwoven Banarasi Pure Silk Saree",
          productImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
          sku: "AR-SAR-002",
          colour: "Ruby Crimson",
          size: "Free Size",
          quantity: 1,
          unitPrice: 7200,
          totalPrice: 7200,
        },
      ],
    },
    {
      orderNumber: "AR-20261030-1003",
      customerName: "Rohan Verma",
      customerPhone: "+919920517851",
      deliveryAddress: "C-42, Defence Colony, Near Ring Road",
      city: "New Delhi",
      postalCode: "110024",
      notes: "Office address, deliver between 10am to 5pm.",
      internalNotes: "Standard courier dispatched via Delhivery Express.",
      subtotal: 3100,
      shippingCharge: 100,
      total: 3200,
      status: "SHIPPED",
      createdAt: new Date("2026-10-30T11:45:00Z"),
      items: [
        {
          productName: "Premium Linen Slim-Fit Casual Shirt",
          productImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
          sku: "AR-SHT-003",
          colour: "Sky Blue",
          size: "L",
          quantity: 1,
          unitPrice: 1850,
          totalPrice: 1850,
        },
        {
          productName: "Pure Cotton Pique Knit Polo Shirt",
          productImage: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=800&q=80",
          sku: "AR-POLO-005",
          colour: "Navy Blue",
          size: "L",
          quantity: 1,
          unitPrice: 1250,
          totalPrice: 1250,
        },
      ],
    },
    {
      orderNumber: "AR-20261031-1004",
      customerName: "Pooja Kulkarni",
      customerPhone: "+919920517851",
      deliveryAddress: "Apartment 6A, Koregaon Park Plaza",
      city: "Pune",
      postalCode: "411001",
      notes: "Just placed order via WhatsApp",
      internalNotes: "Awaiting customer WhatsApp payment proof or confirmation call.",
      subtotal: 4600,
      shippingCharge: 0,
      total: 4600,
      status: "PENDING",
      createdAt: new Date("2026-10-31T09:20:00Z"),
      items: [
        {
          productName: "Embroidered Georgette 3-Piece Salwar Suit",
          productImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
          sku: "AR-SUIT-004",
          colour: "Teal Green",
          size: "M (38)",
          quantity: 1,
          unitPrice: 4600,
          totalPrice: 4600,
        },
      ],
    },
  ];

  for (const o of sampleOrders) {
    const existingOrder = await prisma.order.findUnique({ where: { orderNumber: o.orderNumber } });
    if (!existingOrder) {
      await prisma.order.create({
        data: {
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          deliveryAddress: o.deliveryAddress,
          city: o.city,
          postalCode: o.postalCode,
          notes: o.notes,
          internalNotes: o.internalNotes,
          subtotal: o.subtotal,
          shippingCharge: o.shippingCharge,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt,
          items: {
            create: o.items,
          },
        },
      });
    }
  }
  console.log(`Seeded sample orders.`);

  // 5. Store Settings
  const storeSettingsData = {
    businessName: "The Premiums Society",
    storeLogo: "/images/logo.png",
    primaryPhone: "+919920517851",
    secondaryPhone: "+919920517851",
    defaultRecipient: "primary",
    businessEmail: "contact@thepremiums.in",
    shippingCharge: 100,
    freeShippingThreshold: 2000,
    currency: "INR",
    currencySymbol: "₹",
    storeAnnouncement: "Special Festive Offer: FREE Delivery on orders over ₹2000 across India!",
    announcementActive: true,
    facebookUrl: "https://www.instagram.com/the_premiumss?xtok=MXBtOTNoc2tiM3RxMg==",
    instagramUrl: "https://www.instagram.com/the_premiumss?xtok=MXBtOTNoc2tiM3RxMg==",
    whatsappUrl: "https://wa.me/919920517851",
    address: null,
  };

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: storeSettingsData,
    create: {
      id: "default",
      ...storeSettingsData,
    },
  });
  console.log("Seeded Store Settings.");

  // 6. Website Content
  const websiteContentData = {
    heroHeading: "Elegance Reimagined for Every Celebration",
    heroSubheading: "Explore premium handcrafted Panjabis, Banarasi Silks, Contemporary Kurtis and Casual Essentials made with supreme perfection.",
    heroImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    heroPrimaryBtnText: "Explore Collection",
    heroPrimaryBtnLink: "/shop",
    heroSecondaryBtnText: "View Festive Panjabis",
    heroSecondaryBtnLink: "/shop?category=mens-panjabi-kurta",
    announcementBar: "✨ Festive Collection 2026 is LIVE! Direct WhatsApp Order & All-India Express Delivery.",
    brandStoryTitle: "Preserving Heritage, Crafting Contemporary Luxury",
    brandStoryText: "The Premiums Society was born out of a profound admiration for Indian handloom traditions combined with modern tailored precision. Every piece in our boutique undergoes rigorous fabric selection, detailed hand-embroidery, and careful tailoring to ensure you exude unmatched elegance.",
    brandStoryImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  };

  await prisma.websiteContent.upsert({
    where: { id: "default" },
    update: websiteContentData,
    create: {
      id: "default",
      ...websiteContentData,
    },
  });
  console.log("Seeded Website Content.");

  // 7. Policies
  const policies = [
    {
      id: "privacy-policy",
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: `### Privacy Policy for The Premiums Society

At **The Premiums Society**, accessible from our online portal, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by The Premiums Society and how we use it.

#### 1. Information We Collect
When you browse or place an order via WhatsApp through The Premiums Society, we may ask you to provide certain personally identifiable information:
- Full Name
- Mobile / WhatsApp Number
- Full Delivery Address and PIN Code
- Order specifications (Size, Colour, Quantities)

#### 2. How We Use Your Information
We use the information we collect in various ways, including to:
- Process, dispatch, and deliver your clothing orders across India.
- Communicate with you via WhatsApp or phone call regarding your order confirmation and courier tracking.
- Improve our website catalogue, user experience, and customer service.
- Prevent fraudulent activities and preserve order history records.

#### 3. Data Protection & Security
We employ industry-standard security measures, password encryption, and secure database management to protect your personal details. We never sell, rent, or trade your personal information to third parties.

#### 4. Contact Us
If you have any questions or suggestions regarding our Privacy Policy, please reach out to us at:
- **Email:** contact@thepremiums.in
- **WhatsApp Helpline:** +91 9920517851
- **Secondary Helpline:** +91 9920517851`,
    },
    {
      id: "shipping-policy",
      slug: "shipping-policy",
      title: "Shipping & Delivery Policy",
      content: `### Shipping & Delivery Policy

Thank you for shopping at **The Premiums Society**! Here are the terms and conditions that constitute our Shipping Policy.

#### 1. All-India Delivery Coverage
We deliver nationwide across all pin codes in India through trusted express courier partners (e.g. Delhivery, Blue Dart, DTDC, India Post Express).

#### 2. Shipping Charges
- **Standard All-India Express:** ₹100 Flat Rate
- **Free Shipping Threshold:** Orders with a subtotal exceeding **₹2000** automatically qualify for **100% Free Nationwide Delivery**!

#### 3. Delivery Timelines
- **Metro & Major Cities:** Delivered within 2 to 3 business days following order confirmation on WhatsApp.
- **Rest of India:** Delivered within 3 to 5 business days.

#### 4. Order Confirmation & Tracking
Once you place an order on our website, our WhatsApp checkout button will generate a pre-formatted message. Our representative will confirm your delivery address and send you your unique order tracking number once dispatched.

#### 5. Payment Options
We support Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), and Direct Bank Transfer confirmed via WhatsApp.`,
    },
    {
      id: "return-policy",
      slug: "return-policy",
      title: "Return & Refund Policy",
      content: `### Return & Exchange Policy

At **The Premiums Society**, our customer satisfaction is paramount. If you are not completely satisfied with your purchase, we are here to assist you with our seamless return and size exchange policy.

#### 1. Eligibility for Return or Exchange
- Items must be requested for return/exchange within **7 days** of receiving the parcel.
- Items must be unused, unwashed, unaltered, and in the original condition with all original price tags and packaging intact.
- Items damaged due to mishandling or washed contrary to label instructions are not eligible.

#### 2. Size Exchange Process
If the size you ordered does not fit perfectly:
1. Contact us on WhatsApp (+91 9920517851) with your Order ID and photo of the item.
2. We will check available variant inventory and arrange a pickup/replacement delivery.
3. Hassle-free exchange assistance provided by our dedicated concierge.

#### 3. Defective or Wrong Item Received
If you receive a defective garment or incorrect item, please notify us within 24 hours of delivery. We will replace the item immediately with zero additional delivery fee.

#### 4. Refund Processing
If an eligible returned item cannot be replaced due to out-of-stock inventory, a full refund will be disbursed to your UPI/bank account within 3-5 business days of receiving the returned package.`,
    },
    {
      id: "terms-conditions",
      slug: "terms-conditions",
      title: "Terms and Conditions",
      content: `### Terms and Conditions

Welcome to **The Premiums Society**! By accessing this website or placing orders through our customer portal and WhatsApp channels, you agree to comply with and be bound by the following terms and conditions.

#### 1. Product Information & Pricing
- We make every effort to display the colors, fabrics, and details of our products accurately. However, slight variations may occur due to photographic lighting or monitor displays.
- Prices and availability are subject to change without prior notice. All prices are listed in Indian Rupees (₹ INR).

#### 2. Order Placement & WhatsApp Checkout
- Placing an order through our website records the order in our database and generates a detailed order message for WhatsApp.
- An order is finalized and confirmed once our sales team verifies stock and communication occurs via WhatsApp or phone (+91 9920517851 / +91 9920517851).

#### 3. Stock Availability
- Inventory is updated in real time. In the rare event that an item becomes out-of-stock after order placement, our team will inform you promptly and offer an exchange or refund.

#### 4. Intellectual Property
All content on this website, including photographs, branding, logos, and descriptions, are the intellectual property of **The Premiums Society** and may not be reproduced without written permission.`,
    },
  ];

  for (const pol of policies) {
    await prisma.policy.upsert({
      where: { slug: pol.slug },
      update: pol,
      create: pol,
    });
  }
  console.log("Seeded Policies.");

  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
