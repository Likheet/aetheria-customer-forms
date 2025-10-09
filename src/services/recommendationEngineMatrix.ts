import {
  lookupMatrixEntry,
  ConcernKey,
  SkinTypeKey,
  BandColor,
  MatrixEntry,
  MatrixProduct,
  ProductSlot,
  ProductInfo,
  getProductInfo,
} from '../data/concernMatrix';
import { buildWeeklyPlan } from './scheduler';
import { pairCompatibility, serumKeyToTag, IngredientTag } from './ingredientInteractions';

type Maybe<T> = T | undefined | null;

export interface ProductRecommendation {
  cleanser: string;
  coreSerum: string;
  secondarySerum: string;
  moisturizer: string;
  sunscreen: string;
  tertiarySerum?: string;
  _keys?: {
    cleanserType?: string;
    core?: string;
    secondary?: string;
    tertiary?: string;
    moisturizerType?: string;
  };
  _flags?: {
    vc_form?: 'laa' | 'derivative';
    core_acid_strength?: 'low' | 'medium' | 'high';
    secondary_acid_strength?: 'low' | 'medium' | 'high';
    tertiary_acid_strength?: 'low' | 'medium' | 'high';
  };
  _ingredients?: {
    cleanser: IngredientTag[];
    coreSerum: IngredientTag[];
    secondarySerums: IngredientTag[][];
    moisturizer: IngredientTag[];
    sunscreen: IngredientTag[];
  };
}

export interface DecisionEngineFlags {
  acneSubtype?: string;
  acneHormonal?: boolean;
  dermatologistReferral?: boolean;
  textureSubtype?: string;
  pigmentationSubtype?: string;
  barrierOverride?: boolean;
  [key: string]: unknown;
}

export interface DecisionEngineInput {
  effectiveBands: Partial<Record<string, string>>;
  flags?: DecisionEngineFlags;
}

export interface RecommendationContext {
  skinType: string | string[];
  decisionEngine?: DecisionEngineInput;
  effectiveBands?: Partial<Record<string, string>>;
  acneCategories?: string[];
  decisions?: any[];
  formData: {
    name?: string;
    skinType?: string;
    mainConcerns?: string[];
    concernPriority?: string[];
    pregnancy?: string;
    pregnancyBreastfeeding?: string;
    sensitivity?: string;
    pigmentationType?: string;
    serumComfort?: string;
    routineSteps?: string;
    moisturizerTexture?: string;
    allergies?: string;
    recentIsotretinoin?: string;
    severeCysticAcne?: string;
    barrierStressHigh?: string;
    [key: string]: unknown;
  };
}

export interface EnhancedRecommendation extends ProductRecommendation {
  primaryConcern: string;
  concernBand: string;
  rationale?: string;
  serumCount: number;
  additionalSerums?: string[];
  notes: string[];
  am: string[];
  pm: string[];
  schedule?: {
    am: Array<{ step: number; label: string; product: string }>;
    pmByDay: Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', Array<{ step: number; label: string; product: string }>>;
    warnings: string[];
    customerView: {
      am: Array<{ step: number; label: string; product: string }>;
      pm: Array<{ step: number; label: string; product: string }>;
      notes: string[];
    };
  };
}

// ---- Safety gate helpers ----
function hasSevereCysticGate(context: RecommendationContext): boolean {
  const v = (context.formData as any).severeCysticAcne;
  return typeof v === 'string' && v.trim().toLowerCase() === 'yes';
}

function hasBarrierStressHighGate(context: RecommendationContext): boolean {
  const v = (context.formData as any).barrierStressHigh;
  return typeof v === 'string' && v.trim().toLowerCase() === 'yes';
}

function hasRecentIsotretinoinGate(context: RecommendationContext): boolean {
  const v = (context.formData as any).recentIsotretinoin;
  return typeof v === 'string' && v.trim().toLowerCase() === 'yes';
}

function parsedAllergies(context: RecommendationContext): string[] {
  const raw = String((context.formData as any).allergies || '').toLowerCase();
  if (!raw) return [];
  return raw
    .split(/[,;/]/)
    .map(token => token.trim())
    .filter(Boolean);
}

function isPregnancySafe(context: RecommendationContext): boolean {
  const pregnancy = String(context.formData.pregnancy || '').toLowerCase();
  if (pregnancy === 'yes') return true;
  const pb = String(context.formData.pregnancyBreastfeeding || '').toLowerCase();
  return pb.includes('pregnan');
}

function deriveEffectiveBands(context: RecommendationContext): Record<string, string> {
  const fromDecision = context.decisionEngine?.effectiveBands || {};
  const legacy = context.effectiveBands || {};
  return { ...legacy, ...fromDecision };
}

function isSensitive(context: RecommendationContext): boolean {
  const eff = deriveEffectiveBands(context);
  const band = String(eff.sensitivity || '').toLowerCase();
  if (band === 'yellow' || band === 'red') return true;
  return String(context.formData.sensitivity || '').toLowerCase() === 'yes';
}

