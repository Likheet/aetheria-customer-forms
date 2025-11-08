import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, ArrowLeft, ArrowRight, FileText, Droplets, Shield, Heart, Sparkles, Sun, Clock, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { saveConsultationData } from '../services/newConsultationService';
import {
  deriveSelfBands as deriveSelfBandsRt,
  getFollowUpQuestions as getFollowUpsRt,
  decideBandUpdates as decideBandRt,
  decideAllBandUpdates as decideAllRt,
  mergeBands as mergeBandsRt,
  computeSensitivityFromForm,
  deriveAcneCategoryLabel,
} from '../lib/decisionEngine';
import type { MachineScanBands } from '../lib/decisionEngine';
import { UpdatedConsultData, AcneCategory } from '../types';
import { generateRecommendations, RecommendationContext, RoutineOptionsResponse } from '../services/recommendationEngine';
import {
  loadConcernMatrixData,
  isConcernMatrixLoaded,
  getConcernMatrixLoadError,
} from '../data/concernMatrix';
import RecommendationDisplay from './RecommendationDisplay';

// Refactored form step components
import {
  NameStep,
  PhoneStep,
  DateOfBirthStep,
  GenderStep,
  PregnancyStep,
  IsotretinoinStep,
  SevereCysticAcneStep,
  AllergyConflictStep,
  BarrierStressStep,
  SkinTypeStep,
  OilLevelsStep,
  HydrationLevelsStep,
  SensitivityScreeningStep,
  DiagnosedConditionsStep,
  PrescriptionTreatmentsStep,
  ProfessionalTreatmentsStep,
  CurrentProductsStep,
  IrritatingProductsStep,
  MainConcernsStep,
  ConcernPriorityStep,
  RoutineStepsStep,
  SerumComfortStep,
  LegalDisclaimerStep,
} from './steps';

// Refactored concern components
import {
  AcneTypeStep,
  AcneSeverityStep,
  PigmentationTypeStep,
  PigmentationSeverityStep,
  ScarringTypeStep,
  ScarringSeverityStep,
  WrinklesStep,
  PoresStep,
  TextureStep,
} from './concerns';

interface UpdatedConsultFormProps {
  onBack: () => void;
  onComplete: () => void;
  machine?: MachineScanBands;
  // raw metrics payload from machine_analysis (for dev box)
  machineRaw?: any;
  sessionId?: string;
  prefill?: Partial<UpdatedConsultData>;
}

const initialFormData: UpdatedConsultData = {
  // Personal Information
  name: '',
  phoneNumber: '',
  dateOfBirth: '',
  calculatedAge: null,
  gender: '',
  
  // Gate Questions (Safety Screening)
  pregnancy: '',
  recentIsotretinoin: '',
  severeCysticAcne: '',
  allergyConflict: '',
  barrierStressHigh: '',
  gateActions: '',
  
  // Section A – Skin Basics
  skinType: '',
  skinTypeFlag: '',
  oilLevels: '',
  hydrationLevels: '',
  sensitivity: '',
  sensitivityTriggers: '',
  
  // Section B – Current Skin History
  diagnosedConditions: '',
  prescriptionTreatments: '',
  professionalTreatments: '',
  
  // Section C – Current Routine
  currentProducts: '',
  currentProductsList: [],
  productDuration: '',
  irritatingProducts: '',
  
  // Section D – Main Concerns
  mainConcerns: [],
  concernPriority: [],
  acneBreakouts: [],
  acneDuration: '',
  pigmentationType: '',
  pigmentationSeverity: '',
  pigmentationDuration: '',
  rednessType: '',
  rednessDuration: '',
  dullnessType: '',
  dullnessDuration: '',
  wrinklesType: '',
  wrinklesDuration: '',
  poresType: '',
  poresDuration: '',
  textureType: '',
  textureDuration: '',
  oilinessType: '',
  oilinessDuration: '',
  drynessType: '',
  drynessDuration: '',
  
  // Post Acne Scarring
  postAcneScarringType: '',
  postAcneScarringSubtype: undefined,
  postAcneScarringSeverity: '',
  postAcneScarringColor: '',
  
  // Sensitivity questions
  sensitivityRedness: '',
  sensitivityDiagnosis: '',
  sensitivityCleansing: '',
  sensitivityProducts: '',
  sensitivitySun: '',
  sensitivityCapillaries: '',
  sensitivitySeasonal: '',
  
  // Section E - Lifestyle Inputs
  diet: '',
  waterIntake: '',
  sleepHours: '',
  stressLevels: '',
  environment: '',
  
  // Section F - Willingness & Preferences
  routineSteps: '',
  serumComfort: '',
  moisturizerTexture: '',
  budget: '',
  
  // Legal Disclaimer
  legalDisclaimerAgreed: false,
  legalDisclaimerNotMedical: false,
  legalDisclaimerConsultDermatologist: false,
  legalDisclaimerPatchTest: false,
  legalDisclaimerDiscontinueUse: false,
  legalDisclaimerDiscloseInfo: false,
  legalDisclaimerNoLiability: false,
  
  // Additional fields
  allergies: '',
  pregnancyBreastfeeding: '',
  medications: '',
};

// Scenario-specific dummy data used by the "Fill form" helper
const AUTO_FILL_MACHINE_FALLBACK: MachineScanBands = {
  moisture: 'yellow',
  sebum: 'red',
  texture: 'yellow',
  textureAging: 'yellow',
  textureBumpy: 'yellow',
  pores: 'blue',
  acne: 'blue',
  pigmentation_brown: 'blue',
  pigmentation_red: 'blue',
  sensitivity: 'green',
};

const AUTO_FILL_FORM_TEMPLATE: UpdatedConsultData = {
  // Personal Information
  name: 'Anita Rao',
  phoneNumber: '+919876543210',
  dateOfBirth: '1992-08-04',
  calculatedAge: computeAgeFromDOB('1992-08-04') ?? null,
  gender: 'Female',

  // Gate Questions (Safety Screening)
  pregnancy: 'No',
  recentIsotretinoin: 'No',
  severeCysticAcne: 'No',
  allergyConflict: 'No',
  barrierStressHigh: 'No',
  gateActions: '',

  // Section A – Skin Basics
  skinType: 'Combination – Hydrated',
  skinTypeFlag: 'Combination',
  oilLevels: 'Comfortable, no shine or greasiness → Green',
  hydrationLevels: 'Comfortable, no tightness → Green',
  sensitivity: 'No',
  sensitivityTriggers: 'None noted so far',

  // Section B – Current Skin History
  diagnosedConditions: 'No diagnosed skin conditions',
  prescriptionTreatments: 'None',
  professionalTreatments: 'None in the past 6 months',

  // Section C – Current Routine
  currentProducts: 'Gentle gel cleanser; Niacinamide serum; Lightweight gel moisturizer; Broad spectrum SPF 50',
  currentProductsList: [
    { name: 'CeraVe Foaming Cleanser', duration: '6-12 months' },
    { name: 'The Ordinary Niacinamide 10% + Zinc 1%', duration: '3-6 months' },
    { name: 'Isntree Hyaluronic Acid Watery Sun Gel', duration: '1-3 months' },
  ],
  productDuration: '6-12 months',
  irritatingProducts: 'Retinol / Retinoids (Adapalene, Tretinoin, etc.)',

  // Section D – Main Concerns
  mainConcerns: ['Acne', 'Large pores', 'Bumpy skin'],
  concernPriority: ['Acne', 'Large pores', 'Bumpy skin'],
  acneBreakouts: [
    {
      type: 'Red pimples (inflamed, sometimes pus-filled)',
      severity: 'Several (4–10), some painful → Yellow',
      category: (deriveAcneCategoryLabel('Red pimples (inflamed, sometimes pus-filled)') || 'Inflammatory acne') as AcneCategory,
    },
  ],
  acneDuration: 'Breakouts flare for about a week before each cycle',
  pigmentationType: 'Moderate brown spots/patches, noticeable in several areas → Yellow',
  pigmentationSeverity: 'Moderate brown spots/patches, noticeable in several areas → Yellow',
  pigmentationDuration: 'Post-acne marks lingering for the last 3 months',
  rednessType: 'Redness across nose and cheeks after sun exposure',
  rednessDuration: 'Calms down in 2-3 days with soothing care',
  dullnessType: 'Skin looks lacklustre by evening without exfoliation',
  dullnessDuration: 'Noticeable over the past 2 months',
  wrinklesType: 'A few fine lines or slight looseness in some spots → Blue',
  wrinklesDuration: 'Mostly around eyes over the past year',
  poresType: 'Clearly visible on multiple zones (nose, cheeks, forehead) → Yellow',
  poresDuration: 'Visible throughout the day despite skincare',
  textureType: 'A few small areas with bumps or rough patches (like nose or chin) → Blue',
  textureDuration: 'Comes and goes depending on exfoliation',
  oilinessType: 'Shine returns by afternoon on forehead and nose',
  oilinessDuration: 'Daily, especially in humid weather',
  drynessType: 'Tightness around mouth after cleansing',
  drynessDuration: 'Happens whenever skipping moisturizer',

  // Sensitivity questions
  sensitivityRedness: 'No',
  sensitivityDiagnosis: 'No',
  sensitivityCleansing: 'No',
  sensitivityProducts: 'No',
  sensitivitySun: 'No',
  sensitivityCapillaries: 'No',
  sensitivitySeasonal: 'No',

  // Section E - Lifestyle Inputs
  diet: 'Balanced',
  waterIntake: 'Medium',
  sleepHours: '5-7',
  stressLevels: 'Medium',
  environment: 'Humid climate',

  // Section F - Willingness & Preferences
  routineSteps: '4-step',
  serumComfort: '2',
  moisturizerTexture: 'Gel',
  budget: 'Flexible if results-driven',
  
  // Legal Disclaimer
  legalDisclaimerAgreed: true,
  legalDisclaimerNotMedical: true,
  legalDisclaimerConsultDermatologist: true,
  legalDisclaimerPatchTest: true,
  legalDisclaimerDiscontinueUse: true,
  legalDisclaimerDiscloseInfo: true,
  legalDisclaimerNoLiability: true,

  // Additional fields
  allergies: 'No known allergies',
  pregnancyBreastfeeding: 'No',
  medications: 'None',
};

type LegalDisclaimerField =
  | 'legalDisclaimerNotMedical'
  | 'legalDisclaimerConsultDermatologist'
  | 'legalDisclaimerPatchTest'
  | 'legalDisclaimerDiscontinueUse'
  | 'legalDisclaimerDiscloseInfo'
  | 'legalDisclaimerNoLiability';

const LEGAL_DISCLAIMER_KEYS: LegalDisclaimerField[] = [
  'legalDisclaimerNotMedical',
  'legalDisclaimerConsultDermatologist',
  'legalDisclaimerPatchTest',
  'legalDisclaimerDiscontinueUse',
  'legalDisclaimerDiscloseInfo',
  'legalDisclaimerNoLiability',
];

const AUTO_FILL_FOLLOWUP_ANSWERS: Record<string, Record<string, string | string[]>> = {
  sebum_machineOily_customerNormal: {
    Q1: 'Yes',
    Q2: 'All over',
    Q3: 'No',
  },
  acne_machineClear_customerPresence: {
    Q1: '6-15',
    Q2: 'No',
    Q3: '10-20',
    Q4: 'Yes',
    Q5: 'No',
  },
  texture_machineBumpy_customerSmooth: {
    Q1: 'Cheeks',
    Q2: 'Yes',
    Q3: 'No',
    Q4: 'No',
  },
  pores_machineNormal_customerConcerned: {
    Q1: 'No',
    Q2: 'Yes',
    Q3: 'Yes',
  },
};

const deriveAcneCategory = (acneType: string): string => deriveAcneCategoryLabel(acneType) || '';

// Helper to extract Post Acne Scarring subtype from display text
const mapScarringTypeToSubtype = (displayText: string): string => {
  if (displayText.includes('pitted scars') || displayText.includes('Ice pick')) {
    return 'IcePick';
  }
  if (displayText.includes('shallow depressions') || displayText.includes('Rolling')) {
    return 'Rolling';
  }
  if (displayText.includes('dark marks') || displayText.includes('post-inflammatory pigmentation')) {
    return 'PostInflammatoryPigmentation';
  }
  if (displayText.includes('thick scars') || displayText.includes('Keloid')) {
    return 'Keloid';
  }
  return '';
};

