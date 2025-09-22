// Skin Recommendation Engine
// Maps form data and decision engine outputs to product recommendations

import { PRODUCT_DATABASE, getProductByTier, formatProductName } from '../data/productDatabase';
import { buildWeeklyPlan } from './scheduler';
import { pairCompatibility, serumKeyToTag } from './ingredientInteractions';

export interface ProductRecommendation {
  cleanser: string;
  coreSerum: string;
  secondarySerum: string;
  moisturizer: string;
  sunscreen: string;
  // Internal metadata to aid scheduling (non-UI)
  _keys?: {
    cleanserType?: string;
    core?: string;
    secondary?: string;
    moisturizerType?: string;
  };
  _flags?: {
    vc_form?: 'laa'|'derivative';
    core_acid_strength?: 'low'|'medium'|'high';
    secondary_acid_strength?: 'low'|'medium'|'high';
  };
}

export interface RecommendationContext {
  skinType: string | string[];
  effectiveBands: {
    moisture?: string;
    sebum?: string;
    acne?: string;
    pores?: string;
    texture?: string;
    pigmentation?: string;
    pigmentation_brown?: string;
    pigmentation_red?: string;
    sensitivity?: string;
  };
  acneCategories: string[];
  decisions: any[];
  formData: {
    name?: string;
    skinType?: string;
    mainConcerns?: string[];
    pregnancy?: string;
    pregnancyBreastfeeding?: string;
    sensitivity?: string;
    pigmentationType?: string;
    [key: string]: any;
  };
}

// ---- Gate helpers ----
function hasSevereCysticGate(context: RecommendationContext): boolean {
  const v = (context.formData as any).severeCysticAcne;
  return typeof v === 'string' && v.toLowerCase() === 'yes';
}

function hasBarrierStressHighGate(context: RecommendationContext): boolean {
  const v = (context.formData as any).barrierStressHigh;
  return typeof v === 'string' && v.toLowerCase() === 'yes';
}

function hasRecentIsotretinoinGate(context: RecommendationContext): boolean {
  const v = (context.formData as any).recentIsotretinoin;
  return typeof v === 'string' && v.toLowerCase() === 'yes';
}

function parsedAllergies(context: RecommendationContext): string {
  return ((context.formData as any).allergies || '').toLowerCase();
}

// Build disallow set for serum keys based on safety gates and allergies
function buildGateDisallowSet(context: RecommendationContext): Set<string> {
  const disallow = new Set<string>();
  const onIso = hasRecentIsotretinoinGate(context);
  const allergies = parsedAllergies(context);
  const pregnant = isPregnancySafe(context);
  const barrierFirst = hasBarrierStressHighGate(context);

  if (onIso) {
    // Avoid initiating high-irritant actives while on isotretinoin
    ['retinol','adapalene','benzoyl-peroxide','salicylic-acid','lactic-acid','vitamin-c'].forEach(k => disallow.add(k));
  }
  if (pregnant) {
    // Strictly avoid retinoids in pregnancy
    ['retinol','adapalene'].forEach(k => disallow.add(k));
  }
  if (barrierFirst) {
    // Phase 0: avoid retinoids/BHA/AHA/BPO
    ['retinol','adapalene','salicylic-acid','lactic-acid','benzoyl-peroxide'].forEach(k => disallow.add(k));
  }
  if (allergies.includes('aspirin') || allergies.includes('salicyl')) disallow.add('salicylic-acid');
  if (allergies.includes('benzoyl')) disallow.add('benzoyl-peroxide');
  if (allergies.includes('retino')) { disallow.add('retinol'); disallow.add('adapalene'); }
  if (allergies.includes('niacinamide')) disallow.add('niacinamide');
  if (allergies.includes('vitamin c') || allergies.includes('ascorb')) disallow.add('vitamin-c');
  if (allergies.includes('lactic') || allergies.includes('aha') || allergies.includes('glycol')) disallow.add('lactic-acid');

  return disallow;
}

// Helper function to determine if user is sensitive
function isSensitive(context: RecommendationContext): boolean {
  const sensitivityBand = context.effectiveBands?.sensitivity?.toLowerCase();
  return sensitivityBand === 'yellow' || sensitivityBand === 'red' || 
         context.formData.sensitivity === 'Yes';
}

// Helper function to check if pregnancy-safe products are needed
function isPregnancySafe(context: RecommendationContext): boolean {
  return context.formData.pregnancy === 'Yes' || 
         (context.formData.pregnancyBreastfeeding?.toLowerCase().includes('pregnant') ?? false);
}