function buildGateDisallowSet(context: RecommendationContext): Set<string> {
  const disallow = new Set<string>();
  const onIso = hasRecentIsotretinoinGate(context);
  const allergies = parsedAllergies(context);
  const pregnant = isPregnancySafe(context);
  const barrierFirst = hasBarrierStressHighGate(context);

  if (onIso) {
    ['retinol', 'adapalene', 'benzoyl-peroxide', 'salicylic-acid', 'lactic-acid', 'vitamin-c'].forEach(k => disallow.add(k));
  }
  if (pregnant) {
    ['retinol', 'adapalene', 'benzoyl-peroxide', 'salicylic-acid', 'lactic-acid'].forEach(k => disallow.add(k));
  }
  if (barrierFirst) {
    ['retinol', 'adapalene', 'salicylic-acid', 'lactic-acid', 'benzoyl-peroxide'].forEach(k => disallow.add(k));
  }

  const allergyMatches = (keyword: string): boolean =>
    allergies.some(allergy => keyword.includes(allergy) || allergy.includes(keyword));

  if (allergyMatches('aspirin') || allergyMatches('salicyl')) disallow.add('salicylic-acid');
  if (allergyMatches('benzoyl')) disallow.add('benzoyl-peroxide');
  if (allergyMatches('retino')) {
    disallow.add('retinol');
    disallow.add('adapalene');
  }
  if (allergyMatches('niacinamide')) disallow.add('niacinamide');
  if (allergyMatches('vitamin c') || allergyMatches('ascorb')) disallow.add('vitamin-c');
  if (allergyMatches('lactic') || allergyMatches('aha') || allergyMatches('glycol')) disallow.add('lactic-acid');

  return disallow;
}

const BAND_PRIORITY: Record<BandColor, number> = {
  red: 1,
  yellow: 2,
  blue: 3,
  green: 4,
};

const CONCERN_PRIORITY: Record<ConcernKey, number> = {
  acne: 1,
  sebum: 2,
  pigmentation: 3,
  texture: 4,
  pores: 5,
  acnescars: 6,
};

const SKIN_TYPE_DEFAULTS: Record<
  SkinTypeKey,
  {
    cleanser: string;
    coreSerum: string;
    secondarySerum: string;
    moisturizer: string;
    sunscreen: string;
  }
> = {
  Dry: {
    cleanser: 'Cream cleanser',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Azelaic acid',
    moisturizer: 'Rich cream',
    sunscreen: 'Nourishing mineral cream sunscreen SPF 50',
  },
  Combo: {
    cleanser: 'Gentle foaming cleanser',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Azelaic acid',
    moisturizer: 'Gel-cream',
    sunscreen: 'Hybrid sunscreen SPF 50',
  },
  Oily: {
    cleanser: 'Gel-based cleanser',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Salicylic acid 2%',
    moisturizer: 'Oil-free gel',
    sunscreen: 'Lightweight gel sunscreen SPF 50',
  },
  Sensitive: {
    cleanser: 'Gentle cleanser',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Azelaic acid',
    moisturizer: 'Barrier cream',
    sunscreen: 'Pure mineral sunscreen SPF 50',
  },
  Normal: {
    cleanser: 'Gentle foaming cleanser',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Vitamin C (derivatives)',
    moisturizer: 'Gel-cream',
    sunscreen: 'Broad-spectrum sunscreen SPF 50',
  },
};

function toBandColor(value: string | undefined): BandColor | null {
  if (!value) return null;
  const lower = value.trim().toLowerCase();
  if (lower === 'red' || lower === 'yellow' || lower === 'blue' || lower === 'green') {
    return lower as BandColor;
  }
  return null;
}

interface RoutineState {
  cleanser: MatrixProduct;
  coreSerum: MatrixProduct;
  secondarySerums: MatrixProduct[];
  moisturizer: MatrixProduct;
  sunscreen: MatrixProduct;
}

function cloneProduct(product: MatrixProduct): MatrixProduct {
  return {
    ...product,
    ingredientTags: [...product.ingredientTags],
    ingredientKeywords: [...product.ingredientKeywords],
  };
}

function instantiateProduct(name: string, slot: ProductSlot): MatrixProduct {
  const info = getProductInfo(name);
  if (!info) {
    throw new Error(`No product metadata found for "${name}"`);
  }
  const ingredientTags = [...info.ingredientTags];
  const ingredientKeywords = [...info.ingredientKeywords];
  return {
    ...info,
    ingredientTags,
    ingredientKeywords,
    slot,
    rawName: name,
    isDynamic: false,
  };
}

function buildRoutineFromEntry(entry: MatrixEntry): RoutineState {
  return {
    cleanser: cloneProduct(entry.cleanser),
    coreSerum: cloneProduct(entry.coreSerum),
    secondarySerums: [],
    moisturizer: cloneProduct(entry.moisturizer),
    sunscreen: cloneProduct(entry.sunscreen),
  };
}

