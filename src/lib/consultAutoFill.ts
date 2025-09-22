import { deriveAcneCategoryLabel, deriveSelfBands, getFollowUpQuestions, decideBandUpdates, mergeBands } from './decisionEngine';
import type { MachineScanBands } from './decisionEngine';
import type { UpdatedConsultData } from '../types';

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;

export const SKIN_TYPE_OPTIONS = [
  'Oily – Hydrated', 
  'Oily – Dehydrated', 
  'Combination – Hydrated', 
  'Combination – Dehydrated', 
  'Dry – Dehydrated'
] as const;

export const OIL_LEVEL_OPTIONS = [
  'Comfortable, no shine or greasiness \u001a Green',
  'Slight shine only in T-zone, not bothersome \u001a Blue',
  'Noticeable shine in multiple areas \u001a Yellow',
  'Very greasy/heavy shine across face, frequent blotting/wash needed \u001a Red',
] as const;

export const HYDRATION_LEVEL_OPTIONS = [
  'Comfortable, no tightness \u001a Green',
  'Slight tightness or occasional dryness \u001a Blue',
  'Often feels tight, rough, or flaky \u001a Yellow',
  'Always feels very tight, itchy, or cracks/peels \u001a Red',
] as const;

export const SENSITIVITY_OPTIONS = ['Yes', 'No', 'Sometimes'] as const;

export const DIET_OPTIONS = ['Balanced', 'Oily/Spicy', 'Vegetarian', 'High Sugar'] as const;

export const WATER_INTAKE_OPTIONS = ['Low', 'Medium', 'High'] as const;

export const SLEEP_HOURS_OPTIONS = ['Less than 5', '5-7', '7+'] as const;

export const STRESS_LEVEL_OPTIONS = ['Low', 'Medium', 'High'] as const;

export const ENVIRONMENT_OPTIONS = ['Polluted city', 'Humid climate', 'Dry weather', 'Indoors A/C', 'Outdoors sun'] as const;

export const ROUTINE_STEP_OPTIONS = ['3-step', '4-step', '5+ step'] as const;

export const SERUM_COMFORT_OPTIONS = ['1', '2', '3'] as const;

export const MOISTURIZER_TEXTURE_OPTIONS = ['Gel', 'Lotion', 'Cream', 'Rich Balm'] as const;

// brand preference removed from form

export const PRODUCT_DURATION_OPTIONS = [
  'Less than 1 month',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '1-2 years',
  '2+ years',
] as const;

export const MAIN_CONCERN_OPTIONS = [
  'Acne',
  'Pigmentation',
  'Sensitivity',
  'Fine lines & wrinkles',
  'Large pores',
  'Bumpy skin',
] as const;

export const PIGMENTATION_TYPE_OPTIONS = ['Red', 'Brown'] as const;

export const PIGMENTATION_SEVERITY_OPTIONS = {
  Red: [
    'Light red, only in a small area \u001a Blue',
    'Moderate red, noticeable in several zones \u001a Yellow',
    'Bright or deep red, widespread across the face \u001a Red',
  ],
  Brown: [
    'Light brown patches, visible up close but small in size \u001a Blue',
    'Moderate brown spots/patches, noticeable in several areas \u001a Yellow',
    'Dark brown patches, large or widespread across the face \u001a Red',
  ],
} as const;

export const WRINKLES_SEVERITY_OPTIONS = [
  'A few fine lines or slight looseness in some spots \u001a Blue',
  'Wrinkles or sagging you can see in several areas \u001a Yellow',
  'Deep wrinkles or sagging that\'s easy to notice \u001a Red',
] as const;

export const PORES_SEVERITY_OPTIONS = [
  'Noticeable near the nose or small areas on close inspection \u001a Blue',
  'Clearly visible on multiple zones (nose, cheeks, forehead) \u001a Yellow',
  'Large, obvious pores across much of the face, visible from a distance \u001a Red',
] as const;

