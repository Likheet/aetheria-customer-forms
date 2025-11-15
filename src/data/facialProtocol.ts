export interface FacialProfile {
  skinType?: string;
  concernPriority?: string[];
  mainConcerns?: string[];
  sensitivityAnswer?: string;
  sensitivityBand?: string;
}

export interface FacialStep {
  step: number;
  title: string;
  productType: string;
  product: string;
  remarks?: string;
  skipped?: boolean;
}

type ConcernSlug = 'acne' | 'acnescars' | 'pigmentation' | 'pigmentation_sensitive' | 'aging' | 'bumpy' | 'pores';
type SkinBase = 'oily' | 'combo' | 'dry' | 'normal';

const SENSITIVE_BANDS = new Set(['yellow', 'red']);
const MAJOR_CONCERNS = new Set<ConcernSlug>(['pigmentation', 'pigmentation_sensitive', 'aging', 'bumpy', 'acne', 'acnescars', 'pores']);

export function buildFacialProtocol(profile?: FacialProfile | null): FacialStep[] {
  if (!profile) return [];

  const skinBase = deriveSkinBase(profile.skinType);
  const isDry = skinBase === 'dry';
  const isComboOrOily = skinBase === 'combo' || skinBase === 'oily';
  const sensitive = isSensitiveProfile(profile);
  const primaryConcern = resolvePrimaryConcern(profile);
  const concernSet = new Set(resolveConcernSlugs([...(profile.mainConcerns ?? []), ...(profile.concernPriority ?? [])]));
  const hasMajorConcern = Array.from(concernSet).some(slug => MAJOR_CONCERNS.has(slug));
  const noConcern = !hasMajorConcern;

  const steps: FacialStep[] = [];

  // Step 1 – Pre cleanser
  const includePreCleanser = isComboOrOily;
  steps.push({
    step: 1,
    title: 'Pre Cleanser',
    productType: 'Cleansing oil',
    product: includePreCleanser ? 'Beauty of Joseon Cleansing Oil' : 'Skip (dry/sensitive skin)',
    remarks: includePreCleanser
      ? 'Only used for combination or oily skin to melt SPF/makeup before the main cleanse.'
      : 'Dry-leaning clients can skip the pre-cleanser entirely.',
    skipped: !includePreCleanser,
  });

  // Step 2 – Cleanser
  const hydratingCleanser = 'Thalgo Velvet Cleansing Milk';
  const purifyingCleanser = 'Thalgo Gentle Purifying Gel';
  const useHydratingCleanser = isDry || sensitive;
  steps.push({
    step: 2,
    title: 'Cleanser',
    productType: useHydratingCleanser ? 'Hydrating cleanser' : 'Purifying cleanser',
    product: useHydratingCleanser ? hydratingCleanser : purifyingCleanser,
    remarks: useHydratingCleanser ? 'Dry or sensitized skin needs the velvet cleansing milk.' : 'Combination/oily skin tolerates the gentle purifying gel.',
  });

  // Step 3 – Toner
  const tonerProduct = useHydratingCleanser ? 'Thalgo Beautifying Tonic Lotion' : 'Purifying toner';
  steps.push({
    step: 3,
    title: 'Toner',
    productType: useHydratingCleanser ? 'Hydrating toner' : 'Purifying toner',
    product: tonerProduct,
    remarks: useHydratingCleanser
      ? 'Hydrating tonic comforts dry or sensitized skin.'
      : 'Purifying toner (product TBD) balances combination/oily skin.',
  });

  // Step 4 – Exfoliator
  const exfoliatorProduct = sensitive ? 'Thalgo gentle exfoliator' : 'Skeyndor Resurfacing peel cleansing gel';
  steps.push({
    step: 4,
    title: 'Exfoliator',
    productType: sensitive ? 'Mild exfoliator' : 'Chemical exfoliator',
    product: exfoliatorProduct,
    remarks: sensitive ? 'Swap to the gentle scrub when the sensitivity score is elevated.' : 'Use the resurfacing peel for everyone else unless sensitivity flags in the intake.',
  });

  // Step 5 – Mist
  steps.push({
    step: 5,
    title: 'Mist',
    productType: 'Hydrating mist',
    product: 'Klairs Fundamental Ampule Mist',
    remarks: 'Universal calming mist for every client.',
  });

  // Step 6 – Massage cream
  const usesAntiAgingMassage = primaryConcern === 'aging';
  steps.push({
    step: 6,
    title: 'Massage cream',
    productType: usesAntiAgingMassage ? 'Anti-aging massage cream' : 'Massage cream',
    product: usesAntiAgingMassage ? 'Thalgo Resurfacing Cream' : 'Thalgo Oligo-Marine Modelling Cream',
    remarks: usesAntiAgingMassage
      ? 'Aging as the primary concern upgrades the massage cream to the resurfacing formula.'
      : 'Standard massage cream for all other profiles.',
  });

  // Step 7 – Essence
  steps.push(buildEssenceStep({ step: 7, primaryConcern, skinBase, sensitive, noConcern }));

  // Step 8 – Mask
  steps.push(resolveMaskStep({ step: 8, primaryConcern, sensitive, isDry }));

  // Step 9 – Serum
  steps.push(resolveSerumStep({ step: 9, primaryConcern }));

  // Step 10 – Moisturizer
  steps.push(resolveMoisturizerStep({ step: 10, primaryConcern, sensitive, isDry }));

  // Step 11 – Sunscreen
  steps.push({
    step: 11,
    title: 'Sunscreen',
    productType: 'Sunscreen',
    product: 'Biore UV Aqua Rich Watery Essence SPF',
    remarks: 'Finish every routine with the Biore UV Aqua Rich Watery Essence SPF for all skin types.',
  });

  return steps;
}