function buildSkinTypeFallbackRoutine(skinType: SkinTypeKey, notes: string[]): RoutineState {
  const defaults = SKIN_TYPE_DEFAULTS[skinType];
  notes.push(`Using skin type fallback routine for ${skinType}.`);
  return {
    cleanser: instantiateProduct(defaults.cleanser, 'cleanser'),
    coreSerum: instantiateProduct(defaults.coreSerum, 'coreSerum'),
    secondarySerums: [],
    moisturizer: instantiateProduct(defaults.moisturizer, 'moisturizer'),
    sunscreen: instantiateProduct(defaults.sunscreen, 'sunscreen'),
  };
}

const SERUM_KEY_MAP: Record<string, string> = {
  'adapalene 0.1% pm': 'adapalene',
  'adapalene 0.1%': 'adapalene',
  'adapalene': 'adapalene',
  'retinol': 'retinol',
  'retinol treatment': 'retinol',
  'retinol peptide treatment': 'retinol',
  'benzoyl peroxide 2.5%': 'benzoyl-peroxide',
  'benzoyl peroxide 2.5% am': 'benzoyl-peroxide',
  'salicylic acid 2%': 'salicylic-acid',
  'gentle aha serum': 'lactic-acid',
  'niacinamide serum': 'niacinamide',
  'vitamin c serum': 'vitamin-c',
  'vitamin c derivative serum': 'vitamin-c-derivative',
  'azelaic acid 10%': 'azelaic-acid',
  'azelaic acid 10-15%': 'azelaic-acid',
  'azelaic acid': 'azelaic-acid',
  'tranexamic acid serum': 'tranexamic-acid',
  'bakuchiol peptide serum': 'peptides',
  'clay mask': 'clay-mask',
  'silicone scar sheets': 'silicone-sheets',
};

function serumKeyFromProduct(product: MatrixProduct | undefined): string | undefined {
  if (!product) return undefined;
  const raw = product.rawName?.trim().toLowerCase();
  if (raw && SERUM_KEY_MAP[raw]) return SERUM_KEY_MAP[raw];
  const name = product.name.trim().toLowerCase();
  if (SERUM_KEY_MAP[name]) return SERUM_KEY_MAP[name];
  const tags = product.ingredientTags || [];
  if (tags.includes('retinoids')) {
    return raw?.includes('adapalene') ? 'adapalene' : 'retinol';
  }
  if (tags.includes('benzoyl_peroxide')) return 'benzoyl-peroxide';
  if (tags.includes('bha')) return 'salicylic-acid';
  if (tags.includes('aha')) return 'lactic-acid';
  if (tags.includes('azelaic')) return 'azelaic-acid';
  if (tags.includes('niacinamide')) return 'niacinamide';
  if (tags.includes('vitamin_c_ascorbic')) return 'vitamin-c';
  if (tags.includes('vitamin_c_derivative')) return 'vitamin-c-derivative';
  if (tags.includes('tranexamic')) return 'tranexamic-acid';
  if (tags.includes('peptides')) return 'peptides';
  return undefined;
}

interface CompatibilityResult {
  allowed: boolean;
  cautions: string[];
  reason?: string;
}

function evaluateCompatibility(existing: MatrixProduct[], candidate: MatrixProduct): CompatibilityResult {
  const cautions: string[] = [];
  for (const product of existing) {
    for (const a of product.ingredientTags) {
      for (const b of candidate.ingredientTags) {
        const cmp = pairCompatibility(a, b);
        if (cmp === 'disallow') {
          return {
            allowed: false,
            reason: `${candidate.name} conflicts with ${product.name}`,
            cautions,
          };
        }
        if (cmp === 'caution') {
          cautions.push(`${candidate.name} requires caution with ${product.name}`);
        }
      }
    }
  }
  return { allowed: true, cautions };
}

function replaceSerum(target: 'core' | number, routine: RoutineState, replacement: MatrixProduct, notes: string[], reason: string): void {
  if (target === 'core') {
    notes.push(`${reason}: replaced core serum with ${replacement.name}.`);
    routine.coreSerum = replacement;
  } else {
    notes.push(`${reason}: replaced serum #${target + 1} with ${replacement.name}.`);
    routine.secondarySerums[target] = replacement;
  }
}

function pregnancySafeSerumReplacement(original: MatrixProduct): MatrixProduct {
  if (original.ingredientTags.includes('azelaic')) {
    return instantiateProduct('Niacinamide serum', original.slot);
  }
  if (original.ingredientTags.includes('niacinamide')) {
    return instantiateProduct('Azelaic acid 10%', original.slot);
  }
  return instantiateProduct('Azelaic acid 10%', original.slot);
}

function applyPregnancySafety(routine: RoutineState, context: RecommendationContext, notes: string[]): void {
  if (!isPregnancySafe(context)) return;

  const checkAndReplace = (product: MatrixProduct, target: 'core' | number): void => {
    const tags = product.ingredientTags;
    if (tags.includes('retinoids') || tags.includes('benzoyl_peroxide') || tags.includes('bha') || tags.includes('aha')) {
      const replacement = pregnancySafeSerumReplacement(product);
      replaceSerum(target, routine, replacement, notes, 'Pregnancy safety');
    }
  };

  checkAndReplace(routine.coreSerum, 'core');
  routine.secondarySerums.forEach((serum, idx) => checkAndReplace(serum, idx));
}