export const TEXTURE_SEVERITY_OPTIONS = [
  'A few small areas with bumps or rough patches (like nose or chin) \u001a Blue',
  'Noticeable bumps or uneven texture in several areas of the face \u001a Yellow',
  'Rough or bumpy texture across most of the face \u001a Red',
] as const;

export type AcneType =
  | 'Blackheads (tiny dark dots in pores)'
  | 'Whiteheads (small white bumps under the skin)'
  | 'Red pimples (inflamed, sometimes pus-filled)'
  | 'Large painful bumps (deep cystic acne)'
  | 'Mostly around jawline/chin, often before periods (hormonal)';

export const ACNE_TYPE_OPTIONS: AcneType[] = [
  'Blackheads (tiny dark dots in pores)',
  'Whiteheads (small white bumps under the skin)',
  'Red pimples (inflamed, sometimes pus-filled)',
  'Large painful bumps (deep cystic acne)',
  'Mostly around jawline/chin, often before periods (hormonal)',
];

export const SENSITIVITY_FOLLOW_UP_FIELD_KEYS: Array<keyof UpdatedConsultData> = [
  'sensitivityRedness',
  'sensitivityDiagnosis',
  'sensitivityCleansing',
  'sensitivityProducts',
  'sensitivitySun',
  'sensitivityCapillaries',
  'sensitivitySeasonal',
];

export const SENSITIVITY_FOLLOW_UP_PROMPTS = [
  'Do you often experience redness, burning, or stinging when using skincare products?',
  'Have you ever been diagnosed with sensitive skin, rosacea, or eczema?',
  'Would you describe your skin baseline as very dry (tight, flaky, rough)?',
  'Have you noticed breakouts or irritation when using active ingredients (Vitamin C, AHAs, Niacinamide, Retinoids, etc.)?',
  'Does your skin get easily irritated by sun, heat, wind, or pollution?',
  'Do you have visible broken capillaries or flushing on your skin (cheeks, nose, etc.)?',
  'Are you under 20 years of age?',
] as const;

export const YES_NO_OPTIONS = ['Yes', 'No'] as const;

export const SAMPLE_FIRST_NAMES = [
  'Aarav',
  'Diya',
  'Isha',
  'Rhea',
  'Maya',
  'Nikhil',
  'Kaya',
  'Vihaan',
  'Anya',
  'Ira',
  'Shaan',
  'Arjun',
];

export const SAMPLE_LAST_NAMES = [
  'Sharma',
  'Kapoor',
  'Iyer',
  'Fernandes',
  'Patel',
  'Menon',
  'Desai',
  'Rao',
  'Khan',
  'Mehta',
  'Banerjee',
  'Singh',
];

export const SAMPLE_PRODUCT_NAMES = [
  'CeraVe Foaming Cleanser',
  'The Ordinary Niacinamide 10% + Zinc 1%',
  'La Roche-Posay Toleriane Hydrating Cleanser',
  'Avene Cicalfate+ Restorative Cream',
  'Bioderma Atoderm Intensive Balm',
  'COSRX Advanced Snail 96 Mucin Essence',
  'Paula\'s Choice Skin Perfecting 2% BHA Liquid',
  'Dermalogica Daily Microfoliant',
  'SkinCeuticals C E Ferulic Serum',
  'Isntree Hyaluronic Acid Watery Sun Gel',
  'Supergoop! Unseen Sunscreen SPF 40',
  'Augustinus Bader The Rich Cream',
  'Laneige Water Sleeping Mask',
  'Drunk Elephant Protini Polypeptide Cream',
];

export const SAMPLE_ALLERGIES = [
  'No known allergies',
  'Allergic to aspirin-based products',
  'Fragrance sensitivity',
  'Allergic to nuts and nut oils',
];

export const SAMPLE_MEDICATIONS = [
  'None',
  'Oral contraceptive pill',
  'Spironolactone 50mg',
  'Metformin 500mg',
];

export const SAMPLE_DIAGNOSED_CONDITIONS = [
  'Mild seasonal eczema managed with emollients',
  'No diagnosed skin conditions',
  'Grade II acne previously treated with topical retinoids',
  'PCOS-related breakouts and irregular cycles',
];