// Helper to extract severity/color from display text
const mapScarringSeverityToValue = (displayText: string): string => {
  // Format: "description → Color"
  if (displayText.includes('→ Blue')) return 'Blue';
  if (displayText.includes('→ Yellow')) return 'Yellow';
  if (displayText.includes('→ Red') && !displayText.includes('Active')) return 'Red';
  // Color selection format
  if (displayText.includes('Red') && displayText.includes('Active')) return 'Red';
  if (displayText.includes('Brown') && displayText.includes('Pigmented')) return 'Brown';
  if (displayText.includes('Both') && displayText.includes('Combination')) return 'Both';
  return '';
};

const ACNE_TYPE_OPTIONS = [
  'Blackheads (tiny dark dots in pores)',
  'Whiteheads (small white bumps under the skin)',
  'Red pimples (inflamed, sometimes pus-filled)',
  'Large painful bumps (deep cystic acne)',
  'Mostly around jawline/chin, often before periods (hormonal)',
];

const ensureTextureAggregate = (bands: Record<string, any>) => {
  const order: Record<string, number> = { green: 0, blue: 1, yellow: 2, red: 3 }
  const normalizeBand = (value: any) => String(value || '').toLowerCase()
  const candidates = [normalizeBand(bands.texture), normalizeBand(bands.textureAging), normalizeBand(bands.textureBumpy)].filter(Boolean)
  if (!candidates.length) return
  let worst = candidates[0]
  for (const candidate of candidates) {
    if ((order[candidate] ?? -1) > (order[worst] ?? -1)) {
      worst = candidate
    }
  }
  if (worst) {
    bands.texture = worst
  }
}

const SENSITIVITY_QUESTION_CONFIG = [
  {
    key: 'sensitivityRedness' as const,
    label: 'Do you often experience redness, burning, or stinging when using skincare products?',
  },
  {
    key: 'sensitivityDiagnosis' as const,
    label: 'Have you ever been diagnosed with sensitive skin, rosacea, or eczema?',
  },
  {
    key: 'sensitivityCleansing' as const,
    label: 'Would you describe your skin baseline as very dry (tight, flaky, rough)?',
  },
  {
    key: 'sensitivityProducts' as const,
    label: 'Have you noticed breakouts or irritation with actives (Vitamin C, AHAs, Niacinamide, Retinoids, etc.)?',
  },
  {
    key: 'sensitivitySun' as const,
    label: 'Does your skin get easily irritated by sun, heat, wind, or pollution?',
  },
  {
    key: 'sensitivityCapillaries' as const,
    label: 'Do you have visible broken capillaries or flushing (cheeks, nose, etc.)?',
  },
] as const;

const getAcneSeverityOptions = (acneType: string): string[] => {
  const normalized = (acneType || '').toLowerCase();
  if (normalized.includes('blackheads')) {
    return [
      'A few, mostly on the nose (≤10) → Blue',
      'Many in the T-zone (11–30) → Yellow',
      'Widespread across face (30+) → Red',
    ];
  }
  if (normalized.includes('whiteheads')) {
    return [
      'A few, small area (≤10) → Blue',
      'Many in several areas (11–20) → Yellow',
      'Widespread across face (20+) → Red',
    ];
  }
  if (normalized.includes('red pimples') || normalized.includes('inflamed')) {
    return [
      'A few (1–3), mild → Blue',
      'Several (4–10), some painful → Yellow',
      'Many (10+), inflamed/widespread → Red',
    ];
  }
  if (normalized.includes('cystic') || normalized.includes('large painful')) {
    return [
      'Rare (1 in last 2 weeks) → Blue',
      'Frequent (1–3 per week) → Yellow',
      'Persistent (4+ per week or multiple at once) → Red',
    ];
  }
  if (normalized.includes('jawline') || normalized.includes('hormonal')) {
    return [
      'Mild monthly flare (1–3 pimples) → Blue',
      'Clear monthly flare (several pimples/cyst lasting a week) → Yellow',
      'Strong monthly flare (multiple cysts lasting >1 week) → Red',
    ];
  }
  return [
    'Mild (few breakouts) → Blue',
    'Moderate (several breakouts) → Yellow',
    'Severe (many breakouts) → Red',
  ];
};

// Helper function to derive skin type flag from skin type selection
const deriveSkinTypeFlag = (skinType: string | null | undefined): string => {
  if (!skinType) return '';
  const type = String(skinType);
  if (type.startsWith('Oily')) return 'Oily';
  if (type.startsWith('Combination')) return 'Combination';
  if (type.startsWith('Dry')) return 'Dry';
  return '';
};