function isotretinoinSafeReplacement(original: MatrixProduct): MatrixProduct {
  if (original.ingredientTags.includes('niacinamide')) return instantiateProduct('Niacinamide serum', original.slot);
  if (original.ingredientTags.includes('azelaic')) return instantiateProduct('Niacinamide serum', original.slot);
  return instantiateProduct('Niacinamide serum', original.slot);
}

function applyIsotretinoinSafety(routine: RoutineState, context: RecommendationContext, notes: string[]): void {
  if (!hasRecentIsotretinoinGate(context)) return;

  const replaceIfHarsh = (product: MatrixProduct, target: 'core' | number): void => {
    const tags = product.ingredientTags;
    if (tags.includes('retinoids') || tags.includes('benzoyl_peroxide') || tags.includes('bha') || tags.includes('aha')) {
      const replacement = isotretinoinSafeReplacement(product);
      replaceSerum(target, routine, replacement, notes, 'Isotretinoin recovery safety');
    }
  };

  replaceIfHarsh(routine.coreSerum, 'core');
  routine.secondarySerums.forEach((serum, idx) => replaceIfHarsh(serum, idx));

  // Upgrade moisturizer to barrier focus
  if (!routine.moisturizer.ingredientTags.includes('ceramides')) {
    routine.moisturizer = instantiateProduct('Barrier repair cream', 'moisturizer');
    notes.push('Isotretinoin recovery safety: switched moisturizer to Barrier repair cream.');
  }
  routine.cleanser = instantiateProduct('Gentle cleanser', 'cleanser');
  notes.push('Isotretinoin recovery safety: switched cleanser to Gentle cleanser.');
}

function applyAllergySafety(routine: RoutineState, context: RecommendationContext, notes: string[]): void {
  const allergies = parsedAllergies(context);
  if (!allergies.length) return;
  const hasAllergy = (product: MatrixProduct): Maybe<string> => {
    for (const keyword of product.ingredientKeywords) {
      for (const allergy of allergies) {
        if (keyword.includes(allergy) || allergy.includes(keyword)) {
          return keyword;
        }
      }
    }
    return null;
  };

  const replaceWithAlt = (product: MatrixProduct, target: 'core' | number, allergen: string) => {
    let replacementName = 'Niacinamide serum';
    if (allergen.includes('niacinamide')) {
      replacementName = 'Azelaic acid 10%';
    } else if (allergen.includes('azelaic')) {
      replacementName = 'Vitamin C derivative serum';
    } else if (allergen.includes('vitamin c')) {
      replacementName = 'Niacinamide serum';
    } else if (allergen.includes('salicyl')) {
      replacementName = 'Azelaic acid 10%';
    } else if (allergen.includes('benzoyl')) {
      replacementName = 'Azelaic acid 10%';
    } else if (allergen.includes('retino')) {
      replacementName = 'Azelaic acid 10%';
    }
    const replacement = instantiateProduct(replacementName, product.slot);
    replaceSerum(target, routine, replacement, notes, `Allergy safety (${allergen})`);
  };

  const coreAllergen = hasAllergy(routine.coreSerum);
  if (coreAllergen) replaceWithAlt(routine.coreSerum, 'core', coreAllergen);

  routine.secondarySerums.forEach((serum, idx) => {
    const allergen = hasAllergy(serum);
    if (allergen) replaceWithAlt(serum, idx, allergen);
  });

  const moisturizerAllergen = hasAllergy(routine.moisturizer);
  if (moisturizerAllergen) {
    routine.moisturizer = instantiateProduct('Barrier repair cream', 'moisturizer');
    notes.push(`Allergy safety (${moisturizerAllergen}): switched moisturizer to Barrier repair cream.`);
  }

  const cleanserAllergen = hasAllergy(routine.cleanser);
  if (cleanserAllergen) {
    routine.cleanser = instantiateProduct('Gentle cleanser', 'cleanser');
    notes.push(`Allergy safety (${cleanserAllergen}): switched cleanser to Gentle cleanser.`);
  }
}

function augmentSerumsForAdditionalConcerns(
  routine: RoutineState,
  additionalConcerns: ConcernSelection[],
  context: RecommendationContext,
  skinType: SkinTypeKey,
  notes: string[],
): void {
  const serumComfort = Math.max(1, Math.min(3, parseInt(String(context.formData.serumComfort || '1'), 10) || 1));
  if (serumComfort <= 1) return;

  const disallow = buildGateDisallowSet(context);
  const existingSerums: MatrixProduct[] = [routine.coreSerum, ...routine.secondarySerums];
  let slotsRemaining = serumComfort - 1;

  for (const concern of additionalConcerns) {
    if (slotsRemaining <= 0) break;
    const entry = fetchMatrixEntry(concern, skinType, notes);
    if (!entry) {
      notes.push(`Missing matrix entry for ${concern.concern} ${concern.subtype}; unable to add serum.`);
      continue;
    }
    if (!entry.secondarySerum) {
      notes.push(`No secondary serum defined for ${concern.concern} ${concern.subtype}.`);
      continue;
    }
    const candidate = cloneProduct(entry.secondarySerum);
    const key = serumKeyFromProduct(candidate);
    if (key && disallow.has(key)) {
      notes.push(`Skipped ${candidate.name} due to safety gate (${key}).`);
      continue;
    }
    const compat = evaluateCompatibility(existingSerums, candidate);
    if (!compat.allowed) {
      notes.push(`Skipped ${candidate.name}: ${compat.reason}.`);
      continue;
    }
    routine.secondarySerums.push(candidate);
    existingSerums.push(candidate);
    slotsRemaining -= 1;
    if (compat.cautions.length) {
      compat.cautions.forEach(c => notes.push(`Compatibility caution: ${c}.`));
    }
  }
}