function deriveSkinBase(label?: string): SkinBase {
  const value = String(label || '').toLowerCase();
  if (value.includes('combo') || value.includes('combination')) return 'combo';
  if (value.includes('oily')) return 'oily';
  if (value.includes('dry')) return 'dry';
  return 'normal';
}

function isSensitiveProfile(profile: FacialProfile): boolean {
  const answer = String(profile.sensitivityAnswer || '').toLowerCase();
  const band = String(profile.sensitivityBand || '').toLowerCase();
  return answer === 'yes' || SENSITIVE_BANDS.has(band);
}

function resolvePrimaryConcern(profile: FacialProfile): ConcernSlug | null {
  const ordered = [...(profile.concernPriority ?? []), ...(profile.mainConcerns ?? [])];
  for (const entry of ordered) {
    const slug = normalizeConcern(entry);
    if (slug) return slug;
  }
  return null;
}

function resolveConcernSlugs(entries: string[]): ConcernSlug[] {
  const seen = new Set<ConcernSlug>();
  for (const entry of entries) {
    const slug = normalizeConcern(entry);
    if (slug && !seen.has(slug)) {
      seen.add(slug);
    }
  }
  return Array.from(seen.values());
}

function normalizeConcern(value?: string): ConcernSlug | null {
  const label = String(value || '').toLowerCase();
  if (!label) return null;
  if (label.includes('scar')) return 'acnescars';
  if (label.includes('acne')) return 'acne';
  if (label.includes('pigmentation') && label.includes('sensitive')) return 'pigmentation_sensitive';
  if (label.includes('pigmentation')) return 'pigmentation';
  if (label.includes('wrinkle') || label.includes('aging')) return 'aging';
  if (label.includes('bumpy') || label.includes('texture')) return 'bumpy';
  if (label.includes('pore')) return 'pores';
  return null;
}

function buildEssenceStep(args: {
  step: number;
  primaryConcern: ConcernSlug | null;
  skinBase: SkinBase;
  sensitive: boolean;
  noConcern: boolean;
}): FacialStep {
  const { step, primaryConcern, skinBase, sensitive, noConcern } = args;

  const defaultEssence = {
    title: 'Essence',
    productType: 'Niacinamide essence',
    product: 'Cosrx galactomyces + niacinamide essence',
  };

  if (primaryConcern === 'aging') {
    return {
      step,
      title: 'Essence',
      productType: 'Peptide essence',
      product: 'Cosrx peptide skin booster',
      remarks: 'Peptides reinforce firmness when aging is the top priority.',
    };
  }

  if (primaryConcern === 'pigmentation' && sensitive) {
    return {
      step,
      title: 'Essence',
      productType: 'Gentle brightening essence',
      product: 'Beauty of Joseon Ginseng Essence Water',
      remarks: 'Sensitive pigmentation clients need a non-irritating brightening essence.',
    };
  }

  if (primaryConcern === 'pigmentation') {
    return {
      step,
      title: 'Essence',
      productType: 'Niacinamide essence',
      product: 'Cosrx galactomyces + niacinamide essence',
      remarks: 'Niacinamide brightens and balances pigmentation concerns.',
    };
  }

  if (primaryConcern === 'bumpy' || primaryConcern === 'acne' || primaryConcern === 'acnescars' || primaryConcern === 'pores') {
    return {
      step,
      title: 'Essence',
      productType: 'Niacinamide essence',
      product: 'Cosrx galactomyces + niacinamide essence',
      remarks: 'Niacinamide helps regulate congestion-driven concerns.',
    };
  }

  if (noConcern) {
    if (skinBase === 'combo' || skinBase === 'oily') {
      return {
        step,
        title: 'Essence',
        productType: 'Niacinamide essence',
        product: 'Cosrx galactomyces + niacinamide essence',
        remarks: 'Defaulting to niacinamide for combination/oily clients without stated priorities.',
      };
    }
    return {
      step,
      title: 'Essence',
      productType: 'Hyaluronic Acid essence',
      product: 'Cosrx hyaluronic acid essence',
      remarks: 'Hydrating essence for dry or sensitive clients without specific concerns.',
    };
  }

  return {
    step,
    ...defaultEssence,
    remarks: 'Universal balancing essence when no specific override applies.',
  };
}

