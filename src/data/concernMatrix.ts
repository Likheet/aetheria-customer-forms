import { IngredientTag } from '../services/ingredientInteractions';

export type ConcernKey =
  | 'acne'
  | 'pigmentation'
  | 'pores'
  | 'texture'
  | 'sebum'
  | 'acnescars';

export type SkinTypeKey = 'Dry' | 'Combo' | 'Oily' | 'Sensitive' | 'Normal';
export type BandColor = 'green' | 'blue' | 'yellow' | 'red';

export type ProductSlot = 'cleanser' | 'coreSerum' | 'secondarySerum' | 'moisturizer' | 'sunscreen';

export interface ProductInfo {
  name: string;
  ingredientTags: IngredientTag[];
  ingredientKeywords: string[];
  defaultUsage?: 'am' | 'pm' | 'both';
  pregnancyUnsafe?: boolean;
  isotretinoinUnsafe?: boolean;
  barrierUnsafe?: boolean;
  notes?: string;
  isReferral?: boolean;
}

export interface MatrixProduct extends ProductInfo {
  slot: ProductSlot;
  rawName: string;
  isDynamic?: boolean;
}

export interface MatrixEntry {
  concern: ConcernKey;
  subtype: string;
  skinType: SkinTypeKey;
  band: BandColor;
  cleanser: MatrixProduct;
  coreSerum: MatrixProduct;
  secondarySerum?: MatrixProduct | null;
  moisturizer: MatrixProduct;
  sunscreen: MatrixProduct;
  remarks?: string;
}

type ProductRegistry = Map<string, ProductInfo>;

const productRegistry: ProductRegistry = new Map();

function registerProduct(
  aliases: string[],
  info: Omit<ProductInfo, 'name'> & { name?: string }
): void {
  if (!aliases.length) return;
  const primaryName = info.name || aliases[0];
  const normalizedInfo: ProductInfo = {
    name: primaryName,
    ingredientTags: info.ingredientTags,
    ingredientKeywords: info.ingredientKeywords,
    defaultUsage: info.defaultUsage ?? 'both',
    pregnancyUnsafe: info.pregnancyUnsafe ?? false,
    isotretinoinUnsafe: info.isotretinoinUnsafe ?? false,
    barrierUnsafe: info.barrierUnsafe ?? false,
    notes: info.notes,
    isReferral: info.isReferral ?? false,
  };
  for (const alias of aliases) {
    if (!alias) continue;
    productRegistry.set(alias.trim().toLowerCase(), normalizedInfo);
  }
}

const TAGS = {
  retinoids: ['retinoids'] as IngredientTag[],
  vitaminC: ['vitamin_c_ascorbic'] as IngredientTag[],
  vitaminCDerivative: ['vitamin_c_derivative'] as IngredientTag[],
  niacinamide: ['niacinamide'] as IngredientTag[],
  bha: ['bha'] as IngredientTag[],
  aha: ['aha'] as IngredientTag[],
  azelaic: ['azelaic'] as IngredientTag[],
  bpo: ['benzoyl_peroxide'] as IngredientTag[],
  peptides: ['peptides'] as IngredientTag[],
  tranexamic: ['tranexamic'] as IngredientTag[],
  ceramides: ['ceramides'] as IngredientTag[],
  sunscreen: ['sunscreen'] as IngredientTag[],
};

// --- Cleanser definitions ---
registerProduct(
  ['Gentle cleanser', 'Gentle gel', 'Gentle foaming', 'Gentle foaming cleanser'],
  {
    name: 'Gentle foaming cleanser',
    ingredientTags: [],
    ingredientKeywords: ['gentle cleanser', 'amino surfactants'],
  }
);

registerProduct(
  ['Cream cleanser', 'Hydrating cleanser'],
  {
    name: 'Cream cleanser',
    ingredientTags: [],
    ingredientKeywords: ['cream cleanser', 'hydrating'],
  }
);

registerProduct(['Gel cleanser', 'Gel-based'], {
  name: 'Gel-based cleanser',
  ingredientTags: [],
  ingredientKeywords: ['gel cleanser'],
});

registerProduct(['Foaming', 'Foaming cleanser'], {
  name: 'Foaming cleanser',
  ingredientTags: [],
  ingredientKeywords: ['foaming cleanser'],
});

registerProduct(
  ['Foaming/Salicylic acid', 'Salicylic acid or foaming', 'Salicylic acid or foaming cleanser'],
  {
    name: 'Salicylic acid foaming cleanser',
    ingredientTags: TAGS.bha,
    ingredientKeywords: ['salicylic acid', 'bha cleanser'],
    pregnancyUnsafe: false,
    isotretinoinUnsafe: true,
    barrierUnsafe: true,
  }
);

registerProduct(
  ['Salicylic acid cleanser', 'Mild Salicylic acid cleanser'],
  {
    name: 'Salicylic acid cleanser',
    ingredientTags: TAGS.bha,
    ingredientKeywords: ['salicylic acid', 'bha cleanser'],
    isotretinoinUnsafe: true,
    barrierUnsafe: true,
  }
);

