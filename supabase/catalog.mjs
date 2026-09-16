/** 50 Nova catalog products — no warehouse/supplier/threshold/reserved. */

const sizeColor = (base, sizes, colors, stocks) =>
  sizes.flatMap((size, i) =>
    colors.map((color, j) => ({
      id: `${base}-${size}-${color}`.toLowerCase().replace(/\s+/g, ''),
      size,
      color,
      sku: `${base}-${size}-${color.slice(0, 3).toUpperCase()}`,
      price: null,
      stock: stocks[(i * colors.length + j) % stocks.length],
    }))
  );

const one = (base, colors, stocks) =>
  colors.map((color, i) => ({
    id: `${base}-${color}`.toLowerCase().replace(/\s+/g, ''),
    size: 'One Size',
    color,
    sku: `${base}-${color.slice(0, 3).toUpperCase()}`,
    price: null,
    stock: stocks[i % stocks.length],
  }));

const img = (id, n, alt, primary = false) => ({
  url: `https://akqrnvrgsnofnhrhlxow.supabase.co/storage/v1/object/public/product-images/${id}/${n}.jpg`,
  alt,
  primary,
});

function P({
  id, name, sku, categoryId, price, compareAt = null, cost, stock, status = 'active',
  brand, tags, variants, rating, reviewCount, description, createdAt, updatedAt,
}) {
  return {
    id,
    name,
    sku,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    categoryId,
    price,
    compareAt,
    cost,
    stock,
    status,
    brand,
    tags,
    variants,
    rating,
    reviewCount,
    description,
    seoTitle: `${name} | Nova Store`,
    metaDescription: description.slice(0, 155),
    createdAt,
    updatedAt,
    images: [
      img(id, 1, `${name} — front`, true),
      img(id, 2, `${name} — detail`, false),
    ],
  };
}

