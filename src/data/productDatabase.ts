// Product Database
// Contains specific product recommendations organized by category, subcategory, and price tier

export interface ProductOption {
  name: string;
  brand: string;
  tier: 'affordable' | 'mid-range' | 'premium';
}

export interface ProductCategory {
  [subcategory: string]: ProductOption[];
}

export interface ProductDatabase {
  [category: string]: ProductCategory;
}

export const PRODUCT_DATABASE: ProductDatabase = {
  cleanser: {
    'foaming-gel': [
      { name: 'Cetaphil Oily Skin Cleanser', brand: 'Galderma', tier: 'affordable' },
      { name: 'CeraVe Foaming Cleanser', brand: 'Loreal', tier: 'affordable' },
      { name: 'Bioderma Foaming Cleanser', brand: 'NAOS', tier: 'mid-range' },
      { name: "Paula's Choice Foaming Cleanser", brand: 'Unilever', tier: 'premium' },
    ],
    'salicylic-acid': [
      { name: 'Minimalist 2% Salicylic Acid Facewash', brand: 'Minimalist', tier: 'affordable' },
      { name: 'Derma Co Salicylic Acid Facewash', brand: 'Honasa', tier: 'affordable' },
      { name: 'CeraVe Blemish Control Cleanser with 2% Salicylic Acid & Niacinamide', brand: 'CeraVe', tier: 'mid-range' },
      { name: 'Bioderma Sebium Gel Moussant Actif Cleanser with Salicylic & Glycolic Acid', brand: 'Bioderma', tier: 'mid-range' },
      { name: 'Dermalogica Clearing Skin Wash With Salycylic Acid', brand: 'Unilever', tier: 'premium' },
      { name: 'Clinique Anti-Blemish Solutions Cleansing Gel With Salicylic Acid', brand: 'Clinique', tier: 'premium' },
    ],
    'hydrating': [
      { name: 'Cetaphil Gentle Skin Cleanser', brand: 'Galderma', tier: 'affordable' },
      { name: 'CeraVe Hydrating Cleanser', brand: 'Loreal', tier: 'affordable' },
      { name: 'Neutrogena Hydro Boost Cleanser', brand: 'Kenvue', tier: 'mid-range' },
      { name: "Paula's Choice Resist Optimal Results Hydrating Cleanser", brand: "Paula's Choice", tier: 'premium' },
    ],
    'gentle-foaming': [
      { name: 'Cetaphil Gentle Foaming Cleanser', brand: 'Cetaphil', tier: 'affordable' },
      { name: 'CeraVe Foaming Cleanser', brand: 'CeraVe', tier: 'affordable' },
      { name: "Paula's Choice Calm Nourishing Cleanser", brand: "Paula's Choice", tier: 'premium' },
      { name: 'Clinique All About Clean Liquid Mild', brand: 'Estee Lauder', tier: 'premium' },
    ],
    'bumpy-skin': [
      { name: 'CeraVe SA Smoothing Cleanser', brand: 'Loreal', tier: 'mid-range' },
    ],
  },
  serum: {
    'niacinamide': [
      { name: 'Minimalist 5% Niacinamide', brand: 'Minimalist', tier: 'affordable' },
      { name: 'The Ordinary 10% Niacinamide', brand: 'Estee Lauder', tier: 'mid-range' },
      { name: 'Cetaphil Brightening Healthy Radiance Perfecting Serum', brand: 'Galderma', tier: 'mid-range' },
      { name: "Paula's Choice 10% Niacinamide", brand: 'Unilever', tier: 'premium' },
    ],
    'vitamin-c': [
      { name: 'Minimalist 10% Vitamin C', brand: 'Minimalist', tier: 'affordable' },
      { name: 'Klairs Freshly Juiced Vitamin C', brand: 'Klairs', tier: 'mid-range' },
      { name: 'The Ordinary Ascorbyl Glucoside Solution 12%', brand: 'The Ordinary', tier: 'mid-range' },
      { name: 'Dermalogica Biolumin-C Serum', brand: 'Dermalogica', tier: 'premium' },
    ],
    'salicylic-acid': [
      { name: 'Minimalist 2% Salicylic Acid', brand: 'Minimalist', tier: 'affordable' },
      { name: 'Derma Co 2% Salicylic Acid', brand: 'Honasa', tier: 'affordable' },
      { name: 'The Ordinary 2% Salicylic Acid', brand: 'Estee Lauder', tier: 'mid-range' },
      { name: "Paula's Choice 2% Salicylic Acid", brand: 'Unilever', tier: 'premium' },
    ],
    'lactic-acid': [
      { name: 'Minimalist 5% Lactic Acid', brand: 'Minimalist', tier: 'affordable' },
      { name: 'Suganda 5% Lactic Acid', brand: 'Suganda', tier: 'affordable' },
      { name: 'The Ordinary Lactic Acid 10% + HA', brand: 'Estee Lauder', tier: 'mid-range' },
    ],
    'azelaic-acid': [
      { name: 'Aziderm 10/20% Cream', brand: 'Aziderm', tier: 'affordable' },
      { name: 'The Ordinary Azelaic Acid Suspension 10%', brand: 'Estee Lauder', tier: 'mid-range' },
      { name: "Paula's Choice 10% Azelaic Acid Booster", brand: 'Unilever', tier: 'premium' },
    ],
    'adapalene': [
      { name: 'Differin Gel', brand: 'Galderma', tier: 'affordable' },
    ],
    'retinol': [
      { name: 'Minimalist 0.3% Retinol', brand: 'Minimalist', tier: 'affordable' },
      { name: 'Neutrogena Retinol', brand: 'Kenvue', tier: 'mid-range' },
    ],
    'alpha-arbutin': [
      { name: 'Minimalist 2% Alpha Arbutin', brand: 'Minimalist', tier: 'affordable' },
      { name: 'Beauty of Joseon Alpha Arbutin', brand: 'Beauty of Joseon', tier: 'mid-range' },
    ],
    'tranexamic-acid': [
      { name: 'Fixderma Skarfix TX Serum', brand: 'Fixderma', tier: 'affordable' },
      { name: 'Skin 1004 Tone Brightening Capsule', brand: 'Skin1004', tier: 'mid-range' },
    ],
    'benzoyl-peroxide': [
      { name: 'Benzac AC Gel 2.5%', brand: 'Benzac', tier: 'affordable' },
    ],
    'peptides': [
      { name: 'Minimalist 10% Multi Peptide Face Serum', brand: 'Minimalist', tier: 'affordable' },
      { name: 'Cosrx Peptide Booster', brand: 'Cosrx', tier: 'mid-range' },
    ],
  },
  moisturizer: {
    'gel': [
      { name: 'Plum 2% Niacinamide And Rice Water Moisturiser', brand: 'Plum', tier: 'affordable' },
      { name: 'Neutrogena Hydro Boost', brand: 'Kenvue', tier: 'mid-range' },
      { name: 'CeraVe Oil Control Gel-Cream Lightweight Moisturizer', brand: 'CeraVe', tier: 'mid-range' },
      { name: 'The Ordinary Natural Moisturizing Factors', brand: 'The Ordinary', tier: 'mid-range' },
    ],
    'niacinamide': [
      { name: 'Plum 2% Niacinamide And Rice Water Moisturiser', brand: 'Plum', tier: 'affordable' },
    ],
    'gel-cream': [
      { name: 'Within Beauty Ceramide & Hyaluronic Acid Gel Moisturiser', brand: 'Within Beauty', tier: 'affordable' },
    ],
    'rich-cream': [
      { name: 'Minimalist 5% Marula Oil Moisturizer With Hyaluronic Acid & Vitamin F & E', brand: 'Minimalist', tier: 'affordable' },
      { name: 'CeraVe Moisturizer Cream', brand: 'CeraVe', tier: 'affordable' },
      { name: 'Cetaphil Moisturizing Cream', brand: 'Cetaphil', tier: 'mid-range' },
    ],
    'barrier-oily-combination': [
      { name: 'Minimalist 0.3% Ceramide Barrier Repair Moisturizing Cream', brand: 'Minimalist', tier: 'affordable' },
      { name: 'Within Beauty Ceramide & Hyaluronic Acid Gel Moisturiser', brand: 'Within Beauty', tier: 'mid-range' },
    ],
    'barrier-dry': [
      { name: 'Cetaphil Moisturizing Cream', brand: 'Cetaphil', tier: 'affordable' },
      { name: 'CeraVe Moisturizing Lotion', brand: 'CeraVe', tier: 'affordable' },
      { name: "Paula's Choice Resist Barrier Repair Advanced Moisturizer", brand: "Paula's Choice", tier: 'premium' },
    ],
    'ceramide-peptide-oily-combination': [
      { name: 'Minimalist 0.3% Ceramide Barrier Repair Moisturizing Cream', brand: 'Minimalist', tier: 'affordable' },
      { name: 'Within Beauty Ceramide & Peptide Night Gel', brand: 'Within Beauty', tier: 'mid-range' },
    ],
    'ceramide-peptide-dry': [
      { name: 'Minimalist Vitamin B12 + Repair Complex', brand: 'Minimalist', tier: 'affordable' },
      { name: 'CeraVe Moisturizer Cream', brand: 'CeraVe', tier: 'mid-range' },
    ],
  },
  sunscreen: {
    'general': [
      { name: 'Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 50', brand: 'Neutrogena', tier: 'affordable' },
      { name: 'La Roche-Posay Anthelios Ultra Light Fluid SPF 50', brand: 'La Roche-Posay', tier: 'mid-range' },
      { name: 'EltaMD UV Clear Broad-Spectrum SPF 46', brand: 'EltaMD', tier: 'premium' },
    ],
  },
};

// Helper function to get product by preference tier
export function getProductByTier(products: ProductOption[], preferredTier: 'affordable' | 'mid-range' | 'premium' = 'mid-range'): ProductOption {
  // Try to get preferred tier first
  const preferred = products.find(p => p.tier === preferredTier);
  if (preferred) return preferred;
  
  // Fall back to mid-range if available
  const midRange = products.find(p => p.tier === 'mid-range');
  if (midRange) return midRange;
  
  // Fall back to affordable
  const affordable = products.find(p => p.tier === 'affordable');
  if (affordable) return affordable;
  
  // Return first available product
  return products[0];
}

// Helper function to get formatted product name
export function formatProductName(product: ProductOption): string {
  return `${product.name} (${product.brand})`;
}