registerProduct(['Benzoyl Peroxide facewash'], {
  name: 'Benzoyl Peroxide facewash',
  ingredientTags: TAGS.bpo,
  ingredientKeywords: ['benzoyl peroxide', 'bpo cleanser'],
  pregnancyUnsafe: false,
  isotretinoinUnsafe: true,
  barrierUnsafe: true,
});

// --- Serum definitions ---
registerProduct(
  ['Niacinamide', 'Niacinamide 5%', '5% Niacinamide'],
  {
    name: 'Niacinamide serum',
    ingredientTags: TAGS.niacinamide,
    ingredientKeywords: ['niacinamide'],
  }
);

registerProduct(
  ['Azelaic acid', 'Azelaic 10%', '10% Azelaic Acid', 'Azelaic Acid 10%', 'Azelaic acid 10-15%'],
  {
    name: 'Azelaic acid 10%',
    ingredientTags: TAGS.azelaic,
    ingredientKeywords: ['azelaic acid'],
    isotretinoinUnsafe: false,
    pregnancyUnsafe: false,
  }
);

registerProduct(
  ['Adapalene', 'Adapalene 0.1%', 'Adapalene 0.1% PM', 'Adapalene 0.1% (3-5x/week)'],
  {
    name: 'Adapalene 0.1%',
    ingredientTags: TAGS.retinoids,
    ingredientKeywords: ['adapalene', 'retinoid'],
    defaultUsage: 'pm',
    pregnancyUnsafe: true,
    isotretinoinUnsafe: true,
    barrierUnsafe: true,
  }
);

registerProduct(
  ['Benzoyl Peroxide 2.5%', 'Benzoyl Peroxide 2.5% AM'],
  {
    name: 'Benzoyl Peroxide 2.5%',
    ingredientTags: TAGS.bpo,
    ingredientKeywords: ['benzoyl peroxide'],
    defaultUsage: 'am',
    pregnancyUnsafe: false,
    isotretinoinUnsafe: true,
    barrierUnsafe: true,
  }
);

registerProduct(['Salicylic acid', 'Salicylic acid 2%', '2% Salicylic acid (2x/week)'], {
  name: 'Salicylic acid 2%',
  ingredientTags: TAGS.bha,
  ingredientKeywords: ['salicylic acid'],
  defaultUsage: 'pm',
  pregnancyUnsafe: false,
  isotretinoinUnsafe: true,
  barrierUnsafe: true,
});

registerProduct(['Lactic acid', '5% Lactic acid', '8-10% Glycolic acid'], {
  name: 'Gentle AHA serum',
  ingredientTags: TAGS.aha,
  ingredientKeywords: ['lactic acid', 'glycolic acid', 'aha'],
  defaultUsage: 'pm',
  pregnancyUnsafe: false,
  isotretinoinUnsafe: true,
  barrierUnsafe: true,
});

registerProduct(['Vitamin C'], {
  name: 'Vitamin C serum',
  ingredientTags: TAGS.vitaminC,
  ingredientKeywords: ['vitamin c', 'l-ascorbic acid'],
  defaultUsage: 'am',
});

registerProduct(['Vitamin C (derivatives)'], {
  name: 'Vitamin C derivative serum',
  ingredientTags: TAGS.vitaminCDerivative,
  ingredientKeywords: ['vitamin c derivative', 'tetrahexyldecyl ascorbate'],
  defaultUsage: 'am',
});

registerProduct(['Tranexamic acid', 'Tranexamic Acid + Alpha Arbutin'], {
  name: 'Tranexamic acid serum',
  ingredientTags: TAGS.tranexamic,
  ingredientKeywords: ['tranexamic acid', 'alpha arbutin'],
  defaultUsage: 'am',
});

registerProduct(['Retinol'], {
  name: 'Retinol treatment',
  ingredientTags: TAGS.retinoids,
  ingredientKeywords: ['retinol'],
  defaultUsage: 'pm',
  pregnancyUnsafe: true,
  isotretinoinUnsafe: true,
  barrierUnsafe: true,
});

registerProduct(['Retinol/Peptides'], {
  name: 'Retinol peptide treatment',
  ingredientTags: TAGS.retinoids.concat(TAGS.peptides),
  ingredientKeywords: ['retinol', 'peptides'],
  defaultUsage: 'pm',
  pregnancyUnsafe: true,
  isotretinoinUnsafe: true,
  barrierUnsafe: true,
});

registerProduct(['Bakuchiol/Peptides'], {
  name: 'Bakuchiol peptide serum',
  ingredientTags: TAGS.peptides,
  ingredientKeywords: ['bakuchiol', 'peptides'],
  defaultUsage: 'pm',
});

registerProduct(['Azelaic Acid 10%'], {
  name: 'Azelaic acid 10%',
  ingredientTags: TAGS.azelaic,
  ingredientKeywords: ['azelaic acid'],
});

registerProduct(['Adapalene 0.1%'], {
  name: 'Adapalene 0.1%',
  ingredientTags: TAGS.retinoids,
  ingredientKeywords: ['adapalene', 'retinoid'],
  defaultUsage: 'pm',
  pregnancyUnsafe: true,
  isotretinoinUnsafe: true,
  barrierUnsafe: true,
});