type SerumTiming = 'am' | 'pm' | 'both';

function serumTiming(product: MatrixProduct): SerumTiming {
  const reference = (product.rawName || product.name || '').toUpperCase();
  if (/\bAM\b/.test(reference)) return 'am';
  if (/\bPM\b/.test(reference)) return 'pm';

  const name = product.name.toLowerCase();
  const tags = product.ingredientTags;
  if (tags.includes('retinoids')) return 'pm';
  if (tags.includes('peptides')) return 'pm';
  if (tags.includes('vitamin_c_ascorbic') || tags.includes('vitamin_c_derivative') || tags.includes('tranexamic')) {
    return 'am';
  }
  if (tags.includes('azelaic') || tags.includes('niacinamide') || tags.includes('ceramides')) {
    return 'both';
  }
  if (tags.includes('bha') || tags.includes('aha')) {
    return 'pm';
  }
  if (tags.includes('benzoyl_peroxide')) {
    return name.includes('am') ? 'am' : 'pm';
  }
  return 'both';
}

function buildAmPmRoutines(routine: RoutineState): { am: string[]; pm: string[] } {
  const amSerums: string[] = [];
  const pmSerums: string[] = [];
  const serums = [routine.coreSerum, ...routine.secondarySerums];

  serums.forEach(product => {
    const timing = serumTiming(product);
    if (timing === 'am' || timing === 'both') {
      amSerums.push(product.name);
    }
    if (timing === 'pm' || timing === 'both') {
      pmSerums.push(product.name);
    }
  });

  const cleanserName = routine.cleanser.name;
  const moisturizerName = routine.moisturizer.name;
  const sunscreenName = routine.sunscreen.name;

  const am = [cleanserName, ...amSerums, moisturizerName, sunscreenName];
  const pm = [cleanserName, ...pmSerums, moisturizerName];

  return {
    am: am.filter(Boolean),
    pm: pm.filter(Boolean),
  };
}

function tagsForProduct(product: MatrixProduct | undefined): IngredientTag[] {
  return product ? [...product.ingredientTags] : [];
}

function detectVitaminCForm(product: MatrixProduct | undefined): 'laa' | 'derivative' | undefined {
  if (!product) return undefined;
  if (product.ingredientTags.includes('vitamin_c_ascorbic')) return 'laa';
  if (product.ingredientTags.includes('vitamin_c_derivative')) return 'derivative';
  return undefined;
}

function acidStrengthFor(product: MatrixProduct | undefined): 'low' | 'medium' | 'high' | undefined {
  if (!product) return undefined;
  if (product.ingredientTags.includes('retinoids') || product.ingredientTags.includes('benzoyl_peroxide')) return 'high';
  if (product.ingredientTags.includes('aha') || product.ingredientTags.includes('bha')) return 'medium';
  return 'low';
}

