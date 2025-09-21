// Skin Recommendation Engine
// Maps form data and decision engine outputs to product recommendations

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

// Helper function to determine sensitivity level
function getSensitivityLevel(context: RecommendationContext): 'none' | 'mild' | 'high' {
  if (!isSensitive(context)) return 'none';
  
  const sensitivityBand = context.effectiveBands?.sensitivity?.toLowerCase();
  if (sensitivityBand === 'red') return 'high';
  return 'mild';
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

// Skin type specific recommendations
function getSkinTypeRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const skinTypeString = Array.isArray(context.skinType) ? context.skinType.join(' ') : (context.skinType || '');
  const skinType = skinTypeString.toLowerCase();
  
  if (skinType.includes('oily') && skinType.includes('dehydrated')) {
    return {
      cleanser: "Gentle foaming",
      coreSerum: "",
      secondarySerum: "",
      moisturizer: "Gel-cream with ceramides",
      sunscreen: "Oil-free gel SPF"
    };
  }
  
  if (skinType.includes('oily') && skinType.includes('hydrated')) {
    return {
      cleanser: "Foaming / mild SA",
      coreSerum: "",
      secondarySerum: "",
      moisturizer: "Lightweight gel/lotion",
      sunscreen: "Matte SPF 50"
    };
  }
  
  if (skinType.includes('combination') && skinType.includes('dehydrated')) {
    return {
      cleanser: "Gentle gel / cream cleanser",
      coreSerum: "",
      secondarySerum: "",
      moisturizer: "Gel-cream, barrier supportive",
      sunscreen: "Non-comedogenic hybrid SPF"
    };
  }
  
  if (skinType.includes('combination') && skinType.includes('hydrated')) {
    return {
      cleanser: "Foaming gel",
      coreSerum: "",
      secondarySerum: "",
      moisturizer: "Gel-cream, oil-free",
      sunscreen: "Lightweight SPF 50"
    };
  }
  
  if (skinType.includes('dry') && skinType.includes('dehydrated')) {
    return {
      cleanser: "Cream cleanser",
      coreSerum: "",
      secondarySerum: "",
      moisturizer: "Rich cream with occlusives + ceramides",
      sunscreen: "Moisturizing cream SPF"
    };
  }
  
  return null;
}

