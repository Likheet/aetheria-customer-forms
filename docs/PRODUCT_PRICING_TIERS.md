# Product Pricing Tiers Documentation

**Date**: October 18, 2025  
**Location**: `src/data/productDatabase.ts`  
**Status**: ✅ Fully Implemented

---

## Overview

Aetheria Forms includes a comprehensive product database with **pricing tier support** across all product categories. Each product is classified into three tiers:

- **Affordable** - Budget-friendly, accessible options
- **Mid-Range** - Balanced price-to-efficacy ratio
- **Premium** - High-end, luxury brands

---

## Database Structure

```typescript
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
```

---

## Product Categories & Subcategories

### 1. **Cleanser** (5 subcategories)

| Subcategory | Affordable | Mid-Range | Premium |
|---|---|---|---|
| **Foaming Gel** | Cetaphil Oily Skin, CeraVe Foaming | Bioderma Foaming | Paula's Choice Foaming |
| **Salicylic Acid** | Minimalist 2%, Derma Co 2% | CeraVe Blemish Control, Bioderma Sebium | Dermalogica Clearing, Clinique Anti-Blemish |
| **Hydrating** | Cetaphil Gentle, CeraVe Hydrating | Neutrogena Hydro Boost | Paula's Choice Resist |
| **Gentle Foaming** | Cetaphil Gentle, CeraVe Foaming | - | Paula's Choice Calm, Clinique All About Clean |
| **Bumpy Skin** | - | CeraVe SA Smoothing | - |
| **Cream** | Cetaphil Gentle, CeraVe Hydrating | - | - |

### 2. **Serum** (14 subcategories)

| Subcategory | Affordable | Mid-Range | Premium |
|---|---|---|---|
| **Niacinamide** | Minimalist 5% | The Ordinary 10%, Cetaphil Brightening | Paula's Choice 10% |
| **Vitamin C (Ascorbic)** | - | Klairs Freshly Juiced | La Roche-Posay Pure Vitamin C10 |
| **Vitamin C (Derivatives)** | Minimalist 10% | The Ordinary Ascorbyl Glucoside 12% | - |
| **Salicylic Acid** | Minimalist 2%, Derma Co 2% | The Ordinary 2% | Paula's Choice 2% |
| **Lactic Acid** | Minimalist 5%, Suganda 5% | The Ordinary Lactic Acid 10% | - |
| **Azelaic Acid** | Aziderm 10/20% Cream | The Ordinary Azelaic 10% | Paula's Choice 10% Azelaic Booster |
| **Adapalene** | Differin Gel | - | - |
| **Retinol** | Minimalist 0.3% | Neutrogena Retinol | - |
| **Alpha Arbutin** | Minimalist 2% | Beauty of Joseon Alpha Arbutin | - |
| **Tranexamic Acid** | Fixderma Skarfix TX | Skin 1004 Tone Brightening Capsule | - |
| **Benzoyl Peroxide** | Benzac AC Gel 2.5% | - | - |
| **Peptides** | Minimalist 10% Multi Peptide | Cosrx Peptide Booster | - |
| **Vitamin C Ascorbic** | - | - | La Roche-Posay Pure Vitamin C10 |
| **Bakuchiol** | - | Bakuchiol Peptide Serum | Bakuchiol Peptide Treatment PM |
| **Gentle AHA** | Minimalist Gentle AHA | - | - |

### 3. **Moisturizer** (8 subcategories)

| Subcategory | Affordable | Mid-Range | Premium |
|---|---|---|---|
| **Gel** | Plum 2% Niacinamide | Neutrogena Hydro Boost, CeraVe Oil Control, The Ordinary NMF | - |
| **Niacinamide** | Plum 2% Niacinamide | - | - |
| **Gel-Cream** | Within Beauty Ceramide & HA | - | - |
| **Rich Cream** | Minimalist 5% Marula Oil, CeraVe Moisturizer | Cetaphil Moisturizing Cream | - |
| **Barrier (Oily/Combo)** | Minimalist 0.3% Ceramide | Within Beauty Ceramide & HA | - |
| **Barrier (Dry)** | Cetaphil Moisturizing, CeraVe Lotion | - | Paula's Choice Resist Barrier Repair |
| **Ceramide/Peptide (Oily/Combo)** | Minimalist 0.3% Ceramide | Within Beauty Ceramide & Peptide | - |
| **Ceramide/Peptide (Dry)** | Minimalist Vitamin B12 + Repair | CeraVe Moisturizer Cream | - |
| **Smoothening** | CeraVe SA Lotion | - | - |

### 4. **Sunscreen** (6 subcategories)

| Subcategory | Affordable | Mid-Range | Premium |
|---|---|---|---|
| **Chemical Gel/Fluid** | Minimalist Light Fluid SPF 50 | Re\'equil Ultra Matte Gel SPF50 | - |
| **Hybrid/Gentle Mineral** | Minimalist Light Fluid SPF 50 | Re\'equil Sheer Zinc Tinted SPF 50, Bioderma Photoderm | Bioderma Photoderm Crème SPF50+ |
| **Chemical/Hybrid Fluid** | Minimalist Light Fluid SPF 50 | Neutrogena Ultra Sheer SPF50+, Bioderma Photoderm | Bioderma Photoderm Crème SPF50+ |
| **Mineral/Hybrid Cream** | - | Re\'equil Sheer Zinc, Suncros SPF50 | Bioderma Photoderm Crème SPF50+ |
| **Pure Mineral** | Re\'equil Sheer Zinc SPF 50 | Suncros SPF50 | - |
| **Tinted Mineral** | Re\'equil Sheer Zinc SPF 50 | - | Bioderma Photoderm M SPF50+ |