export const products = [
  P({ id: 'prd-1001', name: 'Court Sneaker Low', sku: 'FW-CRT-001', categoryId: 'cat-sneakers', price: 129, compareAt: 149, cost: 54, stock: 42, brand: 'Nova Basics', tags: ['bestseller', 'everyday'], variants: sizeColor('FW-CRT', ['40', '41', '42', '43'], ['White', 'Navy'], [6, 5, 8, 7, 4, 5, 4, 3]), rating: 4.7, reviewCount: 186, createdAt: '2024-03-12', updatedAt: '2026-08-20', description: 'A clean leather court sneaker with a cushioned insole, extra-grip rubber cupsole and a slightly padded collar. Built for all-day wear, not just weekends.' }),
  P({ id: 'prd-1002', name: 'Classic Oversized Hoodie', sku: 'AP-HOOD-014', categoryId: 'cat-apparel', price: 68, compareAt: 85, cost: 24.5, stock: 184, brand: 'Nova Basics', tags: ['bestseller', 'fleece'], variants: sizeColor('AP-HOOD', ['S', 'M', 'L', 'XL'], ['Charcoal', 'Sand'], [22, 18, 31, 26, 29, 21, 19, 18]), rating: 4.5, reviewCount: 342, createdAt: '2024-01-08', updatedAt: '2026-08-20', description: 'Heavyweight 420gsm cotton fleece with a relaxed drop shoulder, double-lined hood and ribbed cuffs. Garment dyed so it feels lived-in from the first wear.' }),
  P({ id: 'prd-1003', name: 'Leather Minimal Wallet', sku: 'AC-WLT-007', categoryId: 'cat-accessories', price: 49, cost: 16, stock: 267, brand: 'Aldgate', tags: ['leather', 'gift'], variants: one('AC-WLT', ['Tan', 'Black', 'Espresso'], [92, 108, 67]), rating: 4.6, reviewCount: 156, createdAt: '2024-05-21', updatedAt: '2026-08-14', description: 'Full-grain vegetable-tanned leather, six card slots and a slim note pocket. Hand-finished edges keep the profile under 8mm.' }),
  P({ id: 'prd-1004', name: 'Wireless ANC Headphones', sku: 'AU-WNC-220', categoryId: 'cat-audio', price: 279, compareAt: 329, cost: 148, stock: 41, brand: 'Aurex', tags: ['bestseller', 'flagship'], variants: one('AU-WNC', ['Midnight', 'Silver'], [24, 17]), rating: 4.8, reviewCount: 489, createdAt: '2023-11-02', updatedAt: '2026-08-21', description: 'Hybrid adaptive noise cancellation, 38-hour battery, multipoint Bluetooth 5.3 and memory-foam earcups. Hard shell case included.' }),
  P({ id: 'prd-1005', name: 'Ceramic Coffee Set', sku: 'HM-CER-031', categoryId: 'cat-home', price: 89, compareAt: 110, cost: 34, stock: 76, brand: 'Terra Studio', tags: ['handmade', 'gift'], variants: one('HM-CER', ['Matte Cream', 'Slate'], [44, 32]), rating: 4.4, reviewCount: 97, createdAt: '2024-07-15', updatedAt: '2026-08-11', description: 'A four-piece stoneware set — two 280ml cups and two saucers — glazed by hand in small batches. Dishwasher and microwave safe.' }),
  P({ id: 'prd-1006', name: 'Merino Wool Crew Sweater', sku: 'AP-MER-022', categoryId: 'cat-apparel', price: 118, cost: 46, stock: 58, brand: 'Nova Basics', tags: ['wool', 'seasonal'], variants: sizeColor('AP-MER', ['S', 'M', 'L', 'XL'], ['Oat', 'Navy'], [6, 9, 11, 8, 7, 6, 6, 5]), rating: 4.5, reviewCount: 74, createdAt: '2024-09-03', updatedAt: '2026-08-18', description: 'Extra-fine 19.5 micron merino at a 12-gauge. Fully fashioned shoulders and a ribbed crew neck that holds its shape.' }),
  P({ id: 'prd-1007', name: 'Everyday Canvas Tote', sku: 'AC-TOT-011', categoryId: 'cat-accessories', price: 38, compareAt: 45, cost: 11.5, stock: 312, brand: 'Nova Basics', tags: ['canvas', 'everyday'], variants: one('AC-TOT', ['Natural', 'Olive', 'Black'], [128, 96, 88]), rating: 4.3, reviewCount: 203, createdAt: '2024-02-19', updatedAt: '2026-08-09', description: '16oz organic cotton canvas with a reinforced base, interior zip pocket and 62cm webbing handles that clear the shoulder.' }),
  P({ id: 'prd-1008', name: 'Mechanical Keyboard 75%', sku: 'TC-KBD-075', categoryId: 'cat-tech', price: 159, compareAt: 189, cost: 71, stock: 9, brand: 'Keystone', tags: ['bestseller', 'desk'], variants: one('TC-KBD', ['Graphite', 'Ivory'], [4, 5]), rating: 4.7, reviewCount: 268, createdAt: '2024-04-27', updatedAt: '2026-08-20', description: 'Gasket-mounted aluminium 75% board with hot-swap sockets, a rotary encoder and pre-lubed linear switches. QMK and VIA ready.' }),
  P({ id: 'prd-1009', name: 'Trail Shell Jacket', sku: 'OW-TRJ-005', categoryId: 'cat-outerwear', price: 149, compareAt: 199, cost: 62, stock: 0, brand: 'Ridgeline', tags: ['waterproof', 'seasonal'], variants: sizeColor('OW-TRJ', ['S', 'M', 'L'], ['Ember', 'Slate'], [0, 0, 0, 0, 0, 0]), rating: 4.2, reviewCount: 61, createdAt: '2024-10-11', updatedAt: '2026-08-21', description: 'A 2.5-layer waterproof shell rated to 20,000mm with taped seams, underarm vents and a helmet-compatible hood. Packs into its chest pocket.' }),
  P({ id: 'prd-1010', name: 'Linen Button-Down Shirt', sku: 'AP-LIN-018', categoryId: 'cat-apparel', price: 79, cost: 28, stock: 143, brand: 'Nova Basics', tags: ['linen', 'summer'], variants: sizeColor('AP-LIN', ['S', 'M', 'L', 'XL'], ['White', 'Sky'], [21, 19, 24, 18, 17, 16, 15, 13]), rating: 4.4, reviewCount: 118, createdAt: '2025-01-22', updatedAt: '2026-08-16', description: 'Washed European linen with a camp collar, mother-of-pearl buttons and a straight hem meant to be worn untucked.' }),
  P({ id: 'prd-1011', name: 'Portable Bluetooth Speaker', sku: 'AU-SPK-090', categoryId: 'cat-audio', price: 129, compareAt: 149, cost: 54, stock: 87, brand: 'Aurex', tags: ['travel'], variants: one('AU-SPK', ['Ember', 'Graphite'], [39, 48]), rating: 4.5, reviewCount: 187, createdAt: '2024-06-08', updatedAt: '2026-08-12', description: 'IP67 dust and water resistant with a passive bass radiator, 20-hour playtime and stereo pairing. Recycled aluminium grille.' }),
  P({ id: 'prd-1012', name: 'Suede Chelsea Boots', sku: 'FW-CHB-003', categoryId: 'cat-footwear', price: 189, compareAt: 229, cost: 84, stock: 7, brand: 'Aldgate', tags: ['leather', 'seasonal'], variants: sizeColor('FW-CHB', ['41', '42', '43', '44'], ['Tobacco'], [1, 2, 3, 1]), rating: 4.6, reviewCount: 92, createdAt: '2024-08-30', updatedAt: '2026-08-17', description: 'Italian suede on a Goodyear-welted rubber sole with twin elastic gores. Resoleable and built to break in fast.' }),
  P({ id: 'prd-1013', name: 'Insulated Water Bottle', sku: 'HM-BTL-044', categoryId: 'cat-home', price: 34, cost: 9.5, stock: 421, brand: 'Terra Studio', tags: ['everyday'], variants: one('HM-BTL', ['Ember', 'Slate', 'Cream'], [162, 141, 118]), rating: 4.6, reviewCount: 274, createdAt: '2024-03-04', updatedAt: '2026-08-08', description: 'Double-wall vacuum insulation keeps drinks cold 24 hours or hot 12. Powder-coated 18/8 steel with a leak-proof lid.' }),
  P({ id: 'prd-1014', name: 'Slim Laptop Sleeve 14"', sku: 'TC-SLV-014', categoryId: 'cat-tech', price: 59, compareAt: 69, cost: 21, stock: 96, brand: 'Keystone', tags: ['travel'], variants: one('TC-SLV', ['Charcoal', 'Sand'], [51, 45]), rating: 4.3, reviewCount: 88, createdAt: '2024-11-19', updatedAt: '2026-08-13', description: 'Felted wool exterior, 4mm impact foam and a microfibre lining. A magnetic flap closes flat so it slides into any bag.' }),
  P({ id: 'prd-1015', name: 'Organic Cotton T-Shirt', sku: 'AP-TEE-002', categoryId: 'cat-apparel', price: 32, cost: 8.75, stock: 528, brand: 'Nova Basics', tags: ['bestseller', 'organic'], variants: sizeColor('AP-TEE', ['S', 'M', 'L', 'XL'], ['White', 'Black', 'Sage'], [38, 52, 61, 44, 47, 55, 41, 39, 36, 42, 40, 33]), rating: 4.5, reviewCount: 612, createdAt: '2023-09-14', updatedAt: '2026-08-21', description: 'A 200gsm GOTS-certified organic cotton tee with set-in sleeves and a ribbed collar that resists stretching.' }),
  P({ id: 'prd-1016', name: 'Desk Lamp with Qi Pad', sku: 'TC-LMP-028', categoryId: 'cat-tech', price: 99, compareAt: 129, cost: 41, stock: 34, brand: 'Keystone', tags: ['desk'], variants: one('TC-LMP', ['Matte Black', 'White'], [19, 15]), rating: 4.2, reviewCount: 76, createdAt: '2025-02-11', updatedAt: '2026-08-15', description: '2700K–6500K colour temperature, five brightness steps and a 15W Qi pad in the base. Weighted aluminium arm.' }),
  P({ id: 'prd-1017', name: 'Cashmere Blend Scarf', sku: 'AC-SCF-025', categoryId: 'cat-accessories', price: 95, compareAt: 120, cost: 38, stock: 18, brand: 'Aldgate', tags: ['seasonal', 'gift'], variants: one('AC-SCF', ['Camel', 'Charcoal'], [11, 7]), rating: 4.7, reviewCount: 54, createdAt: '2024-10-02', updatedAt: '2026-08-10', description: '70% wool, 30% cashmere, brushed for loft and finished with hand-tied fringe. 190 × 32cm for a double loop.' }),
  P({ id: 'prd-1018', name: 'Running Shorts 5"', sku: 'AP-SHT-041', categoryId: 'cat-apparel', price: 45, cost: 14, stock: 205, brand: 'Ridgeline', tags: ['running', 'summer'], variants: sizeColor('AP-SHT', ['S', 'M', 'L', 'XL'], ['Black', 'Ember'], [29, 31, 27, 22, 25, 26, 24, 21]), rating: 4.4, reviewCount: 133, createdAt: '2025-03-18', updatedAt: '2026-08-07', description: 'Featherweight ripstop with a bonded liner, zip pocket and reflective hem hits. 96g in a medium.' }),
  P({ id: 'prd-1019', name: 'Compact Espresso Machine', sku: 'HM-ESP-052', categoryId: 'cat-home', price: 349, compareAt: 429, cost: 178, stock: 12, brand: 'Terra Studio', tags: ['flagship', 'kitchen'], variants: one('HM-ESP', ['Brushed Steel'], [12]), rating: 4.6, reviewCount: 141, createdAt: '2024-12-05', updatedAt: '2026-08-19', description: '15-bar thermoblock that reaches brew temperature in 25 seconds. 51mm portafilter, steam wand and a 1.4L tank.' }),
  P({ id: 'prd-1020', name: 'Yoga Mat Pro 6mm', sku: 'FT-MAT-016', categoryId: 'cat-fitness', price: 72, compareAt: 89, cost: 26, stock: 63, status: 'draft', brand: 'Ridgeline', tags: ['training'], variants: one('FT-MAT', ['Sage', 'Slate'], [35, 28]), rating: 4.3, reviewCount: 47, createdAt: '2025-06-12', updatedAt: '2026-08-05', description: 'Closed-cell natural rubber with a moisture-wicking top layer, alignment markings and 6mm of joint support.' }),
  P({ id: 'prd-1021', name: 'Titanium Sunglasses', sku: 'AC-SUN-033', categoryId: 'cat-accessories', price: 165, cost: 62, stock: 27, brand: 'Aldgate', tags: ['summer'], variants: one('AC-SUN', ['Gold', 'Gunmetal'], [15, 12]), rating: 4.5, reviewCount: 63, createdAt: '2025-04-08', updatedAt: '2026-08-06', description: 'Beta-titanium frames at 21g with polarised CR-39 lenses, adjustable nose pads and spring hinges.' }),
  P({ id: 'prd-1022', name: 'Packable Down Vest', sku: 'OW-VST-009', categoryId: 'cat-outerwear', price: 129, compareAt: 159, cost: 52, stock: 4, brand: 'Ridgeline', tags: ['seasonal'], variants: sizeColor('OW-VST', ['S', 'M', 'L'], ['Ember', 'Black'], [1, 0, 1, 1, 1, 0]), rating: 4.4, reviewCount: 58, createdAt: '2024-09-27', updatedAt: '2026-08-20', description: '700-fill responsible down in a 20D recycled ripstop shell. Packs into the left pocket. 218g in a medium.' }),
  P({ id: 'prd-1023', name: 'Bamboo Cutting Board Set', sku: 'HM-BRD-060', categoryId: 'cat-home', price: 54, compareAt: 65, cost: 18, stock: 118, brand: 'Terra Studio', tags: ['kitchen', 'gift'], variants: one('HM-BRD', ['Natural'], [118]), rating: 4.2, reviewCount: 89, createdAt: '2025-05-30', updatedAt: '2026-08-04', description: 'Three end-grain bamboo boards with juice grooves and finger grips. Finished with food-safe mineral oil.' }),
  P({ id: 'prd-1024', name: 'Performance Socks 3-Pack', sku: 'AP-SCK-070', categoryId: 'cat-apparel', price: 24, cost: 6.5, stock: 389, brand: 'Nova Basics', tags: ['running', 'everyday'], variants: sizeColor('AP-SCK', ['M', 'L'], ['White', 'Black'], [112, 98, 96, 83]), rating: 4.4, reviewCount: 176, createdAt: '2024-07-01', updatedAt: '2026-08-03', description: 'Merino-blend cushioned crew socks with arch compression, a seamless toe and mesh across the instep.' }),
  P({ id: 'prd-1025', name: 'Leather Weekender Bag', sku: 'AC-BAG-050', categoryId: 'cat-accessories', price: 289, compareAt: 349, cost: 132, stock: 15, brand: 'Aldgate', tags: ['leather', 'travel', 'flagship'], variants: one('AC-BAG', ['Tobacco', 'Black'], [8, 7]), rating: 4.8, reviewCount: 71, createdAt: '2024-05-16', updatedAt: '2026-08-18', description: 'A 42L full-grain leather duffle with brass hardware, a suede-lined laptop sleeve and a padded strap.' }),
  P({ id: 'prd-1026', name: 'Wireless Charging Pad Duo', sku: 'TC-CHG-081', categoryId: 'cat-tech', price: 69, compareAt: 79, cost: 24, stock: 152, brand: 'Keystone', tags: ['desk'], variants: one('TC-CHG', ['Charcoal'], [152]), rating: 4.1, reviewCount: 104, createdAt: '2025-07-09', updatedAt: '2026-08-02', description: 'Charges a phone and earbuds at 15W and 5W. Silicone anti-slip surface and a 1.5m braided USB-C cable.' }),
  P({ id: 'prd-1027', name: 'Quilted Field Jacket', sku: 'OW-FLD-013', categoryId: 'cat-outerwear', price: 219, compareAt: 269, cost: 96, stock: 22, status: 'archived', brand: 'Ridgeline', tags: ['seasonal'], variants: sizeColor('OW-FLD', ['S', 'M', 'L', 'XL'], ['Olive'], [5, 7, 6, 4]), rating: 4.3, reviewCount: 39, createdAt: '2023-10-19', updatedAt: '2026-06-24', description: 'Waxed cotton outer with a diamond-quilted lining, corduroy collar and four bellows pockets.' }),
  P({ id: 'prd-1028', name: 'Studio Monitor Headphones', sku: 'AU-STU-140', categoryId: 'cat-audio', price: 199, cost: 88, stock: 31, brand: 'Aurex', tags: ['studio'], variants: one('AU-STU', ['Black'], [31]), rating: 4.6, reviewCount: 112, createdAt: '2025-01-30', updatedAt: '2026-08-01', description: 'Closed-back 45mm drivers tuned flat, a detachable coiled cable and replaceable velour pads. 38 ohm.' }),
  P({ id: 'prd-1029', name: 'Wide-Leg Chino Trousers', sku: 'AP-CHN-028', categoryId: 'cat-apparel', price: 88, cost: 31, stock: 96, brand: 'Nova Basics', tags: ['everyday'], variants: sizeColor('AP-CHN', ['S', 'M', 'L', 'XL'], ['Khaki', 'Navy'], [14, 12, 16, 11, 13, 10, 11, 9]), rating: 4.4, reviewCount: 81, createdAt: '2025-03-02', updatedAt: '2026-08-18', description: 'Tencel-cotton chinos with a high rise, deep pockets and a single reverse pleat. Drapes clean without looking stiff.' }),
  P({ id: 'prd-1030', name: 'Ribbed Tank Top', sku: 'AP-TNK-009', categoryId: 'cat-apparel', price: 28, cost: 7.5, stock: 240, brand: 'Nova Basics', tags: ['summer', 'organic'], variants: sizeColor('AP-TNK', ['S', 'M', 'L'], ['White', 'Black', 'Clay'], [28, 30, 26, 24, 27, 25, 22, 21, 37]), rating: 4.3, reviewCount: 94, createdAt: '2025-04-14', updatedAt: '2026-08-12', description: 'A fine-rib organic cotton tank with a bound neckline and a slightly cropped hem. Layer or wear alone.' }),
  P({ id: 'prd-1031', name: 'Heavyweight Sweatpants', sku: 'AP-SWT-033', categoryId: 'cat-apparel', price: 74, compareAt: 88, cost: 26, stock: 110, brand: 'Nova Basics', tags: ['fleece', 'everyday'], variants: sizeColor('AP-SWT', ['S', 'M', 'L', 'XL'], ['Charcoal', 'Oat'], [12, 14, 16, 13, 15, 11, 16, 13]), rating: 4.6, reviewCount: 151, createdAt: '2024-11-08', updatedAt: '2026-08-19', description: 'Matching 420gsm fleece to the hoodie, with a tapered leg, zip pocket and an elastic hem that does not cling.' }),
  P({ id: 'prd-1032', name: 'Oxford Shirt', sku: 'AP-OXF-016', categoryId: 'cat-apparel', price: 72, cost: 22, stock: 87, brand: 'Nova Basics', tags: ['everyday'], variants: sizeColor('AP-OXF', ['S', 'M', 'L', 'XL'], ['White', 'Blue'], [10, 12, 14, 9, 11, 10, 12, 9]), rating: 4.5, reviewCount: 128, createdAt: '2024-02-03', updatedAt: '2026-08-15', description: 'A classic button-down in compact Oxford cloth, garment washed, with a box pleat and a locker loop.' }),
  P({ id: 'prd-1033', name: 'Trail Runner', sku: 'FW-TRL-012', categoryId: 'cat-sneakers', price: 154, cost: 68, stock: 33, brand: 'Ridgeline', tags: ['running'], variants: sizeColor('FW-TRL', ['40', '41', '42', '43'], ['Slate', 'Ember'], [3, 5, 6, 4, 4, 3, 5, 3]), rating: 4.5, reviewCount: 77, createdAt: '2025-02-20', updatedAt: '2026-08-17', description: 'A rockered trail shoe with a sticky rubber outsole, rock plate and a gusseted tongue that keeps debris out.' }),
  P({ id: 'prd-1034', name: 'Leather Loafer', sku: 'FW-LOA-008', categoryId: 'cat-footwear', price: 210, cost: 92, stock: 19, brand: 'Aldgate', tags: ['leather'], variants: sizeColor('FW-LOA', ['41', '42', '43', '44'], ['Black', 'Cognac'], [2, 3, 3, 2, 3, 2, 2, 2]), rating: 4.6, reviewCount: 58, createdAt: '2024-09-18', updatedAt: '2026-08-14', description: 'Penny loafers in burnished calf with a stacked leather heel and a leather sole. Unlined for a softer drape.' }),
  P({ id: 'prd-1035', name: 'Canvas Slip-On', sku: 'FW-SLP-004', categoryId: 'cat-sneakers', price: 64, cost: 18, stock: 176, brand: 'Nova Basics', tags: ['everyday', 'summer'], variants: sizeColor('FW-SLP', ['40', '41', '42', '43'], ['Natural', 'Navy'], [20, 24, 28, 22, 21, 19, 23, 19]), rating: 4.3, reviewCount: 140, createdAt: '2025-05-01', updatedAt: '2026-08-10', description: 'Vulcanised canvas slip-ons with an elastic gore and a cushioned footbed. Machine washable on a cold cycle.' }),
  P({ id: 'prd-1036', name: 'Hiking Boot', sku: 'FW-HIK-015', categoryId: 'cat-footwear', price: 239, compareAt: 269, cost: 105, stock: 14, brand: 'Ridgeline', tags: ['leather'], variants: sizeColor('FW-HIK', ['41', '42', '43', '44'], ['Walnut'], [3, 4, 4, 3]), rating: 4.7, reviewCount: 66, createdAt: '2024-08-12', updatedAt: '2026-08-16', description: 'Full-grain leather hiking boot with a Vibram-style sole, padded collar and a waterproof membrane. Recraftable.' }),
  P({ id: 'prd-1037', name: 'Recovery Slide', sku: 'FW-SLD-002', categoryId: 'cat-footwear', price: 42, cost: 11, stock: 198, brand: 'Ridgeline', tags: ['everyday'], variants: sizeColor('FW-SLD', ['40', '41', '42', '43'], ['Black', 'Bone'], [24, 26, 28, 22, 25, 24, 26, 23]), rating: 4.4, reviewCount: 119, createdAt: '2025-06-22', updatedAt: '2026-08-08', description: 'One-piece EVA recovery slides with a deep footbed and a wide strap. Light enough for travel, sturdy enough for home.' }),
  P({ id: 'prd-1038', name: 'Classic Runner', sku: 'FW-RUN-021', categoryId: 'cat-sneakers', price: 138, cost: 58, stock: 51, brand: 'Nova Basics', tags: ['running', 'bestseller'], variants: sizeColor('FW-RUN', ['40', '41', '42', '43'], ['White', 'Grey'], [5, 8, 9, 6, 7, 5, 6, 5]), rating: 4.6, reviewCount: 204, createdAt: '2024-04-04', updatedAt: '2026-08-21', description: 'A daily trainer with a knitted upper, responsive foam midsole and a modest 8mm drop. Road, not trail.' }),
  P({ id: 'prd-1039', name: 'Wool Overcoat', sku: 'OW-COV-018', categoryId: 'cat-outerwear', price: 320, compareAt: 380, cost: 142, stock: 11, brand: 'Aldgate', tags: ['seasonal', 'flagship'], variants: sizeColor('OW-COV', ['S', 'M', 'L', 'XL'], ['Camel', 'Charcoal'], [1, 2, 2, 1, 2, 1, 1, 1]), rating: 4.8, reviewCount: 44, createdAt: '2024-10-20', updatedAt: '2026-08-13', description: 'Italian wool-cashmere blend in a knee-length single-breasted cut. Horn buttons, a centre vent and a half-canvas chest.' }),
  P({ id: 'prd-1040', name: 'Rain Shell', sku: 'OW-RAN-007', categoryId: 'cat-outerwear', price: 118, cost: 44, stock: 48, brand: 'Ridgeline', tags: ['waterproof'], variants: sizeColor('OW-RAN', ['S', 'M', 'L', 'XL'], ['Black', 'Olive'], [5, 7, 8, 6, 6, 5, 6, 5]), rating: 4.3, reviewCount: 72, createdAt: '2025-01-11', updatedAt: '2026-08-11', description: 'A lightweight city rain shell with fully taped seams, a two-way zip and a peaked hood that stays up in wind.' }),
  P({ id: 'prd-1041', name: 'Leather Belt', sku: 'AC-BLT-019', categoryId: 'cat-accessories', price: 58, cost: 18, stock: 134, brand: 'Aldgate', tags: ['leather', 'everyday'], variants: sizeColor('AC-BLT', ['85', '90', '95', '100'], ['Tan', 'Black'], [16, 18, 20, 14, 17, 16, 18, 15]), rating: 4.5, reviewCount: 90, createdAt: '2024-06-16', updatedAt: '2026-08-09', description: 'A 32mm full-grain belt with a solid brass buckle and a rolled tip. Cut from the same hides as the wallet.' }),
  P({ id: 'prd-1042', name: 'Merino Beanie', sku: 'AC-CAP-006', categoryId: 'cat-accessories', price: 36, cost: 9, stock: 88, brand: 'Nova Basics', tags: ['seasonal'], variants: one('AC-CAP', ['Charcoal', 'Oat', 'Navy'], [32, 28, 28]), rating: 4.4, reviewCount: 67, createdAt: '2024-09-09', updatedAt: '2026-08-07', description: 'A fine-knit merino beanie with a double-layer brim. Warm without the itch, and it does not pill after a season.' }),
  P({ id: 'prd-1043', name: 'Crossbody Bag', sku: 'AC-CRS-022', categoryId: 'cat-accessories', price: 96, cost: 34, stock: 54, brand: 'Aldgate', tags: ['leather', 'everyday'], variants: one('AC-CRS', ['Black', 'Tan'], [29, 25]), rating: 4.6, reviewCount: 83, createdAt: '2025-03-27', updatedAt: '2026-08-18', description: 'A compact leather crossbody with a zip main pocket, a card slot and an adjustable strap. Fits a phone and keys without bulk.' }),
  P({ id: 'prd-1044', name: 'True Wireless Earbuds', sku: 'AU-EAR-055', categoryId: 'cat-audio', price: 149, compareAt: 179, cost: 62, stock: 73, brand: 'Aurex', tags: ['bestseller'], variants: one('AU-EAR', ['White', 'Midnight'], [40, 33]), rating: 4.5, reviewCount: 231, createdAt: '2025-02-02', updatedAt: '2026-08-20', description: 'ANC earbuds with a 28-hour case, wireless charging and IPX4. Three ear-tip sizes in the box.' }),
  P({ id: 'prd-1045', name: 'Desktop Speaker Pair', sku: 'AU-DSK-030', categoryId: 'cat-audio', price: 229, cost: 98, stock: 26, brand: 'Aurex', tags: ['desk', 'flagship'], variants: one('AU-DSK', ['Walnut', 'Black'], [14, 12]), rating: 4.7, reviewCount: 59, createdAt: '2024-12-18', updatedAt: '2026-08-12', description: 'Active desktop speakers with a 3.5" woofer, silk tweeter and Bluetooth 5.3 plus a 3.5mm line-in. Rear bass port.' }),
  P({ id: 'prd-1046', name: 'Linen Duvet Cover', sku: 'HM-DUV-041', categoryId: 'cat-home', price: 159, cost: 52, stock: 40, brand: 'Terra Studio', tags: ['linen'], variants: one('HM-DUV', ['Stone', 'Sage', 'White'], [14, 13, 13]), rating: 4.5, reviewCount: 48, createdAt: '2025-01-07', updatedAt: '2026-08-06', description: 'Stonewashed European linen duvet cover, queen size, with coconut buttons and a 40cm internal flap. Gets softer every wash.' }),
  P({ id: 'prd-1047', name: 'Scented Candle Set', sku: 'HM-CND-018', categoryId: 'cat-home', price: 46, cost: 14, stock: 91, brand: 'Terra Studio', tags: ['gift'], variants: one('HM-CND', ['Cedar', 'Fig'], [48, 43]), rating: 4.4, reviewCount: 102, createdAt: '2025-04-22', updatedAt: '2026-08-04', description: 'Two 180g soy-wax candles in smoked glass. Cedarwood & vetiver, and fig leaf. About 40 hours burn time each.' }),
  P({ id: 'prd-1048', name: 'Pour-Over Kettle', sku: 'HM-KTL-027', categoryId: 'cat-home', price: 64, cost: 22, stock: 57, brand: 'Terra Studio', tags: ['kitchen'], variants: one('HM-KTL', ['Brushed Steel', 'Matte Black'], [30, 27]), rating: 4.6, reviewCount: 85, createdAt: '2024-08-05', updatedAt: '2026-08-15', description: 'A 900ml gooseneck kettle with a thermometer in the lid and a balanced pour. Works on gas, induction and ceramic.' }),
  P({ id: 'prd-1049', name: 'USB-C Hub 7-in-1', sku: 'TC-HUB-011', categoryId: 'cat-tech', price: 52, cost: 16, stock: 143, brand: 'Keystone', tags: ['desk', 'travel'], variants: one('TC-HUB', ['Space Grey'], [143]), rating: 4.2, reviewCount: 97, createdAt: '2025-07-18', updatedAt: '2026-08-03', description: 'HDMI 4K, SD/microSD, two USB-A, USB-C passthrough at 100W and a 1Gbps ethernet port. Aluminium shell.' }),
  P({ id: 'prd-1050', name: 'Resistance Band Set', sku: 'FT-BND-008', categoryId: 'cat-fitness', price: 29, cost: 8, stock: 210, brand: 'Ridgeline', tags: ['training'], variants: one('FT-BND', ['Multi'], [210]), rating: 4.3, reviewCount: 64, createdAt: '2025-05-19', updatedAt: '2026-08-02', description: 'Five loop bands from 5kg to 30kg equivalent, a door anchor and a mesh pouch. Natural latex, no powdery coating.' }),
];