// Sebum-based recommendations
function getSebumRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const sebumBand = context.effectiveBands?.sebum?.toLowerCase();
  const primarySkinType = getPrimarySkinType(context.skinType);
  const sensitive = isSensitive(context);
  
  if (sebumBand === 'yellow') {
    if (sensitive) {
      return {
        cleanser: "Gel-based",
        coreSerum: "Niacinamide",
        secondarySerum: "",
        moisturizer: "Oil-free gel-cream",
        sunscreen: "SPF 50, non-comedogenic"
      };
    }
    
    if (primarySkinType === 'Oily') {
      return {
        cleanser: "SA or foaming cleanser",
        coreSerum: "Niacinamide",
        secondarySerum: "Salicylic acid 2%",
        moisturizer: "Oil-free gel",
        sunscreen: "Matte SPF 50"
      };
    }
    
    // Combo/Normal
    return {
      cleanser: "Gel-based",
      coreSerum: "Niacinamide",
      secondarySerum: "",
      moisturizer: "Oil-free gel-cream",
      sunscreen: "SPF 50, non-comedogenic"
    };
  }
  
  if (sebumBand === 'red') {
    if (sensitive) {
      return {
        cleanser: "Gel-based",
        coreSerum: "Niacinamide",
        secondarySerum: "",
        moisturizer: "Oil-free gel-cream",
        sunscreen: "SPF 50, non-comedogenic"
      };
    }
    
    // Oily
    return {
      cleanser: "SA or foaming cleanser",
      coreSerum: "Niacinamide",
      secondarySerum: "Salicylic acid 2%",
      moisturizer: "Very light gel",
      sunscreen: "Matte SPF 50"
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
    return {
      cleanser: "Gentle cleanser",
      coreSerum: "Azelaic acid 10–15%",
      secondarySerum: "Niacinamide",
      moisturizer: "Barrier cream",
      sunscreen: "Mineral SPF"
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
        coreSerum: "Azelaic 10% (anti-inflammatory + PIH)",
        secondarySerum: "5% Niacinamide",
        moisturizer: "Ceramide cream",
        sunscreen: "Hydrating SPF50"
      };
    }
    
    if (primarySkinType === 'Oily') {
      return {
        cleanser: "Gentle gel",
        coreSerum: "Adapalene 0.1% PM",
        secondarySerum: "10% Azelaic Acid",
        moisturizer: "Oil-free gel",
        sunscreen: "Matte SPF50"
      };
    }
    
    // Combination/Normal
    return {
      cleanser: "Gentle gel",
      coreSerum: "Adapalene 0.1% PM",
      secondarySerum: "10% Azelaic Acid",
      moisturizer: "Gel-cream",
      sunscreen: "Non-comedogenic SPF50"
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
  const primarySkinType = getPrimarySkinType(context.skinType);
  const sensitivityLevel = getSensitivityLevel(context);
  
  if (poresBand === 'blue') {
    if (sensitivityLevel !== 'none') {
      return {
        cleanser: "Gentle foaming",
        coreSerum: "Niacinamide 5%",
        secondarySerum: "",
        moisturizer: "Gel-cream",
        sunscreen: "SPF 50"
      };
    }
    
    if (primarySkinType === 'Oily') {
      return {
        cleanser: "Foaming / SA",
        coreSerum: "Niacinamide",
        secondarySerum: "",
        moisturizer: "Oil-free gel",
        sunscreen: "Matte SPF"
      };
    }
    
    // Combo/Normal
    return {
      cleanser: "Gentle foaming",
      coreSerum: "Niacinamide 5%",
      secondarySerum: "",
      moisturizer: "Gel-cream",
      sunscreen: "SPF 50"
    };
  }
  
  if (poresBand === 'yellow' || poresBand === 'red') {
    if (sensitivityLevel === 'high') {
      return {
        cleanser: "Gentle foaming",
        coreSerum: "Niacinamide 5%",
        secondarySerum: "Clay mask",
        moisturizer: "Barrier cream",
        sunscreen: "SPF 50"
      };
    }
    
    if (sensitivityLevel === 'mild') {
      return {
        cleanser: "SA cleanser",
        coreSerum: "Niacinamide 5%",
        secondarySerum: "Clay mask",
        moisturizer: "Gel-cream",
        sunscreen: "SPF 50"
      };
    }
    
    if (primarySkinType === 'Oily') {
      return {
        cleanser: "SA cleanser",
        coreSerum: "Salicylic acid",
        secondarySerum: "Niacinamide",
        moisturizer: "Oil-free gel",
        sunscreen: "Matte SPF"
      };
    }
    
    // Combo
    return {
      cleanser: "Gentle foaming",
      coreSerum: "Salicylic acid",
      secondarySerum: "Niacinamide",
      moisturizer: "Gel-cream",
      sunscreen: "SPF 50"
    };
  }
  
  return null;
}

// Texture-based recommendations
function getTextureRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const textureBand = context.effectiveBands?.texture?.toLowerCase();
  const primarySkinType = getPrimarySkinType(context.skinType);
  const sensitivityLevel = getSensitivityLevel(context);
  
  // Aging concerns
  if (textureBand === 'yellow' || textureBand === 'red') {
    // Check if this is bumpy skin vs aging
    const isBumpySkin = context.formData.mainConcerns?.includes('Bumpy skin');
    
    if (isBumpySkin) {
      if (sensitivityLevel === 'mild') {
        return {
          cleanser: "Cream cleanser",
          coreSerum: "Niacinamide",
          secondarySerum: "",
          moisturizer: "CeraVe SA Lotion for Rough & Bumpy Skin",
          sunscreen: "SPF 50"
        };
      }
      
      if (primarySkinType === 'Dry') {
        return {
          cleanser: "Cream cleanser",
          coreSerum: "Adapalene",
          secondarySerum: "Lactic acid",
          moisturizer: "Barrier cream",
          sunscreen: "SPF 50"
        };
      }
      
      if (primarySkinType === 'Oily') {
        return {
          cleanser: "Gentle foaming",
          coreSerum: "Adapalene",
          secondarySerum: "Salicylic acid",
          moisturizer: "Oil-free gel",
          sunscreen: "Matte SPF"
        };
      }
      
      // Combo
      return {
        cleanser: "Gentle foaming",
        coreSerum: "Adapalene",
        secondarySerum: "Salicylic acid",
        moisturizer: "Gel-cream",
        sunscreen: "SPF 50"
      };
    } else {
      // Aging concerns
      if (sensitivityLevel === 'high') {
        return {
          cleanser: "Cream cleanser",
          coreSerum: "Bakuchiol/peptides",
          secondarySerum: "Niacinamide",
          moisturizer: "Barrier cream",
          sunscreen: "SPF 50"
        };
      }
      
      if (sensitivityLevel === 'mild') {
        return {
          cleanser: "Cream cleanser",
          coreSerum: "Bakuchiol/peptides",
          secondarySerum: "Vitamin C (Not L-AA)",
          moisturizer: "Barrier cream",
          sunscreen: "SPF 50"
        };
      }
      
      if (primarySkinType === 'Dry') {
        return {
          cleanser: "Cream cleanser",
          coreSerum: "Retinol / Peptides",
          secondarySerum: "Vitamin C",
          moisturizer: "Rich cream w/ ceramides",
          sunscreen: "SPF 50"
        };
      }
      
      if (primarySkinType === 'Oily') {
        return {
          cleanser: "Foaming",
          coreSerum: "Retinol (encapsulated/light)",
          secondarySerum: "Vitamin C",
          moisturizer: "Oil-free gel",
          sunscreen: "SPF 50 matte"
        };
      }
      
      // Combo
      return {
        cleanser: "Gentle foaming",
        coreSerum: "Retinol",
        secondarySerum: "Vitamin C",
        moisturizer: "Gel-cream",
        sunscreen: "SPF 50"
      };
    }
  }
  
  return null;
}