export const SAMPLE_PRESCRIPTION_TREATMENTS = [
  'Completed a 3-month course of topical adapalene in 2024',
  'Occasional hydrocortisone cream for flare-ups',
  'None',
  'Low-dose doxycycline for inflammatory acne six months ago',
];

export const SAMPLE_PROFESSIONAL_TREATMENTS = [
  'Monthly hydra facials for maintenance',
  'One TCA peel in clinic three months ago',
  'None in the past 6 months',
  'Microneedling session for acne scars four months ago',
];

export const SAMPLE_ROUTINE_NOTES = [
  'Cleansing balm, gentle gel cleanser, vitamin C serum, peptide moisturizer, SPF 50',
  'Minimal routine: cleanser, ceramide moisturizer, SPF',
  'Double cleanse, exfoliating toner twice weekly, hydrating serum, barrier cream, sunscreen',
  'Advanced routine with antioxidants, niacinamide, and retinoid on alternate nights',
];

export const SAMPLE_SENSITIVITY_TRIGGERS = [
  'Fragrance-heavy products and prolonged sun exposure',
  'High-percentage AHAs cause tingling and redness',
  'Retinol twice a week, but no severe reactions',
  'None noted so far',
];

export const SAMPLE_IRRITATING_INGREDIENTS = [
  'Retinol / Retinoids (Adapalene, Tretinoin, etc.)',
  'Salicylic Acid (BHA)',
  'Vitamin C (Ascorbic Acid, Derivatives)',
  'Benzoyl Peroxide',
  'Hydroquinone',
  'Fragrance oils',
];

export const SAMPLE_BUDGETS = [
  'Under $150 per month',
  '$150-$300 per month',
  'Flexible if results-driven',
];

export const SAMPLE_PREGNANCY_STATUSES = [
  'No',
  'Planning pregnancy in the next year',
  'Currently breastfeeding',
];

export const SAMPLE_ENVIRONMENT_NOTES = [
  'Works long hours in an air-conditioned studio',
  'Commutes daily in humid coastal weather',
  'Spends weekends outdoors coaching soccer',
  'Lives in a high-pollution metro city apartment',
];

export const SAMPLE_STRESS_NOTES = [
  'High workload during product launches, manages with yoga twice weekly',
  'Medium stress due to balancing work and grad school',
  'Generally low stress, mindfulness practice every morning',
];

export const SAMPLE_SLEEP_NOTES = [
  'Averages 6 hours on weekdays, 8 on weekends',
  'Consistent 7.5 hours nightly with wind-down routine',
  'Light sleeper, often interrupted rest leading to 5-6 hours total',
];

export const SAMPLE_DIET_NOTES = [
  'Primarily plant-forward meals with weekly seafood',
  'Balanced meals with mindful sugar intake and plenty of greens',
  'Vegetarian diet with daily smoothies and supplements',
  'High-protein plan with limited dairy and refined carbs',
];

export const SAMPLE_WATER_INTAKE_NOTES = [
  'Carries a 1-litre bottle, refills twice daily',
  'Struggles to exceed 1.5 litres without reminders',
  'Targets 3 litres, aided by herbal teas and electrolyte drinks',
];

export const SAMPLE_ACNE_BREAKOUT_NOTES = [
  'Flare-ups intensify a week before cycle starts',
  'Mostly confined to chin and jaw, calms with salicylic acid',
  'Occasional cystic lesion on cheeks after stressful weeks',
];

export const SAMPLE_PIGMENTATION_NOTES = [
  'Brown patches along cheekbones from post-acne marks',
  'Redness across nose and central cheeks after sun exposure',
  'Stubborn PIH lingering from healed breakouts',
];

export const SAMPLE_TEXTURE_NOTES = [
  'Roughness concentrated on forehead due to congestion',
  'Tiny bumps on cheeks improved with enzyme exfoliants',
  'Consistent smoothness except for sporadic chin congestion',
];

export const SAMPLE_PORE_NOTES = [
  'Noticeably enlarged on nose and cheeks, improves with niacinamide',
  'Visible across T-zone, worsens in humid weather',
  'Tight and less visible after regular clay masking',
];