function resolveMaskStep(args: {
  step: number;
  primaryConcern: ConcernSlug | null;
  sensitive: boolean;
  isDry: boolean;
}): FacialStep {
  const { step, primaryConcern, sensitive, isDry } = args;
  if (sensitive || isDry) {
    return {
      step,
      title: 'Mask',
      productType: 'Hydrating mask',
      product: 'Beauty of Joseon Rice Mask',
      remarks: 'Hydrating mask for dry or sensitive skin (wins over acne rules).',
    };
  }

  if (primaryConcern === 'acne') {
    return {
      step,
      title: 'Mask',
      productType: 'Purifying mask',
      product: 'Thalgo Purifying Mask',
      remarks: 'Purifying mask when acne is the top concern.',
    };
  }

  return {
    step,
    title: 'Mask',
    productType: 'Peel-off mask',
    product: 'Thalgo Micronized Marine Algae',
    remarks: 'Default peel-off mask for everyone except acne or dry/sensitive profiles.',
  };
}

function resolveSerumStep(args: { step: number; primaryConcern: ConcernSlug | null }): FacialStep {
  const { step, primaryConcern } = args;

  if (primaryConcern === 'aging') {
    return {
      step,
      title: 'Serum',
      productType: 'Anti-aging serum',
      product: 'Estée Lauder Advanced Night Repair Peptide Serum',
      remarks: 'Peptide-focused serum for aging priority.',
    };
  }

  if (primaryConcern === 'pigmentation' || primaryConcern === 'pigmentation_sensitive') {
    return {
      step,
      title: 'Serum',
      productType: 'Pigmentation serum',
      product: 'Klairs Vitamin C Serum',
      remarks: 'Vitamin C serum when pigmentation leads.',
    };
  }

  if (primaryConcern === 'acnescars') {
    return {
      step,
      title: 'Serum',
      productType: 'Acne scar serum',
      product: 'SKIN1004 Madagascar Centella Tone Brightening Capsule Serum',
      remarks: 'Centella brightening serum to target acne scars.',
    };
  }

  if (primaryConcern === 'acne' || primaryConcern === 'bumpy' || primaryConcern === 'pores') {
    return {
      step,
      title: 'Serum',
      productType: 'Acne serum',
      product: 'Beauty Of Joseon Glow Serum - Propolis + Niacinamide',
      remarks: 'Niacinamide/propolis serum supports acne, bumpy skin, or enlarged pores.',
    };
  }

  return {
    step,
    title: 'Serum',
    productType: 'Balancing serum',
    product: 'Beauty Of Joseon Glow Serum - Propolis + Niacinamide',
    remarks: 'Fallback serum when no specific concern is selected.',
  };
}

function resolveMoisturizerStep(args: {
  step: number;
  primaryConcern: ConcernSlug | null;
  sensitive: boolean;
  isDry: boolean;
}): FacialStep {
  const { step, primaryConcern, sensitive, isDry } = args;

  if (primaryConcern === 'aging') {
    return {
      step,
      title: 'Moisturizer',
      productType: 'Anti-aging moisturizer',
      product: 'Thalgo Wrinkle Correcting Rich Cream',
      remarks: 'Aging concern overrides skin-type defaults for moisturizer.',
    };
  }

  if (isDry || sensitive) {
    return {
      step,
      title: 'Moisturizer',
      productType: 'Dry/sensitive moisturizer',
      product: 'Estée Lauder Nutritious Melting Soft Crème',
      remarks: 'Comforting cream for dry or sensitive clients.',
    };
  }

  return {
    step,
    title: 'Moisturizer',
    productType: 'Oily/combination moisturizer',
    product: 'Thalgo Mattifying Powder Lotion',
    remarks: 'Mattifying lotion for oily or combination profiles.',
  };
}