// Helper function to get primary skin type category
function getPrimarySkinType(skinType: string | string[]): 'Dry' | 'Combo' | 'Oily' | 'Normal' {
  const typeString = Array.isArray(skinType) ? skinType.join(' ') : (skinType || '');
  const type = typeString.toLowerCase();
  if (type.includes('dry')) return 'Dry';
  if (type.includes('combination') || type.includes('combo')) return 'Combo';
  if (type.includes('oily')) return 'Oily';
  return 'Normal';
}

// Helper function to determine price preference tier
function getPriceTier(_context: RecommendationContext): 'affordable' | 'mid-range' | 'premium' {
  // You could extend this logic based on form data if you collect budget preference
  // For now, defaulting to mid-range as a balanced option
  return 'mid-range';
}

// Helper function to create a basic routine with specific products
function createBasicRoutine(context: RecommendationContext, options: {
  cleanserType: string;
  coreSerum: string;
  secondarySerum?: string;
  moisturizerType: string;
}): ProductRecommendation {
  const priceTier = getPriceTier(context);
  
  const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser[options.cleanserType] || PRODUCT_DATABASE.cleanser['gentle-foaming'], priceTier);
  // core serum selection handled below as 'core'
  const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer[options.moisturizerType] || PRODUCT_DATABASE.moisturizer['gel-cream'], priceTier);
  const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
  
  // Build serum selections with compatibility enforcement
  const coreKey = options.coreSerum;
  const core = getProductByTier(PRODUCT_DATABASE.serum[coreKey] || PRODUCT_DATABASE.serum['niacinamide'], priceTier);
  const coreTag = serumKeyToTag(coreKey);
  let secondarySerum = "";
  if (options.secondarySerum) {
    const secKey = options.secondarySerum;
    const secTag = serumKeyToTag(secKey);
    // Default allow unless pair is disallowed
    let ok = true;
    if (coreTag && secTag) {
      const cmp = pairCompatibility(coreTag, secTag);
      if (cmp === 'disallow') ok = false;
    }
    if (ok) {
      const secondary = getProductByTier(PRODUCT_DATABASE.serum[secKey] || PRODUCT_DATABASE.serum['niacinamide'], priceTier);
      secondarySerum = formatProductName(secondary);
    } else {
      // Conflict: drop secondary to avoid unsafe layering now; scheduling rules can suggest AM/PM split later
      secondarySerum = "";
    }
  }
  
  return {
    cleanser: formatProductName(cleanser),
    coreSerum: formatProductName(core),
    secondarySerum,
    moisturizer: formatProductName(moisturizer),
    sunscreen: formatProductName(sunscreen),
    _keys: {
      cleanserType: options.cleanserType,
      core: coreKey,
      secondary: options.secondarySerum,
      moisturizerType: options.moisturizerType,
    },
    _flags: {
      // Treat vitamin-c as LAA unless otherwise specified
      vc_form: coreKey === 'vitamin-c' ? 'laa' : (options.secondarySerum === 'vitamin-c' ? 'laa' : undefined),
      // Unknown acid strengths treated as high for safety
      core_acid_strength: 'high',
      secondary_acid_strength: 'high',
    }
  };
}

// Build an explicit barrier-first routine (Phase 0) — no strong actives
function buildBarrierFirstRoutine(context: RecommendationContext): ProductRecommendation {
  const primarySkinType = getPrimarySkinType(context.skinType);
  return createBasicRoutine(context, {
    cleanserType: 'gentle-foaming',
    coreSerum: 'niacinamide',
    secondarySerum: undefined,
    moisturizerType: primarySkinType === 'Dry' ? 'barrier-dry' : 'barrier-oily-combination'
  });
}

// Adjust an existing recommendation based on isotretinoin and allergy gates
function adjustForIsotretinoinAndAllergies(reco: ProductRecommendation, context: RecommendationContext): ProductRecommendation {
  const disallow = buildGateDisallowSet(context);

  // Determine current keys (fallbacks if absent)
  const keys = (reco as ProductRecommendation)._keys || {} as any;
  const currentCleanser = keys.cleanserType || 'gentle-foaming';
  let coreKey: string | undefined = keys.core || undefined;
  let secKey: string | undefined = keys.secondary || undefined;

  // Cleanser: avoid salicylic cleanser on iso or aspirin allergy
  const onIso = hasRecentIsotretinoinGate(context);
  const cleanserType = (onIso || disallow.has('salicylic-acid')) && currentCleanser === 'salicylic-acid'
    ? 'gentle-foaming'
    : currentCleanser || 'gentle-foaming';

  // Replace disallowed core/secondary
  const safeFallbacks = ['azelaic-acid','niacinamide','peptides'];
  if (!coreKey || disallow.has(coreKey)) {
    coreKey = safeFallbacks.find(k => !disallow.has(k));
  }
  if (secKey && disallow.has(secKey)) {
    // Try to replace with a different safe option that isn't same as core
    const safe = safeFallbacks.find(k => !disallow.has(k) && k !== coreKey!);
    secKey = safe || undefined;
  }

  // If both keys end up undefined (extreme allergies), fall back to niacinamide if not disallowed
  if (!coreKey) {
    coreKey = disallow.has('niacinamide') ? 'peptides' : 'niacinamide';
  }

  // Rebuild recommendation strings using safe keys
  const primarySkinType = getPrimarySkinType(context.skinType);
  const moisturizerType = keys.moisturizerType || (primarySkinType === 'Dry' ? 'barrier-dry' : 'barrier-oily-combination');
  const adjusted = createBasicRoutine(context, {
    cleanserType,
    coreSerum: coreKey!,
    secondarySerum: secKey,
    moisturizerType
  });

  return adjusted;
}