export const IMAGE_PROMPTS = {
  'prd-1001': [
    'Professional e-commerce photo of a clean white leather low-top court sneaker, 45-degree studio angle, soft shadow, light gray seamless background, photorealistic, no text',
    'Detail e-commerce photo of the same white court sneaker showing the cupsole and stitching, overhead three-quarter view, studio lighting, light gray background, no text',
  ],
  'prd-1002': [
    'E-commerce studio photo of an oversized charcoal cotton hoodie on an invisible mannequin, heavyweight fleece, light gray background, photorealistic, no logos, no text',
    'Detail photo of the hoodie fabric and ribbed cuff, folded on a linen surface, soft natural light, no text',
  ],
  'prd-1003': [
    'Studio product photo of a slim tan leather bifold wallet, slightly open showing card slots, light gray background, photorealistic, no text',
    'Top-down photo of the closed tan leather wallet with visible edge paint, soft shadow, light background, no text',
  ],
  'prd-1004': [
    'Premium studio photo of matte midnight over-ear wireless headphones, three-quarter view, light gray background, photorealistic, no brand logos, no text',
    'Side profile product photo of the same midnight headphones showing earcup cushion, studio lighting, no text',
  ],
  'prd-1005': [
    'E-commerce photo of a matte cream ceramic cup and saucer set, two cups, handmade stoneware, light gray background, photorealistic, no text',
    'Detail of the ceramic glaze texture on a cream stoneware cup, soft daylight, no text',
  ],
  'prd-1006': [
    'Studio photo of an oat merino crewneck sweater, folded neatly, fine knit visible, light gray background, photorealistic, no text',
    'Close-up of merino knit texture and ribbed collar, soft light, no text',
  ],
  'prd-1007': [
    'Studio photo of a natural canvas tote bag standing upright, webbing handles, light gray background, photorealistic, no logos, no text',
    'Detail of canvas weave and reinforced base of the tote, overhead, no text',
  ],
  'prd-1008': [
    'Studio photo of a compact 75 percent mechanical keyboard in graphite aluminium, slight angle, light gray background, photorealistic, no brand, no text',
    'Close-up of keycaps and rotary encoder on the graphite keyboard, no text',
  ],
  'prd-1009': [
    'Studio photo of a slate waterproof trail running jacket, hood up, technical shell, light gray background, photorealistic, no logos, no text',
    'Detail of taped seams and zipper on the trail jacket, no text',
  ],
  'prd-1010': [
    'Studio photo of a white linen camp-collar shirt on invisible mannequin, relaxed fit, light gray background, photorealistic, no text',
    'Fabric detail of washed linen shirt, mother of pearl button, no text',
  ],
  'prd-1011': [
    'Studio photo of a compact cylindrical Bluetooth speaker in graphite with metal grille, light gray background, photorealistic, no logos, no text',
    'Three-quarter detail of the speaker grille and lanyard, no text',
  ],
  'prd-1012': [
    'Studio photo of tobacco suede chelsea boots, pair, three-quarter view, light gray background, photorealistic, no text',
    'Detail of elastic gore and suede texture on the chelsea boot, no text',
  ],
  'prd-1013': [
    'Studio photo of a powder-coated cream stainless steel water bottle, standing, light gray background, photorealistic, no logos, no text',
    'Detail of the bottle lid and powder coat texture, no text',
  ],
  'prd-1014': [
    'Studio photo of a charcoal felt laptop sleeve, closed with magnetic flap, light gray background, photorealistic, no text',
    'Open laptop sleeve showing microfibre interior, no text',
  ],
  'prd-1015': [
    'Studio photo of a sage green organic cotton t-shirt on invisible mannequin, light gray background, photorealistic, no logos, no text',
    'Folded sage t-shirt fabric close-up, ribbed collar, no text',
  ],
  'prd-1016': [
    'Studio photo of a matte black adjustable desk lamp with a round wireless charging base, light gray background, photorealistic, no text',
    'Detail of the lamp base Qi pad and aluminium arm joint, no text',
  ],
  'prd-1017': [
    'Studio photo of a camel cashmere blend scarf loosely draped, light gray background, photorealistic, no text',
    'Close-up of scarf fringe and brushed wool texture, no text',
  ],
  'prd-1018': [
    'Studio photo of black 5-inch running shorts on invisible mannequin, athletic, light gray background, photorealistic, no logos, no text',
    'Detail of zip pocket and hem on the running shorts, no text',
  ],
  'prd-1019': [
    'Studio photo of a compact stainless steel espresso machine, three-quarter view, light gray background, photorealistic, no brand logos, no text',
    'Detail of portafilter and steam wand on the espresso machine, no text',
  ],
  'prd-1020': [
    'Studio photo of a rolled sage green yoga mat, premium, light gray background, photorealistic, no text',
    'Unrolled yoga mat corner showing alignment marks, no text',
  ],
  'prd-1021': [
    'Studio photo of slim gold titanium sunglasses, three-quarter view, light gray background, photorealistic, no logos, no text',
    'Folded sunglasses in a hard case, detail, no text',
  ],
  'prd-1022': [
    'Studio photo of a packable ember orange down vest on invisible mannequin, light gray background, photorealistic, no logos, no text',
    'Vest packed into its pocket, compact stuff sack look, no text',
  ],
  'prd-1023': [
    'Studio photo of three nested bamboo cutting boards, end grain, light gray background, photorealistic, no text',
    'Detail of juice groove and wood grain on a bamboo board, no text',
  ],
  'prd-1024': [
    'Studio photo of a three-pack of white athletic crew socks stacked, light gray background, photorealistic, no logos, no text',
    'Single sock showing arch knit and mesh instep, no text',
  ],
  'prd-1025': [
    'Studio photo of a tobacco leather weekender duffle bag, standing, light gray background, photorealistic, no logos, no text',
    'Detail of brass hardware and leather grain on the duffle, no text',
  ],
  'prd-1026': [
    'Studio photo of a charcoal dual wireless charging pad, top view slight angle, light gray background, photorealistic, no logos, no text',
    'Side profile of the slim charging pad with braided cable, no text',
  ],
  'prd-1027': [
    'Studio photo of an olive quilted field jacket on invisible mannequin, waxed cotton, light gray background, photorealistic, no logos, no text',
    'Detail of bellows pocket and corduroy collar, no text',
  ],
  'prd-1028': [
    'Studio photo of black closed-back studio headphones, three-quarter view, light gray background, photorealistic, no brand, no text',
    'Detail of velour ear pad and coiled cable, no text',
  ],
  'prd-1029': [
    'Studio photo of khaki wide-leg chino trousers on invisible mannequin, light gray background, photorealistic, no text',
    'Fabric drape detail of the chinos, no text',
  ],
  'prd-1030': [
    'Studio photo of a clay ribbed tank top on invisible mannequin, light gray background, photorealistic, no logos, no text',
    'Rib knit texture close-up of the tank, no text',
  ],
  'prd-1031': [
    'Studio photo of charcoal heavyweight sweatpants on invisible mannequin, tapered, light gray background, photorealistic, no logos, no text',
    'Cuff and fleece interior detail of the sweatpants, no text',
  ],
  'prd-1032': [
    'Studio photo of a white Oxford button-down shirt on invisible mannequin, light gray background, photorealistic, no text',
    'Collar and button placket detail of the Oxford shirt, no text',
  ],
  'prd-1033': [
    'Studio photo of a slate trail running shoe with aggressive outsole, 45-degree angle, light gray background, photorealistic, no logos, no text',
    'Outsole detail of the trail runner, no text',
  ],
  'prd-1034': [
    'Studio photo of cognac leather penny loafers, pair, three-quarter view, light gray background, photorealistic, no text',
    'Top-down of the loafer penny strap and burnished leather, no text',
  ],
  'prd-1035': [
    'Studio photo of natural canvas slip-on shoes, pair, light gray background, photorealistic, no logos, no text',
    'Side profile of the canvas slip-on showing elastic gore, no text',
  ],
  'prd-1036': [
    'Studio photo of a walnut leather hiking boot, three-quarter view, light gray background, photorealistic, no logos, no text',
    'Sole and lacing detail of the hiking boot, no text',
  ],
  'prd-1037': [
    'Studio photo of a black EVA recovery slide sandal, three-quarter view, light gray background, photorealistic, no logos, no text',
    'Top view of the slide footbed texture, no text',
  ],
  'prd-1038': [
    'Studio photo of a white and grey knitted running shoe, 45-degree angle, light gray background, photorealistic, no logos, no text',
    'Midsole foam detail of the classic runner, no text',
  ],
  'prd-1039': [
    'Studio photo of a camel wool overcoat on invisible mannequin, knee length, light gray background, photorealistic, no logos, no text',
    'Horn button and lapel detail of the wool overcoat, no text',
  ],
  'prd-1040': [
    'Studio photo of a black city rain shell jacket, hood down, light gray background, photorealistic, no logos, no text',
    'Hood and taped seam detail of the rain shell, no text',
  ],
  'prd-1041': [
    'Studio photo of a tan leather belt coiled, brass buckle visible, light gray background, photorealistic, no text',
    'Buckle detail of the leather belt, no text',
  ],
  'prd-1042': [
    'Studio photo of a charcoal merino beanie, standing, light gray background, photorealistic, no logos, no text',
    'Knit texture close-up of the beanie brim, no text',
  ],
  'prd-1043': [
    'Studio photo of a small black leather crossbody bag, strap visible, light gray background, photorealistic, no logos, no text',
    'Zipper and leather grain detail of the crossbody, no text',
  ],
  'prd-1044': [
    'Studio photo of white true wireless earbuds next to an open charging case, light gray background, photorealistic, no brand logos, no text',
    'Earbuds in the open case, overhead, no text',
  ],
  'prd-1045': [
    'Studio photo of a pair of walnut desktop speakers, slight angle, light gray background, photorealistic, no logos, no text',
    'Front driver detail of one walnut speaker, no text',
  ],
  'prd-1046': [
    'Studio photo of a neatly folded stone linen duvet cover, light gray background, photorealistic, no text',
    'Linen weave and coconut button detail, no text',
  ],
  'prd-1047': [
    'Studio photo of two scented candles in smoked glass jars, one lid off, light gray background, photorealistic, no labels, no text',
    'Top-down of candle wax surface in smoked glass, no text',
  ],
  'prd-1048': [
    'Studio photo of a stainless gooseneck pour-over kettle, light gray background, photorealistic, no logos, no text',
    'Spout and thermometer lid detail of the kettle, no text',
  ],
  'prd-1049': [
    'Studio photo of a compact aluminium USB-C hub with ports visible, light gray background, photorealistic, no logos, no text',
    'Ports close-up of the USB-C hub, no text',
  ],
  'prd-1050': [
    'Studio photo of a set of five resistance bands in a mesh pouch, light gray background, photorealistic, no text',
    'Resistance bands laid out by thickness, overhead, no text',
  ],
};