function computeAgeFromDOB(dob?: string | null): number | null {
  if (!dob) return null;
  const parsed = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const monthDiff = now.getMonth() - parsed.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < parsed.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

const UpdatedConsultForm: React.FC<UpdatedConsultFormProps> = ({ onBack, onComplete, machine, machineRaw, sessionId, prefill }) => {
  const buildInitialFormData = (): UpdatedConsultData => {
    const base: any = { ...initialFormData, ...(prefill || {}) }
    const providedBreakouts = Array.isArray(base.acneBreakouts) ? base.acneBreakouts : []
    const normalizedBreakouts = providedBreakouts.length
      ? providedBreakouts.map((item: any) => ({
          type: item?.type || '',
          severity: item?.severity || '',
          category: (deriveAcneCategory(item?.type || '') || item?.category || 'Comedonal acne') as AcneCategory,
        }))
      : (() => {
          const legacyType = base.acneType || base.acneSubtype || ''
          if (!legacyType) return []
          return [
            {
              type: legacyType,
              severity: base.acneSeverity || '',
              category: (deriveAcneCategory(legacyType) || 'Comedonal acne') as AcneCategory,
            },
          ]
        })()
    base.acneBreakouts = normalizedBreakouts
    delete base.acneType
    delete base.acneSeverity
    delete base.acneCategory
    
    // Ensure skinTypeFlag is set if skinType is present
    if (base.skinType && !base.skinTypeFlag) {
      base.skinTypeFlag = deriveSkinTypeFlag(base.skinType);
    }

    base.calculatedAge = computeAgeFromDOB(base.dateOfBirth) ?? null;
    const infoComplete = LEGAL_DISCLAIMER_KEYS.every((key) => Boolean(base[key]));
    base.legalDisclaimerAgreed = infoComplete;
    
    return base as UpdatedConsultData
  }

  const matrixPreloaded = isConcernMatrixLoaded();
  const matrixInitialError = getConcernMatrixLoadError();

  const [matrixReady, setMatrixReady] = useState(matrixPreloaded);
  const [matrixLoading, setMatrixLoading] = useState(!matrixPreloaded && !matrixInitialError);
  const [matrixLoadError, setMatrixLoadError] = useState<string | null>(
    matrixInitialError?.message ?? null
  );

  useEffect(() => {
    let active = true;
    if (matrixReady || matrixLoadError) {
      setMatrixLoading(false);
      return () => {
        active = false;
      };
    }

    setMatrixLoading(true);
    loadConcernMatrixData()
      .then(() => {
        if (!active) return;
        setMatrixReady(true);
        setMatrixLoading(false);
        setMatrixLoadError(null);
      })
      .catch(err => {
        if (!active) return;
        setMatrixLoading(false);
        setMatrixLoadError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      active = false;
    };
  }, [matrixReady, matrixLoadError]);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UpdatedConsultData>(buildInitialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recommendation, setRecommendation] = useState<RoutineOptionsResponse | null>(null);
  const [decisionAuditState, setDecisionAuditState] = useState<any>(null);
  const [triageOutcomesState, setTriageOutcomesState] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // RULE_SPECS runtime state
  const [runtimeSelf, setRuntimeSelf] = useState<any>({});
  // queued follow-up (next to show when user clicks Next)
  const [followUp, setFollowUp] = useState<null | { ruleId: string; category: string; dimension?: 'brown' | 'red' | 'aging' | 'bumpy'; questions: Array<{ id: string; prompt: string; options: string[]; multi?: boolean }> }>(null);
  // active follow-up currently being displayed
  const [activeFollowUp, setActiveFollowUp] = useState<null | { ruleId: string; category: string; dimension?: 'brown' | 'red' | 'aging' | 'bumpy'; questions: Array<{ id: string; prompt: string; options: string[]; multi?: boolean }> }>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, Record<string, string | string[]>>>({});
  const [followUpLocal, setFollowUpLocal] = useState<Record<string, string | string[]>>({});
  // Drafts store in-progress answers for each follow-up (not yet submitted)
  const [followUpDrafts, setFollowUpDrafts] = useState<Record<string, Record<string, string | string[]>>>({});
  const [pendingAutoFill, setPendingAutoFill] = useState<null | { answers: Record<string, Record<string, string | string[]>> }>(null);
  // Track order of applied follow-up decisions to support undo on Back (removed for now)
  const [effectiveBands, setEffectiveBands] = useState<any>(() => {
    const seed = { ...(machine || {}) } as Record<string, any>
    ensureTextureAggregate(seed)
    return seed
  });
  const [computedSensitivity, setComputedSensitivity] = useState<{ score: number; tier: string; band: string; remark: string } | null>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [gateRemarks, setGateRemarks] = useState<string[]>([]);
  const prevMainConcernsRef = useRef<string[]>([]);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(computeAgeFromDOB(formData.dateOfBirth));
  
  // Sidebar state - slide in/out from right, default open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isMachineBandOpen, setIsMachineBandOpen] = useState(true);
  const [isEffectiveBandOpen, setIsEffectiveBandOpen] = useState(true);

  useEffect(() => {
    setCalculatedAge(computeAgeFromDOB(formData.dateOfBirth));
  }, [formData.dateOfBirth]);

  useEffect(() => {
    setFormData(prev => {
      let next = prev;
      const autoValue = calculatedAge == null
        ? ''
        : calculatedAge < 20
          ? 'Yes'
          : 'No';

      if (autoValue !== prev.sensitivitySeasonal) {
        next = next === prev ? { ...prev } : next;
        next.sensitivitySeasonal = autoValue;
      }

      if (calculatedAge != null && calculatedAge <= 25 && prev.mainConcerns.includes('Fine lines & wrinkles')) {
        const filteredConcerns = prev.mainConcerns.filter(c => c !== 'Fine lines & wrinkles');
        const filteredPriority = (Array.isArray(prev.concernPriority) ? prev.concernPriority : []).filter(c => c !== 'Fine lines & wrinkles');
        if (filteredConcerns.length !== prev.mainConcerns.length || filteredPriority.length !== (Array.isArray(prev.concernPriority) ? prev.concernPriority.length : 0)) {
          next = next === prev ? { ...prev } : next;
          next.mainConcerns = filteredConcerns as typeof prev.mainConcerns;
          next.concernPriority = filteredPriority as typeof prev.concernPriority;
        }
      }

      const ageForForm = calculatedAge ?? null;
      if ((prev as any).calculatedAge !== ageForForm) {
        next = next === prev ? { ...prev } : next;
        (next as any).calculatedAge = ageForForm;
      }

      return next;
    });
  }, [calculatedAge]);

  // Gate questions logic
  const gateQuestions = [
    {
      field: 'pregnancy',
      question: 'Are you currently pregnant or breastfeeding?',
      action: 'Pregnancy detected — avoiding retinoids. Block retinoids, high-dose salicylic (>2%), strong peels, oral tranexamic. Allow azelaic, niacinamide, vitC derivatives (cautious). Set block_retinoids=true.'
    },
    {
      field: 'recentIsotretinoin',
      question: 'Have you used isotretinoin (Accutane) in the last 6 months?',
      action: 'Recent isotretinoin use — avoiding irritants. Block retinoid initiation and in-clinic procedures; allow only low-irritant topicals. Set procedural_contraindicated=true.'
    },
    {
      field: 'severeCysticAcne',
      question: 'Do you have severe or cystic acne that is painful or scarring?',
      action: 'Severe cystic acne detected — dermatologist referral required. Recommend soothing barrier care + SPF only. Set referral_required=true.'
    },
    {
      field: 'allergyConflict',
      question: 'Do you have any known allergies to skincare ingredients?',
      action: 'Allergy conflict detected — product modifications needed. Block product SKU; pick replace; set product_allergy_conflict.'
    },
    {
      field: 'barrierStressHigh',
      question: 'Is your skin currently very irritated, inflamed, or compromised?',
      action: 'High barrier stress detected — barrier-first protocol required. Force barrier-first routine (no retinoids/BHA/AHA/BP). Set phase0_required=true.'
    }
  ];

  const handleGateChange = (field: string, value: string, action: string) => {
    updateFormData({ [field]: value });
    
    if (value === 'Yes') {
      // Add remark if not already present
      setGateRemarks(prev => {
        if (!prev.includes(action)) {
          return [...prev, action];
        }
        return prev;
      });
    } else {
      // Remove remark if present
      setGateRemarks(prev => prev.filter(remark => remark !== action));
    }
  };

  // Per-concern readiness: allow follow-ups for a category only if the concern is selected
  // and prerequisite fields for that concern are answered. Moisture/Grease remain global.
  const MAIN_CONCERNS_STEP = 19;

  const isCategoryReady = (category: string, dimension?: 'brown' | 'red' | 'aging' | 'bumpy') => {
    const concerns: string[] = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : []
    const acneBreakouts = Array.isArray(formData.acneBreakouts) ? formData.acneBreakouts : []
    switch (category) {
      case 'Acne':
        // Don't surface acne follow-ups until after the main concerns step is completed
        if (currentStep <= MAIN_CONCERNS_STEP) {
          return false
        }
        // When Acne is selected, ensure required follow-up inputs are provided
        if (concerns.includes('Acne')) {
          if (!acneBreakouts.length) return false
          return acneBreakouts.every(item => String(item.type || '').trim() && String(item.severity || '').trim())
        }
        // If Acne is not selected, still allow mismatch reconciliation when machine flags red/yellow
        const machineBand = String((machine as any)?.acne || '').toLowerCase()
        return machineBand === 'red' || machineBand === 'yellow'
      case 'Pigmentation':
        // Only ready if Pigmentation is selected and type/severity provided
        return concerns.includes('Pigmentation') && (
          String(formData.pigmentationType || '').trim() && String(formData.pigmentationSeverity || '').trim()
        )
      case 'Texture': {
        const wantsWrinkles = concerns.includes('Fine lines & wrinkles')
        const wantsBumpy = concerns.includes('Bumpy skin')
        if (dimension === 'aging') {
          if (!wantsWrinkles) return false
          return !!String(formData.wrinklesType || '').trim()
        }
        if (dimension === 'bumpy') {
          if (!wantsBumpy) return false
          return !!String(formData.textureType || '').trim()
        }
        if (!wantsWrinkles && !wantsBumpy) return false
        if (wantsWrinkles && !String(formData.wrinklesType || '').trim()) return false
        if (wantsBumpy && !String(formData.textureType || '').trim()) return false
        return true
      }
      case 'Pores':
        // Only ready if Pores is selected and subtype provided
        return concerns.includes('Large pores') && !!String(formData.poresType || '').trim()
      // Do not gate Grease/Moisture/Sensitivity here
      default:
        return true
    }
  }
  
  // Auto-focus functionality
  const firstInputRef = useRef<HTMLInputElement>(null);
  const firstTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus on first input when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeElement = firstInputRef.current || firstTextareaRef.current;
      if (activeElement && !activeElement.value) {
        activeElement.focus();
      }
    }, 100); // Small delay to ensure DOM is rendered
    
    return () => clearTimeout(timer);
  }, [currentStep]);

  const updateFormData = (incomingUpdates: Partial<UpdatedConsultData>) => {
    const updates: Partial<UpdatedConsultData> = { ...incomingUpdates };

    if (updates.skinType) {
      updates.skinTypeFlag = deriveSkinTypeFlag(updates.skinType);
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'dateOfBirth')) {
      const dob = updates.dateOfBirth as string | undefined;
      const computedAge = computeAgeFromDOB(dob) ?? null;
      updates.calculatedAge = computedAge;
      setCalculatedAge(computedAge);
    }

    let legalDisclaimerAgreedChanged = false;
    const disclaimerTouched =
      LEGAL_DISCLAIMER_KEYS.some((key) => Object.prototype.hasOwnProperty.call(updates, key)) ||
      Object.prototype.hasOwnProperty.call(updates, 'legalDisclaimerAgreed');

    setFormData(prev => {
      const next = { ...prev, ...updates };

      if (disclaimerTouched) {
        const allChecked = LEGAL_DISCLAIMER_KEYS.every((key) => Boolean(next[key]));
        if (next.legalDisclaimerAgreed !== allChecked) {
          next.legalDisclaimerAgreed = allChecked;
          legalDisclaimerAgreedChanged = true;
        }
      }

      return next;
    });

    const keysToClear = new Set(Object.keys(updates));
    if (legalDisclaimerAgreedChanged) {
      keysToClear.add('legalDisclaimerAgreed');
    }

    keysToClear.forEach(key => {
      if (errors[key]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    });
  };

  // Recompute engine outputs from base answers + stored follow-up answers
  const recomputeEngine = (answersByRuleId: Record<string, Record<string, string | string[]>>) => {
    try {
      const ctx = { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding } as any;
      const m = (machine || {}) as any;
      const self = deriveSelfBandsRt(formData as any, ctx);
      setRuntimeSelf(self);
      // Build follow-ups
      const allQsets = getFollowUpsRt(m, self);
      // Helper: is the category still selected (ignores prereqs)
      const concerns: string[] = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : []
      const isCategorySelected = (category: string) => {
        switch (category) {
          case 'Acne':
            return concerns.includes('Acne')
          case 'Pigmentation':
            return concerns.includes('Pigmentation')
          case 'Texture':
            return concerns.includes('Fine lines & wrinkles') || concerns.includes('Bumpy skin')
          case 'Pores':
            return concerns.includes('Large pores')
          default:
            // Moisture/Grease and others are global
            return true
        }
      }
      // Filter per category readiness (selected + prereqs)
      const qsets = allQsets.filter(q => isCategoryReady(q.category as any, q.dimension as any));
      // Map ruleId -> category for selection-based retention
      const ruleToCategory: Record<string, string> = {}
      for (const q of allQsets) ruleToCategory[q.ruleId] = q.category || ''
      const applicable = new Set(qsets.map(q => q.ruleId));
      // Build per-rule dependency keys (category + machine/self bands + key form fields)
      const keysNow: Record<string, string> = {};
      const norm = (s: any) => String(s ?? '').toLowerCase().trim();
    for (const r of qsets) {
      let cat = r.category || ''
      let dim = r.dimension || ''
      let mBand = ''
      let sBand = ''
      switch (cat) {
        case 'Moisture': mBand = norm(m.moisture); sBand = norm(self.moisture); break
        case 'Grease': mBand = norm(m.sebum); sBand = norm(self.sebum); break
        case 'Texture':
          if (dim === 'aging') {
            mBand = norm((m as any).textureAging ?? m.texture)
            sBand = norm((self as any).textureAging ?? self.texture)
          } else if (dim === 'bumpy') {
            mBand = norm((m as any).textureBumpy ?? m.texture)
            sBand = norm((self as any).textureBumpy ?? self.texture)
          } else {
            mBand = norm(m.texture)
            sBand = norm(self.texture)
          }
          break
        case 'Pores': mBand = norm(m.pores); sBand = norm(self.pores); break
        case 'Acne': mBand = norm(m.acne); sBand = norm(self.acne); break
        case 'Pigmentation':
          if (dim === 'red') { mBand = norm(m.pigmentation_red); sBand = norm(self.pigmentation_red) }
          else { mBand = norm(m.pigmentation_brown); sBand = norm(self.pigmentation_brown) }
          break
        default: break
      }
      // Add concern-specific fields to ensure re-asking when user changes these
      const acneKey = Array.isArray(formData.acneBreakouts)
        ? (formData.acneBreakouts as any[])
            .map((item) => `${norm(item.type)}|${norm(item.severity)}`)
            .join(',')
        : ''
      
      // Build category-specific extra fields - only include fields that would actually invalidate this follow-up
      let extra = ''
      switch (cat) {
        case 'Acne':
          extra = [acneKey].join('~') // Acne follow-ups depend on acne breakouts, not necessarily main concerns
          break
        case 'Texture':
          if (dim === 'aging') {
            extra = norm(formData.wrinklesType)
          } else if (dim === 'bumpy') {
            extra = norm(formData.textureType)
          } else {
            extra = [norm(formData.textureType), norm(formData.wrinklesType)].join('~')
          }
          break
        case 'Pores':
          extra = [norm(formData.poresType)].join('~')
          break
        case 'Pigmentation':
          extra = [norm(formData.pigmentationType), norm(formData.pigmentationSeverity)].join('~')
          break
        case 'Moisture':
        case 'Grease':
        default:
          // For categories that don't have specific form fields, use minimal dependency
          extra = ''
          break
      }
      keysNow[r.ruleId] = [cat, dim, mBand, sBand, extra].join('#')
    }
    // Keep ALL follow-up answers that are still relevant
    // Rule is relevant if either:
    //  - it's still applicable now (selected + prereqs satisfied), OR
    //  - its category remains selected (even if prereqs temporarily not filled)
    const filteredAnswers: Record<string, Record<string, string | string[]>> = {}
    for (const [rid, ans] of Object.entries(answersByRuleId || {})) {
      const cat = ruleToCategory[rid] || ''
      const stillSelected = isCategorySelected(cat)
      if (applicable.has(rid) || stillSelected) {
        filteredAnswers[rid] = ans
      }
    }
    const newDecisions: any[] = []
    let updates: any = {}
    // Auto-apply no-question rules
    for (const r of qsets) {
      if (!r.questions || r.questions.length === 0) {
        const d = decideBandRt(r.ruleId, {}, ctx) || { updates: {} }
        newDecisions.push({ ruleId: r.ruleId, ...d, decidedAt: new Date().toISOString(), specVersion: 'live' })
        updates = mergeBandsRt(updates, d.updates || {}) as any
      }
    }
    // Apply answered rules with questions
    for (const r of qsets) {
      if (r.questions && r.questions.length && filteredAnswers[r.ruleId]) {
        const d = decideBandRt(r.ruleId, filteredAnswers[r.ruleId], ctx) || { updates: {} }
        newDecisions.push({ ruleId: r.ruleId, ...d, decidedAt: new Date().toISOString(), specVersion: 'live' })
        updates = mergeBandsRt(updates, d.updates || {}) as any
      }
    }
    // Determine which follow-up to show based on priority and current state
    // Priority: show unanswered follow-ups for categories that need them most
    let next = null
    
    // First, try to find an unanswered follow-up with high priority (red/yellow bands)
    const highPriorityNext = qsets.find(q => {
      if (!q.questions || !q.questions.length || filteredAnswers[q.ruleId]) return false
      const cat = q.category || ''
      const dim = q.dimension || ''
      let bandValue = ''
      switch (cat) {
        case 'Acne': bandValue = norm(m.acne) || norm(self.acne); break
        case 'Texture':
          if (dim === 'aging') bandValue = norm((m as any).textureAging ?? m.texture) || norm((self as any).textureAging ?? self.texture)
          else if (dim === 'bumpy') bandValue = norm((m as any).textureBumpy ?? m.texture) || norm((self as any).textureBumpy ?? self.texture)
          else bandValue = norm(m.texture) || norm(self.texture)
          break
        case 'Pores': bandValue = norm(m.pores) || norm(self.pores); break
        case 'Pigmentation':
          if (dim === 'red') bandValue = norm(m.pigmentation_red) || norm(self.pigmentation_red)
          else bandValue = norm(m.pigmentation_brown) || norm(self.pigmentation_brown)
          break
        default: break
      }
      return bandValue === 'red' || bandValue === 'yellow'
    })
    
    // If no high priority, find any unanswered follow-up
    next = highPriorityNext || qsets.find(q => q.questions && q.questions.length && !filteredAnswers[q.ruleId]) || null
    
  setFollowUp(next ? { ruleId: next.ruleId, category: next.category as any, dimension: next.dimension as any, questions: next.questions || [] } : null)
  if (next) setFollowUpLocal(followUpDrafts[next.ruleId] || filteredAnswers[next.ruleId] || {})
    setDecisions(newDecisions)
    // Compute sensitivity band from form inputs and merge into effective bands
  const sens = computeSensitivityFromForm(formData as any, ctx)
  setComputedSensitivity(sens as any)
  const combinedBands = { ...m, ...updates, sensitivity: sens.band }
  ensureTextureAggregate(combinedBands)
  setEffectiveBands(combinedBands)
    setFollowUpAnswers(filteredAnswers)
    } catch (error) {
      console.error('Failed to recompute engine:', error);
      // Set fallback state to prevent crashes
        const fallback = { ...(machine || {}) }
        ensureTextureAggregate(fallback)
        setEffectiveBands(fallback);
    }
  }

  // Trigger recompute when base answers change
  useEffect(() => {
    recomputeEngine(followUpAnswers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.oilLevels,
    formData.hydrationLevels,
    formData.acneBreakouts,
    formData.pigmentationType,
    formData.pigmentationSeverity,
    formData.poresType,
    formData.wrinklesType,
    formData.textureType,
    formData.mainConcerns,
    formData.dateOfBirth,
    formData.pregnancyBreastfeeding,
    // Sensitivity score drivers (Yes/No)
    (formData as any).sensitivityRedness,
    (formData as any).sensitivityDiagnosis,
    (formData as any).sensitivityProducts,
    (formData as any).sensitivitySun,
    (formData as any).sensitivityCapillaries,
    (formData as any).sensitivitySeasonal, // age under 20
    (formData as any).sensitivityCleansing, // very dry baseline
  ])

  useEffect(() => {
    if (pendingAutoFill) {
      recomputeEngine(pendingAutoFill.answers)
      setPendingAutoFill(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoFill])

  // When concerns change, proactively drop stale answers/drafts tied to unselected categories
  // and clear mismatch follow-ups once Acne is explicitly chosen.
  useEffect(() => {
    const concerns: string[] = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : []
    const prevConcerns = prevMainConcernsRef.current || []
    const mismatchRuleId = 'acne_MAcne_CNone'
    const acneJustSelected = concerns.includes('Acne') && !prevConcerns.includes('Acne')

    let answersWorking: typeof followUpAnswers = followUpAnswers
    let draftsWorking: typeof followUpDrafts = followUpDrafts
    let answersChangedDueToAcne = false
    let draftsChangedDueToAcne = false
    let shouldResetFollowUpLocal = false

    if (acneJustSelected) {
      if (answersWorking[mismatchRuleId]) {
        const { [mismatchRuleId]: _removed, ...rest } = answersWorking
        answersWorking = rest
        answersChangedDueToAcne = true
      }
      if (draftsWorking[mismatchRuleId]) {
        const { [mismatchRuleId]: _removedDraft, ...restDraft } = draftsWorking
        draftsWorking = restDraft
        draftsChangedDueToAcne = true
      }
      if (followUp?.ruleId === mismatchRuleId) {
        setFollowUp(null)
        shouldResetFollowUpLocal = true
      }
      if (activeFollowUp?.ruleId === mismatchRuleId) {
        setActiveFollowUp(null)
        shouldResetFollowUpLocal = true
      }
      if (shouldResetFollowUpLocal) {
        setFollowUpLocal({})
      }
    }

    try {
      const m = (machine || {}) as any
      const self = (runtimeSelf || {}) as any
      const qsets = getFollowUpsRt(m, self)
      const ruleToCategory: Record<string, string> = {}
      for (const q of qsets) ruleToCategory[q.ruleId] = q.category || ''
      const isCategorySelected = (category: string) => {
        switch (category) {
          case 'Acne': return concerns.includes('Acne')
          case 'Pigmentation': return concerns.includes('Pigmentation')
          case 'Texture': return concerns.includes('Fine lines & wrinkles') || concerns.includes('Bumpy skin')
          case 'Pores': return concerns.includes('Large pores')
          default: return true
        }
      }
      // Prune answers that belong to categories no longer selected, or were cleared due to Acne being added
      const prunedAnswers: typeof followUpAnswers = {}
      let answersChanged = answersChangedDueToAcne
      for (const [rid, ans] of Object.entries(answersWorking)) {
        const cat = ruleToCategory[rid] || ''
        if (isCategorySelected(cat)) {
          prunedAnswers[rid] = ans
        } else {
          answersChanged = true
        }
      }
      if (answersChanged) {
        setFollowUpAnswers(prunedAnswers)
        recomputeEngine(prunedAnswers)
      }

      const prunedDrafts: typeof followUpDrafts = {}
      let draftsChanged = draftsChangedDueToAcne
      for (const [rid, ans] of Object.entries(draftsWorking)) {
        const cat = ruleToCategory[rid] || ''
        if (isCategorySelected(cat)) {
          prunedDrafts[rid] = ans
        } else {
          draftsChanged = true
        }
      }
      if (draftsChanged) {
        setFollowUpDrafts(prunedDrafts)
      }
    } catch (e) {
      // non-fatal; keep going
      console.warn('Failed to prune deselected concern answers:', e)
    }

    prevMainConcernsRef.current = concerns
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.mainConcerns])

  const toggleFollowUpOption = (qid: string, opt: string, multi?: boolean) => {
    setFollowUpLocal(prev => {
      const cur = prev[qid]
      if (!multi) return { ...prev, [qid]: opt }
      const arr = Array.isArray(cur) ? [...cur] : []
      const idx = arr.indexOf(opt)
      if (idx >= 0) {
        arr.splice(idx, 1)
      } else {
        arr.push(opt)
      }
      return { ...prev, [qid]: arr }
    })
  }

  const handleSubmitFollowUp = () => {
    if (!activeFollowUp) return;
    
    try {
      // Ensure all visible questions answered (skip Q2a if Q2 != 'Yes', skip Q4 for texture if Q1 != 'Forehead')
      const allAnswered = (activeFollowUp.questions || []).every(q => {
        // Skip Q2a if Q2 is not "Yes"
        if (q.id === 'Q2a' && followUpLocal['Q2'] !== 'Yes') {
          return true; // Not required since it's hidden
        }
        
        // Skip Q4 (dandruff question) if Q1 is not "Forehead" for texture_machineBumpy_customerSmooth
        if (q.id === 'Q4' && activeFollowUp.ruleId === 'texture_machineBumpy_customerSmooth' && followUpLocal['Q1'] !== 'Forehead') {
          return true; // Not required since it's hidden
        }
        
        // Skip Q3 (dandruff question) if Q2 is not "Forehead" for texture_machineSmooth_customerBumpy
        if (q.id === 'Q3' && activeFollowUp.ruleId === 'texture_machineSmooth_customerBumpy' && followUpLocal['Q2'] !== 'Forehead') {
          return true; // Not required since it's hidden
        }
        
        return followUpLocal[q.id] !== undefined && 
          (Array.isArray(followUpLocal[q.id]) 
            ? (followUpLocal[q.id] as any[]).length > 0 
            : String(followUpLocal[q.id]).length > 0
          );
      });
      if (!allAnswered) return; // required
      
      const ruleId = activeFollowUp.ruleId;
      const decision = decideBandRt(ruleId, followUpLocal, { 
        dateOfBirth: formData.dateOfBirth, 
        pregnancyBreastfeeding: formData.pregnancyBreastfeeding 
      } as any) || { updates: {} };
      
      setDecisions(prev => [...prev, { ruleId, ...decision, decidedAt: new Date().toISOString(), specVersion: 'live' }]);
      setEffectiveBands((prev: any) => {
        const next = { ...prev, ...(decision.updates || {}) } as Record<string, any>
        ensureTextureAggregate(next)
        return next
      });
      
      // Route handling: if rule indicates routing to Acne, ensure Acne follow-ups appear by injecting concern
      const flags: string[] = Array.isArray((decision as any).flags) ? (decision as any).flags as string[] : [];
      if (flags.some(f => /route:acne/i.test(f))) {
        setFormData(prev => {
          const mc = Array.isArray(prev.mainConcerns) ? prev.mainConcerns : [];
          if (mc.includes('Acne') || mc.length >= 3) return prev;
          return { ...prev, mainConcerns: [...mc, 'Acne'] };
        });
      }
      
      // Compute updated answers synchronously for next-step selection
      const updatedAnswers = { ...followUpAnswers, [ruleId]: followUpLocal } as Record<string, Record<string, string | string[]>>;
  recomputeEngine(updatedAnswers);
      setActiveFollowUp(null);
      // Clear any saved draft once submitted
      setFollowUpDrafts(prev => {
        const next = { ...prev };
        delete next[ruleId];
        return next;
      });
    } catch (error) {
      console.error('Failed to submit follow-up:', error);
      // Don't prevent the user from continuing, but log the error
    }
  };

  // Small tag/chip input component used for irritating products
  const TagInput: React.FC<{
    value: string[];
    onChange: (v: string[]) => void;
    placeholder?: string;
    className?: string;
  }> = ({ value, onChange, placeholder }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const [highlight, setHighlight] = useState<number>(-1);

    // Suggestions list (provided by user) - sorted alphabetically
    const SUGGESTIONS = [
      'Azelaic Acid',
      'Benzoyl Peroxide',
      'Glycolic Acid (AHA)',
      'Hydroquinone',
      'Kojic Acid',
      'Lactic Acid (AHA)',
      'Mandelic Acid (AHA)',
      'Niacinamide',
      'Retinol / Retinoids (Adapalene, Tretinoin, etc.)',
      'Salicylic Acid (BHA)',
      'Vitamin C (Ascorbic Acid, Derivatives)'
    ].sort((a,b) => a.localeCompare(b));

    const addTag = (raw: string) => {
      const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return;
      const next = Array.from(new Set([...(value || []), ...parts]));
      onChange(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle Escape: prefer local behavior (close suggestions / clear input)
      if (e.key === 'Escape') {
        // If user is typing, clear the input instead of deleting tags
        if (input.trim()) {
          e.preventDefault();
          e.stopPropagation();
          setInput('');
          setHighlight(-1);
          return;
        }
        // If suggestions are open, just close them
        if (focused && filteredSuggestions.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          setFocused(false);
          setHighlight(-1);
          return;
        }
        // Otherwise allow the event to bubble so the form's Escape handler can act as Back
      }
      // Arrow navigation for suggestions
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight(prev => Math.max(prev - 1, 0));
        return;
      }

      // If suggestion highlighted, Enter selects it
      if ((e.key === 'Enter' || e.key === 'Tab') && highlight >= 0 && filteredSuggestions[highlight]) {
        e.preventDefault();
        const sel = filteredSuggestions[highlight];
        addTag(sel);
        setInput('');
        setHighlight(-1);
        requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }

      if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
        if (input.trim()) {
          e.preventDefault();
          addTag(input);
          setInput('');
          setHighlight(-1);
          // keep focus
          requestAnimationFrame(() => inputRef.current?.focus());
        } else if (e.key === 'Tab') {
          // allow tab to move focus when input empty
        } else {
          e.preventDefault();
        }
      }
      // Backspace to remove last tag when input empty
      if (e.key === 'Backspace' && input === '' && value && value.length > 0) {
        e.preventDefault();
        const next = value.slice(0, -1);
        onChange(next);
      }
    };

    const handleBlur = () => {
      // delay hiding suggestions to allow click to register
      setTimeout(() => {
        setFocused(false);
        if (input.trim()) {
          addTag(input);
          setInput('');
        }
        setHighlight(-1);
      }, 150);
    };

    const handleFocus = () => {
      setFocused(true);
      setHighlight(-1);
    };

    const filteredSuggestions = (input.trim()
      ? SUGGESTIONS.filter(s => s.toLowerCase().includes(input.toLowerCase()))
      : SUGGESTIONS
    );

    return (
      <div className="w-full">
  <div className="flex flex-wrap gap-2 items-center p-2 border border-gray-200 rounded-md bg-white relative">
          {(value || []).map((tag, i) => (
            <div key={tag + i} className="inline-flex items-center space-x-2 bg-gray-100 text-sm text-gray-700 px-3 py-1 rounded-full">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => onChange((value || []).filter((_, idx) => idx !== i))}
                className="text-gray-500 hover:text-gray-700"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </div>
          ))}

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="flex-1 min-w-[160px] p-2 text-sm outline-none"
            aria-autocomplete="list"
            aria-expanded={focused}
          />

          {/* Suggestions dropdown */}
          {focused && filteredSuggestions.length > 0 && (
            <div className="absolute left-2 right-2 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-auto">
              {filteredSuggestions.map((s, idx) => (
                <div
                  key={s}
                  onMouseDown={(ev) => {
                    // onMouseDown to prevent blur before click
                    ev.preventDefault();
                    addTag(s);
                    setInput('');
                    setHighlight(-1);
                    requestAnimationFrame(() => inputRef.current?.focus());
                  }}
                  onMouseEnter={() => setHighlight(idx)}
                  className={`px-4 py-2 cursor-pointer text-sm ${highlight === idx ? 'bg-amber-100' : 'hover:bg-gray-50'}`}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Separate product names with commas or new lines.</p>
      </div>
    );
  };

  const getTotalSteps = (concerns: string[] = formData.mainConcerns) => {
    // Base steps: 4 (personal info) + 5 (gates) + 4 (skin basics) + 3 (history) + 3 (routine) = 19  
    let totalSteps = 19;
    
    // Add dynamic steps for each selected concern
    concerns.forEach(concern => {
      if (concern === 'Pigmentation') {
        totalSteps += 2; // Type + Severity
      } else if (concern === 'Acne') {
        totalSteps += 2; // Type + Severity
      } else {
        totalSteps += 1; // Just severity
      }
    });
    // Add prioritization step if 2+ concerns selected
    if (concerns.length >= 2) {
      totalSteps += 1;
    }
    
    // Section E - Lifestyle questions REMOVED: 5 (diet, water, sleep, stress, environment)
    
    // Add preference questions: 2 (routine-steps, serum-comfort)
    // moisturizer-texture question REMOVED
    totalSteps += 2;
  
    // Add legal disclaimer step
    totalSteps += 1;
    
    return totalSteps;
  };

  const fillWithDummyData = () => {
    const machineBands: MachineScanBands = { ...AUTO_FILL_MACHINE_FALLBACK, ...(machine || {}) };

    const filledData: UpdatedConsultData = {
      ...AUTO_FILL_FORM_TEMPLATE,
      currentProductsList: AUTO_FILL_FORM_TEMPLATE.currentProductsList.map(item => ({ ...item })),
      mainConcerns: [...AUTO_FILL_FORM_TEMPLATE.mainConcerns],
      concernPriority: Array.isArray(AUTO_FILL_FORM_TEMPLATE.concernPriority)
        ? [...AUTO_FILL_FORM_TEMPLATE.concernPriority]
        : [...AUTO_FILL_FORM_TEMPLATE.mainConcerns],
      acneBreakouts: AUTO_FILL_FORM_TEMPLATE.acneBreakouts.map(item => ({ ...item })),
    };

    filledData.currentProducts = filledData.currentProductsList
      .map(item => `${item.name} (${item.duration})`)
      .join('; ');

    const followUps: Record<string, Record<string, string | string[]>> = {};
    for (const [ruleId, answers] of Object.entries(AUTO_FILL_FOLLOWUP_ANSWERS) as Array<[
      string,
      Record<string, string | string[]>
    ]>) {
      const answerMap: Record<string, string | string[]> = {};
      for (const [questionId, value] of Object.entries(answers) as Array<[
        string,
        string | string[]
      ]>) {
        answerMap[questionId] = Array.isArray(value) ? [...value] : value;
      }
      followUps[ruleId] = answerMap;
    }

    const context = {
      dateOfBirth: filledData.dateOfBirth,
      pregnancyBreastfeeding: filledData.pregnancyBreastfeeding,
    } as any;

    const derivedSelf = deriveSelfBandsRt(filledData as any, context);
    const allDecisions = decideAllRt(machineBands as any, derivedSelf, followUps, context);
    const sensitivityResult = computeSensitivityFromForm(filledData as any, context);

    setFormData(filledData);
    setGateRemarks([]);
    setErrors({});
    setRecommendation(null);
    setIsSubmitted(false);
    setFollowUpAnswers(followUps);
    setFollowUpDrafts({});
    setFollowUpLocal({});
    setFollowUp(null);
    setActiveFollowUp(null);
    setRuntimeSelf(derivedSelf);
    setDecisions(allDecisions.decisions || []);
  const aggregateBands = { ...allDecisions.effectiveBands, sensitivity: sensitivityResult.band } as Record<string, any>
  ensureTextureAggregate(aggregateBands)
  setEffectiveBands(aggregateBands);
    setComputedSensitivity(sensitivityResult as any);
    setTriageOutcomesState(allDecisions.decisions || []);
    setDecisionAuditState({
      machineBands,
      selfBands: derivedSelf,
      followUpAnswers: followUps,
      decisions: allDecisions.decisions || [],
      effectiveBands: { ...allDecisions.effectiveBands, sensitivity: sensitivityResult.band },
    });

    const totalSteps = getTotalSteps(filledData.mainConcerns);
    setCurrentStep(totalSteps);
    setPendingAutoFill({ answers: followUps });
  };

  const getConcernSteps = () => {
    const concernSteps: Array<{concern: string, step: 'type' | 'severity' | 'sensitivity-question', questionIndex?: number}> = [];
    
    formData.mainConcerns.forEach(concern => {
      if (concern === 'Pigmentation') {
        concernSteps.push({concern, step: 'type'});
        concernSteps.push({concern, step: 'severity'});
      } else if (concern === 'Acne') {
        concernSteps.push({concern, step: 'type'});
        concernSteps.push({concern, step: 'severity'});
      } else if (concern === 'Post Acne Scarring') {
        concernSteps.push({concern, step: 'type'});
        concernSteps.push({concern, step: 'severity'});
      } else {
        concernSteps.push({concern, step: 'severity'});
      }
    });
    
    return concernSteps;
  };

  const getCurrentConcernStep = () => {
    
    const concernSteps = getConcernSteps();
    // Insert prioritization step if 2+ concerns selected
    const hasPriorityStep = (formData.mainConcerns || []).length >= 2;
    const priorityStepIndex = 20 + concernSteps.length; // immediately after concern follow-ups
    const lifestyleStartStep = priorityStepIndex + (hasPriorityStep ? 1 : 0); // Start after priority (if present)
    
    // Lifestyle questions REMOVED: diet, water-intake, sleep-hours, stress-levels, environment
    
    // Individual preference questions (2 questions)
    // moisturizer-texture question REMOVED
    const preferenceStartStep = lifestyleStartStep;
    if (currentStep === preferenceStartStep) return 'routine-steps';
    if (currentStep === preferenceStartStep + 1) return 'serum-comfort';
    
    // Legal disclaimer
    if (currentStep === preferenceStartStep + 2) return 'legal-disclaimer';
  // brand-preference question removed
    
    const concernIndex = currentStep - 20; // Start after main concerns step (19)
    if (hasPriorityStep && currentStep === priorityStepIndex) return 'concern-priority';
    return concernSteps[concernIndex] || null;
  };

  const validateStep = (step: number): boolean => {
    try {
      const newErrors: Record<string, string> = {};
      const currentConcernStep = getCurrentConcernStep();

    switch (step) {
      case 1: // Name
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        break;
      case 2: // Phone Number
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else {
          const raw = formData.phoneNumber.trim();
          const digits = raw.replace(/\D/g, '');
          const isE164 = /^\+[1-9]\d{6,14}$/.test(raw);
          const isIndian10 = digits.length === 10 && /^[6-9]/.test(digits);
          const isInternational = digits.length > 10 && /^[1-9]/.test(digits);
          if (!(isE164 || isIndian10 || isInternational)) {
            newErrors.phoneNumber = 'Enter a valid phone number';
          }
        }
        break;
      case 3: // Date of Birth
        if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
        break;
      case 4: // Gender
        if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
        break;
      // Gate Questions (Safety Screening)
      case 5: // Pregnancy Gate
        // Skip validation for males - they are automatically marked as "No"
        if (formData.gender !== 'Male') {
          if (!formData.pregnancy || formData.pregnancy.trim() === '') newErrors.pregnancy = 'Please answer the pregnancy question';
        }
        break;
      case 6: // Isotretinoin Gate
        if (!formData.recentIsotretinoin || formData.recentIsotretinoin.trim() === '') newErrors.recentIsotretinoin = 'Please answer the isotretinoin question';
        break;
      case 7: // Severe Acne Gate
        if (!formData.severeCysticAcne || formData.severeCysticAcne.trim() === '') newErrors.severeCysticAcne = 'Please answer the severe acne question';
        break;
      case 8: // Allergies Gate
        if (!formData.allergyConflict || formData.allergyConflict.trim() === '') newErrors.allergyConflict = 'Please answer the allergies question';
        break;
      case 9: // Barrier Stress Gate
        if (!formData.barrierStressHigh || formData.barrierStressHigh.trim() === '') newErrors.barrierStressHigh = 'Please answer the barrier stress question';
        break;
      // Section A - Skin Basics
      case 10: // Skin Type
        if (!formData.skinType.trim()) newErrors.skinType = 'Skin type is required';
        break;
      case 11: // Oil Levels
        if (!formData.oilLevels.trim()) newErrors.oilLevels = 'Oil level description is required';
        break;
      case 12: // Hydration Levels
        if (!formData.hydrationLevels.trim()) newErrors.hydrationLevels = 'Hydration level description is required';
        break;
  case 13: // Sensitivity Screening (auto-age + 6 prompts)
        {
          const sensitivityFields = SENSITIVITY_QUESTION_CONFIG.map(q => q.key);
          sensitivityFields.forEach((key) => {
            const val = (formData as any)[key] as string;
            if (!val || !val.trim()) newErrors[key] = 'Please select an option';
          });
        }
        break;
      // Section B - Current Skin History
      case 14: // Diagnosed Conditions - Optional
        break;
      case 15: // Prescription Treatments - Optional
        break;
      case 16: // Professional Treatments - Optional
        break;
      // Section C - Current Routine
      case 17: // Current Products
        if (!formData.currentProductsList || formData.currentProductsList.length === 0) {
          newErrors.currentProductsList = 'Please add at least one product';
        } else {
          const hasIncompleteProducts = formData.currentProductsList.some(product => 
            !product.name.trim() || !product.duration.trim()
          );
          if (hasIncompleteProducts) {
            newErrors.currentProductsList = 'Please fill in all product names and durations';
          }
        }
        break;
      case 18: // Irritating Products - Optional
        break;
      // Section D - Main Concerns
      case 19: // Main Concerns
        if (formData.mainConcerns.length === 0) newErrors.mainConcerns = 'Select at least one main concern';
        if (formData.mainConcerns.length > 3) newErrors.mainConcerns = 'Please select a maximum of 3 main concerns';
        break;
      default: // Dynamic steps
        // Individual lifestyle questions removed
        if (currentConcernStep === 'concern-priority') {
          // Must have a ranking assigned for all selected concerns
          const selected = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : [];
          const order = Array.isArray(formData.concernPriority) ? formData.concernPriority : [];
          const acnePinnedOk = !selected.includes('Acne') || order[0] === 'Acne';
          const coveredAll = selected.every(c => order.includes(c)) && order.length === selected.length;
          if (!acnePinnedOk) newErrors.concernPriority = 'Acne must be the top priority when selected.';
          else if (!coveredAll) newErrors.concernPriority = 'Please order all selected concerns.';
        }
        // Individual preference questions
        if (currentConcernStep === 'routine-steps') {
          if (!formData.routineSteps.trim()) newErrors.routineSteps = 'Please select your preferred routine steps';
        } else if (currentConcernStep === 'serum-comfort') {
          if (!formData.serumComfort.trim()) newErrors.serumComfort = 'Please select your serum comfort level';
        } else if (currentConcernStep === 'legal-disclaimer') {
          const allChecked = LEGAL_DISCLAIMER_KEYS.every((key) => formData[key]);
          if (!allChecked) newErrors.legalDisclaimerAgreed = 'You must acknowledge all disclaimer points to continue';
        // brand-preference validation removed
        } else if (currentConcernStep && typeof currentConcernStep === 'object') {
          const { concern, step: stepType, questionIndex } = currentConcernStep as any;
          if (stepType === 'sensitivity-question' && typeof questionIndex === 'number') {
        const sensitivityFields = SENSITIVITY_QUESTION_CONFIG.map(q => q.key);
            const key = sensitivityFields[questionIndex] as keyof UpdatedConsultData;
            const val = (formData[key] as string) || '';
            if (!val.trim()) newErrors[key as string] = 'Please select an option';
          } else {
            if (concern === 'Acne') {
              const breakouts = Array.isArray(formData.acneBreakouts) ? formData.acneBreakouts : []
              if (stepType === 'type') {
                if (!breakouts.length) newErrors.acneBreakouts = 'Select at least one breakout type';
              } else if (stepType === 'severity') {
                if (!breakouts.length) {
                  newErrors.acneBreakouts = 'Select at least one breakout type';
                } else if (breakouts.some(item => !String(item.severity || '').trim())) {
                  newErrors.acneBreakouts = 'Select a severity for each breakout type';
                }
              }
            } else {
              const baseMap: Record<string, string> = {
                'Pigmentation': 'pigmentation',
                'Fine lines & wrinkles': 'wrinkles',
                'Large pores': 'pores',
                'Bumpy skin': 'texture',
                'Post Acne Scarring': 'postAcneScarring',
              }
              const base = baseMap[concern] || concern.toLowerCase().replace(/[^a-z]/g, '')
              const concernsWithType = ['Pigmentation']
              const concernsWithColor = ['Post Acne Scarring']
              let key = ''
              if (stepType === 'type') {
                key = base + 'Type'
              } else if (stepType === 'severity') {
                if (concernsWithColor.includes(concern)) {
                  // Post Acne Scarring can have either Color or Severity depending on type
                  const scarType = formData.postAcneScarringType || '';
                  if (scarType.includes('pigmentation') || scarType.includes('Post-inflammatory')) {
                    key = base + 'Color'
                  } else {
                    key = base + 'Severity'
                  }
                } else if (concernsWithType.includes(concern)) {
                  key = base + 'Severity'
                } else {
                  key = base + 'Type'
                }
              }
              const val = (formData[key as keyof UpdatedConsultData] as string) || ''
              if (!val.trim()) newErrors[key as string] = `${concern} ${stepType === 'severity' ? 'severity' : 'type'} is required`
            }
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error in validateStep:', error);
      // Return false to prevent advancing if validation fails due to error
      return false;
    }
  };

  const handleNext = () => {
    // If a follow-up page is active, treat Next as Continue only when answered (guarded elsewhere)
    if (activeFollowUp) {
      const allAnswered = (activeFollowUp.questions || []).every(q => followUpLocal[q.id] !== undefined && (Array.isArray(followUpLocal[q.id]) ? (followUpLocal[q.id] as any[]).length > 0 : String(followUpLocal[q.id]).length > 0))
      if (allAnswered) handleSubmitFollowUp();
      return;
    }
    // If a follow-up is queued (and not currently shown), open it instead of advancing
    if (followUp) {
      setActiveFollowUp(followUp)
      setFollowUpLocal(followUpDrafts[followUp.ruleId] || followUpAnswers[followUp.ruleId] || {})
      return;
    }
    if (validateStep(currentStep)) {
      if (currentStep < getTotalSteps()) {
        let nextStep = currentStep + 1;
        
        // Skip pregnancy gate (step 5) for males
        if (nextStep === 5 && formData.gender === 'Male') {
          // Auto-set pregnancy to "No" for males
          if (!formData.pregnancy || formData.pregnancy.trim() === '') {
            updateFormData({ pregnancy: 'No' });
          }
          // Skip to step 6 (isotretinoin gate)
          nextStep = 6;
        }
        
        setCurrentStep(nextStep);
      } else {
        handlePreview();
      }
    }
  };

  const handleBack = () => {
    // If a follow-up page is active, exit it first
    if (activeFollowUp) {
      // Preserve any in-progress answers as a draft before closing
      try {
        if (activeFollowUp && followUpLocal && Object.keys(followUpLocal).length > 0) {
          setFollowUpDrafts(prev => ({ ...prev, [activeFollowUp.ruleId]: followUpLocal }));
        }
      } catch {}
      setActiveFollowUp(null)
      // And also navigate back a step
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1)
      } else {
        try { onBack(); } catch (e) { console.warn('onBack handler failed:', e) }
      }
      return
    }
    // Do NOT clear previously answered follow-ups on Back.
    // Back should simply navigate steps (or exit form on step 1) while preserving answers.
    if (currentStep > 1) {
      let prevStep = currentStep - 1;
      
      // Skip pregnancy gate (step 5) for males when going back
      if (prevStep === 5 && formData.gender === 'Male') {
        // Skip to step 4 (gender)
        prevStep = 4;
      }
      
      setCurrentStep(prevStep);
      return
    }
    // At the first step, delegate to external back handler (if any)
    try {
      onBack();
    } catch (e) {
      console.warn('onBack handler failed:', e)
    }
  };

  const handleRetryMatrixLoad = async () => {
    try {
      setMatrixLoadError(null);
      setMatrixLoading(true);
      await loadConcernMatrixData(true);
      setMatrixReady(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMatrixLoadError(message);
    } finally {
      setMatrixLoading(false);
    }
  };

  // Make Escape act as Back for this form: capture phase to stop App's global Escape handler
  useEffect(() => {
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        // If possible, go back within the form, otherwise call external onBack
        if (currentStep > 1) {
          setCurrentStep(prev => Math.max(prev - 1, 1));
        } else {
          onBack();
        }
      }
    };

    document.addEventListener('keydown', escapeHandler, true); // use capture
    return () => document.removeEventListener('keydown', escapeHandler, true);
  }, [currentStep, onBack]);

  // Build preview (decision audit + recommendations) without saving
  const handlePreview = async () => {
    if (!isConcernMatrixLoaded()) {
      try {
        setMatrixLoading(true);
        await loadConcernMatrixData();
        setMatrixReady(true);
        setMatrixLoadError(null);
        setMatrixLoading(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setMatrixLoadError(message);
        alert('Unable to load the product catalogue. Please retry in a moment.');
        setMatrixLoading(false);
        return;
      }
    }

    try {
      let decisionAudit: any = {};
      let triageOutcomes: any[] = [];
      try {
        const self = deriveSelfBandsRt(formData as any, { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding } as any);
        const m = (machine || {}) as any;
        const all = decideAllRt(m, self, followUpAnswers, { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding } as any);
        triageOutcomes = all.decisions || [];
        decisionAudit = {
          machineBands: m,
          selfBands: self,
          followUpAnswers,
          decisions: all.decisions,
          effectiveBands: all.effectiveBands,
        };
      } catch (e) {
        console.warn('Runtime decision audit failed:', e);
      }

      setDecisionAuditState(decisionAudit);
      setTriageOutcomesState(triageOutcomes);
      // Build effective bands for context: prefer latest state (with sensitivity merged); fallback to audit bands and merge sensitivity now
      let effectiveForContext: any = effectiveBands && Object.keys(effectiveBands || {}).length ? { ...effectiveBands } : { ...(decisionAudit.effectiveBands || {}) };
      try {
        const sens = computeSensitivityFromForm(formData as any, { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding } as any);
        effectiveForContext = { ...(effectiveForContext || {}), sensitivity: sens.band };
      } catch {}
      if (effectiveForContext) {
        ensureTextureAggregate(effectiveForContext);
      }

      // Derive acne categories from selected breakout types; include cystic flag from severeCysticAcne gate
      const acneCategories: string[] = (() => {
        const set = new Set<string>();
        const arr = Array.isArray(formData.acneBreakouts) ? formData.acneBreakouts : [];
        for (const item of arr) {
          const cat = String((item as any)?.category || '').trim();
          if (cat) set.add(cat);
        }
        if (String(formData.severeCysticAcne).trim() === 'Yes') set.add('Cystic acne');
        return Array.from(set);
      })();

      const acneSubtypeFlag = (() => {
        if (!acneCategories.length) return '';
        return acneCategories[0];
      })();

      const textureSubtypeFlag = (() => {
        const concerns = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : [];
        const lowered = concerns
          .filter((concern: unknown): concern is string => typeof concern === 'string')
          .map((c: string) => c.toLowerCase());
        const wantsWrinkles = lowered.some((c: string) => c.includes('wrinkle'));
        const wantsBumpy = lowered.some((c: string) => c.includes('bumpy'));
        const priorityList = Array.isArray(formData.concernPriority) ? formData.concernPriority : [];
        const findPriorityIndex = (needle: string) => priorityList.findIndex(item => typeof item === 'string' && item.toLowerCase().includes(needle));
        const priorityWrinkles = findPriorityIndex('wrinkle');
        const priorityBumpy = findPriorityIndex('bumpy');
        const normalize = (value: any) => String(value || '').toLowerCase();
        const order: Record<string, number> = { green: 0, blue: 1, yellow: 2, red: 3 };
        const agingBand = order[normalize(effectiveForContext?.textureAging)] ?? -1;
        const bumpyBand = order[normalize(effectiveForContext?.textureBumpy)] ?? -1;

        if (wantsWrinkles && wantsBumpy) {
          if (priorityWrinkles >= 0 && priorityBumpy >= 0) {
            return priorityWrinkles <= priorityBumpy ? 'Aging,Bumpy' : 'Bumpy,Aging';
          }
          if (agingBand > bumpyBand && agingBand >= 0) return 'Aging,Bumpy';
          if (bumpyBand > agingBand && bumpyBand >= 0) return 'Bumpy,Aging';
          return 'Aging,Bumpy';
        }
        if (wantsWrinkles) return 'Aging';
        if (wantsBumpy) return 'Bumpy';

        const wrinkleType = normalize((formData as any).wrinklesType);
        const textureType = normalize((formData as any).textureType);
        if (wrinkleType.includes('wrinkle')) return 'Aging';
        if (textureType.includes('bump')) return 'Bumpy';
        if (agingBand > bumpyBand && agingBand >= 0) return 'Aging';
        if (bumpyBand > agingBand && bumpyBand >= 0) return 'Bumpy';
        return '';
      })();

      const decisionEngineInput = {
        effectiveBands: effectiveForContext || {},
        flags: {
          acneSubtype: acneSubtypeFlag,
          acneHormonal: acneCategories.includes('Hormonal acne'),
          dermatologistReferral: String(formData.severeCysticAcne || '').trim() === 'Yes',
          barrierOverride: String(formData.barrierStressHigh || '').trim() === 'Yes',
          textureSubtype: textureSubtypeFlag,
          pigmentationSubtype: formData.pigmentationType || '',
        },
      };

      const recommendationContext: RecommendationContext = {
        skinType: formData.skinType,
        decisionEngine: decisionEngineInput,
        effectiveBands: effectiveForContext || {},
        acneCategories,
        decisions: triageOutcomes,
        formData: {
          name: formData.name,
          skinType: formData.skinType,
          mainConcerns: formData.mainConcerns || [],
          concernPriority: (formData as any).concernPriority || [],
          pregnancy: formData.pregnancy,
          pregnancyBreastfeeding: formData.pregnancyBreastfeeding,
          sensitivity: formData.sensitivity,
          pigmentationType: formData.pigmentationType,
          serumComfort: formData.serumComfort,
          routineSteps: formData.routineSteps,
          moisturizerTexture: formData.moisturizerTexture,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          recentIsotretinoin: formData.recentIsotretinoin,
          severeCysticAcne: formData.severeCysticAcne,
          barrierStressHigh: formData.barrierStressHigh,
          allergies: formData.allergies,
        }
      };
      const recommendationResult = generateRecommendations(recommendationContext);
      setRecommendation(recommendationResult);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to prepare recommendations:', error);
      alert('Could not generate recommendations. Please review inputs and try again.');
    }
  };

  // Persist to DB from the recommendations page
  const handleFinalizeSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = { ...(formData as any), triageOutcomes: triageOutcomesState, decisionAudit: decisionAuditState };
      if (recommendation) {
        payload.routineOptions = recommendation;
        payload.selectedRoutine = recommendation.routines[recommendation.selectedIndex] ?? null;
      }
      console.log('Finalizing consultation save:', payload);
      const createdSessionId = await saveConsultationData(payload, { sessionId });
      console.log('Consultation saved successfully with session ID:', createdSessionId);
      try { onComplete(); } catch (e) { console.warn('onComplete handler failed:', e); }
    } catch (error) {
      console.error('Failed to submit consultation:', error);
      alert('Failed to save consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow pressing Enter to trigger Next (except in textareas)
  const handleEnterAdvance = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    // If we're on the irritating products step, let the local TagInput handle Enter
    if (currentStep === 18) return;
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'textarea') return; // keep newline behavior in textareas
    // If follow-up active, only continue when all answered
    if (activeFollowUp) {
      e.preventDefault();
      const allAnswered = (activeFollowUp.questions || []).every(q => followUpLocal[q.id] !== undefined && (Array.isArray(followUpLocal[q.id]) ? (followUpLocal[q.id] as any[]).length > 0 : String(followUpLocal[q.id]).length > 0))
      if (allAnswered) handleSubmitFollowUp();
      return;
    }
    // If focused on the actual submit button, let normal submit run
    if (tag === 'button') {
      const btn = target as HTMLButtonElement;
      if (btn.type === 'submit') return;
    }
    e.preventDefault();
    handleNext();
  };

  // Form submit handler so pressing Enter advances like clicking Next
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = getTotalSteps(formData.mainConcerns);
    if (currentStep === total) {
      handlePreview();
    } else {
      handleNext();
    }
  };

  const handleConcernToggle = (concern: string) => {
    if (concern === 'Fine lines & wrinkles' && !(calculatedAge !== null && calculatedAge > 25)) {
      return;
    }
    const newConcerns = formData.mainConcerns.includes(concern)
      ? formData.mainConcerns.filter((c: string) => c !== concern)
      : formData.mainConcerns.length < 3 
        ? [...formData.mainConcerns, concern]
        : formData.mainConcerns; // Don't add if already at max (3)
    // Maintain concernPriority in sync: keep relative order of existing, add new at end, remove deselected
    let nextPriority = Array.isArray(formData.concernPriority) ? [...formData.concernPriority] : [];
    // Remove any that are no longer selected
    nextPriority = nextPriority.filter(c => newConcerns.includes(c));
    // Add any newly added at the end
    newConcerns.forEach(c => { if (!nextPriority.includes(c)) nextPriority.push(c); });
    // If Acne is present, force it to index 0
    if (newConcerns.includes('Acne')) {
      nextPriority = ['Acne', ...nextPriority.filter(c => c !== 'Acne')];
    }
    updateFormData({ mainConcerns: newConcerns, concernPriority: nextPriority });
  };

  if (matrixLoadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-4">
        <div className="max-w-md space-y-3">
          <h2 className="text-xl font-semibold text-red-700">We couldn't load the product catalogue.</h2>
          <p className="text-sm text-red-600">
            {matrixLoadError}
          </p>
          <p className="text-sm text-gray-600">
            Check your connection and try again. The dashboard data has to be available before recommendations can be generated.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRetryMatrixLoad}
          className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          disabled={matrixLoading}
        >
          {matrixLoading ? 'Retrying…' : 'Retry loading data'}
        </button>
      </div>
    );
  }

  if (matrixLoading || !matrixReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-3">
        <div className="w-14 h-14 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-semibold text-amber-900">Loading product catalogue…</p>
        <p className="text-sm text-amber-800/80">Fetching the latest routines and products from Supabase.</p>
      </div>
    );
  }

  if (isSubmitted) {
    if (recommendation) {
      return (
        <RecommendationDisplay 
          recommendation={recommendation}
          userName={formData.name || 'Guest'}
          onComplete={onComplete}
          onSubmit={handleFinalizeSubmit}
          submitting={isSubmitting}
          onBackToEdit={() => setIsSubmitted(false)}
          onRoutineSelect={(_, index) => setRecommendation(prev => (prev ? { ...prev, selectedIndex: index } : prev))}
        />
      );
    }
    
    // Loading state while generating recommendations
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Generating Your Skincare Routine...</h1>
          <p className="text-gray-600">Please wait while we create personalized recommendations for you.</p>
        </div>
      </div>
    );
  }

  const renderConcernFollowUp = (concern: string, stepType: 'type' | 'severity' | 'sensitivity-question', questionIndex?: number) => {
    // Common props for all concern components
    const stepProps = {
      formData,
      updateFormData,
      errors,
    };

    // Acne concern
    if (concern === 'Acne') {
      if (stepType === 'type') {
        return <AcneTypeStep {...stepProps} />;
      }
      if (stepType === 'severity') {
        return <AcneSeverityStep {...stepProps} />;
      }
    }

    // Pigmentation concern
    if (concern === 'Pigmentation') {
      if (stepType === 'type') {
        return <PigmentationTypeStep {...stepProps} />;
      }
      if (stepType === 'severity') {
        return <PigmentationSeverityStep {...stepProps} />;
      }
    }

    // Post Acne Scarring concern
    if (concern === 'Post Acne Scarring') {
      if (stepType === 'type') {
        return <ScarringTypeStep {...stepProps} />;
      }
      if (stepType === 'severity') {
        return <ScarringSeverityStep {...stepProps} />;
      }
    }

    // Simple concerns (only severity, no type)
    if (concern === 'Fine lines & wrinkles') {
      return <WrinklesStep {...stepProps} />;
    }

    if (concern === 'Large pores') {
      return <PoresStep {...stepProps} />;
    }

    if (concern === 'Bumpy skin') {
      return <TextureStep {...stepProps} />;
    }

    // Fallback for unsupported concerns
    return null;
  };


  const renderStep = () => {
    const currentConcernStep = getCurrentConcernStep();

    // Handle dynamic concern follow-up steps
    if (currentConcernStep && typeof currentConcernStep === 'object') {
      return renderConcernFollowUp(
        currentConcernStep.concern, 
        currentConcernStep.step, 
        currentConcernStep.questionIndex
      );
    }

    // Handle individual lifestyle questions
    // Common props for all step components
    const stepProps = {
      formData,
      updateFormData,
      errors,
    };

    // Concern priority step
    if (currentConcernStep === 'concern-priority') {
      return <ConcernPriorityStep {...stepProps} />;
    }
    // Section E - Lifestyle questions REMOVED (diet, water-intake, sleep-hours, stress-levels, environment)

    // Preference steps
    if (currentConcernStep === 'routine-steps') {
      return <RoutineStepsStep {...stepProps} />;
    }

    if (currentConcernStep === 'serum-comfort') {
      return <SerumComfortStep {...stepProps} />;
    }

    // Legal disclaimer step
    if (currentConcernStep === 'legal-disclaimer') {
      return <LegalDisclaimerStep {...stepProps} />;
    }

    // brand-preference UI removed

    // Handle base steps (1-19) using extracted components
    switch (currentStep) {
      // Personal Info (Steps 1-4)
      case 1:
        return <NameStep {...stepProps} />;

      case 2:
        return <PhoneStep {...stepProps} />;

      case 3:
        return <DateOfBirthStep {...stepProps} />;

      case 4:
        return <GenderStep {...stepProps} />;

      // Safety Gates (Steps 5-9)
      case 5:
        return <PregnancyStep {...stepProps} />;

      case 6:
        return <IsotretinoinStep {...stepProps} />;

      case 7:
        return <SevereCysticAcneStep {...stepProps} />;

      case 8:
        return <AllergyConflictStep {...stepProps} />;

      case 9:
        return <BarrierStressStep {...stepProps} />;

      // Skin Basics (Steps 10-12)
      case 10:
        return <SkinTypeStep {...stepProps} />;

      case 11:
        return <OilLevelsStep {...stepProps} />;

      case 12:
        return <HydrationLevelsStep {...stepProps} />;

      // Sensitivity Screening (Step 13)
      case 13:
        return <SensitivityScreeningStep {...stepProps} />;

      // History (Steps 14-16)
      case 14:
        return <DiagnosedConditionsStep {...stepProps} />;

      case 15:
        return <PrescriptionTreatmentsStep {...stepProps} />;

      case 16:
        return <ProfessionalTreatmentsStep {...stepProps} />;

      // Current Products (Steps 17-18)
      case 17:
        return <CurrentProductsStep {...stepProps} />;

      case 18:
        return <IrritatingProductsStep {...stepProps} />;

      // Main Concerns (Step 19)
      case 19:
        return <MainConcernsStep {...stepProps} handleConcernToggle={handleConcernToggle} />;

      default:
        return null;
    }
  };

  const totalSteps = getTotalSteps();

  if (isSubmitted) {
    if (recommendation) {
      return (
        <RecommendationDisplay
          recommendation={recommendation}
          onComplete={onComplete}
          onSubmit={handleFinalizeSubmit}
          submitting={isSubmitting}
          onBackToEdit={() => setIsSubmitted(false)}
        />
      );
    }

    // Loading state while generating recommendations
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-6">
        <div className="bg-surface/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6 animate-pulse">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Generating Your Skincare Routine...</h1>
          <p className="text-muted-foreground">Please wait while we create personalized recommendations for you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-[1000px] mx-auto px-6 py-8 md:px-8">
        {/* Dev: Sidebar Toggle Button - Only visible on mobile/tablet */}
        {machine && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`fixed top-32 z-50 bg-surface/90 backdrop-blur border border-border/60 hover:bg-surface text-foreground p-3 rounded-lg shadow-xl transition-all lg:hidden ${
              isSidebarOpen ? 'right-[21rem]' : 'right-4'
            }`}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        )}

        {/* Dev: Machine Bands Sidebar - Slides in from right (Development only) */}
        {import.meta.env.DEV && machine && (
          <>
            {/* Overlay for mobile */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar Panel */}
            <div
              className={`fixed top-24 right-0 w-80 z-50 h-[calc(100vh-6rem)] bg-surface/95 backdrop-blur-xl border-l border-border/60 shadow-2xl transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
              }`}
            >
              <div className="h-full overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--primary)) hsl(var(--muted))' }}>
            <Collapsible open={isMachineBandOpen} onOpenChange={setIsMachineBandOpen}>
              <div className="bg-surface/80 backdrop-blur border border-border/60 rounded-xl shadow-xl overflow-hidden">
                <CollapsibleTrigger className="w-full px-4 py-2 bg-primary/10 text-foreground text-sm font-semibold flex items-center justify-between hover:bg-primary/20 transition-colors">
                  <span>Machine Bands (Dev)</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMachineBandOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 text-sm text-foreground/90 space-y-1">
                <div><span className="font-medium text-primary">Moisture:</span> {machine.moisture || '-'} {machineRaw?.moisture !== undefined && <span className="text-muted-foreground">(val: {String(machineRaw.moisture)})</span>}</div>
                <div><span className="font-medium text-primary">Sebum:</span> {machine.sebum || '-'} {machineRaw?.sebum !== undefined && <span className="text-muted-foreground">(val: {String(machineRaw.sebum)})</span>}</div>
                <div><span className="font-medium text-primary">Texture:</span> {machine.texture || '-'} {machineRaw?.texture !== undefined && <span className="text-muted-foreground">(val: {String(machineRaw.texture)})</span>}</div>
                <div><span className="font-medium text-primary">Texture (Aging):</span> {machine.textureAging || '-'} {machineRaw?.texture_aging !== undefined && <span className="text-muted-foreground">(val: {String(machineRaw.texture_aging)})</span>}</div>
                <div><span className="font-medium text-primary">Texture (Bumpy):</span> {machine.textureBumpy || '-'} {machineRaw?.texture_bumpy !== undefined && <span className="text-muted-foreground">(val: {String(machineRaw.texture_bumpy)})</span>}</div>
                <div><span className="font-medium text-primary">Pores:</span> {machine.pores || '-'} {machineRaw?.pores !== undefined && <span className="text-muted-foreground">(val: {String(machineRaw.pores)})</span>}</div>
                <div><span className="font-medium text-primary">Acne:</span> {machine.acne || '-'} {machineRaw?.acne !== undefined && <span className="text-muted-foreground">(val: {String(machineRaw.acne)})</span>}</div>
                {machine.acneDetails?.breakouts?.length ? (
                  <div className="text-xs text-muted-foreground/80 pl-2 space-y-1">
                    {machine.acneDetails.breakouts.map((entry, idx) => (
                      <div key={`${entry.type || 'type'}-${idx}`}>
                        • {entry.type || 'Type'}{entry.severity ? ` — ${entry.severity}` : ''}{entry.category ? ` (${entry.category})` : ''}
                      </div>
                    ))}
                  </div>
                ) : null}
                {(() => {
                  const order: any = { green: 0, blue: 1, yellow: 2, red: 3 }
                  const b = machine.pigmentation_brown as any
                  const r = machine.pigmentation_red as any
                  const combined = (b && r)
                    ? (order[b] >= order[r] ? b : r)
                    : (b || r || '-')
                  return (
                    <div><span className="font-medium text-primary">Pigmentation:</span> {combined}</div>
                  )
                })()}
                <div><span className="font-medium text-primary">Sensitivity:</span> {machine.sensitivity || '-'} {machineRaw?.sensitivity !== undefined && <span className="text-muted-foreground">(val: {String(machineRaw.sensitivity)})</span>}</div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
            <Collapsible open={isEffectiveBandOpen} onOpenChange={setIsEffectiveBandOpen}>
              <div className="bg-surface/80 backdrop-blur border border-border/60 rounded-xl shadow-xl overflow-hidden">
                <CollapsibleTrigger className="w-full px-4 py-2 bg-primary/10 text-foreground text-sm font-semibold flex items-center justify-between hover:bg-primary/20 transition-colors">
                  <span>Effective Bands (Dev)</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isEffectiveBandOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 text-sm text-foreground/90 space-y-1">
                <div><span className="font-medium text-primary">Moisture:</span> {effectiveBands?.moisture || '-'}</div>
                <div><span className="font-medium text-primary">Sebum:</span> {effectiveBands?.sebum || '-'}</div>
                <div><span className="font-medium text-primary">Texture:</span> {effectiveBands?.texture || '-'}</div>
                <div><span className="font-medium text-primary">Pores:</span> {effectiveBands?.pores || '-'}</div>
                <div><span className="font-medium text-primary">Acne:</span> {effectiveBands?.acne || '-'}</div>
                <div>
                  <span className="font-medium">Acne categories:</span>{' '}
                  {(() => {
                    const breakouts = Array.isArray(formData.acneBreakouts) ? formData.acneBreakouts : []
                    const cats = Array.from(
                      new Set(
                        breakouts
                          .map(item => deriveAcneCategory(item.type) || item.category)
                          .filter(Boolean)
                      )
                    )
                    return cats.length ? cats.join(', ') : '-'
                  })()}
                </div>
                {(() => {
                  const order: any = { green: 0, blue: 1, yellow: 2, red: 3 }
                  const b = effectiveBands?.pigmentation_brown as any
                  const r = effectiveBands?.pigmentation_red as any
                  const combined = (b && r)
                    ? (order[b] >= order[r] ? b : r)
                    : (b || r || '-')
                  return (
                    <div><span className="font-medium">Pigmentation:</span> {combined}</div>
                  )
                })()}
                <div><span className="font-medium">Sensitivity:</span> {effectiveBands?.sensitivity || '-'}{computedSensitivity ? <span className="text-gray-600"> (score: {computedSensitivity.score} — {computedSensitivity.remark})</span> : null}</div>
                <div className="pt-2">
                  <div className="text-xs text-gray-600 mb-1">Flags</div>
                  <div className="flex flex-wrap gap-1">
                    {formData.skinType && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs border border-blue-200">{formData.skinType}</span>
                    )}
                    {Array.from(new Set(decisions.flatMap(d => d.flags || []))).map(f => {
                      const label = f.replace(/^Grease\s*:/i, 'Sebum:')
                      return (
                        <span key={f} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs border border-amber-200">{label}</span>
                      )
                    })}
                    {decisions.length === 0 && !formData.skinType && <span className="text-gray-400">—</span>}
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-gray-600 mb-1">Safety</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(decisions.flatMap(d => d.safety || []))).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs border border-red-200">{s}</span>
                    ))}
                    {decisions.length === 0 && <span className="text-gray-400">—</span>}
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-gray-600 mb-1">Remarks</div>
                  <div className="space-y-1">
                    {(() => {
                      const fromDecisions = Array.from(new Set(decisions.map(d => (d.verdict || '').trim()).filter(Boolean)))
                      const extra: string[] = []
                      const wt = String((formData as any).wrinklesType || '').toLowerCase()
                      if (wt.includes('yellow') || wt.includes('red')) {
                        extra.push('Follow anti-aging routine.')
                      }
                      // Add acne category tags to Remarks
                      if (Array.isArray((formData as any).acneBreakouts)) {
                        const breakoutCategories = ((formData as any).acneBreakouts as any[])
                          .map(entry => deriveAcneCategory(entry.type) || entry.category)
                          .filter(Boolean)
                        breakoutCategories.forEach(cat => extra.push(cat as string))
                      }
                      // Add Post Acne Scarring remark if selected
                      const scarringSubtype = (formData as any).postAcneScarringSubtype
                      const scarringColor = (formData as any).postAcneScarringSeverity || (formData as any).postAcneScarringColor
                      if (scarringSubtype && scarringColor) {
                        extra.push(`Post Acne Scarring: ${scarringSubtype} (${scarringColor})`)
                      }
                      // Add gate remarks
                      gateRemarks.forEach(remark => extra.push(remark))
                      const all = Array.from(new Set([...fromDecisions, ...extra]))
                      if (all.length === 0) return <span className="text-gray-400">-</span>
                      return (
                        <div className="space-y-1">
                          {all.map(r => (
                            <div key={r} className="text-gray-700 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1">{r}</div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
            {/* Editable Follow-ups list for quick access */}
            <div className="bg-white/95 border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold">Follow-ups (Editable)</div>
              <div className="p-4 text-sm text-gray-800 space-y-2">
                {(() => {
                  const qsets = getFollowUpsRt((machine as any) || {}, (runtimeSelf as any) || {}).filter(q => isCategoryReady(q.category as any, q.dimension as any))
                  const items = qsets.filter(q => q.questions && q.questions.length)
                  if (items.length === 0) return <div className="text-gray-400">None</div>
                  return items.map(q => (
                    <div key={q.ruleId} className="flex items-center justify-between">
                      <div className="truncate pr-2">{q.category === 'Grease' ? 'Sebum' : q.category}{q.dimension ? ` (${q.dimension})` : ''}</div>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs border border-amber-300 text-amber-700 rounded hover:bg-amber-50"
                        onClick={() => {
                          setActiveFollowUp({ ruleId: q.ruleId, category: q.category as any, dimension: q.dimension as any, questions: q.questions || [] })
                          setFollowUpLocal(followUpAnswers[q.ruleId] || {})
                        }}
                      >
                        {followUpAnswers[q.ruleId] ? 'Edit' : 'Answer'}
                      </button>
                    </div>
                  ))
                })()}
              </div>
            </div>
              </div>
            </div>
          </>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-foreground/70 hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Profile Selection</span>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground bg-clip-text">Updated Client Consult</h1>
            <button
              onClick={fillWithDummyData}
              className="mt-2 px-3 py-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
              type="button"
              title="Fill only empty fields with sample data, keeping your existing entries"
            >
              Fill Remaining (Test)
            </button>
          </div>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Progress Indicator - Sleek Modern Theme */}
        <div className="max-w-6xl mx-auto mb-8 animate-fade-in">
          <div className="bg-surface/80 backdrop-blur-xl rounded-2xl p-5 border border-border/60 shadow-xl">
            {/* Step Counter */}
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-3 font-light">
              <span>
                Step <span className="text-primary font-medium">{currentStep}</span> of {totalSteps}
              </span>
              <span className="text-primary font-medium">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content - Dark Theme Container */}
        <form onSubmit={handleFormSubmit} onKeyDownCapture={handleEnterAdvance} className="max-w-6xl mx-auto bg-transparent rounded-2xl min-h-[600px] flex flex-col">
          <div className="flex-1 p-8">
            {!activeFollowUp && renderStep()}
            {activeFollowUp && (
              <div className="w-full mx-auto">
                <div className="bg-surface/95 rounded-2xl shadow-sm border border-border p-8">
                  <div className="px-6 py-4 border-b border-border bg-secondary/50 rounded-t-xl -mx-8 -mt-8 mb-6">
                    <div className="text-base font-medium text-foreground">Follow-up: {activeFollowUp.category === 'Grease' ? 'Sebum' : activeFollowUp.category}{activeFollowUp.dimension ? ` (${activeFollowUp.dimension})` : ''}</div>
                    <div className="text-xs text-muted-foreground font-light">Resolve machine vs customer difference</div>
                  </div>
                  <div className="px-6 py-5 space-y-5">
                    {activeFollowUp.questions.map((q) => {
                      // Conditional rendering: Skip Q2a if Q2 is not "Yes"
                      if (q.id === 'Q2a' && followUpLocal['Q2'] !== 'Yes') {
                        return null;
                      }
                      
                      // Conditional rendering: Skip Q4 (dandruff question) if Q1 is not "Forehead" in texture_machineBumpy_customerSmooth
                      if (q.id === 'Q4' && activeFollowUp.ruleId === 'texture_machineBumpy_customerSmooth' && followUpLocal['Q1'] !== 'Forehead') {
                        return null;
                      }
                      
                      // Conditional rendering: Skip Q3 (dandruff question) if Q2 is not "Forehead" in texture_machineSmooth_customerBumpy
                      if (q.id === 'Q3' && activeFollowUp.ruleId === 'texture_machineSmooth_customerBumpy' && followUpLocal['Q2'] !== 'Forehead') {
                        return null;
                      }
                      
                      return (
                      <div key={q.id}>
                        <div className="text-sm font-medium text-foreground mb-2">{q.prompt}</div>
                        {!q.multi ? (
                          <div className="flex flex-wrap gap-2">
                            {q.options.map(opt => (
                              <button
                                type="button"
                                key={opt}
                                onClick={() => toggleFollowUpOption(q.id, opt, false)}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all duration-300 ${followUpLocal[q.id] === opt ? 'bg-primary/20 border-primary text-foreground shadow-lg shadow-primary/30' : 'bg-muted/50 border-border text-foreground/80 hover:bg-muted hover:border-border/80'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {q.options.map(opt => {
                              const arr = Array.isArray(followUpLocal[q.id]) ? (followUpLocal[q.id] as string[]) : []
                              const selected = arr.includes(opt)
                              return (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() => toggleFollowUpOption(q.id, opt, true)}
                                  className={`px-3 py-2 rounded-lg border text-sm transition-all duration-300 ${selected ? 'bg-amber-900/40 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/30' : 'bg-gray-800/40 border-gray-600/50 text-gray-300 hover:bg-gray-700/60 hover:border-gray-500/60'}`}
                                >
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}          </div>

          {/* Navigation - Minimal luxury button layout */}
          <div className="flex justify-between items-center px-0 py-8 gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-all duration-200 group ${
                currentStep === 1
                  ? 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-sm'
              }`}
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
              <span>Back</span>
            </button>

            {!activeFollowUp ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium text-base hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group min-w-[140px] justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === totalSteps ? 'Submit' : (followUp ? 'Resolve Follow-up' : 'Next')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitFollowUp}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium text-base hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatedConsultForm;