registerProduct(['Clay mask'], {
  name: 'Clay mask',
  ingredientTags: [],
  ingredientKeywords: ['kaolin', 'bentonite'],
  defaultUsage: 'pm',
});

registerProduct(['Silicon sheets'], {
  name: 'Silicone scar sheets',
  ingredientTags: [],
  ingredientKeywords: ['silicone sheets'],
  defaultUsage: 'pm',
});

// --- Moisturizers ---
registerProduct(['Gel cream', 'Gel-cream'], {
  name: 'Gel-cream moisturizer',
  ingredientTags: [],
  ingredientKeywords: ['gel cream'],
});

registerProduct(['Oil-free gel'], {
  name: 'Oil-free gel moisturizer',
  ingredientTags: [],
  ingredientKeywords: ['oil-free gel'],
});

registerProduct(['Barrier cream'], {
  name: 'Barrier repair cream',
  ingredientTags: TAGS.ceramides,
  ingredientKeywords: ['ceramides', 'cholesterol', 'fatty acids'],
});

registerProduct(['Rich cream'], {
  name: 'Rich cream moisturizer',
  ingredientTags: TAGS.ceramides,
  ingredientKeywords: ['rich cream', 'ceramides'],
});

registerProduct(['Smoothening moisturizer'], {
  name: 'Smoothing moisturizer',
  ingredientTags: [],
  ingredientKeywords: ['smoothing moisturizer'],
});

// --- Sunscreens ---
registerProduct(['Pure mineral sunscreen'], {
  name: 'Pure mineral sunscreen SPF 50',
  ingredientTags: TAGS.sunscreen,
  ingredientKeywords: ['mineral sunscreen', 'zinc oxide'],
  defaultUsage: 'am',
});

registerProduct(['Tinted mineral sunscreen'], {
  name: 'Tinted mineral sunscreen SPF 50',
  ingredientTags: TAGS.sunscreen,
  ingredientKeywords: ['tinted mineral sunscreen', 'zinc oxide'],
  defaultUsage: 'am',
});

registerProduct(['Broad-spectrum sunscreen'], {
  name: 'Broad-spectrum sunscreen SPF 50',
  ingredientTags: TAGS.sunscreen,
  ingredientKeywords: ['broad-spectrum sunscreen'],
  defaultUsage: 'am',
});

const SKIN_TYPE_DEFAULTS: Record<
  SkinTypeKey,
  Partial<Record<ProductSlot, string>>
> = {
  Dry: {
    cleanser: 'Cream cleanser',
    moisturizer: 'Rich cream',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Azelaic acid',
    sunscreen: 'Nourishing mineral cream sunscreen SPF 50',
  },
  Combo: {
    cleanser: 'Gentle foaming cleanser',
    moisturizer: 'Gel-cream',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Azelaic acid',
    sunscreen: 'Hybrid sunscreen SPF 50',
  },
  Oily: {
    cleanser: 'Gel cleanser',
    moisturizer: 'Oil-free gel',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Salicylic acid 2%',
    sunscreen: 'Lightweight gel sunscreen SPF 50',
  },
  Sensitive: {
    cleanser: 'Gentle cleanser',
    moisturizer: 'Barrier cream',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Azelaic acid',
    sunscreen: 'Pure mineral sunscreen',
  },
  Normal: {
    cleanser: 'Gentle foaming cleanser',
    moisturizer: 'Gel-cream',
    coreSerum: 'Niacinamide',
    secondarySerum: 'Vitamin C (derivatives)',
    sunscreen: 'Broad-spectrum sunscreen',
  },
};

const DYNAMIC_SUNSCREENS: Record<string, ProductInfo> = {
  'Lightweight gel sunscreen SPF 50': {
    name: 'Lightweight gel sunscreen SPF 50',
    ingredientTags: TAGS.sunscreen,
    ingredientKeywords: ['sunscreen', 'gel', 'chemical'],
    defaultUsage: 'am',
  },
  'Nourishing mineral cream sunscreen SPF 50': {
    name: 'Nourishing mineral cream sunscreen SPF 50',
    ingredientTags: TAGS.sunscreen,
    ingredientKeywords: ['sunscreen', 'mineral'],
    defaultUsage: 'am',
  },
  'Hybrid sunscreen SPF 50': {
    name: 'Hybrid sunscreen SPF 50',
    ingredientTags: TAGS.sunscreen,
    ingredientKeywords: ['sunscreen', 'hybrid'],
    defaultUsage: 'am',
  },
  'Broad-spectrum sunscreen SPF 50': {
    name: 'Broad-spectrum sunscreen SPF 50',
    ingredientTags: TAGS.sunscreen,
    ingredientKeywords: ['sunscreen', 'broad spectrum'],
    defaultUsage: 'am',
  },
};

function lookupProductInfo(rawName: string): ProductInfo | undefined {
  const key = rawName.trim().toLowerCase();
  return productRegistry.get(key) || DYNAMIC_SUNSCREENS[rawName];
}

