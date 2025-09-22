// Skin Recommendation Engine
// Maps form data and decision engine outputs to product recommendations

import { PRODUCT_DATABASE, getProductByTier, formatProductName } from '../data/productDatabase';

export interface ProductRecommendation {
  cleanser: string;
  coreSerum: string;
  secondarySerum: string;
  moisturizer: string;
  sunscreen: string;
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
  const coreSerum = getProductByTier(PRODUCT_DATABASE.serum[options.coreSerum] || PRODUCT_DATABASE.serum['niacinamide'], priceTier);
  const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer[options.moisturizerType] || PRODUCT_DATABASE.moisturizer['gel-cream'], priceTier);
  const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
  
  let secondarySerum = "";
  if (options.secondarySerum) {
    const secondary = getProductByTier(PRODUCT_DATABASE.serum[options.secondarySerum] || PRODUCT_DATABASE.serum['niacinamide'], priceTier);
    secondarySerum = formatProductName(secondary);
  }
  
  return {
    cleanser: formatProductName(cleanser),
    coreSerum: formatProductName(coreSerum),
    secondarySerum,
    moisturizer: formatProductName(moisturizer),
    sunscreen: formatProductName(sunscreen)
  };
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
  const priceTier = getPriceTier(context);
  
  // Pregnancy-safe acne
  if (isPregnant && (acneBand === 'blue' || acneBand === 'yellow' || acneBand === 'red')) {
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['gentle-foaming'], priceTier);
    const azelaic = getProductByTier(PRODUCT_DATABASE.serum['azelaic-acid'], priceTier);
    const niacinamide = getProductByTier(PRODUCT_DATABASE.serum['niacinamide'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['barrier-oily-combination'], priceTier);
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    return {
      cleanser: formatProductName(cleanser),
      coreSerum: formatProductName(azelaic),
      secondarySerum: formatProductName(niacinamide),
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
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
    const sunscreen = getProductByTier(PRODUCT_DATABASE.sunscreen['general'], priceTier);
    
    if (sensitive) {
      const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['gentle-foaming'], priceTier);
      const azelaic = getProductByTier(PRODUCT_DATABASE.serum['azelaic-acid'], priceTier);
      const niacinamide = getProductByTier(PRODUCT_DATABASE.serum['niacinamide'], priceTier);
      const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel-cream'], priceTier);
      
      return {
        cleanser: formatProductName(cleanser),
        coreSerum: formatProductName(azelaic),
        secondarySerum: formatProductName(niacinamide),
        moisturizer: formatProductName(moisturizer),
        sunscreen: formatProductName(sunscreen)
      };
    }
    
    if (primarySkinType === 'Dry') {
      const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['hydrating'], priceTier);
      const azelaic = getProductByTier(PRODUCT_DATABASE.serum['azelaic-acid'], priceTier);
      const niacinamide = getProductByTier(PRODUCT_DATABASE.serum['niacinamide'], priceTier);
      const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['ceramide-peptide-dry'], priceTier);
      
      return {
        cleanser: formatProductName(cleanser),
        coreSerum: formatProductName(azelaic),
        secondarySerum: formatProductName(niacinamide),
        moisturizer: formatProductName(moisturizer),
        sunscreen: formatProductName(sunscreen)
      };
    }
    
    if (primarySkinType === 'Oily') {
      const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['gentle-foaming'], priceTier);
      const adapalene = getProductByTier(PRODUCT_DATABASE.serum['adapalene'], priceTier);
      const azelaic = getProductByTier(PRODUCT_DATABASE.serum['azelaic-acid'], priceTier);
      const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel'], priceTier);
      
      return {
        cleanser: formatProductName(cleanser),
        coreSerum: formatProductName(adapalene),
        secondarySerum: formatProductName(azelaic),
        moisturizer: formatProductName(moisturizer),
        sunscreen: formatProductName(sunscreen)
      };
    }
    
    // Combination/Normal
    const cleanser = getProductByTier(PRODUCT_DATABASE.cleanser['gentle-foaming'], priceTier);
    const adapalene = getProductByTier(PRODUCT_DATABASE.serum['adapalene'], priceTier);
    const azelaic = getProductByTier(PRODUCT_DATABASE.serum['azelaic-acid'], priceTier);
    const moisturizer = getProductByTier(PRODUCT_DATABASE.moisturizer['gel-cream'], priceTier);
    
    return {
      cleanser: formatProductName(cleanser),
      coreSerum: formatProductName(adapalene),
      secondarySerum: formatProductName(azelaic),
      moisturizer: formatProductName(moisturizer),
      sunscreen: formatProductName(sunscreen)
    };
  }
  
  // Inflammatory acne (Yellow/Red)
  if (acneBand === 'yellow' || acneBand === 'red') {
    if (acneCategories.includes('Inflammatory acne')) {
      if (sensitive) {
        return {
          cleanser: "Gentle gel",
          coreSerum: "10% Azelaic Acid",
          secondarySerum: "5% Niacinamide",
          moisturizer: "Gel-cream",
          sunscreen: "SPF 50"
        };
      }
      
      if (primarySkinType === 'Dry') {
        return {
          cleanser: "Cream cleanser",
          coreSerum: "BPO 2.5%",
          secondarySerum: "10% Azelaic Acid",
          moisturizer: "Barrier cream (ceramide + cholesterol)",
          sunscreen: "Mineral SPF50"
        };
      }
      
      if (primarySkinType === 'Oily') {
        return {
          cleanser: "Gel cleanser",
          coreSerum: "BPO 2.5% AM",
          secondarySerum: "10% Azelaic Acid",
          moisturizer: "Oil-free gel",
          sunscreen: "Matte SPF50"
        };
      }
      
      // Combination/Normal
      return {
        cleanser: "Gentle foaming cleanser",
        coreSerum: "BPO 2.5% AM",
        secondarySerum: "10% Azelaic Acid",
        moisturizer: "Gel-cream",
        sunscreen: "Non-comedogenic SPF50"
      };
    }
  }
  
  // Comedonal acne
  if (acneCategories.includes('Comedonal acne')) {
    if (sensitive) {
      return {
        cleanser: "Mild SA cleanser",
        coreSerum: "Niacinamide",
        secondarySerum: "",
        moisturizer: "Barrier cream",
        sunscreen: "SPF 50"
      };
    }
    
    if (primarySkinType === 'Dry') {
      return {
        cleanser: "Gentle cleanser",
        coreSerum: "Adapalene 0.1%",
        secondarySerum: "10% Azelaic Acid",
        moisturizer: "Barrier cream",
        sunscreen: "SPF 50"
      };
    }
    
    if (primarySkinType === 'Oily') {
      return {
        cleanser: "SA cleanser",
        coreSerum: "Adapalene 0.1%",
        secondarySerum: "10% Azelaic Acid",
        moisturizer: "Oil-free gel",
        sunscreen: "Matte SPF 50"
      };
    }
    
    // Combo
    return {
      cleanser: "SA cleanser",
      coreSerum: "Adapalene 0.1%",
      secondarySerum: "10% Azelaic Acid",
      moisturizer: "Gel-cream",
      sunscreen: "SPF 50"
    };
  }
  
  // Situational acne
  if (acneCategories.includes('Situational acne')) {
    if (primarySkinType === 'Dry') {
      return {
        cleanser: "Gentle cleanser",
        coreSerum: "Azelaic acid",
        secondarySerum: "Niacinamide",
        moisturizer: "Barrier cream",
        sunscreen: "SPF 50"
      };
    }
    
    if (primarySkinType === 'Oily') {
      return {
        cleanser: "BPO facewash",
        coreSerum: "Niacinamide",
        secondarySerum: "",
        moisturizer: "Oil-free gel",
        sunscreen: "Matte SPF 50"
      };
    }
    
    // Combo
    return {
      cleanser: "BPO facewash",
      coreSerum: "Niacinamide",
      secondarySerum: "",
      moisturizer: "Gel-cream",
      sunscreen: "SPF 50"
    };
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
}

