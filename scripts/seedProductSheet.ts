/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js';

type PriceTier = 'affordable' | 'mid' | 'premium';

interface SheetEntry {
  category: string;
  subcategory: string;
  tier: PriceTier;
  name: string;
  brand?: string;
  remarks?: string;
  defaultUsage?: 'am' | 'pm' | 'both';
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials. Provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const SHEET: SheetEntry[] = [
  { category: 'Cleanser', subcategory: 'Foaming gel cleanser', tier: 'affordable', name: 'Cetaphil Oily Skin Cleanser', brand: 'Galderma' },
  { category: 'Cleanser', subcategory: 'Foaming gel cleanser', tier: 'mid', name: 'CeraVe Foaming Cleanser', brand: 'L’Oréal' },
  { category: 'Cleanser', subcategory: 'Foaming gel cleanser', tier: 'mid', name: 'Bioderma Sebium Foaming Cleanser', brand: 'NAOS' },
  { category: 'Cleanser', subcategory: 'Foaming gel cleanser', tier: 'premium', name: "Paula's Choice Foaming Cleanser", brand: 'Unilever' },
  { category: 'Cleanser', subcategory: 'Salicylic acid facewash', tier: 'affordable', name: 'Minimalist 2% Salicylic Acid Cleanser' },
  { category: 'Cleanser', subcategory: 'Salicylic acid facewash', tier: 'affordable', name: 'The Derma Co 2% Salicylic Acid Facewash', brand: 'Honasa' },
  { category: 'Cleanser', subcategory: 'Salicylic acid facewash', tier: 'mid', name: 'CeraVe Blemish Control Cleanser 2% Salicylic Acid', brand: 'L’Oréal' },
  { category: 'Cleanser', subcategory: 'Salicylic acid facewash', tier: 'mid', name: 'Bioderma Sebium Gel Moussant Actif', brand: 'NAOS' },
  { category: 'Cleanser', subcategory: 'Salicylic acid facewash', tier: 'premium', name: 'Dermalogica Clearing Skin Wash', brand: 'Unilever' },
  { category: 'Cleanser', subcategory: 'Salicylic acid facewash', tier: 'premium', name: 'Clinique Anti-Blemish Solutions Cleansing Gel', brand: 'Estée Lauder' },
  { category: 'Cleanser', subcategory: 'Hydrating cleanser', tier: 'affordable', name: 'Cetaphil Gentle Skin Cleanser', brand: 'Galderma' },
  { category: 'Cleanser', subcategory: 'Hydrating cleanser', tier: 'affordable', name: 'CeraVe Hydrating Cleanser', brand: 'L’Oréal' },
  { category: 'Cleanser', subcategory: 'Hydrating cleanser', tier: 'mid', name: 'Neutrogena Hydro Boost Cleanser', brand: 'Kenvue' },
  { category: 'Cleanser', subcategory: 'Hydrating cleanser', tier: 'premium', name: "Paula's Choice Resist Hydrating Cleanser" },
  { category: 'Cleanser', subcategory: 'Gentle foaming cleanser', tier: 'affordable', name: 'Cetaphil Gentle Foaming Cleanser', brand: 'Galderma' },
  { category: 'Cleanser', subcategory: 'Gentle foaming cleanser', tier: 'affordable', name: 'CeraVe Foaming Cleanser', brand: 'L’Oréal' },
  { category: 'Cleanser', subcategory: 'Gentle foaming cleanser', tier: 'premium', name: "Paula’s Choice Calm Nourishing Cleanser" },
  { category: 'Cleanser', subcategory: 'Gentle foaming cleanser', tier: 'premium', name: 'Clinique All About Clean Liquid Mild', brand: 'Estée Lauder' },
  { category: 'Cleanser', subcategory: 'Bumpy skin cleanser', tier: 'mid', name: 'CeraVe SA Smoothing Cleanser', brand: 'L’Oréal' },
  { category: 'Serum', subcategory: 'Niacinamide', tier: 'affordable', name: 'Minimalist 5% Niacinamide' },
  { category: 'Serum', subcategory: 'Niacinamide', tier: 'mid', name: 'The Ordinary Niacinamide 10% + Zinc 1%', brand: 'Estée Lauder' },
  { category: 'Serum', subcategory: 'Niacinamide', tier: 'premium', name: "Paula's Choice Niacinamide Booster", brand: 'Unilever' },
  { category: 'Serum', subcategory: 'Niacinamide', tier: 'premium', name: 'Cetaphil Bright Healthy Radiance Perfecting Serum', brand: 'Galderma' },
  { category: 'Serum', subcategory: 'Vitamin C (ascorbic)', tier: 'mid', name: 'Klairs Freshly Juiced Vitamin C' },
  { category: 'Serum', subcategory: 'Vitamin C (ascorbic)', tier: 'premium', name: 'La Roche-Posay Pure Vitamin C10 Serum' },
  { category: 'Serum', subcategory: 'Vitamin C (derivatives)', tier: 'affordable', name: 'Minimalist 10% Vitamin C Face Serum' },
  { category: 'Serum', subcategory: 'Vitamin C (derivatives)', tier: 'mid', name: 'The Ordinary Ascorbyl Glucoside Solution 12%' },
  { category: 'Serum', subcategory: 'Salicylic acid', tier: 'affordable', name: 'Minimalist 2% Salicylic Acid Serum' },
  { category: 'Serum', subcategory: 'Salicylic acid', tier: 'mid', name: 'The Ordinary Salicylic Acid 2% Solution', brand: 'Estée Lauder' },
  { category: 'Serum', subcategory: 'Salicylic acid', tier: 'premium', name: "Paula's Choice 2% BHA Liquid Exfoliant", brand: 'Unilever' },
  { category: 'Serum', subcategory: 'Salicylic acid', tier: 'mid', name: 'The Derma Co 2% Salicylic Acid Serum', brand: 'Honasa' },
  { category: 'Serum', subcategory: 'Lactic acid', tier: 'affordable', name: 'Minimalist 5% Lactic Acid Serum' },
  { category: 'Serum', subcategory: 'Lactic acid', tier: 'mid', name: 'The Ordinary Lactic Acid 10% + HA', brand: 'Estée Lauder' },
  { category: 'Serum', subcategory: 'Lactic acid', tier: 'mid', name: 'Suganda 5% Lactic Acid Serum' },
  { category: 'Serum', subcategory: 'Azelaic acid', tier: 'affordable', name: 'Aziderm 10%/20% Cream' },
  { category: 'Serum', subcategory: 'Azelaic acid', tier: 'mid', name: 'The Ordinary Azelaic Acid Suspension 10%', brand: 'Estée Lauder' },
  { category: 'Serum', subcategory: 'Azelaic acid', tier: 'premium', name: "Paula’s Choice 10% Azelaic Acid Booster", brand: 'Unilever' },
  { category: 'Serum', subcategory: 'Adapalene', tier: 'affordable', name: 'Differin Gel 0.1%', brand: 'Galderma', defaultUsage: 'pm' },
  { category: 'Serum', subcategory: 'Retinol', tier: 'affordable', name: 'Minimalist 0.3% Retinol', defaultUsage: 'pm' },
  { category: 'Serum', subcategory: 'Retinol', tier: 'mid', name: 'Neutrogena Rapid Wrinkle Repair Retinol', brand: 'Kenvue', defaultUsage: 'pm' },
  { category: 'Serum', subcategory: 'Alpha arbutin', tier: 'affordable', name: 'Minimalist 2% Alpha Arbutin' },
  { category: 'Serum', subcategory: 'Alpha arbutin', tier: 'mid', name: 'Beauty of Joseon Alpha Arbutin' },
  { category: 'Serum', subcategory: 'Tranexamic acid', tier: 'affordable', name: 'Fixderma Skarfix TX Serum' },
  { category: 'Serum', subcategory: 'Tranexamic acid', tier: 'mid', name: 'Skin1004 Tone Brightening Capsule' },
  { category: 'Serum', subcategory: 'Benzoyl peroxide', tier: 'affordable', name: 'Benzac AC Gel 2.5%', defaultUsage: 'pm' },
  { category: 'Serum', subcategory: 'Peptides', tier: 'affordable', name: 'Minimalist 10% Multi-Peptide Face Serum' },
  { category: 'Serum', subcategory: 'Peptides', tier: 'mid', name: 'Cosrx Advanced Snail Peptide Serum' },
  { category: 'Moisturizer', subcategory: 'Gel moisturizer', tier: 'affordable', name: 'Plum 2% Niacinamide and Rice Water Moisturiser' },
  { category: 'Moisturizer', subcategory: 'Gel moisturizer', tier: 'mid', name: 'Neutrogena Hydro Boost Gel Cream', brand: 'Kenvue' },
  { category: 'Moisturizer', subcategory: 'Gel moisturizer', tier: 'mid', name: 'CeraVe Oil-Control Gel Cream', brand: 'L’Oréal' },
  { category: 'Moisturizer', subcategory: 'Gel moisturizer', tier: 'mid', name: 'The Ordinary Natural Moisturizing Factors' },
  { category: 'Moisturizer', subcategory: 'Niacinamide moisturizer', tier: 'affordable', name: 'Plum 2% Niacinamide Moisturiser' },
  { category: 'Moisturizer', subcategory: 'Niacinamide moisturizer', tier: 'mid', name: "Dr. Sheth’s Cica & Ceramide Oil-Free Moisturiser" },
  { category: 'Moisturizer', subcategory: 'Gel cream moisturizer', tier: 'mid', name: 'Within Beauty Ceramide & Hyaluronic Acid Gel Moisturiser' },
  { category: 'Moisturizer', subcategory: 'Rich cream moisturizer', tier: 'affordable', name: 'Minimalist 5% Marula Oil Moisturizer' },
  { category: 'Moisturizer', subcategory: 'Rich cream moisturizer', tier: 'mid', name: 'Cetaphil Moisturising Cream', brand: 'Galderma' },
  { category: 'Moisturizer', subcategory: 'Rich cream moisturizer', tier: 'mid', name: 'CeraVe Moisturising Cream', brand: 'L’Oréal' },
  { category: 'Moisturizer', subcategory: 'Barrier cream (oily/combination)', tier: 'affordable', name: 'Minimalist 0.3% Ceramide Barrier Repair Cream' },
  { category: 'Moisturizer', subcategory: 'Barrier cream (oily/combination)', tier: 'mid', name: 'Within Beauty Ceramide & Hyaluronic Acid Gel Moisturiser' },
  { category: 'Moisturizer', subcategory: 'Barrier cream (dry skin)', tier: 'affordable', name: 'Cetaphil Moisturising Cream', brand: 'Galderma' },
  { category: 'Moisturizer', subcategory: 'Barrier cream (dry skin)', tier: 'affordable', name: 'CeraVe Moisturising Lotion', brand: 'L’Oréal' },
  { category: 'Moisturizer', subcategory: 'Barrier cream (dry skin)', tier: 'premium', name: "Paula's Choice Resist Barrier Repair Moisturizer" },
  { category: 'Moisturizer', subcategory: 'Ceramide/peptide cream (oily/combination)', tier: 'affordable', name: 'Minimalist 0.3% Ceramide Barrier Repair Cream' },
  { category: 'Moisturizer', subcategory: 'Ceramide/peptide cream (oily/combination)', tier: 'mid', name: 'Within Beauty Ceramide & Peptide Night Gel' },
  { category: 'Moisturizer', subcategory: 'Ceramide/peptide cream (dry)', tier: 'affordable', name: 'Minimalist Vitamin B12 + Repair Complex' },
  { category: 'Moisturizer', subcategory: 'Ceramide/peptide cream (dry)', tier: 'mid', name: 'CeraVe Moisturising Cream', brand: 'L’Oréal' },
  { category: 'Moisturizer', subcategory: 'Smoothening moisturizer', tier: 'mid', name: 'CeraVe SA Lotion for Rough & Bumpy Skin', brand: 'L’Oréal' },
  { category: 'Sunscreen', subcategory: 'Chemical gel/fluid sunscreen', tier: 'affordable', name: 'Minimalist Light Fluid SPF 50', defaultUsage: 'am' },
  { category: 'Sunscreen', subcategory: 'Chemical gel/fluid sunscreen', tier: 'mid', name: 'Re’equil Ultra Matte Gel SPF 50', defaultUsage: 'am' },
  { category: 'Sunscreen', subcategory: 'Chemical/hybrid fluid sunscreen', tier: 'affordable', name: 'Minimalist Light Fluid SPF 50', defaultUsage: 'am' },
  { category: 'Sunscreen', subcategory: 'Chemical/hybrid fluid sunscreen', tier: 'mid', name: 'Neutrogena Ultra Sheer SPF50+', brand: 'Kenvue', defaultUsage: 'am' },
  { category: 'Sunscreen', subcategory: 'Hybrid/gentle mineral sunscreen', tier: 'mid', name: "Re'equil Sheer Zinc Tinted Sunscreen SPF 50", defaultUsage: 'am' },
];

function buildKeywords(entry: SheetEntry): string[] {
  const base = new Set<string>();
  entry.name
    .split(/\s+/)
    .map(token => token.toLowerCase())
    .forEach(token => base.add(token));
  if (entry.brand) {
    entry.brand
      .split(/\s+/)
      .map(token => token.toLowerCase())
      .forEach(token => base.add(token));
  }
  base.add(`tier:${entry.tier}`);
  base.add(`subcat:${entry.subcategory}`);
  base.add(entry.category.toLowerCase());
  return Array.from(base);
}

async function upsertEntry(entry: SheetEntry) {
  const slug = slugify(`${entry.category}-${entry.name}-${entry.tier}`);
  const { data: existing, error: fetchError } = await supabase
    .from('product')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const payload = {
    slug,
    display_name: entry.name,
    brand: entry.brand ?? null,
    category: entry.category,
    default_usage: entry.defaultUsage ?? 'both',
    pregnancy_unsafe: false,
    isotretinoin_unsafe: false,
    barrier_unsafe: false,
    ingredient_keywords: buildKeywords(entry),
    notes: entry.remarks ?? null,
  };

  if (existing) {
    const { error } = await supabase.from('product').update(payload).eq('id', existing.id);
    if (error) throw error;
    console.log(`Updated product ${entry.name}`);
  } else {
    const { error } = await supabase.from('product').insert(payload);
    if (error) throw error;
    console.log(`Inserted product ${entry.name}`);
  }
}

async function main() {
  console.log(`Syncing ${SHEET.length} curated products…`);
  for (const entry of SHEET) {
    await upsertEntry(entry);
  }
  console.log('✅ Product sheet synced.');
}

main().catch(error => {
  console.error('Failed to seed product sheet:', error);
  process.exit(1);
});