// Pigmentation-based recommendations
function getPigmentationRecommendation(context: RecommendationContext): ProductRecommendation | null {
  const pigmentationBand = context.effectiveBands?.pigmentation?.toLowerCase();
  const primarySkinType = getPrimarySkinType(context.skinType);
  const sensitive = isSensitive(context);
  
  if (pigmentationBand === 'yellow' || pigmentationBand === 'red') {
    // Determine if it's PIE (red) or PIH (brown) pigmentation
    const pigmentationType = context.formData.pigmentationType?.toLowerCase() || '';
    const isRedPigmentation = pigmentationType.includes('red');
    const isBrownPigmentation = pigmentationType.includes('brown');
    
    // PIE (red pigmentation)
    if (isRedPigmentation) {
      if (sensitive) {
        return {
          cleanser: "Gentle cleanser",
          coreSerum: "Azelaic acid",
          secondarySerum: "Niacinamide",
          moisturizer: "Barrier cream",
          sunscreen: "SPF 50"
        };
      }
      
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
          cleanser: "Foaming",
          coreSerum: "Azelaic acid",
          secondarySerum: "Niacinamide",
          moisturizer: "Oil-free gel",
          sunscreen: "Matte SPF"
        };
      }
      
      // Combo
      return {
        cleanser: "Foaming",
        coreSerum: "Azelaic acid",
        secondarySerum: "Niacinamide",
        moisturizer: "Gel-cream",
        sunscreen: "SPF 50"
      };
    }
    
    // PIH (brown pigmentation)
    if (isBrownPigmentation) {
      if (sensitive) {
        return {
          cleanser: "Gentle cleanser",
          coreSerum: "Azelaic acid",
          secondarySerum: "Niacinamide",
          moisturizer: "Barrier cream",
          sunscreen: "SPF 50"
        };
      }
      
      if (primarySkinType === 'Dry') {
        return {
          cleanser: "Gentle cleanser",
          coreSerum: "Tranexamic acid",
          secondarySerum: "Vitamin C",
          moisturizer: "Barrier cream",
          sunscreen: "SPF 50"
        };
      }
      
      if (primarySkinType === 'Oily') {
        return {
          cleanser: "SA or foaming",
          coreSerum: "Tranexamic acid",
          secondarySerum: "Vitamin C",
          moisturizer: "Oil-free gel",
          sunscreen: "Matte SPF"
        };
      }
      
      // Combo
      return {
        cleanser: "Foaming",
        coreSerum: "Tranexamic acid",
        secondarySerum: "Vitamin C",
        moisturizer: "Gel-cream",
        sunscreen: "SPF 50"
      };
    }
  }
  
  return null;
}

// Main recommendation function that prioritizes concerns
export function generateRecommendations(context: RecommendationContext): ProductRecommendation {
  // Priority order: Acne > Sebum > Pigmentation > Texture > Pores > Skin Type
  
  // Check for acne recommendations first (highest priority)
  const acneRec = getAcneRecommendation(context);
  if (acneRec) return acneRec;
  
  // Check sebum-related recommendations
  const sebumRec = getSebumRecommendation(context);
  if (sebumRec) return sebumRec;
  
  // Check pigmentation recommendations
  const pigmentationRec = getPigmentationRecommendation(context);
  if (pigmentationRec) return pigmentationRec;
  
  // Check texture recommendations
  const textureRec = getTextureRecommendation(context);
  if (textureRec) return textureRec;
  
  // Check pores recommendations
  const poresRec = getPoresRecommendation(context);
  if (poresRec) return poresRec;
  
  // Fall back to skin type recommendations
  const skinTypeRec = getSkinTypeRecommendation(context);
  if (skinTypeRec) return skinTypeRec;
  
  // Default fallback recommendation
  return {
    cleanser: "Gentle cleanser",
    coreSerum: "Niacinamide",
    secondarySerum: "",
    moisturizer: "Gel-cream",
    sunscreen: "SPF 50"
  };
}