function routineToRecommendation(
  routine: RoutineState,
  primaryConcern: ConcernSelection,
  otherConcerns: ConcernSelection[],
  context: RecommendationContext,
  notes: string[],
): EnhancedRecommendation {
  const { am, pm } = buildAmPmRoutines(routine);
  const serumCount = 1 + routine.secondarySerums.length;
  const secondaryName = routine.secondarySerums[0]?.name || '';
  const tertiaryName = routine.secondarySerums[1]?.name;
  const additionalSerums = routine.secondarySerums.slice(1).map(s => s.name);

  const coreKey = serumKeyFromProduct(routine.coreSerum);
  const secondaryKey = serumKeyFromProduct(routine.secondarySerums[0]);
  const tertiaryKey = serumKeyFromProduct(routine.secondarySerums[1]);

  const recommendation: EnhancedRecommendation = {
    cleanser: routine.cleanser.name,
    coreSerum: routine.coreSerum.name,
    secondarySerum: secondaryName,
    tertiarySerum: tertiaryName,
    moisturizer: routine.moisturizer.name,
    sunscreen: routine.sunscreen.name,
    serumCount,
    additionalSerums,
    primaryConcern: `${primaryConcern.concern.charAt(0).toUpperCase()}${primaryConcern.concern.slice(1)} (${primaryConcern.band})`,
    concernBand: primaryConcern.band,
    am,
    pm,
    notes,
    _keys: {
      cleanserType: routine.cleanser.rawName,
      core: coreKey,
      secondary: secondaryKey,
      tertiary: tertiaryKey,
      moisturizerType: routine.moisturizer.rawName,
    },
    _flags: {
      vc_form: detectVitaminCForm(routine.coreSerum) || detectVitaminCForm(routine.secondarySerums[0]),
      core_acid_strength: acidStrengthFor(routine.coreSerum),
      secondary_acid_strength: acidStrengthFor(routine.secondarySerums[0]),
      tertiary_acid_strength: acidStrengthFor(routine.secondarySerums[1]),
    },
    _ingredients: {
      cleanser: tagsForProduct(routine.cleanser),
      coreSerum: tagsForProduct(routine.coreSerum),
      secondarySerums: routine.secondarySerums.map(tagsForProduct),
      moisturizer: tagsForProduct(routine.moisturizer),
      sunscreen: tagsForProduct(routine.sunscreen),
    },
  };

  if (otherConcerns.length) {
    recommendation.rationale = `Also considered: ${otherConcerns.map(c => `${c.concern} (${c.band})`).join(', ')}.`;
  }

  try {
    if (coreKey) {
      const scheduleSecondaryKey = secondaryKey || tertiaryKey;
      const scheduleSecondaryProduct = secondaryKey
        ? routine.secondarySerums[0]
        : (tertiaryKey ? routine.secondarySerums[1] : undefined);
      const { plan, customerView } = buildWeeklyPlan({
        cleanser: recommendation.cleanser,
        coreSerumKey: coreKey,
        coreSerumName: routine.coreSerum.name,
        coreSerumRawName: routine.coreSerum.rawName,
        secondarySerumKey: scheduleSecondaryKey,
        secondarySerumName: scheduleSecondaryProduct?.name,
        secondarySerumRawName: scheduleSecondaryProduct?.rawName,
        moisturizer: recommendation.moisturizer,
        sunscreen: recommendation.sunscreen,
        flags: {
          vc_form: recommendation._flags?.vc_form,
          core_acid_strength: recommendation._flags?.core_acid_strength,
          secondary_acid_strength: recommendation._flags?.secondary_acid_strength,
          pregnancy: isPregnancySafe(context),
          sensitivity: isSensitive(context),
          sensitivityBand: (deriveEffectiveBands(context).sensitivity as 'green' | 'blue' | 'yellow' | 'red') || 'green',
          serumComfort: Math.max(1, Math.min(3, parseInt(String(context.formData.serumComfort || '1'), 10) || 1)),
        },
      });
      recommendation.schedule = { ...plan, customerView };
    }
  } catch (error) {
    notes.push(`Schedule generation failed: ${(error as Error).message}`);
  }

  return recommendation;
}

function buildBarrierFirstRoutine(context: RecommendationContext): EnhancedRecommendation {
  const notes = ['Barrier-first override: severe barrier compromise.'];
  const cleanser = instantiateProduct('Gentle cleanser', 'cleanser');
  const serum = instantiateProduct('Niacinamide serum', 'coreSerum');
  const moisturizer = instantiateProduct('Barrier repair cream', 'moisturizer');
  const sunscreen = instantiateProduct('Pure mineral sunscreen SPF 50', 'sunscreen');

  const routine: RoutineState = {
    cleanser,
    coreSerum: serum,
    secondarySerums: [],
    moisturizer,
    sunscreen,
  };

  return routineToRecommendation(
    routine,
    {
      concern: 'texture',
      subtype: 'Barrier',
      band: 'yellow',
      priority: 0,
      source: 'decision',
    },
    [],
    context,
    notes,
  );
}

function buildDermReferralRecommendation(): EnhancedRecommendation {
  return {
    cleanser: '-',
    coreSerum: '-',
    secondarySerum: '-',
    tertiarySerum: undefined,
    moisturizer: '-',
    sunscreen: '- (DERMATOLOGIST REFERRAL REQUIRED)',
    serumCount: 0,
    additionalSerums: [],
    primaryConcern: 'Safety',
    concernBand: '',
    notes: ['Dermatologist referral required.'],
    am: [],
    pm: [],
  };
}

function buildFallbackRecommendation(
  skinType: SkinTypeKey,
  primary: ConcernSelection,
  others: ConcernSelection[],
  context: RecommendationContext,
  notes: string[],
): EnhancedRecommendation {
  const routine = buildSkinTypeFallbackRoutine(skinType, notes);
  return routineToRecommendation(routine, primary, others, context, notes);
}