// Helper function to determine how many serums to recommend
function determineSerumCount(context: RecommendationContext, activeConcerns: ConcernWithBand[]): { 
  serumCount: number; 
  additionalSerums: string[] 
} {
  const serumComfort = parseInt(context.formData.serumComfort || '1');
  const additionalSerums: string[] = [];
  
  // If user only wants 1 serum or only has 1 concern, use just the core serum
  if (serumComfort === 1 || activeConcerns.length <= 1) {
    return { serumCount: 1, additionalSerums };
  }
  
  // If user is comfortable with multiple serums and has multiple concerns,
  // add core serums from other concerns as additional options
  const otherConcerns = activeConcerns.slice(1); // Skip primary concern
  
  for (let i = 0; i < Math.min(otherConcerns.length, serumComfort - 1); i++) {
    const concern = otherConcerns[i];
    const additionalSerum = getCoreSerumForConcern(concern, context);
    if (additionalSerum) {
      additionalSerums.push(additionalSerum);
    }
  }
  
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
      if (concern.band === 'blue') return sensitive ? '10% Azelaic Acid' : 'Adapalene 0.1% PM';
      if (concern.band === 'yellow' || concern.band === 'red') return 'BPO 2.5%';
      break;
    case 'sebum':
      return 'Niacinamide';
    case 'pigmentation':
      return 'Azelaic acid';
    case 'texture':
      return sensitive ? 'Bakuchiol/peptides' : 'Retinol';
    case 'pores':
      return 'Niacinamide 5%';
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
  
  // Check each concern type and map to effective bands
  if (mainConcerns.includes('Acne Management')) {
    const band = context.effectiveBands?.acne?.toLowerCase() || 'green';
    concerns.push({
      concern: 'acne',
      band,
      priority: CONCERN_PRIORITY.acne
    });
  }
  
  if (mainConcerns.includes('Sebum Control')) {
    const band = context.effectiveBands?.sebum?.toLowerCase() || 'green';
    concerns.push({
      concern: 'sebum', 
      band,
      priority: CONCERN_PRIORITY.sebum
    });
  }
  
  if (mainConcerns.includes('Hyperpigmentation')) {
    // Check both red and brown pigmentation, take the worse one
    const redBand = context.effectiveBands?.pigmentation_red?.toLowerCase() || 'green';
    const brownBand = context.effectiveBands?.pigmentation_brown?.toLowerCase() || 'green';
    const worseBand = BAND_PRIORITY[redBand] <= BAND_PRIORITY[brownBand] ? redBand : brownBand;
    
    concerns.push({
      concern: 'pigmentation',
      band: worseBand,
      priority: CONCERN_PRIORITY.pigmentation
    });
  }
  
  if (mainConcerns.includes('Texture Improvement')) {
    const band = context.effectiveBands?.texture?.toLowerCase() || 'green';
    concerns.push({
      concern: 'texture',
      band,
      priority: CONCERN_PRIORITY.texture
    });
  }
  
  if (mainConcerns.includes('Pore Refinement')) {
    const band = context.effectiveBands?.pores?.toLowerCase() || 'green';
    concerns.push({
      concern: 'pores',
      band,
      priority: CONCERN_PRIORITY.pores
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
    
    // If bands are the same, use concern priority
    return a.priority - b.priority;
  });
  
  return sorted[0];
}

// Main recommendation function with worst-wins logic
export function generateRecommendations(context: RecommendationContext): EnhancedRecommendation {
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
  
  // Determine serum count and additional serums
  const serumLogic = determineSerumCount(context, activeConcerns);
  
  const primaryConcernLabel = bandColor 
    ? `${concernName.charAt(0).toUpperCase() + concernName.slice(1)} (${bandColor})`
    : concernName.charAt(0).toUpperCase() + concernName.slice(1);
  
  return {
    ...recommendation,
    primaryConcern: primaryConcernLabel,
    concernBand: bandColor,
    serumCount: serumLogic.serumCount,
    additionalSerums: serumLogic.additionalSerums,
    rationale: activeConcerns.length > 1 
      ? `Primary concern selected using worst-wins logic. Other concerns: ${activeConcerns.filter(c => c !== primaryConcern).map(c => `${c.concern} (${c.band})`).join(', ')}`
      : undefined
  };
}