function resolveDynamicDefault(
  slot: ProductSlot,
  skinType: SkinTypeKey
): ProductInfo | null {
  const fallbackName = SKIN_TYPE_DEFAULTS[skinType]?.[slot];
  if (!fallbackName) return null;
  if (fallbackName in DYNAMIC_SUNSCREENS) return DYNAMIC_SUNSCREENS[fallbackName];
  const info = lookupProductInfo(fallbackName);
  if (!info) {
    throw new Error(`Missing product info for fallback ${fallbackName} (${slot})`);
  }
  return info;
}

function createMatrixProduct(
  slot: ProductSlot,
  rawName: string,
  skinType: SkinTypeKey
): MatrixProduct | null {
  const trimmed = rawName.trim();
  if (!trimmed) return null;
  if (trimmed.toUpperCase() === 'REFER_DERM') {
    return {
      name: 'Dermatologist referral required',
      ingredientTags: [],
      ingredientKeywords: [],
      defaultUsage: 'both',
      pregnancyUnsafe: false,
      isotretinoinUnsafe: false,
      barrierUnsafe: false,
      notes: 'Refer to dermatologist',
      slot,
      rawName,
      isReferral: true,
    };
  }
  if (trimmed.toUpperCase() === 'SKINTYPE_DEFAULT') {
    const fallback = resolveDynamicDefault(slot, skinType);
    if (!fallback) {
      throw new Error(`No skin-type default defined for ${slot} (${skinType})`);
    }
    return {
      ...fallback,
      slot,
      rawName,
      isDynamic: true,
    };
  }
  if (trimmed.toLowerCase() === 'as per skin type') {
    const fallback = resolveDynamicDefault(slot, skinType);
    if (!fallback) {
      throw new Error(`No skin-type default defined for ${slot} (${skinType})`);
    }
    return {
      ...fallback,
      slot,
      rawName,
      isDynamic: true,
    };
  }
  if (trimmed.toLowerCase() === 'broad-spectrum sunscreen') {
    const fallback = DYNAMIC_SUNSCREENS['Broad-spectrum sunscreen SPF 50'];
    return {
      ...fallback,
      slot,
      rawName,
      isDynamic: true,
    };
  }
  const info = lookupProductInfo(trimmed);
  if (!info) {
    throw new Error(`No product info registered for "${trimmed}" (${slot})`);
  }
  return {
    ...info,
    slot,
    rawName,
  };
}