export const SAMPLE_WRINKLE_NOTES = [
  'Forehead lines soften with peptide serums',
  'Crow\'s feet more pronounced with lack of sleep',
  'Neck lines improved after consistent retinoid use',
];

export const SAMPLE_OILINESS_NOTES = [
  'Shine returns mid-day on forehead and nose',
  'Requires blotting sheets during summer commutes',
  'Minimal oil through the day with lightweight moisturizer',
];

export const SAMPLE_DRYNESS_NOTES = [
  'Tightness around mouth after cleansing',
  'Occasional flaking on cheeks and temples',
  'Needs richer cream overnight during winter',
];

export const SENSITIVITY_FOLLOW_UP_DEFAULT = 'No';

export const randomFrom = <T,>(options: readonly T[], rng: () => number = Math.random): T => {
  if (!options.length) throw new Error('Cannot pick from empty list');
  const index = Math.floor(rng() * options.length);
  return options[Math.min(index, options.length - 1)];
};

export const randomSubset = <T,>(
  options: readonly T[],
  {
    min = 1,
    max = options.length,
    rng = Math.random,
  }: { min?: number; max?: number; rng?: () => number } = {},
): T[] => {
  if (!options.length) return [];
  const targetSize = Math.max(min, Math.min(options.length, Math.round(min + (max - min) * rng())));
  const pool = [...options];
  const result: T[] = [];
  while (result.length < targetSize && pool.length) {
    const idx = Math.floor(rng() * pool.length);
    const [picked] = pool.splice(idx, 1);
    result.push(picked);
  }
  return result;
};

export const randomPhoneNumber = (rng: () => number = Math.random): string => {
  const firstDigit = String(7 + Math.floor(rng() * 3));
  const rest = Array.from({ length: 9 }, () => Math.floor(rng() * 10)).join('');
  return `${firstDigit}${rest}`;
};

