/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js';
import type { IngredientTag } from '../src/services/ingredientInteractions';
import {
  legacyProducts,
  legacySkinTypeDefaults,
  legacyRawMatrix,
  legacyDynamicSunscreens,
  type ProductInfo,
  type ProductSlot,
  type ConcernKey,
  type SkinTypeKey,
  type BandColor,
} from './legacyConcernMatrix';

type SeedProduct = {
  name: string;
  slug: string;
  info: ProductInfo;
  aliases: Set<string>;
  isVirtual?: boolean;
};

type SeedMatrixEntry = {
  concern: ConcernKey;
  subtype: string;
  skinType: SkinTypeKey;
  band: BandColor;
  cleanserSlug: string;
  coreSerumSlug: string;
  secondarySerumSlug?: string | null;
  moisturizerSlug: string;
  sunscreenSlug: string;
  remarks?: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing Supabase credentials. Please set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const usedSlugs = new Set<string>();

function slugify(source: string): string {
  const base = source
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  const fallback = base || 'product';
  let candidate = fallback;
  let counter = 1;
  while (usedSlugs.has(candidate)) {
    counter += 1;
    candidate = `${fallback}-${counter}`;
  }
  usedSlugs.add(candidate);
  return candidate;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

async function main() {
  console.log('Preparing legacy concern matrix data…');

  const seedProducts = buildSeedProducts();
  const aliasToSlug = buildAliasLookup(seedProducts);
  const ingredientTags = collectIngredientTags(seedProducts);
  const skinTypeDefaults = buildSkinTypeDefaults(aliasToSlug);
  const matrixEntries = parseLegacyMatrix(aliasToSlug);
  const concernSubtypes = collectConcernSubtypes(matrixEntries);

  console.log(`• Products: ${seedProducts.length}`);
  console.log(`• Ingredient tags: ${ingredientTags.size}`);
  console.log(`• Skin-type defaults: ${skinTypeDefaults.length}`);
  console.log(`• Matrix entries: ${matrixEntries.length}`);
  console.log(`• Concern subtypes: ${concernSubtypes.size}`);

  await seedIngredientTags(Array.from(ingredientTags));
  const slugToId = await seedProductsTable(seedProducts);
  await seedProductAliases(seedProducts, slugToId);
  await seedProductIngredientTags(seedProducts, slugToId);
  const subtypeIdMap = await seedConcernSubtypes(concernSubtypes);
  await seedSkinTypeDefaults(skinTypeDefaults, slugToId);
  await seedMatrixEntries(matrixEntries, slugToId, subtypeIdMap);

  console.log('✅ Legacy concern matrix seeded successfully.');
}

function buildSeedProducts(): SeedProduct[] {
  const products: SeedProduct[] = legacyProducts.map(product => ({
    name: product.name,
    slug: slugify(product.name),
    info: product.info,
    aliases: new Set(product.aliases.map(alias => alias.trim()).filter(Boolean)),
  }));

  const existingNames = new Set(products.map(product => product.name));

  for (const [name, info] of Object.entries(legacyDynamicSunscreens)) {
    if (existingNames.has(name)) continue;
    products.push({
      name,
      slug: slugify(name),
      info: {
        ...info,
        name,
      },
      aliases: new Set([name]),
      isVirtual: false,
    });
    existingNames.add(name);
  }

  // Add virtual product for skin-type defaults
  const skinTypeDefaultSlug = slugify('SKINTYPE_DEFAULT');
  products.push({
    name: 'SKINTYPE_DEFAULT',
    slug: skinTypeDefaultSlug,
    info: {
      name: 'Skin-type default placeholder',
      ingredientTags: [],
      ingredientKeywords: [],
      defaultUsage: 'both',
      pregnancyUnsafe: false,
      isotretinoinUnsafe: false,
      barrierUnsafe: false,
      notes: 'Resolves to skin-type specific defaults at runtime',
      isReferral: false,
    },
    aliases: new Set(['SKINTYPE_DEFAULT', 'As per skin type']),
    isVirtual: true,
  });

  return products;
}

function buildAliasLookup(products: SeedProduct[]): Map<string, string> {
  const aliasToSlug = new Map<string, string>();
  for (const product of products) {
    product.aliases.add(product.name);
    product.aliases.add(product.slug);
    for (const alias of product.aliases) {
      const key = normalizeKey(alias);
      if (!key) continue;
      const existing = aliasToSlug.get(key);
      if (existing && existing !== product.slug) {
        console.warn(
          `Duplicate alias "${alias}" found for products ${existing} and ${product.slug}. Keeping first occurrence.`
        );
        continue;
      }
      aliasToSlug.set(key, product.slug);
    }
  }
  const skinDefault = products.find(product => product.name === 'SKINTYPE_DEFAULT');
  if (skinDefault) {
    aliasToSlug.set('skintype_default', skinDefault.slug);
  }
  return aliasToSlug;
}

function collectIngredientTags(products: SeedProduct[]): Set<IngredientTag> {
  const tags = new Set<IngredientTag>();
  for (const product of products) {
    product.info.ingredientTags.forEach(tag => tags.add(tag));
  }
  return tags;
}

function buildSkinTypeDefaults(aliasToSlug: Map<string, string>) {
  const rows: Array<{ skinType: SkinTypeKey; slot: ProductSlot; productSlug: string }> = [];
  for (const [skinType, slotMap] of Object.entries(legacySkinTypeDefaults) as Array<
    [SkinTypeKey, Partial<Record<ProductSlot, string>>]
  >) {
    for (const [slot, name] of Object.entries(slotMap) as Array<[ProductSlot, string]>) {
      const slug = aliasToSlug.get(normalizeKey(name));
      if (!slug) {
        throw new Error(`No slug found for skin-type default product "${name}"`);
      }
      rows.push({ skinType, slot, productSlug: slug });
    }
  }
  return rows;
}

function parseLegacyMatrix(aliasToSlug: Map<string, string>): SeedMatrixEntry[] {
  const entries: SeedMatrixEntry[] = [];
  const rows = legacyRawMatrix.split('\n').filter(Boolean);
  rows.shift();

  for (const line of rows) {
    const cols = line.split(',');
    if (cols.length < 9) continue;
    const concern = toConcernKey(cols[0]);
    const subtype = cols[1].trim();
    const skinType = toSkinType(cols[2]);
    const band = toBand(cols[3]);
    const cleanser = resolveAlias(cols[4], aliasToSlug);
    const coreSerum = resolveAlias(cols[5], aliasToSlug);
    const secondarySerum = resolveAlias(cols[6], aliasToSlug, true);
    const moisturizer = resolveAlias(cols[7], aliasToSlug);
    const sunscreen = resolveAlias(cols[8], aliasToSlug);
    const remarks = cols[9]?.trim() ? cols[9].trim() : undefined;

    if (!cleanser || !coreSerum || !moisturizer || !sunscreen) {
      throw new Error(`Matrix row missing required product: ${line}`);
    }

    entries.push({
      concern,
      subtype,
      skinType,
      band,
      cleanserSlug: cleanser,
      coreSerumSlug: coreSerum,
      secondarySerumSlug: secondarySerum,
      moisturizerSlug: moisturizer,
      sunscreenSlug: sunscreen,
      remarks,
    });
  }

  return entries;
}

function collectConcernSubtypes(entries: SeedMatrixEntry[]): Map<string, { concern: ConcernKey; code: string }> {
  const map = new Map<string, { concern: ConcernKey; code: string }>();
  for (const entry of entries) {
    const key = `${entry.concern}::${entry.subtype.toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, { concern: entry.concern, code: entry.subtype });
    }
  }
  return map;
}

function resolveAlias(
  raw: string,
  aliasToSlug: Map<string, string>,
  allowEmpty = false
): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return allowEmpty ? null : null;
  }
  const key = normalizeKey(trimmed);
  const slug = aliasToSlug.get(key);
  if (!slug) {
    if (allowEmpty) return null;
    throw new Error(`No product mapping for "${trimmed}"`);
  }
  return slug;
}

function toConcernKey(raw: string): ConcernKey {
  const key = raw.trim().toLowerCase();
  switch (key) {
    case 'acne':
      return 'acne';
    case 'sebum':
      return 'sebum';
    case 'pigmentation':
      return 'pigmentation';
    case 'texture':
      return 'texture';
    case 'pores':
      return 'pores';
    case 'acnescars':
    case 'acne scars':
      return 'acnescars';
    default:
      throw new Error(`Unsupported concern type "${raw}"`);
  }
}

function toSkinType(raw: string): SkinTypeKey {
  const formatted = raw.trim();
  const values: SkinTypeKey[] = ['Dry', 'Combo', 'Oily', 'Sensitive', 'Normal'];
  if (!values.includes(formatted as SkinTypeKey)) {
    throw new Error(`Unsupported skin type "${raw}"`);
  }
  return formatted as SkinTypeKey;
}

function toBand(raw: string): BandColor {
  const key = raw.trim().toLowerCase() as BandColor;
  const values: BandColor[] = ['green', 'blue', 'yellow', 'red'];
  if (!values.includes(key)) {
    throw new Error(`Unsupported band color "${raw}"`);
  }
  return key;
}

function toTitle(value: string): string {
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

async function seedIngredientTags(tags: IngredientTag[]) {
  if (!tags.length) return;
  const rows = tags.map(tag => ({
    id: tag,
    label: toTitle(tag),
  }));
  const { error } = await supabase.from('ingredient_tag').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

async function seedProductsTable(products: SeedProduct[]) {
  const rows = products.map(product => ({
    slug: product.slug,
    display_name: product.name,
    brand: null,
    category: null,
    default_usage: product.info.defaultUsage ?? 'both',
    pregnancy_unsafe: product.info.pregnancyUnsafe ?? false,
    isotretinoin_unsafe: product.info.isotretinoinUnsafe ?? false,
    barrier_unsafe: product.info.barrierUnsafe ?? false,
    is_referral: product.info.isReferral ?? false,
    is_virtual: product.isVirtual ?? false,
    ingredient_keywords: product.info.ingredientKeywords,
    notes: product.info.notes ?? null,
  }));

  const { data, error } = await supabase
    .from('product')
    .upsert(rows, { onConflict: 'slug' })
    .select('id, slug');
  if (error) throw error;
  const map = new Map<string, string>();
  (data || []).forEach(row => map.set(row.slug, row.id));
  return map;
}

async function seedProductAliases(products: SeedProduct[], slugToId: Map<string, string>) {
  const productIds = Array.from(slugToId.values());
  if (productIds.length) {
    await supabase.from('product_alias').delete().in('product_id', productIds);
  }
  const seen = new Set<string>();
  const rows = products.flatMap(product => {
    const id = slugToId.get(product.slug);
    if (!id) {
      throw new Error(`Missing product ID for slug ${product.slug}`);
    }
    return Array.from(product.aliases)
      .map(alias => alias.trim())
      .filter(Boolean)
      .map(alias => {
        const normalized = normalizeKey(alias);
        if (seen.has(normalized)) {
          console.warn(`Skipping duplicate alias "${alias}"`);
          return null;
        }
        seen.add(normalized);
        return {
          product_id: id,
          alias,
        };
      })
      .filter((row): row is { product_id: string; alias: string } => row !== null);
  });
  if (!rows.length) return;
  const { error } = await supabase.from('product_alias').insert(rows, { returning: 'minimal' });
  if (error) throw error;
}

async function seedProductIngredientTags(products: SeedProduct[], slugToId: Map<string, string>) {
  const productIds = Array.from(slugToId.values());
  if (productIds.length) {
    await supabase.from('product_ingredient_tag').delete().in('product_id', productIds);
  }
  const rows = products.flatMap(product => {
    const id = slugToId.get(product.slug);
    if (!id) {
      throw new Error(`Missing product ID for slug ${product.slug}`);
    }
    return product.info.ingredientTags.map(tag => ({
      product_id: id,
      tag_id: tag,
    }));
  });
  if (!rows.length) return;
  const { error } = await supabase
    .from('product_ingredient_tag')
    .insert(rows, { returning: 'minimal' });
  if (error) throw error;
}

async function seedConcernSubtypes(
  subtypes: Map<string, { concern: ConcernKey; code: string }>
): Promise<Map<string, string>> {
  if (!subtypes.size) return new Map();
  await supabase.from('concern_subtype').delete().neq('concern', '');
  const rows = Array.from(subtypes.values()).map(item => ({
    concern: item.concern,
    code: item.code,
    label: toTitle(item.code),
  }));
  const { data, error } = await supabase
    .from('concern_subtype')
    .insert(rows)
    .select('id, concern, code');
  if (error) throw error;
  const map = new Map<string, string>();
  (data || []).forEach(row => map.set(`${row.concern}::${row.code.toLowerCase()}`, row.id));
  return map;
}

async function seedSkinTypeDefaults(
  defaults: Array<{ skinType: SkinTypeKey; slot: ProductSlot; productSlug: string }>,
  slugToId: Map<string, string>
) {
  if (!defaults.length) return;
  await supabase.from('skin_type_default').delete().neq('skin_type', '');
  const rows = defaults.map(item => {
    const productId = slugToId.get(item.productSlug);
    if (!productId) {
      throw new Error(`Missing product ID for skin-type default slug ${item.productSlug}`);
    }
    return {
      skin_type: item.skinType,
      slot: item.slot,
      product_id: productId,
    };
  });
  const { error } = await supabase
    .from('skin_type_default')
    .insert(rows, { returning: 'minimal' });
  if (error) throw error;
}

async function seedMatrixEntries(
  entries: SeedMatrixEntry[],
  slugToId: Map<string, string>,
  subtypeIdMap: Map<string, string>
) {
  if (!entries.length) return;
  await supabase.from('matrix_entry').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const rows = entries.map(entry => {
    const subtypeKey = `${entry.concern}::${entry.subtype.toLowerCase()}`;
    const subtypeId = subtypeIdMap.get(subtypeKey);
    if (!subtypeId) {
      throw new Error(`Missing subtype ID for ${entry.concern} :: ${entry.subtype}`);
    }
    const cleanserId = slugToId.get(entry.cleanserSlug);
    const coreId = slugToId.get(entry.coreSerumSlug);
    const moisturizerId = slugToId.get(entry.moisturizerSlug);
    const sunscreenId = slugToId.get(entry.sunscreenSlug);
    const secondaryId = entry.secondarySerumSlug
      ? slugToId.get(entry.secondarySerumSlug)
      : null;
    if (!cleanserId || !coreId || !moisturizerId || !sunscreenId) {
      throw new Error(
        `Missing product IDs in matrix entry ${entry.concern} ${entry.subtype} ${entry.skinType} ${entry.band}`
      );
    }
    return {
      concern: entry.concern,
      subtype_id: subtypeId,
      skin_type: entry.skinType,
      band: entry.band,
      cleanser_id: cleanserId,
      core_serum_id: coreId,
      secondary_serum_id: secondaryId,
      moisturizer_id: moisturizerId,
      sunscreen_id: sunscreenId,
      remarks: entry.remarks ?? null,
    };
  });
  const { error } = await supabase
    .from('matrix_entry')
    .insert(rows, { returning: 'minimal' });
  if (error) throw error;
}

main().catch(error => {
  console.error('❌ Failed to seed concern matrix:', error);
  process.exit(1);
});