const RAW_MATRIX = `Concern,Subtype,SkinType,Band,Cleanser,CoreSerum,SecondarySerum,Moisturizer,Sunscreen,Remarks
Sebum,General,Combo,Blue,Gel-based,Niacinamide,,Gel cream,SKINTYPE_DEFAULT,
Sebum,General,Combo,Yellow,Gel-based,Niacinamide,,Gel cream,SKINTYPE_DEFAULT,
Sebum,General,Normal,Blue,Gel-based,Niacinamide,,Gel cream,SKINTYPE_DEFAULT,
Sebum,General,Normal,Yellow,Gel-based,Niacinamide,,Gel cream,SKINTYPE_DEFAULT,
Sebum,General,Oily,Blue,Salicylic acid or foaming cleanser,Niacinamide,Salicylic acid 2%,Oil-free gel,SKINTYPE_DEFAULT,
Sebum,General,Oily,Yellow,Salicylic acid or foaming cleanser,Niacinamide,Salicylic acid 2%,Oil-free gel,SKINTYPE_DEFAULT,
Sebum,General,Sensitive,Blue,Gel-based,Niacinamide,,Gel cream,Pure mineral sunscreen,
Sebum,General,Sensitive,Yellow,Gel-based,Niacinamide,,Gel cream,Pure mineral sunscreen,
Sebum,General,Oily,Red,Salicylic acid or foaming cleanser,Niacinamide,Salicylic acid 2%,Oil-free gel,SKINTYPE_DEFAULT,
Sebum,General,Sensitive,Red,Gel-based,Niacinamide,,Oil-free gel,Pure mineral sunscreen,
Acne,Inflammatory,Dry,Blue,Cream cleanser,Azelaic 10%,5% Niacinamide,Rich cream,SKINTYPE_DEFAULT,
Acne,Inflammatory,Combo,Blue,Gentle gel,Adapalene 0.1% PM,10% Azelaic Acid,Gel-cream,SKINTYPE_DEFAULT,
Acne,Inflammatory,Normal,Blue,Gentle gel,Adapalene 0.1% PM,10% Azelaic Acid,Gel-cream,SKINTYPE_DEFAULT,
Acne,Inflammatory,Oily,Blue,Gentle gel,Adapalene 0.1% PM,10% Azelaic Acid,Oil-free gel,SKINTYPE_DEFAULT,
Acne,Inflammatory,Sensitive,Blue,Gentle gel,10% Azelaic Acid,5% Niacinamide,Barrier cream,Pure mineral sunscreen,
Acne,Inflammatory,Dry,Yellow,Cream cleanser,Benzoyl Peroxide 2.5%,10% Azelaic Acid,Rich cream,SKINTYPE_DEFAULT,
Acne,Inflammatory,Dry,Red,Cream cleanser,Benzoyl Peroxide 2.5%,10% Azelaic Acid,Rich cream,SKINTYPE_DEFAULT,
Acne,Inflammatory,Combo,Yellow,Gentle foaming cleanser,Benzoyl Peroxide 2.5% AM,10% Azelaic Acid,Gel-cream,SKINTYPE_DEFAULT,
Acne,Inflammatory,Combo,Red,Gentle foaming cleanser,Benzoyl Peroxide 2.5% AM,10% Azelaic Acid,Gel-cream,SKINTYPE_DEFAULT,
Acne,Inflammatory,Normal,Yellow,Gentle foaming cleanser,Benzoyl Peroxide 2.5% AM,10% Azelaic Acid,Gel-cream,SKINTYPE_DEFAULT,
Acne,Inflammatory,Normal,Red,Gentle foaming cleanser,Benzoyl Peroxide 2.5% AM,10% Azelaic Acid,Gel-cream,SKINTYPE_DEFAULT,
Acne,Inflammatory,Oily,Yellow,Gel cleanser,Benzoyl Peroxide 2.5% AM,10% Azelaic Acid,Oil-free gel,SKINTYPE_DEFAULT,
Acne,Inflammatory,Oily,Red,Gel cleanser,Benzoyl Peroxide 2.5% AM,10% Azelaic Acid,Oil-free gel,SKINTYPE_DEFAULT,
Acne,Inflammatory,Sensitive,Yellow,Gentle gel,10% Azelaic Acid,5% Niacinamide,Gel-cream,Pure mineral sunscreen,
Acne,Inflammatory,Sensitive,Red,Gentle gel,10% Azelaic Acid,5% Niacinamide,Gel-cream,Pure mineral sunscreen,
Acne,Comedonal,Dry,Yellow,Gentle cleanser,Adapalene 0.1%,10% Azelaic Acid,Barrier cream,SKINTYPE_DEFAULT,
Acne,Comedonal,Dry,Red,Gentle cleanser,Adapalene 0.1%,10% Azelaic Acid,Barrier cream,SKINTYPE_DEFAULT,
Acne,Comedonal,Combo,Yellow,Salicylic acid cleanser,Adapalene 0.1%,10% Azelaic Acid,Gel-cream,SKINTYPE_DEFAULT,
Acne,Comedonal,Combo,Red,Salicylic acid cleanser,Adapalene 0.1%,10% Azelaic Acid,Gel-cream,SKINTYPE_DEFAULT,
Acne,Comedonal,Oily,Yellow,Salicylic acid cleanser,Adapalene 0.1%,10% Azelaic Acid,Oil-free gel,SKINTYPE_DEFAULT,
Acne,Comedonal,Oily,Red,Salicylic acid cleanser,Adapalene 0.1%,10% Azelaic Acid,Oil-free gel,SKINTYPE_DEFAULT,
Acne,Comedonal,Sensitive,Yellow,Mild Salicylic acid cleanser,Niacinamide,,Barrier cream,Pure mineral sunscreen,
Acne,Comedonal,Sensitive,Red,Mild Salicylic acid cleanser,Niacinamide,,Barrier cream,Pure mineral sunscreen,
Acne,Situational,Dry,Blue,Gentle cleanser,Azelaic acid,Niacinamide,Barrier cream,SKINTYPE_DEFAULT,
Acne,Situational,Combo,Blue,Benzoyl Peroxide facewash,Niacinamide,,Gel-cream,SKINTYPE_DEFAULT,
Acne,Situational,Oily,Blue,Benzoyl Peroxide facewash,Niacinamide,,Oil-free gel,SKINTYPE_DEFAULT,
Acne,Hormonal,Dry,Blue,SKINTYPE_DEFAULT,10% Azelaic Acid,Adapalene 0.1%,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,REFER DOCTOR
Acne,Hormonal,Combo,Blue,SKINTYPE_DEFAULT,10% Azelaic Acid,Adapalene 0.1%,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,REFER DOCTOR
Acne,Hormonal,Oily,Blue,SKINTYPE_DEFAULT,10% Azelaic Acid,Adapalene 0.1%,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,REFER DOCTOR
Acne,Hormonal,Sensitive,Blue,SKINTYPE_DEFAULT,10% Azelaic Acid,Adapalene 0.1%,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,REFER DOCTOR
Acne,Nodulocystic,Dry,Red,REFER_DERM,REFER_DERM,REFER_DERM,REFER_DERM,REFER_DERM,Dermatologist referral required
Acne,Nodulocystic,Combo,Red,REFER_DERM,REFER_DERM,REFER_DERM,REFER_DERM,REFER_DERM,Dermatologist referral required
Acne,Nodulocystic,Oily,Red,REFER_DERM,REFER_DERM,REFER_DERM,REFER_DERM,REFER_DERM,Dermatologist referral required
Acne,Nodulocystic,Sensitive,Red,REFER_DERM,REFER_DERM,REFER_DERM,REFER_DERM,REFER_DERM,Dermatologist referral required
AcneScars,IcePick,Dry,Yellow,SKINTYPE_DEFAULT,Adapalene 0.1% (3-5x/week),2% Salicylic acid (2x/week),SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,IcePick,Combo,Yellow,SKINTYPE_DEFAULT,Adapalene 0.1% (3-5x/week),2% Salicylic acid (2x/week),SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,IcePick,Oily,Yellow,SKINTYPE_DEFAULT,Adapalene 0.1% (3-5x/week),2% Salicylic acid (2x/week),SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,IcePick,Sensitive,Yellow,SKINTYPE_DEFAULT,Adapalene 0.1% (3-5x/week),2% Salicylic acid (2x/week),SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,Rolling,Oily,Yellow,SKINTYPE_DEFAULT,Adapalene 0.1% (3-5x/week),8-10% Glycolic acid,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,Rolling,Combo,Yellow,SKINTYPE_DEFAULT,Adapalene 0.1% (3-5x/week),8-10% Glycolic acid,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,Rolling,Dry,Yellow,SKINTYPE_DEFAULT,Adapalene 0.1% (3-5x/week),5% Lactic acid,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,PIE,Dry,Yellow,SKINTYPE_DEFAULT,Azelaic Acid 10%,Adapalene 0.1%,SKINTYPE_DEFAULT,Tinted mineral sunscreen,Post-inflammatory erythema (red marks)
AcneScars,PIE,Combo,Yellow,SKINTYPE_DEFAULT,Azelaic Acid 10%,Adapalene 0.1%,SKINTYPE_DEFAULT,Tinted mineral sunscreen,Post-inflammatory erythema (red marks)
AcneScars,PIE,Oily,Yellow,SKINTYPE_DEFAULT,Azelaic Acid 10%,Adapalene 0.1%,SKINTYPE_DEFAULT,Tinted mineral sunscreen,Post-inflammatory erythema (red marks)
AcneScars,PIE,Sensitive,Yellow,SKINTYPE_DEFAULT,Azelaic Acid 10%,Adapalene 0.1%,SKINTYPE_DEFAULT,Tinted mineral sunscreen,Post-inflammatory erythema (red marks)
AcneScars,PIH,Dry,Yellow,SKINTYPE_DEFAULT,Tranexamic Acid + Alpha Arbutin,Azelaic Acid 10%,SKINTYPE_DEFAULT,Tinted mineral sunscreen,Post-inflammatory hyperpigmentation (brown marks)
AcneScars,PIH,Combo,Yellow,SKINTYPE_DEFAULT,Tranexamic Acid + Alpha Arbutin,Azelaic Acid 10%,SKINTYPE_DEFAULT,Tinted mineral sunscreen,Post-inflammatory hyperpigmentation (brown marks)
AcneScars,PIH,Oily,Yellow,SKINTYPE_DEFAULT,Tranexamic Acid + Alpha Arbutin,Azelaic Acid 10%,SKINTYPE_DEFAULT,Tinted mineral sunscreen,Post-inflammatory hyperpigmentation (brown marks)
AcneScars,PIH,Sensitive,Yellow,SKINTYPE_DEFAULT,Tranexamic Acid + Alpha Arbutin,Azelaic Acid 10%,SKINTYPE_DEFAULT,Tinted mineral sunscreen,Post-inflammatory hyperpigmentation (brown marks)
AcneScars,Keloid,Dry,Red,SKINTYPE_DEFAULT,Silicon sheets,,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,Keloid,Combo,Red,SKINTYPE_DEFAULT,Silicon sheets,,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,Keloid,Oily,Red,SKINTYPE_DEFAULT,Silicon sheets,,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
AcneScars,Keloid,Sensitive,Red,SKINTYPE_DEFAULT,Silicon sheets,,SKINTYPE_DEFAULT,SKINTYPE_DEFAULT,Products improve texture but won't fully fix; dermat procedures help
Acne,Pregnancy,Dry,Blue,Gentle cleanser,Azelaic acid 10-15%,Niacinamide,Barrier cream,SKINTYPE_DEFAULT,Pregnancy-safe routine
Acne,Pregnancy,Combo,Blue,Gentle cleanser,Azelaic acid 10-15%,Niacinamide,Barrier cream,SKINTYPE_DEFAULT,Pregnancy-safe routine
Acne,Pregnancy,Oily,Blue,Gentle cleanser,Azelaic acid 10-15%,Niacinamide,Barrier cream,SKINTYPE_DEFAULT,Pregnancy-safe routine
Acne,Pregnancy,Sensitive,Blue,Gentle cleanser,Azelaic acid 10-15%,Niacinamide,Barrier cream,SKINTYPE_DEFAULT,Pregnancy-safe routine
Pores,General,Combo,Blue,Gentle foaming,Niacinamide 5%,,Gel-cream,SKINTYPE_DEFAULT,
Pores,General,Normal,Blue,Gentle foaming,Niacinamide 5%,,Gel-cream,SKINTYPE_DEFAULT,
Pores,General,Oily,Blue,Foaming/Salicylic acid,Niacinamide,,Oil-free gel,SKINTYPE_DEFAULT,
Pores,General,Sensitive,Blue,Gentle foaming,Niacinamide 5%,,Gel-cream,Pure mineral sunscreen,
Pores,General,Combo,Yellow,Gentle foaming,Salicylic acid,Niacinamide,Gel-cream,SKINTYPE_DEFAULT,
Pores,General,Combo,Red,Gentle foaming,Salicylic acid,Niacinamide,Gel-cream,SKINTYPE_DEFAULT,
Pores,General,Oily,Yellow,Salicylic acid cleanser,Salicylic acid,Niacinamide,Oil-free gel,SKINTYPE_DEFAULT,
Pores,General,Oily,Red,Salicylic acid cleanser,Salicylic acid,Niacinamide,Oil-free gel,SKINTYPE_DEFAULT,
Pores,General,Sensitive,Yellow,Salicylic acid cleanser,Niacinamide 5%,Clay mask,Gel-cream,Pure mineral sunscreen,Mild to moderate sensitivity
Pores,General,Sensitive,Red,Gentle foaming,Niacinamide 5%,Clay mask,Barrier cream,Pure mineral sunscreen,High sensitivity
Texture,Aging,Dry,Yellow,Cream cleanser,Retinol/Peptides,Vitamin C (derivatives),Rich cream,SKINTYPE_DEFAULT,
Texture,Aging,Dry,Red,Cream cleanser,Retinol/Peptides,Vitamin C (derivatives),Rich cream,SKINTYPE_DEFAULT,
Texture,Aging,Combo,Yellow,Gentle foaming,Retinol,Vitamin C,Gel-cream,SKINTYPE_DEFAULT,
Texture,Aging,Combo,Red,Gentle foaming,Retinol,Vitamin C,Gel-cream,SKINTYPE_DEFAULT,
Texture,Aging,Oily,Yellow,Foaming,Retinol,Vitamin C,Oil-free gel,SKINTYPE_DEFAULT,
Texture,Aging,Oily,Red,Foaming,Retinol,Vitamin C,Oil-free gel,SKINTYPE_DEFAULT,
Texture,Aging,Sensitive,Yellow,Cream cleanser,Bakuchiol/Peptides,Vitamin C (derivatives),Barrier cream,Pure mineral sunscreen,Mild to moderate sensitivity
Texture,Aging,Sensitive,Red,Cream cleanser,Bakuchiol/Peptides,Niacinamide,Barrier cream,Pure mineral sunscreen,High sensitivity
Texture,Bumpy,Dry,Yellow,Cream cleanser,Adapalene,Lactic acid,Barrier cream,SKINTYPE_DEFAULT,
Texture,Bumpy,Dry,Red,Cream cleanser,Adapalene,Lactic acid,Barrier cream,SKINTYPE_DEFAULT,
Texture,Bumpy,Combo,Yellow,Gentle foaming,Adapalene,Salicylic acid,Gel-cream,SKINTYPE_DEFAULT,
Texture,Bumpy,Combo,Red,Gentle foaming,Adapalene,Salicylic acid,Gel-cream,SKINTYPE_DEFAULT,
Texture,Bumpy,Oily,Yellow,Gentle foaming,Adapalene,Salicylic acid,Oil-free gel,SKINTYPE_DEFAULT,
Texture,Bumpy,Oily,Red,Gentle foaming,Adapalene,Salicylic acid,Oil-free gel,SKINTYPE_DEFAULT,
Texture,Bumpy,Sensitive,Yellow,Cream cleanser,Niacinamide,,Smoothening moisturizer,Pure mineral sunscreen,Mild to moderate sensitivity
Texture,Bumpy,Sensitive,Red,Cream cleanser,Niacinamide,,Smoothening moisturizer,Pure mineral sunscreen,High sensitivity
Pigmentation,PIE,Dry,Yellow,Gentle cleanser,Azelaic acid,Niacinamide,Barrier cream,SKINTYPE_DEFAULT,Red pigmentation (post-inflammatory erythema)
Pigmentation,PIE,Dry,Red,Gentle cleanser,Azelaic acid,Niacinamide,Barrier cream,SKINTYPE_DEFAULT,Red pigmentation (post-inflammatory erythema)
Pigmentation,PIE,Combo,Yellow,Foaming,Azelaic acid,Niacinamide,Gel-cream,SKINTYPE_DEFAULT,Red pigmentation (post-inflammatory erythema)
Pigmentation,PIE,Combo,Red,Foaming,Azelaic acid,Niacinamide,Gel-cream,SKINTYPE_DEFAULT,Red pigmentation (post-inflammatory erythema)
Pigmentation,PIE,Oily,Yellow,Foaming,Azelaic acid,Niacinamide,Oil-free gel,SKINTYPE_DEFAULT,Red pigmentation (post-inflammatory erythema)
Pigmentation,PIE,Oily,Red,Foaming,Azelaic acid,Niacinamide,Oil-free gel,SKINTYPE_DEFAULT,Red pigmentation (post-inflammatory erythema)
Pigmentation,PIE,Sensitive,Yellow,Gentle cleanser,Azelaic acid,Niacinamide,Barrier cream,Pure mineral sunscreen,Red pigmentation (post-inflammatory erythema)
Pigmentation,PIE,Sensitive,Red,Gentle cleanser,Azelaic acid,Niacinamide,Barrier cream,Pure mineral sunscreen,Red pigmentation (post-inflammatory erythema)
Pigmentation,PIH,Dry,Yellow,Gentle cleanser,Tranexamic acid,Vitamin C (derivatives),Rich cream,SKINTYPE_DEFAULT,Brown pigmentation (post-inflammatory hyperpigmentation)
Pigmentation,PIH,Dry,Red,Gentle cleanser,Tranexamic acid,Vitamin C (derivatives),Rich cream,SKINTYPE_DEFAULT,Brown pigmentation (post-inflammatory hyperpigmentation)
Pigmentation,PIH,Combo,Yellow,Foaming,Tranexamic acid,Vitamin C,Gel-cream,SKINTYPE_DEFAULT,Brown pigmentation (post-inflammatory hyperpigmentation)
Pigmentation,PIH,Combo,Red,Foaming,Tranexamic acid,Vitamin C,Gel-cream,SKINTYPE_DEFAULT,Brown pigmentation (post-inflammatory hyperpigmentation)
Pigmentation,PIH,Oily,Yellow,Salicylic acid or foaming,Tranexamic acid,Vitamin C,Oil-free gel,SKINTYPE_DEFAULT,Brown pigmentation (post-inflammatory hyperpigmentation)
Pigmentation,PIH,Oily,Red,Salicylic acid or foaming,Tranexamic acid,Vitamin C,Oil-free gel,SKINTYPE_DEFAULT,Brown pigmentation (post-inflammatory hyperpigmentation)
Pigmentation,PIH,Sensitive,Yellow,Gentle cleanser,Azelaic acid,Niacinamide,Barrier cream,Pure mineral sunscreen,Brown pigmentation (post-inflammatory hyperpigmentation)
Pigmentation,PIH,Sensitive,Red,Gentle cleanser,Azelaic acid,Niacinamide,Barrier cream,Pure mineral sunscreen,Brown pigmentation (post-inflammatory hyperpigmentation)
`;