export function generateRecommendations(context: RecommendationContext): EnhancedRecommendation {
  const notes: string[] = [];

  if (hasSevereCysticGate(context)) {
    return buildDermReferralRecommendation();
  }

  if (hasBarrierStressHighGate(context)) {
    return buildBarrierFirstRoutine(context);
  }

  const concerns = collectConcernSelections(context);
  const { primary, others } = selectPrimaryConcern(concerns, notes);
  const skinType = deriveSkinTypeKey(context);

  if (!primary) {
    notes.push('No primary concern detected; defaulting to skin-type routine.');
    const fallbackPrimary: ConcernSelection = {
      concern: 'texture',
      subtype: 'General',
      band: 'blue',
      priority: 999,
      source: 'decision',
    };
    const routine = buildSkinTypeFallbackRoutine(skinType, notes);
    return routineToRecommendation(routine, fallbackPrimary, [], context, notes);
  }

  const entry = fetchMatrixEntry(primary, skinType, notes);
  let routine: RoutineState;
  if (!entry) {
    notes.push(`Matrix entry missing for ${primary.concern} ${primary.subtype}.`);
    routine = buildSkinTypeFallbackRoutine(skinType, notes);
  } else if (entry.cleanser.isReferral || entry.coreSerum.isReferral || entry.sunscreen.isReferral) {
    notes.push('Matrix row indicates dermatologist referral.');
    return buildDermReferralRecommendation();
  } else {
    routine = buildRoutineFromEntry(entry);
  }

  augmentSerumsForAdditionalConcerns(routine, others, context, skinType, notes);
  applyPregnancySafety(routine, context, notes);
  applyIsotretinoinSafety(routine, context, notes);
  applyAllergySafety(routine, context, notes);

  return routineToRecommendation(routine, primary, others, context, notes);
}

function deriveSkinTypeKey(context: RecommendationContext): SkinTypeKey {
  if (isSensitive(context)) return 'Sensitive';
  const raw = Array.isArray(context.skinType) ? context.skinType.join(' ') : String(context.skinType || '');
  const lower = raw.toLowerCase();
  if (lower.includes('dry')) return 'Dry';
  if (lower.includes('combo') || lower.includes('combination')) return 'Combo';
  if (lower.includes('oily')) return 'Oily';
  return 'Normal';
}

interface ConcernSelection {
  concern: ConcernKey;
  subtype: string;
  band: BandColor;
  priority: number;
  source: 'user' | 'decision';
}

function normalizeConcernLabel(label: string): Maybe<ConcernKey> {
  const lower = label.toLowerCase();
  if (lower.includes('acne')) return 'acne';
  if (lower.includes('sebum') || lower.includes('oil')) return 'sebum';
  if (lower.includes('pigment')) return 'pigmentation';
  if (lower.includes('texture') || lower.includes('fine lines') || lower.includes('wrinkle') || lower.includes('bumpy')) {
    return 'texture';
  }
  if (lower.includes('pore')) return 'pores';
  if (lower.includes('scar')) return 'acnescars';
  return null;
}

function inferAcneSubtype(context: RecommendationContext): string {
  const fromFlags = String(context.decisionEngine?.flags?.acneSubtype || '').toLowerCase();
  if (fromFlags.includes('nodulo') || fromFlags.includes('cystic')) return 'Nodulocystic';
  if (fromFlags.includes('hormonal')) return 'Hormonal';
  if (fromFlags.includes('comed')) return 'Comedonal';
  if (fromFlags.includes('situational')) return 'Situational';
  if (fromFlags.includes('preg')) return 'Pregnancy';
  if (fromFlags.includes('inflam')) return 'Inflammatory';

  const categories = context.acneCategories || [];
  const lowered = categories.map(c => c.toLowerCase());
  if (lowered.some(c => c.includes('nodul') || c.includes('cystic'))) return 'Nodulocystic';
  if (lowered.some(c => c.includes('hormonal'))) return 'Hormonal';
  if (lowered.some(c => c.includes('comed'))) return 'Comedonal';
  if (lowered.some(c => c.includes('situ'))) return 'Situational';
  if (isPregnancySafe(context)) return 'Pregnancy';
  return 'Inflammatory';
}

function inferTextureSubtype(context: RecommendationContext): string {
  const flags = String(context.decisionEngine?.flags?.textureSubtype || '').toLowerCase();
  if (flags.includes('aging')) return 'Aging';
  if (flags.includes('bumpy')) return 'Bumpy';
  const mainConcerns = Array.isArray(context.formData.mainConcerns) ? context.formData.mainConcerns : [];
  const lowered = mainConcerns.map(c => c.toLowerCase());
  if (lowered.some(c => c.includes('fine lines') || c.includes('wrinkle'))) return 'Aging';
  if (lowered.some(c => c.includes('bumpy'))) return 'Bumpy';
  const textureType = String((context.formData as any).textureType || '').toLowerCase();
  if (textureType.includes('bump')) return 'Bumpy';
  return 'Aging';
}

function inferPigmentationSubtype(context: RecommendationContext, effectiveBands: Record<string, string>): { subtype: string; band: BandColor } {
  const bandRed = toBandColor(effectiveBands.pigmentation_red) || toBandColor(effectiveBands.pigmentation) || 'green';
  const bandBrown = toBandColor(effectiveBands.pigmentation_brown) || toBandColor(effectiveBands.pigmentation) || 'green';
  const redPriority = BAND_PRIORITY[bandRed];
  const brownPriority = BAND_PRIORITY[bandBrown];

  const pigType = String(context.formData.pigmentationType || '').toLowerCase();
  if (pigType.includes('red') || pigType.includes('pie')) {
    return { subtype: 'PIE', band: bandRed };
  }
  if (pigType.includes('brown') || pigType.includes('pih')) {
    return { subtype: 'PIH', band: bandBrown };
  }
  if (redPriority < brownPriority) {
    return { subtype: 'PIE', band: bandRed };
  }
  return { subtype: 'PIH', band: bandBrown };
}