// Skin type specific recommendations
function getSkinTypeRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const skinTypeString = Array.isArray(context.skinType) ? context.skinType.join(' ') : (context.skinType || '');
  const skinType = skinTypeString.toLowerCase();
  const priceTier = getPriceTier(context);
  
  if (skinType.includes('oily') && skinType.includes('dehydrated')) {
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['gentle-foaming'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['barrier-oily-combination'], priceTier);
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    return {
      cleanser: formatProductName(cleanser),
      coreSerum: "",
      secondarySerum: "",
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
  }
  
  if (skinType.includes('oily') && skinType.includes('hydrated')) {
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['foaming-gel'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel'], priceTier);
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    return {
      cleanser: formatProductName(cleanser),
      coreSerum: "",
      secondarySerum: "",
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
  }
  
  if (skinType.includes('combination') && skinType.includes('dehydrated')) {
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['hydrating'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['barrier-oily-combination'], priceTier);
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    return {
      cleanser: formatProductName(cleanser),
      coreSerum: "",
      secondarySerum: "",
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
  }
  
  if (skinType.includes('combination') && skinType.includes('hydrated')) {
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['foaming-gel'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel-cream'], priceTier);
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    return {
      cleanser: formatProductName(cleanser),
      coreSerum: "",
      secondarySerum: "",
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
  }
  
  if (skinType.includes('dry') && skinType.includes('dehydrated')) {
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['hydrating'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['barrier-dry'], priceTier);
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    return {
      cleanser: formatProductName(cleanser),
      coreSerum: "",
      secondarySerum: "",
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
  }
  
  return null;
}

// Sebum-based recommendations
function getSebumRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const sebumBand = context.effectiveBands?.sebum?.toLowerCase();
  const primarySkinType = getPrimarySkinType(context.skinType);
  const sensitive = isSensitive(context);
  const priceTier = getPriceTier(context);
  
  if (sebumBand === 'yellow') {
    const niacinamide = getProductByTier(PRODUCT_DATABASE.serum['niacinamide'], priceTier);
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    if (sensitive) {
      const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['gentle-foaming'], priceTier);
      const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel'], priceTier);
      
      return {
        cleanser: formatProductName(cleanser),
        coreSerum: formatProductName(niacinamide),
        secondarySerum: "",
        moisturizer: formatProductName(moisturizer),
        sunscreen: formatProductName(sunscreen)
      };
    }
    
    if (primarySkinType === 'Oily') {
      const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['salicylic-acid'], priceTier);
      const secondarySerum = getProductByTier(PRODUCT_DATABASE.serum['salicylic-acid'], priceTier);
      const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel'], priceTier);
      
      return {
        cleanser: formatProductName(cleanser),
        coreSerum: formatProductName(niacinamide),
        secondarySerum: formatProductName(secondarySerum),
        moisturizer: formatProductName(moisturizer),
        sunscreen: formatProductName(sunscreen)
      };
    }
    
    // Combo/Normal
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['foaming-gel'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel-cream'], priceTier);
    
    return {
      cleanser: formatProductName(cleanser),
      coreSerum: formatProductName(niacinamide),
      secondarySerum: "",
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
  }
  
  if (sebumBand === 'red') {
    const niacinamide = getProductByTier(PRODUCT_DATABASE.serum['niacinamide'], priceTier);
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    if (sensitive) {
      const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['gentle-foaming'], priceTier);
      const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel'], priceTier);
      
      return {
        cleanser: formatProductName(cleanser),
        coreSerum: formatProductName(niacinamide),
        secondarySerum: "",
        moisturizer: formatProductName(moisturizer),
        sunscreen: formatProductName(sunscreen)
      };
    }
    
    // Oily
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['salicylic-acid'], priceTier);
    const secondarySerum = getProductByTier(PRODUCT_DATABASE.serum['salicylic-acid'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel'], priceTier);
    
    return {
      cleanser: formatProductName(cleanser),
      coreSerum: formatProductName(niacinamide),
      secondarySerum: formatProductName(secondarySerum),
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
  }
  
  return null;
}

// Acne-based recommendations
function getAcneRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const acneBand = context.effectiveBands?.acne?.toLowerCase();
  const primarySkinType = getPrimarySkinType(context.skinType);
  const sensitive = isSensitive(context);
  const isPregnant = isPregnancySafe(context);
  const acneCategories = context.acneCategories;
  
  // Pregnancy-safe acne
  if (isPregnant && (acneBand === 'blue' || acneBand === 'yellow' || acneBand === 'red')) {
    // Conservative routine: gentle cleanser + azelaic core; allow niacinamide as secondary
    return createBasicRoutine(context, {
      cleanserType: 'gentle-foaming',
      coreSerum: 'azelaic-acid',
      secondarySerum: 'niacinamide',
      moisturizerType: primarySkinType === 'Dry' ? 'ceramide-peptide-dry' : 'barrier-oily-combination'
    });
  }
  
  // Nodulocystic acne - refer to dermatologist
  if (acneCategories.includes('Cystic acne') || acneCategories.includes('Nodulocystic')) {
    return {
      cleanser: "–",
      coreSerum: "–",
      secondarySerum: "–",
      moisturizer: "–",
      sunscreen: "– (DERMATOLOGIST REFERRAL REQUIRED)"
    };
  }
  
  // Mild acne (Blue)
  if (acneBand === 'blue') {
    if (sensitive) {
      return createBasicRoutine(context, {
        cleanserType: 'gentle-foaming',
        coreSerum: 'azelaic-acid',
        secondarySerum: 'niacinamide',
        moisturizerType: 'gel-cream'
      });
    }

    if (primarySkinType === 'Dry') {
      return createBasicRoutine(context, {
        cleanserType: 'hydrating',
        coreSerum: 'azelaic-acid',
        secondarySerum: 'niacinamide',
        moisturizerType: 'ceramide-peptide-dry'
      });
    }

    if (primarySkinType === 'Oily') {
      return createBasicRoutine(context, {
        cleanserType: 'gentle-foaming',
        coreSerum: 'adapalene',
        secondarySerum: 'azelaic-acid',
        moisturizerType: 'gel'
      });
    }

    // Combination/Normal
    return createBasicRoutine(context, {
      cleanserType: 'gentle-foaming',
      coreSerum: 'adapalene',
      secondarySerum: 'azelaic-acid',
      moisturizerType: 'gel-cream'
    });
  }
  
  // Inflammatory acne (Yellow/Red) → prefer BPO core plus azelaic support
  if ((acneBand === 'yellow' || acneBand === 'red') && acneCategories.includes('Inflammatory acne')) {
    if (sensitive) {
      return createBasicRoutine(context, {
        cleanserType: 'gentle-foaming',
        coreSerum: 'azelaic-acid',
        secondarySerum: 'niacinamide',
        moisturizerType: 'gel-cream'
      });
    }
    if (primarySkinType === 'Dry') {
      return createBasicRoutine(context, {
        cleanserType: 'hydrating',
        coreSerum: 'benzoyl-peroxide',
        secondarySerum: 'azelaic-acid',
        moisturizerType: 'barrier-dry'
      });
    }
    if (primarySkinType === 'Oily') {
      return createBasicRoutine(context, {
        cleanserType: 'salicylic-acid',
        coreSerum: 'benzoyl-peroxide',
        secondarySerum: 'azelaic-acid',
        moisturizerType: 'gel'
      });
    }
    // Combination/Normal
    return createBasicRoutine(context, {
      cleanserType: 'gentle-foaming',
      coreSerum: 'benzoyl-peroxide',
      secondarySerum: 'azelaic-acid',
      moisturizerType: 'gel-cream'
    });
  }
  
  // Comedonal acne → retinoid/adapalene focus + azelaic; gentle if sensitive
  if (acneCategories.includes('Comedonal acne')) {
    if (sensitive) {
      return createBasicRoutine(context, {
        cleanserType: 'salicylic-acid',
        coreSerum: 'niacinamide',
        secondarySerum: undefined,
        moisturizerType: 'barrier-oily-combination'
      });
    }
    if (primarySkinType === 'Dry') {
      return createBasicRoutine(context, {
        cleanserType: 'hydrating',
        coreSerum: 'adapalene',
        secondarySerum: 'azelaic-acid',
        moisturizerType: 'barrier-dry'
      });
    }
    if (primarySkinType === 'Oily') {
      return createBasicRoutine(context, {
        cleanserType: 'salicylic-acid',
        coreSerum: 'adapalene',
        secondarySerum: 'azelaic-acid',
        moisturizerType: 'gel'
      });
    }
    // Combo
    return createBasicRoutine(context, {
      cleanserType: 'salicylic-acid',
      coreSerum: 'adapalene',
      secondarySerum: 'azelaic-acid',
      moisturizerType: 'gel-cream'
    });
  }
  
  // Situational acne → triggers; gentle actives
  if (acneCategories.includes('Situational acne')) {
    if (primarySkinType === 'Dry') {
      return createBasicRoutine(context, {
        cleanserType: 'hydrating',
        coreSerum: 'azelaic-acid',
        secondarySerum: 'niacinamide',
        moisturizerType: 'barrier-dry'
      });
    }
    if (primarySkinType === 'Oily') {
      return createBasicRoutine(context, {
        cleanserType: 'salicylic-acid',
        coreSerum: 'niacinamide',
        secondarySerum: undefined,
        moisturizerType: 'gel'
      });
    }
    // Combo
    return createBasicRoutine(context, {
      cleanserType: 'salicylic-acid',
      coreSerum: 'niacinamide',
      secondarySerum: undefined,
      moisturizerType: 'gel-cream'
    });
  }
  
  return null;
}

// Continue in next part due to length...

// Pores-based recommendations
function getPoresRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const poresBand = context.effectiveBands?.pores?.toLowerCase();
  
  if (poresBand === 'blue') {
    return createBasicRoutine(context, {
      cleanserType: 'gentle-foaming',
      coreSerum: 'niacinamide',
      moisturizerType: 'gel-cream'
    });
  }
  
  if (poresBand === 'yellow' || poresBand === 'red') {
    return createBasicRoutine(context, {
      cleanserType: 'salicylic-acid',
      coreSerum: 'niacinamide',
      secondarySerum: 'salicylic-acid',
      moisturizerType: 'gel'
    });
  }
  
  return null;
}

// Texture-based recommendations
function getTextureRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const textureBand = context.effectiveBands?.texture?.toLowerCase();
  
  if (textureBand === 'yellow' || textureBand === 'red') {
    // Check if this is bumpy skin vs aging
    const isBumpySkin = context.formData.mainConcerns?.includes('Bumpy skin');
    
    if (isBumpySkin) {
      return createBasicRoutine(context, {
        cleanserType: 'bumpy-skin',
        coreSerum: 'salicylic-acid',
        secondarySerum: 'lactic-acid',
        moisturizerType: 'gel-cream'
      });
    } else {
      // Aging texture concerns
      return createBasicRoutine(context, {
        cleanserType: 'gentle-foaming',
        coreSerum: 'retinol',
        secondarySerum: 'peptides',
        moisturizerType: 'rich-cream'
      });
    }
  }
  
  return null;
}

// Pigmentation-based recommendations
function getPigmentationRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const pigmentationBand = context.effectiveBands?.pigmentation?.toLowerCase();
  
  if (pigmentationBand === 'yellow' || pigmentationBand === 'red') {
    // Determine if it's PIE (red) or PIH (brown) pigmentation
    const pigmentationType = context.formData.pigmentationType?.toLowerCase() || '';
    const isRedPigmentation = pigmentationType.includes('red');
    const isBrownPigmentation = pigmentationType.includes('brown');
    
    // For now, use basic product recommendations for pigmentation
    if (isRedPigmentation) {
      return createBasicRoutine(context, {
        cleanserType: 'gentle-foaming',
        coreSerum: 'azelaic-acid',
        secondarySerum: 'niacinamide',
        moisturizerType: 'barrier-oily-combination'
      });
    }
    
    // PIH (brown pigmentation) 
    if (isBrownPigmentation || !isRedPigmentation) {
      return createBasicRoutine(context, {
        cleanserType: 'gentle-foaming',
        coreSerum: 'vitamin-c',
        secondarySerum: 'alpha-arbutin',
        moisturizerType: 'gel-cream'
      });
    }
  }
  
  return null;
}

// Enhanced recommendation result with additional metadata
export interface EnhancedRecommendation extends ProductRecommendation {
  primaryConcern: string;
  concernBand: string;
  rationale?: string;
  serumCount: number;
  additionalSerums?: string[];
  schedule?: {
    am: Array<{step:number;label:string;product:string}>;
    pmByDay: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', Array<{step:number;label:string;product:string}>>;
    warnings: string[];
    customerView: {
      am: Array<{step:number;label:string;product:string}>;
      pm: Array<{step:number;label:string;product:string}>;
      notes: string[];
    }
  }
}

// Map engine serum key → display label
function labelFromKey(key: string): string {
  const map: Record<string,string> = {
    'adapalene': 'Adapalene 0.1%',
    'retinol': 'Retinol',
    'vitamin-c': 'Vitamin C',
    'niacinamide': 'Niacinamide',
    'salicylic-acid': '2% Salicylic Acid',
    'lactic-acid': 'Lactic Acid',
    'azelaic-acid': '10% Azelaic Acid',
    'alpha-arbutin': 'Alpha Arbutin',
    'tranexamic-acid': 'Tranexamic Acid',
    'benzoyl-peroxide': 'Benzoyl Peroxide 2.5%',
    'peptides': 'Peptides',
  };
  return map[key] || key;
}

// Helper function to determine how many serums to recommend
function determineSerumCount(
  context: RecommendationContext,
  activeConcerns: ConcernWithBand[],
  coreKey?: string,
  secondaryKey?: string
): { 
  serumCount: number; 
  additionalSerums: string[] 
} {
  const disallow = buildGateDisallowSet(context);
  const serumComfort = parseInt(context.formData.serumComfort || '1');
  const sensBand = (context.effectiveBands?.sensitivity || 'green').toLowerCase();
  const additionalSerums: string[] = [];
  // Hard caps for higher sensitivity to align with irritation budget
  if (sensBand === 'red' || sensBand === 'yellow') {
    return { serumCount: 1, additionalSerums };
  }
  
  // If user only wants 1 serum or only has 1 concern, use just the core serum
  if (serumComfort === 1 || activeConcerns.length <= 1) {
    return { serumCount: 1, additionalSerums };
  }
  
  // If user is comfortable with multiple serums and has multiple concerns,
  // add core serums from other concerns as additional options
  const otherConcerns = activeConcerns.slice(1); // Skip primary concern
  // Build list of candidate keys
  const candidates: string[] = [];
  for (let i = 0; i < Math.min(otherConcerns.length, serumComfort - 1); i++) {
    const concern = otherConcerns[i];
    const k = getCoreSerumForConcern(concern, context);
    if (k && !disallow.has(k)) candidates.push(k);
  }
  // Filter out disallowed clashes against the chosen core/secondary
  const coreTag = coreKey ? serumKeyToTag(coreKey) : null;
  const secTag = secondaryKey ? serumKeyToTag(secondaryKey) : null;
  const filtered: string[] = [];
  for (const k of candidates) {
    const tag = serumKeyToTag(k);
    let ok = true;
    // Avoid suggesting same-family actives (e.g., retinoid with retinoid)
    if (tag && (tag === coreTag || tag === secTag)) {
      ok = false;
    }
    if (coreTag && tag) {
      const cmp = pairCompatibility(coreTag, tag);
      if (cmp === 'disallow') ok = false;
    }
    if (ok && secTag && tag) {
      const cmp = pairCompatibility(secTag, tag);
      if (cmp === 'disallow') ok = false;
    }
    if (ok) filtered.push(k);
  }
  // Convert to display names
  for (const k of filtered) additionalSerums.push(labelFromKey(k));
  
  return { 
    serumCount: Math.min(serumComfort, 1 + additionalSerums.length), 
    additionalSerums 
  };
}

// Helper to get core serum for a specific concern
function getCoreSerumForConcern(concern: ConcernWithBand, context: RecommendationContext): string | null {
  const sensitive = isSensitive(context);
  
  switch (concern.concern) {
    case 'acne':
      if (concern.band === 'blue') return sensitive ? 'azelaic-acid' : 'adapalene';
      if (concern.band === 'yellow' || concern.band === 'red') return 'benzoyl-peroxide';
      break;
    case 'sebum':
      return 'niacinamide';
    case 'pigmentation':
      return 'azelaic-acid';
    case 'texture':
      return sensitive ? 'peptides' : 'retinol';
    case 'pores':
      return 'niacinamide';
  }
  
  return null;
}

// Band priority mapping (worst-wins: Red > Yellow > Blue > Green)
const BAND_PRIORITY: Record<string, number> = {
  red: 1,
  yellow: 2, 
  blue: 3,
  green: 4
};

// Concern priority for tie-breaking (Acne → Sebum → Pigmentation → Texture → Pores)
const CONCERN_PRIORITY: Record<string, number> = {
  acne: 1,
  sebum: 2,
  pigmentation: 3,
  texture: 4,
  pores: 5
};

interface ConcernWithBand {
  concern: string;
  band: string;
  priority: number;
}

// Extract active concerns with their band colors from form data
function extractActiveConcerns(context: RecommendationContext): ConcernWithBand[] {
  const concerns: ConcernWithBand[] = [];
  const mainConcerns = context.formData.mainConcerns || [];

  // Map UI labels to normalized keys used internally
  const toKey = (label: string): 'acne'|'sebum'|'pigmentation'|'texture'|'pores'|null => {
    const s = (label || '').toLowerCase();
    if (/acne/.test(s)) return 'acne';
    if (/sebum|oiliness/.test(s)) return 'sebum';
    if (/pigment/.test(s)) return 'pigmentation';
    if (/wrinkle|bumpy|texture/.test(s)) return 'texture';
    if (/pore/.test(s)) return 'pores';
    return null;
  };

  // Build user-defined priority map (lower = higher priority)
  const priorityOrder: string[] = Array.isArray((context.formData as any).concernPriority)
    ? ((context.formData as any).concernPriority as string[])
    : [];
  const rankMap: Record<string, number> = {};
  priorityOrder.forEach((label, idx) => {
    const key = toKey(label);
    if (key) rankMap[key] = idx + 1; // 1-based rank
  });
  const getRank = (key: string): number => {
    // If user provided a rank, use it; otherwise default static priority
    if (rankMap[key] != null) return rankMap[key];
    return (CONCERN_PRIORITY as any)[key] ?? 999;
  };
  
  // Check each concern type and map to effective bands
  if (mainConcerns.includes('Acne Management') || mainConcerns.includes('Acne')) {
    const band = context.effectiveBands?.acne?.toLowerCase() || 'green';
    concerns.push({
      concern: 'acne',
      band,
      priority: getRank('acne')
    });
  }
  
  if (mainConcerns.includes('Sebum Control') || mainConcerns.includes('Oiliness')) {
    const band = context.effectiveBands?.sebum?.toLowerCase() || 'green';
    concerns.push({
      concern: 'sebum', 
      band,
      priority: getRank('sebum')
    });
  }
  
  if (mainConcerns.includes('Hyperpigmentation') || mainConcerns.includes('Pigmentation')) {
    // Check both red and brown pigmentation, take the worse one
    const redBand = context.effectiveBands?.pigmentation_red?.toLowerCase() || 'green';
    const brownBand = context.effectiveBands?.pigmentation_brown?.toLowerCase() || 'green';
    const worseBand = BAND_PRIORITY[redBand] <= BAND_PRIORITY[brownBand] ? redBand : brownBand;
    
    concerns.push({
      concern: 'pigmentation',
      band: worseBand,
      priority: getRank('pigmentation')
    });
  }
  
  if (mainConcerns.includes('Texture Improvement') || mainConcerns.includes('Fine lines & wrinkles') || mainConcerns.includes('Bumpy skin')) {
    const band = context.effectiveBands?.texture?.toLowerCase() || 'green';
    concerns.push({
      concern: 'texture',
      band,
      priority: getRank('texture')
    });
  }
  
  if (mainConcerns.includes('Pore Refinement') || mainConcerns.includes('Large pores')) {
    const band = context.effectiveBands?.pores?.toLowerCase() || 'green';
    concerns.push({
      concern: 'pores',
      band,
      priority: getRank('pores')
    });
  }
  
  return concerns;
}

// Find the primary concern using worst-wins logic
function findPrimaryConcern(concerns: ConcernWithBand[]): ConcernWithBand | null {
  if (concerns.length === 0) return null;
  
  // Sort by band priority first (worst wins), then by concern priority for tie-breaking
  const sorted = concerns.sort((a, b) => {
    const bandComparison = BAND_PRIORITY[a.band] - BAND_PRIORITY[b.band];
    if (bandComparison !== 0) return bandComparison;
    
    // If bands are the same, use concern priority (lower is higher priority)
    return a.priority - b.priority;
  });
  
  return sorted[0];
}

// Main recommendation function with worst-wins logic
export function generateRecommendations(context: RecommendationContext): EnhancedRecommendation {
  // Safety overrides from gates
  if (hasSevereCysticGate(context)) {
    return {
      cleanser: '–',
      coreSerum: '–',
      secondarySerum: '–',
      moisturizer: '–',
      sunscreen: '– (DERMATOLOGIST REFERRAL REQUIRED)',
      primaryConcern: 'Safety',
      concernBand: '',
      serumCount: 0,
    } as EnhancedRecommendation;
  }

  if (hasBarrierStressHighGate(context)) {
    const barrierReco = buildBarrierFirstRoutine(context);
    const enhanced: EnhancedRecommendation = {
      ...barrierReco,
      primaryConcern: 'Barrier-first (Phase 0)',
      concernBand: (context.effectiveBands?.sensitivity || '').toLowerCase(),
      serumCount: 1,
      additionalSerums: []
    };
    try {
      const keys = (barrierReco as ProductRecommendation)._keys || ({} as any);
      const flags = (barrierReco as ProductRecommendation)._flags || ({} as any);
      if (keys.core) {
        const { plan, customerView } = buildWeeklyPlan({
          cleanser: barrierReco.cleanser,
          coreSerumKey: keys.core,
          secondarySerumKey: keys.secondary,
          moisturizer: barrierReco.moisturizer,
          sunscreen: barrierReco.sunscreen,
          flags: {
            vc_form: flags.vc_form,
            core_acid_strength: flags.core_acid_strength,
            secondary_acid_strength: flags.secondary_acid_strength,
            pregnancy: isPregnancySafe(context),
            sensitivity: isSensitive(context),
            sensitivityBand: (context.effectiveBands?.sensitivity || 'green').toLowerCase() as 'green'|'blue'|'yellow'|'red',
            serumComfort: parseInt(context.formData.serumComfort || '1'),
          }
        });
        enhanced.schedule = { ...plan, customerView } as any;
      }
    } catch (e) {
      console.warn('Failed to build schedule (barrier-first):', e);
    }
    return enhanced;
  }

  // Extract active concerns from the user's selections
  const activeConcerns = extractActiveConcerns(context);
  const primaryConcern = findPrimaryConcern(activeConcerns);
  
  let recommendation: ProductRecommendation | null = null;
  let concernName = '';
  let bandColor = '';
  
  if (primaryConcern) {
    // Generate recommendation based on primary concern using worst-wins logic
    concernName = primaryConcern.concern;
    bandColor = primaryConcern.band;
    
    switch (primaryConcern.concern) {
      case 'acne':
        recommendation = getAcneRecommendation(context);
        break;
      case 'sebum':
        recommendation = getSebumRecommendation(context);
        break;
      case 'pigmentation':
        recommendation = getPigmentationRecommendation(context);
        break;
      case 'texture':
        recommendation = getTextureRecommendation(context);
        break;
      case 'pores':
        recommendation = getPoresRecommendation(context);
        break;
    }
  }
  
  // Fall back to skin type recommendations if no concern-based match
  if (!recommendation) {
    recommendation = getSkinTypeRecommendation(context);
    concernName = 'Skin Type';
    bandColor = '';
  }
  
  // Final fallback
  if (!recommendation) {
    const priceTier = getPriceTier(context);
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['gentle-foaming'], priceTier);
    const niacinamide = getProductByTier(PRODUCT_DATABASE.serum['niacinamide'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel-cream'], priceTier);
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    recommendation = {
      cleanser: formatProductName(cleanser),
      coreSerum: formatProductName(niacinamide),
      secondarySerum: "",
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
    concernName = 'General Care';
    bandColor = '';
  }
  
  // Apply isotretinoin/allergy adjustments post-selection
  if (recommendation) {
    recommendation = adjustForIsotretinoinAndAllergies(recommendation, context);
  }

  // Determine serum count and additional serums (filtering by compatibility with primary selection when possible)
  const coreKeyForCompat = (recommendation as ProductRecommendation)._keys?.core;
  const secKeyForCompat = (recommendation as ProductRecommendation)._keys?.secondary;
  const serumLogic = determineSerumCount(context, activeConcerns, coreKeyForCompat, secKeyForCompat);
  
  const primaryConcernLabel = bandColor 
    ? `${concernName.charAt(0).toUpperCase() + concernName.slice(1)} (${bandColor})`
    : concernName.charAt(0).toUpperCase() + concernName.slice(1);
  
  const result = {
    ...recommendation,
    primaryConcern: primaryConcernLabel,
    concernBand: bandColor,
    serumCount: serumLogic.serumCount,
    additionalSerums: serumLogic.additionalSerums,
    rationale: activeConcerns.length > 1 
      ? `Primary concern selected using worst-wins logic. Other concerns: ${activeConcerns.filter(c => c !== primaryConcern).map(c => `${c.concern} (${c.band})`).join(', ')}`
      : undefined
  } as EnhancedRecommendation;

  // Build schedule (AM/PM weekly + customerView) using internal metadata when available
  try {
    const keys = (result as ProductRecommendation)._keys || {} as any
    const flags = (result as ProductRecommendation)._flags || {} as any
    if (keys.core) {
      const { plan, customerView } = buildWeeklyPlan({
        cleanser: result.cleanser,
        coreSerumKey: keys.core,
        secondarySerumKey: keys.secondary,
        moisturizer: result.moisturizer,
        sunscreen: result.sunscreen,
        flags: {
          vc_form: flags.vc_form,
          core_acid_strength: flags.core_acid_strength,
          secondary_acid_strength: flags.secondary_acid_strength,
          pregnancy: context.formData.pregnancy === 'Yes' || (context.formData.pregnancyBreastfeeding || '').toLowerCase().includes('pregnant'),
          sensitivity: isSensitive(context),
          sensitivityBand: (context.effectiveBands?.sensitivity || 'green').toLowerCase() as 'green'|'blue'|'yellow'|'red',
          serumComfort: parseInt(context.formData.serumComfort || '1'),
        }
      })
      result.schedule = { ...plan, customerView }
    }
  } catch (e) {
    console.warn('Failed to build schedule:', e)
  }

  return result;
}