const matrixIndex: Record<
  ConcernKey,
  Record<string, Record<SkinTypeKey, Record<BandColor, MatrixEntry>>>
> = Object.create(null);

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

function toBand(raw: string): BandColor {
  const key = raw.trim().toLowerCase() as BandColor;
  if (key !== 'green' && key !== 'blue' && key !== 'yellow' && key !== 'red') {
    throw new Error(`Unsupported band color "${raw}"`);
  }
  return key;
}

function toSkinType(raw: string): SkinTypeKey {
  const formatted = raw.trim();
  if (!['Dry', 'Combo', 'Oily', 'Sensitive', 'Normal'].includes(formatted)) {
    throw new Error(`Unsupported skin type "${raw}"`);
  }
  return formatted as SkinTypeKey;
}

const rows = RAW_MATRIX.split('\n').filter(Boolean);
rows.shift(); // remove header

for (const line of rows) {
  const cols = line.split(',');
  if (cols.length < 9) continue;
  const concern = toConcernKey(cols[0]);
  const subtype = cols[1].trim();
  const skinType = toSkinType(cols[2]);
  const band = toBand(cols[3]);
  const cleanser = createMatrixProduct('cleanser', cols[4], skinType);
  const coreSerum = createMatrixProduct('coreSerum', cols[5], skinType);
  const secondarySerum = createMatrixProduct('secondarySerum', cols[6], skinType);
  const moisturizer = createMatrixProduct('moisturizer', cols[7], skinType);
  const sunscreen = createMatrixProduct('sunscreen', cols[8], skinType);
  const remarks = cols[9]?.trim() || undefined;

  if (!cleanser || !coreSerum || !moisturizer || !sunscreen) {
    throw new Error(`Matrix row missing mandatory product: ${line}`);
  }

  const entry: MatrixEntry = {
    concern,
    subtype,
    skinType,
    band,
    cleanser,
    coreSerum,
    secondarySerum: secondarySerum ?? null,
    moisturizer,
    sunscreen,
    remarks,
  };

  matrixIndex[concern] = matrixIndex[concern] || Object.create(null);
  matrixIndex[concern][subtype] = matrixIndex[concern][subtype] || Object.create(null);
  matrixIndex[concern][subtype][skinType] =
    matrixIndex[concern][subtype][skinType] || Object.create(null);
  matrixIndex[concern][subtype][skinType][band] = entry;
}

export function lookupMatrixEntry(
  params: {
    concern: ConcernKey;
    subtype: string;
    skinType: SkinTypeKey;
    band: BandColor;
  }
): MatrixEntry | undefined {
  return matrixIndex[params.concern]?.[params.subtype]?.[params.skinType]?.[params.band];
}

export function listSubtypes(concern: ConcernKey): string[] {
  return Object.keys(matrixIndex[concern] || {});
}

export function getProductInfo(rawName: string): ProductInfo | undefined {
  return lookupProductInfo(rawName);
}