function inferScarSubtype(context: RecommendationContext): string {
  const flags = String(context.decisionEngine?.flags?.textureSubtype || '').toLowerCase();
  if (flags.includes('pie')) return 'PIE';
  if (flags.includes('pih')) return 'PIH';
  return 'IcePick';
}

function resolveConcernPriority(key: ConcernKey, context: RecommendationContext): number {
  const ordered = Array.isArray(context.formData.concernPriority) ? context.formData.concernPriority : [];
  for (let idx = 0; idx < ordered.length; idx += 1) {
    const match = normalizeConcernLabel(ordered[idx] || '');
    if (match === key) return idx + 1;
  }
  return CONCERN_PRIORITY[key] ?? 999;
}

function collectConcernSelections(context: RecommendationContext): ConcernSelection[] {
  const effectiveBands = deriveEffectiveBands(context);
  const mainConcerns = Array.isArray(context.formData.mainConcerns)
    ? context.formData.mainConcerns
    : [];
  const selections: ConcernSelection[] = [];
  const seen = new Set<ConcernKey>();

  for (const label of mainConcerns) {
    const concern = normalizeConcernLabel(label);
    if (!concern) continue;
    if (seen.has(concern)) continue;
    seen.add(concern);
    let subtype = 'General';
    let band: BandColor | null = null;
    switch (concern) {
      case 'acne':
        subtype = inferAcneSubtype(context);
        band = toBandColor(effectiveBands.acne) || 'blue';
        break;
      case 'sebum':
        subtype = 'General';
        band = toBandColor(effectiveBands.sebum) || 'blue';
        break;
      case 'pigmentation': {
        const { subtype: pigSubtype, band: pigBand } = inferPigmentationSubtype(context, effectiveBands);
        subtype = pigSubtype;
        band = pigBand;
        break;
      }
      case 'texture':
        subtype = inferTextureSubtype(context);
        band = toBandColor(effectiveBands.texture) || 'blue';
        break;
      case 'pores':
        subtype = 'General';
        band = toBandColor(effectiveBands.pores) || 'blue';
        break;
      case 'acnescars':
        subtype = inferScarSubtype(context);
        band = toBandColor(effectiveBands.acne) || 'yellow';
        break;
    }
    selections.push({
      concern,
      subtype,
      band: band || 'blue',
      priority: resolveConcernPriority(concern, context),
      source: 'user',
    });
  }

  return selections.sort((a, b) => {
    const bandDelta = BAND_PRIORITY[a.band] - BAND_PRIORITY[b.band];
    if (bandDelta !== 0) return bandDelta;
    return a.priority - b.priority;
  });
}

function selectPrimaryConcern(concerns: ConcernSelection[], notes: string[]): { primary: ConcernSelection | null; others: ConcernSelection[] } {
  if (concerns.length === 0) return { primary: null, others: [] };
  const acneConcern = concerns.find(c => c.concern === 'acne');
  if (acneConcern) {
    notes.push('Acne priority override applied.');
    const others = concerns.filter(c => c !== acneConcern);
    return { primary: acneConcern, others };
  }
  const [first, ...rest] = concerns;
  return { primary: first, others: rest };
}

function bandFallbackOrder(band: BandColor): BandColor[] {
  switch (band) {
    case 'red':
      return ['red', 'yellow', 'blue'];
    case 'yellow':
      return ['yellow', 'blue'];
    case 'blue':
      return ['blue'];
    case 'green':
      return ['green', 'blue'];
    default:
      return ['blue'];
  }
}

function fetchMatrixEntry(concern: ConcernSelection, skinType: SkinTypeKey, notes: string[]): MatrixEntry | null {
  const bandsToTry = bandFallbackOrder(concern.band);
  for (const band of bandsToTry) {
    const entry = lookupMatrixEntry({
      concern: concern.concern,
      subtype: concern.subtype,
      skinType,
      band,
    });
    if (entry) {
      if (band !== concern.band) {
        notes.push(`Fell back to ${band.toUpperCase()} band for ${concern.concern} ${concern.subtype}.`);
      }
      return entry;
    }
  }

  // Attempt fallback to General subtype if not already
  if (concern.subtype !== 'General') {
    const generalConcern: ConcernSelection = { ...concern, subtype: 'General' };
    const entry = fetchMatrixEntry(generalConcern, skinType, notes);
    if (entry) {
      notes.push(`Used General subtype fallback for ${concern.concern}.`);
      return entry;
    }
  }

  // Attempt switching to Normal skin if missing specific type
  if (skinType !== 'Normal') {
    const entry = fetchMatrixEntry({ ...concern }, 'Normal', notes);
    if (entry) {
      notes.push(`Used Normal skin fallback for ${concern.concern}.`);
      return entry;
    }
  }
  return null;
}