---

## Key Features

### ✅ Tier-Based Selection
Products are organized by affordability, allowing recommendations to adapt to customer budget constraints.

### ✅ Helper Functions

**`getProductByTier(products, preferredTier)`**
- Retrieves a product based on preferred tier
- Falls back to mid-range if preferred tier unavailable
- Further falls back to affordable if mid-range unavailable
- Returns first available product as last resort

```typescript
// Usage
const selectedProduct = getProductByTier(cleanserOptions, 'mid-range');
```

**`formatProductName(product)`**
- Returns formatted name with brand
- Output format: "Product Name (Brand)"

```typescript
// Output example
// "Cetaphil Oily Skin Cleanser (Galderma)"
```

### ✅ Recommendation Integration
The product database integrates with the recommendation engine to suggest options across different price points, enabling:
- **Budget-conscious recommendations** (affordable tier)
- **Balanced recommendations** (mid-range tier)
- **Premium/luxury recommendations** (premium tier)

---

## Usage Examples

### Example 1: Get Mid-Range Niacinamide Serum
```typescript
import { PRODUCT_DATABASE, getProductByTier } from '@/data/productDatabase';

const niacinamideProducts = PRODUCT_DATABASE.serum['niacinamide'];
const midRangeProduct = getProductByTier(niacinamideProducts, 'mid-range');
// Returns: { name: 'The Ordinary 10% Niacinamide', brand: 'Estee Lauder', tier: 'mid-range' }
```

### Example 2: Get Affordable Moisturizer
```typescript
const gelmoisturizers = PRODUCT_DATABASE.moisturizer['gel'];
const affordableProduct = getProductByTier(gelmoisturizers, 'affordable');
// Returns: { name: 'Plum 2% Niacinamide And Rice Water Moisturiser', brand: 'Plum', tier: 'affordable' }
```

### Example 3: Find All Premium Products in Cleanser Category
```typescript
const cleanserProducts = Object.values(PRODUCT_DATABASE.cleanser).flat();
const premiumOptions = cleanserProducts.filter(p => p.tier === 'premium');
```

---

## Data Coverage

### Total Products: 70+ Listed Products

**Category Distribution**:
- **Cleanser**: 5 subcategories, 20+ products
- **Serum**: 14 subcategories, 35+ products
- **Moisturizer**: 8 subcategories, 15+ products
- **Sunscreen**: 6 subcategories, 10+ products

**Tier Distribution** (approximate):
- **Affordable**: 30%
- **Mid-Range**: 45%
- **Premium**: 25%

---

## Integration with Supabase

**Current Status**: Product database is maintained in TypeScript (`productDatabase.ts`)

**Future Enhancement**: Can be extended to sync with Supabase `product` table for:
- Dynamic product updates via admin dashboard
- Ability to add/edit products without code deployment
- Real-time price tier adjustments

**Data Flow**:
1. TypeScript database serves as source of truth
2. Recommendation engine queries products by category/subcategory
3. Tier preference applied at recommendation time
4. Product with brand formatted for display

---

## Updating Products

### To Add a New Product
```typescript
export const PRODUCT_DATABASE: ProductDatabase = {
  cleanser: {
    'foaming-gel': [
      // ... existing products
      { 
        name: 'New Cleanser Name', 
        brand: 'Brand Name', 
        tier: 'mid-range' 
      },
    ],
  },
  // ...
};
```

### To Add a New Subcategory
```typescript
serum: {
  // ... existing subcategories
  'new-active': [
    { name: 'Product Name', brand: 'Brand', tier: 'affordable' },
    { name: 'Product Name', brand: 'Brand', tier: 'mid-range' },
  ],
},
```

### To Add a New Category
```typescript
export const PRODUCT_DATABASE: ProductDatabase = {
  // ... existing categories
  'new-category': {
    'subcategory-1': [
      { name: 'Product 1', brand: 'Brand', tier: 'affordable' },
    ],
  },
};
```

---

## Related Files

- **Main Database**: `src/data/productDatabase.ts`
- **Types**: `src/types.ts` (includes ProductOption, ProductCategory interfaces)
- **Usage in Recommendation Engine**: `src/services/recommendationEngineMatrix.ts`
- **Admin Dashboard**: `src/admin/ProductCatalogManager.tsx`

---

## Notes

- **Tier definitions** are advisory (not enforced by system)
- **Brand names** are canonical identifiers (used for matching)
- **Product names** are display-friendly (used in UI)
- **Subcategories** map to ingredient types (e.g., 'niacinamide', 'vitamin-c')
- **All subcategories** follow kebab-case naming convention

---

## Version History

| Date | Version | Changes |
|---|---|---|
| Oct 18, 2025 | 1.0 | Initial documentation with comprehensive pricing tier structure |

---

*Maintained by: Product Database Team*  
*Last Updated: October 18, 2025*