export const randomDateOfBirth = (rng: () => number = Math.random): string => {
  const start = new Date(1968, 0, 1).getTime();
  const end = new Date(2005, 11, 31).getTime();
  const timestamp = start + (end - start) * rng();
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const deriveAcneCategory = (acneType: string): string => deriveAcneCategoryLabel(acneType) || 'Comedonal acne';

export const getAcneSeverityOptions = (acneType: string): string[] => {
  const normalized = (acneType || '').toLowerCase();
  if (normalized.includes('blackheads')) {
    return [
      'Just a few visible with close inspection \u001a Blue',
      'Shows up across nose and chin regularly \u001a Yellow',
      'Widespread across face, easy to notice \u001a Red',
    ];
  }
  if (normalized.includes('whiteheads')) {
    return [
      'Occasional small clusters \u001a Blue',
      'Weekly clusters or recurring in same spots \u001a Yellow',
      'Many (10+), inflamed/widespread \u001a Red',
    ];
  }
  if (normalized.includes('cystic') || normalized.includes('large painful')) {
    return [
      'Rare (1 in last 2 weeks) \u001a Blue',
      'Frequent (1-3 per week) \u001a Yellow',
      'Persistent (4+ per week or multiple at once) \u001a Red',
    ];
  }
  if (normalized.includes('jawline') || normalized.includes('hormonal')) {
    return [
      'Mild monthly flare (1-3 pimples) \u001a Blue',
      'Clear monthly flare (several pimples/cyst lasting a week) \u001a Yellow',
      'Strong monthly flare (multiple cysts lasting >1 week) \u001a Red',
    ];
  }
  return [
    'Mild (few breakouts) \u001a Blue',
    'Moderate (several breakouts) \u001a Yellow',
    'Severe (many breakouts) \u001a Red',
  ];
};


const safeRng = (rng: () => number): (() => number) => {
  return () => {
    const next = rng();
    if (!Number.isFinite(next) || next < 0 || next > 1) {
      return Math.random();
    }
    return next;
  };
};

const uniqueProducts = (rng: () => number): Array<{ name: string; duration: string }> => {
  const count = 3 + Math.floor(rng() * 2); // 3-4 products typically
  const selectedNames = randomSubset(SAMPLE_PRODUCT_NAMES, { min: count, max: count, rng });
  return selectedNames.map(name => ({ name, duration: randomFrom(PRODUCT_DURATION_OPTIONS, rng) }));
};

const joinList = (items: string[], separator: string): string =>
  items
    .map(item => item.trim())
    .filter(Boolean)
    .join(separator);

const pickConcernSubset = (rng: () => number): string[] => {
  const size = 1 + Math.floor(rng() * 3); // 1-3 concerns
  return randomSubset(MAIN_CONCERN_OPTIONS, { min: size, max: size, rng });
};

const resolvePigmentationSeverity = (type: string, rng: () => number): string => {
  const key = type === 'Red' ? 'Red' : 'Brown';
  const options = PIGMENTATION_SEVERITY_OPTIONS[key as keyof typeof PIGMENTATION_SEVERITY_OPTIONS] || [];
  return options.length ? randomFrom(options, rng) : '';
};

const makeAcneBreakouts = (rng: () => number) => {
  const selected = randomSubset(ACNE_TYPE_OPTIONS, { min: 1, max: 3, rng });
  return selected.map(type => ({
    type,
    severity: randomFrom(getAcneSeverityOptions(type), rng),
    category: deriveAcneCategory(type) as UpdatedConsultData['acneBreakouts'][number]['category'],
  }));
};

const pickOrDefault = (value: string | undefined, fallback: string): string => (value && value.trim() ? value : fallback);

const isCategoryReadyForAutoFill = (
  category: string,
  data: UpdatedConsultData,
  dimension?: 'brown' | 'red',
): boolean => {
  const concerns = Array.isArray(data.mainConcerns) ? data.mainConcerns : [];
  const acneBreakouts = Array.isArray(data.acneBreakouts) ? data.acneBreakouts : [];
  switch (category) {
    case 'Acne':
      if (!concerns.includes('Acne')) return true;
      if (!acneBreakouts.length) return false;
      return acneBreakouts.every(item => item.type?.trim() && item.severity?.trim());
    case 'Pigmentation':
      if (!concerns.includes('Pigmentation')) return true;
      return Boolean(data.pigmentationType?.trim() && data.pigmentationSeverity?.trim());
    case 'Texture': {
      const wantsWrinkles = concerns.includes('Fine lines & wrinkles');
      const wantsBumpy = concerns.includes('Bumpy skin');
      if (!wantsWrinkles && !wantsBumpy) return true;
      if (wantsWrinkles && !data.wrinklesType?.trim()) return false;
      if (wantsBumpy && !data.textureType?.trim()) return false;
      return true;
    }
    case 'Pores':
      return !concerns.includes('Large pores') || Boolean(data.poresType?.trim());
    case 'Moisture':
    case 'Grease':
    case 'Sensitivity':
    default:
      return true;
  }
};

export interface ConsultAutoFillParams {
  base: UpdatedConsultData;
  machine?: MachineScanBands;
  rng?: () => number;
}

export interface ConsultAutoFillResult {
  formData: UpdatedConsultData;
  followUpAnswers: Record<string, Record<string, string | string[]>>;
}

export const generateConsultAutoFill = ({ base, machine, rng }: ConsultAutoFillParams): ConsultAutoFillResult => {
  const random = safeRng(rng ?? Math.random);
  const name = `${randomFrom(SAMPLE_FIRST_NAMES, random)} ${randomFrom(SAMPLE_LAST_NAMES, random)}`;
  const products = uniqueProducts(random);
  const routineNarrative = randomFrom(SAMPLE_ROUTINE_NOTES, random);
  const concerns = pickConcernSubset(random);

  const filled: UpdatedConsultData = {
    ...base,
    name,
    phoneNumber: randomPhoneNumber(random),
    dateOfBirth: randomDateOfBirth(random),
    gender: randomFrom(GENDER_OPTIONS, random),
    pregnancy: pickOrDefault((base as any).pregnancy, 'No'),
    recentIsotretinoin: pickOrDefault((base as any).recentIsotretinoin, 'No'),
    severeCysticAcne: pickOrDefault((base as any).severeCysticAcne, 'No'),
    allergyConflict: pickOrDefault((base as any).allergyConflict, 'No'),
    barrierStressHigh: pickOrDefault((base as any).barrierStressHigh, 'No'),
    gateActions: pickOrDefault((base as any).gateActions, ''),
    skinType: randomFrom(SKIN_TYPE_OPTIONS, random),
    oilLevels: randomFrom(OIL_LEVEL_OPTIONS, random),
    hydrationLevels: randomFrom(HYDRATION_LEVEL_OPTIONS, random),
    sensitivity: randomFrom(SENSITIVITY_OPTIONS, random),
    sensitivityTriggers: randomFrom(SAMPLE_SENSITIVITY_TRIGGERS, random),
    diagnosedConditions: randomFrom(SAMPLE_DIAGNOSED_CONDITIONS, random),
    prescriptionTreatments: randomFrom(SAMPLE_PRESCRIPTION_TREATMENTS, random),
    professionalTreatments: randomFrom(SAMPLE_PROFESSIONAL_TREATMENTS, random),
    currentProducts: routineNarrative,
    currentProductsList: products,
    productDuration: randomFrom(PRODUCT_DURATION_OPTIONS, random),
    irritatingProducts: joinList(randomSubset(SAMPLE_IRRITATING_INGREDIENTS, { min: 1, max: 3, rng: random }), ', '),
    mainConcerns: concerns,
    acneBreakouts: [],
    acneDuration: randomFrom(SAMPLE_ACNE_BREAKOUT_NOTES, random),
    pigmentationType: '',
    pigmentationSeverity: '',
    pigmentationDuration: randomFrom(SAMPLE_PIGMENTATION_NOTES, random),
    rednessType: randomFrom(SAMPLE_PIGMENTATION_NOTES, random),
    rednessDuration: randomFrom(SAMPLE_PIGMENTATION_NOTES, random),
    dullnessType: randomFrom(SAMPLE_TEXTURE_NOTES, random),
    dullnessDuration: randomFrom(SAMPLE_TEXTURE_NOTES, random),
    wrinklesType: '',
    wrinklesDuration: randomFrom(SAMPLE_WRINKLE_NOTES, random),
    poresType: '',
    poresDuration: randomFrom(SAMPLE_PORE_NOTES, random),
    textureType: '',
    textureDuration: randomFrom(SAMPLE_TEXTURE_NOTES, random),
    oilinessType: randomFrom(SAMPLE_OILINESS_NOTES, random),
    oilinessDuration: randomFrom(SAMPLE_OILINESS_NOTES, random),
    drynessType: randomFrom(SAMPLE_DRYNESS_NOTES, random),
    drynessDuration: randomFrom(SAMPLE_DRYNESS_NOTES, random),
    sensitivityRedness: SENSITIVITY_FOLLOW_UP_DEFAULT,
    sensitivityDiagnosis: SENSITIVITY_FOLLOW_UP_DEFAULT,
    sensitivityCleansing: SENSITIVITY_FOLLOW_UP_DEFAULT,
    sensitivityProducts: SENSITIVITY_FOLLOW_UP_DEFAULT,
    sensitivitySun: SENSITIVITY_FOLLOW_UP_DEFAULT,
    sensitivityCapillaries: SENSITIVITY_FOLLOW_UP_DEFAULT,
    sensitivitySeasonal: SENSITIVITY_FOLLOW_UP_DEFAULT,
    diet: randomFrom(DIET_OPTIONS, random),
    waterIntake: randomFrom(WATER_INTAKE_OPTIONS, random),
    sleepHours: randomFrom(SLEEP_HOURS_OPTIONS, random),
    stressLevels: randomFrom(STRESS_LEVEL_OPTIONS, random),
    environment: randomFrom(ENVIRONMENT_OPTIONS, random),
    routineSteps: randomFrom(ROUTINE_STEP_OPTIONS, random),
    serumComfort: randomFrom(SERUM_COMFORT_OPTIONS, random),
    moisturizerTexture: randomFrom(MOISTURIZER_TEXTURE_OPTIONS, random),
  // brandPreference removed
    budget: randomFrom(SAMPLE_BUDGETS, random),
    allergies: randomFrom(SAMPLE_ALLERGIES, random),
    pregnancyBreastfeeding: randomFrom(SAMPLE_PREGNANCY_STATUSES, random),
    medications: randomFrom(SAMPLE_MEDICATIONS, random),
  };

  for (const key of SENSITIVITY_FOLLOW_UP_FIELD_KEYS) {
    (filled as any)[key] = random() < 0.3 ? 'Yes' : 'No';
  }

  if (filled.sensitivity === 'No') {
    filled.sensitivityTriggers = 'None noted so far';
  } else if (!filled.sensitivityTriggers?.trim()) {
    filled.sensitivityTriggers = randomFrom(SAMPLE_SENSITIVITY_TRIGGERS, random);
  }

  filled.currentProducts = joinList(
    [routineNarrative, ...products.map((p) => `${p.name} (${p.duration})`)],
    '; ',
  );

  if (concerns.includes('Acne')) {
    filled.acneBreakouts = makeAcneBreakouts(random);
  } else {
    filled.acneBreakouts = [];
  }

  if (concerns.includes('Pigmentation')) {
    const type = randomFrom(PIGMENTATION_TYPE_OPTIONS, random);
    filled.pigmentationType = type;
    filled.pigmentationSeverity = resolvePigmentationSeverity(type, random);
  }

  if (concerns.includes('Fine lines & wrinkles')) {
    filled.wrinklesType = randomFrom(WRINKLES_SEVERITY_OPTIONS, random);
  }

  if (concerns.includes('Large pores')) {
    filled.poresType = randomFrom(PORES_SEVERITY_OPTIONS, random);
  }

  if (concerns.includes('Bumpy skin')) {
    filled.textureType = randomFrom(TEXTURE_SEVERITY_OPTIONS, random);
  }

  if (!concerns.includes('Sensitivity')) {
    filled.sensitivityTriggers = '';
  }

  const context = {
    dateOfBirth: filled.dateOfBirth,
    pregnancyBreastfeeding: filled.pregnancyBreastfeeding,
  } as any;

  const machineBands: MachineScanBands = { ...(machine || {}) };
  const self = deriveSelfBands(filled as any, context);

  const followUpAnswers: Record<string, Record<string, string | string[]>> = {};
  let effectiveMachine: MachineScanBands = { ...machineBands };

  const MAX_FOLLOWUP_ROUNDS = 6;
  for (let round = 0; round < MAX_FOLLOWUP_ROUNDS; round++) {
    const followUps = getFollowUpQuestions(effectiveMachine as any, self as any)
      .filter(rule => isCategoryReadyForAutoFill(rule.category as string, filled, rule.dimension as any))
      .filter(rule => rule.questions && rule.questions.length);

    const pending = followUps.filter(rule => !followUpAnswers[rule.ruleId]);
    if (!pending.length) break;

    for (const rule of pending) {
      const answers: Record<string, string | string[]> = {};

      for (const question of rule.questions || []) {
        const opts = question.options || [];
        if (!opts.length) continue;

        if (question.multi) {
          answers[question.id] = randomSubset(opts, { min: 1, max: Math.min(2, opts.length), rng: random });
        } else {
          answers[question.id] = randomFrom(opts, random);
        }
      }

      if (!Object.keys(answers).length) continue;

      followUpAnswers[rule.ruleId] = answers;

      const decision = decideBandUpdates(rule.ruleId, answers, context) || { updates: {} };
      if (decision.updates && Object.keys(decision.updates).length) {
        const merged = mergeBands(effectiveMachine as any, decision.updates as any) as MachineScanBands;
        effectiveMachine = { ...effectiveMachine, ...merged };
      }
    }
  }

  return { formData: filled, followUpAnswers };
};
