// Ingredient interaction rules (same-time layering compatibility)
// Implements allow/disallow/caution matrix based on provided guidance.

export type IngredientTag =
  | 'retinoids'
  | 'vitamin_c_ascorbic'
  | 'vitamin_c_derivative'
  | 'niacinamide'
  | 'aha'
  | 'bha'
  | 'azelaic'
  | 'benzoyl_peroxide'
  | 'peptides'
  | 'tranexamic'
  | 'ceramides'
  | 'sunscreen'
  | 'clay'
  | 'silicone'

export type Compatibility = 'allow' | 'disallow' | 'caution'

// Pairwise compatibility following the table.
export function pairCompatibility(a: IngredientTag, b: IngredientTag): Compatibility {
  // symmetric
  const [x, y] = a < b ? [a, b] : [b, a]
  // Disallow pairs
  const disallow: Array<[IngredientTag, IngredientTag]> = [
    ['retinoids', 'vitamin_c_ascorbic'],
    ['retinoids', 'aha'],
    ['retinoids', 'bha'],
    ['retinoids', 'benzoyl_peroxide'],
    ['vitamin_c_ascorbic', 'aha'],
    ['vitamin_c_ascorbic', 'bha'],
    ['vitamin_c_ascorbic', 'benzoyl_peroxide'],
    ['aha', 'bha'], // double exfoliation
  ]
  for (const [p, q] of disallow) {
    const [p1, q1] = p < q ? [p, q] : [q, p]
    if (p1 === x && q1 === y) return 'disallow'
  }

  // Caution pairs
  const caution: Array<[IngredientTag, IngredientTag]> = [
    ['retinoids', 'azelaic'], // can combine but better split AM/PM
    ['vitamin_c_ascorbic', 'peptides'], // low pH can destabilize
    ['aha', 'peptides'],
    ['bha', 'peptides'],
  ]
  for (const [p, q] of caution) {
    const [p1, q1] = p < q ? [p, q] : [q, p]
    if (p1 === x && q1 === y) return 'caution'
  }

  // All others allowed (including vitamin C derivatives with most things)
  return 'allow'
}

// Backward-compatible alias per prompt wording
export const classifyConflict = pairCompatibility;

// Map routine keys to ingredient tags
export function serumKeyToTag(key?: string): IngredientTag | null {
  switch ((key || '').toLowerCase()) {
    case 'adapalene':
    case 'retinol':
      return 'retinoids'
    case 'vitamin-c':
      // Interpret current vitamin-c bucket as Ascorbic (conservative for safety)
      return 'vitamin_c_ascorbic'
    case 'niacinamide':
      return 'niacinamide'
    case 'salicylic-acid':
      return 'bha'
    case 'lactic-acid':
      return 'aha'
    case 'azelaic-acid':
      return 'azelaic'
    case 'alpha-arbutin':
    case 'tranexamic-acid':
      // Safe with most; treat tranexamic as distinct tag for budgeting
      return key === 'tranexamic-acid' ? 'tranexamic' : null
    case 'benzoyl-peroxide':
      return 'benzoyl_peroxide'
    case 'peptides':
      return 'peptides'
    default:
      return null
  }
}

export function moisturizerKeyToTags(key?: string): IngredientTag[] {
  const k = (key || '').toLowerCase()
  const tags: IngredientTag[] = []
  if (k.includes('peptide')) tags.push('peptides')
  if (k.includes('barrier') || k.includes('ceramide')) tags.push('ceramides')
  return tags
}

export function sunscreenTag(): IngredientTag { return 'sunscreen' }
