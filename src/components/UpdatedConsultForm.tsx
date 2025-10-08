import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, ArrowLeft, ArrowRight, FileText, Droplets, Shield, Heart, Sparkles, Sun, Clock } from 'lucide-react';
import { DatePicker } from '@mantine/dates';
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
import ProductAutocomplete from './ProductAutocomplete';
import { SKIN_TYPE_OPTIONS } from '../lib/consultAutoFill';
import { generateRecommendations, RecommendationContext } from '../services/recommendationEngine';
import RecommendationDisplay from './RecommendationDisplay';

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

const ACNE_TYPE_OPTIONS = [
  'Blackheads (tiny dark dots in pores)',
  'Whiteheads (small white bumps under the skin)',
  'Red pimples (inflamed, sometimes pus-filled)',
  'Large painful bumps (deep cystic acne)',
  'Mostly around jawline/chin, often before periods (hormonal)',
];

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
    
    return base as UpdatedConsultData
  }

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UpdatedConsultData>(buildInitialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [decisionAuditState, setDecisionAuditState] = useState<any>(null);
  const [triageOutcomesState, setTriageOutcomesState] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // RULE_SPECS runtime state
  const [runtimeSelf, setRuntimeSelf] = useState<any>({});
  // queued follow-up (next to show when user clicks Next)
  const [followUp, setFollowUp] = useState<null | { ruleId: string; category: string; dimension?: 'brown'|'red'; questions: Array<{ id: string; prompt: string; options: string[]; multi?: boolean }> }>(null);
  // active follow-up currently being displayed
  const [activeFollowUp, setActiveFollowUp] = useState<null | { ruleId: string; category: string; dimension?: 'brown'|'red'; questions: Array<{ id: string; prompt: string; options: string[]; multi?: boolean }> }>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, Record<string, string | string[]>>>({});
  const [followUpLocal, setFollowUpLocal] = useState<Record<string, string | string[]>>({});
  // Drafts store in-progress answers for each follow-up (not yet submitted)
  const [followUpDrafts, setFollowUpDrafts] = useState<Record<string, Record<string, string | string[]>>>({});
  const [pendingAutoFill, setPendingAutoFill] = useState<null | { answers: Record<string, Record<string, string | string[]>> }>(null);
  // Track order of applied follow-up decisions to support undo on Back (removed for now)
  const [effectiveBands, setEffectiveBands] = useState<any>(machine || {});
  const [computedSensitivity, setComputedSensitivity] = useState<{ score: number; tier: string; band: string; remark: string } | null>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [gateRemarks, setGateRemarks] = useState<string[]>([]);

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
  const isCategoryReady = (category: string, _dimension?: 'brown' | 'red') => {
    const concerns: string[] = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : []
    const acneBreakouts = Array.isArray(formData.acneBreakouts) ? formData.acneBreakouts : []
    switch (category) {
      case 'Acne':
        // Only ready if Acne is a selected concern and required fields are filled
        if (!concerns.includes('Acne')) return false
        if (!acneBreakouts.length) return false
        return acneBreakouts.every(item => String(item.type || '').trim() && String(item.severity || '').trim())
      case 'Pigmentation':
        // Only ready if Pigmentation is selected and type/severity provided
        return concerns.includes('Pigmentation') && (
          String(formData.pigmentationType || '').trim() && String(formData.pigmentationSeverity || '').trim()
        )
      case 'Texture': {
        const wantsWrinkles = concerns.includes('Fine lines & wrinkles')
        const wantsBumpy = concerns.includes('Bumpy skin')
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

  const updateFormData = (updates: Partial<UpdatedConsultData>) => {
    // If skinType is being updated, also update skinTypeFlag
    if (updates.skinType) {
      updates.skinTypeFlag = deriveSkinTypeFlag(updates.skinType);
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors when user starts typing
    Object.keys(updates).forEach(key => {
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
        case 'Texture': mBand = norm(m.texture); sBand = norm(self.texture); break
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
          extra = [norm(formData.textureType), norm(formData.wrinklesType)].join('~')
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
        case 'Texture': bandValue = norm(m.texture) || norm(self.texture); break
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
    setEffectiveBands({ ...m, ...updates, sensitivity: sens.band })
    setFollowUpAnswers(filteredAnswers)
    } catch (error) {
      console.error('Failed to recompute engine:', error);
      // Set fallback state to prevent crashes
      setEffectiveBands(machine || {});
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

  // When concerns are deselected, proactively drop answers/drafts for rules from those categories
  useEffect(() => {
    const concerns: string[] = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : []
    // Build ruleId -> category using latest runtime self/machine
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
      // Prune answers that belong to categories no longer selected
      const prunedAnswers: typeof followUpAnswers = {}
      let changed = false
      for (const [rid, ans] of Object.entries(followUpAnswers)) {
        const cat = ruleToCategory[rid] || ''
        if (isCategorySelected(cat)) {
          prunedAnswers[rid] = ans
        } else {
          changed = true
        }
      }
      if (changed) {
        setFollowUpAnswers(prunedAnswers)
        // Also drop any drafts for deselected categories
        setFollowUpDrafts(prev => {
          const next: typeof prev = {}
          for (const [rid, ans] of Object.entries(prev)) {
            const cat = ruleToCategory[rid] || ''
            if (isCategorySelected(cat)) next[rid] = ans
          }
          return next
        })
        // Recompute with pruned answers to reflect band reversion immediately
        recomputeEngine(prunedAnswers)
      }
    } catch (e) {
      // non-fatal; keep going
      console.warn('Failed to prune deselected concern answers:', e)
    }
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
      // Ensure all questions answered
      const allAnswered = (activeFollowUp.questions || []).every(q => 
        followUpLocal[q.id] !== undefined && 
        (Array.isArray(followUpLocal[q.id]) 
          ? (followUpLocal[q.id] as any[]).length > 0 
          : String(followUpLocal[q.id]).length > 0
        )
      );
      if (!allAnswered) return; // required
      
      const ruleId = activeFollowUp.ruleId;
      const decision = decideBandRt(ruleId, followUpLocal, { 
        dateOfBirth: formData.dateOfBirth, 
        pregnancyBreastfeeding: formData.pregnancyBreastfeeding 
      } as any) || { updates: {} };
      
      setDecisions(prev => [...prev, { ruleId, ...decision, decidedAt: new Date().toISOString(), specVersion: 'live' }]);
      setEffectiveBands((prev: any) => ({ ...prev, ...(decision.updates || {}) }));
      
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
    
    // Add lifestyle questions: 5 (diet, water, sleep, stress, environment)
    totalSteps += 5;
    
  // Add preference questions: 3 (routine-steps, serum-comfort, moisturizer-texture)
  totalSteps += 3;
  
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
    setEffectiveBands({ ...allDecisions.effectiveBands, sensitivity: sensitivityResult.band });
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
    
    // Individual lifestyle questions (5 questions)
    if (currentStep === lifestyleStartStep) return 'diet';
    if (currentStep === lifestyleStartStep + 1) return 'water-intake';
    if (currentStep === lifestyleStartStep + 2) return 'sleep-hours';
    if (currentStep === lifestyleStartStep + 3) return 'stress-levels';
    if (currentStep === lifestyleStartStep + 4) return 'environment';
    
  // Individual preference questions (3 questions)
    const preferenceStartStep = lifestyleStartStep + 5;
    if (currentStep === preferenceStartStep) return 'routine-steps';
    if (currentStep === preferenceStartStep + 1) return 'serum-comfort';
    if (currentStep === preferenceStartStep + 2) return 'moisturizer-texture';
    
    // Legal disclaimer
    if (currentStep === preferenceStartStep + 3) return 'legal-disclaimer';
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
        if (!formData.pregnancy || formData.pregnancy.trim() === '') newErrors.pregnancy = 'Please answer the pregnancy question';
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
      case 13: // Sensitivity Screening (everyone answers 7)
        {
          const sensitivityFields = [
            'sensitivityRedness',
            'sensitivityDiagnosis',
            'sensitivityCleansing',
            'sensitivityProducts',
            'sensitivitySun',
            'sensitivityCapillaries',
            'sensitivitySeasonal'
          ] as const;
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
        // Individual lifestyle questions
        if (currentConcernStep === 'concern-priority') {
          // Must have a ranking assigned for all selected concerns
          const selected = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : [];
          const order = Array.isArray(formData.concernPriority) ? formData.concernPriority : [];
          const acnePinnedOk = !selected.includes('Acne') || order[0] === 'Acne';
          const coveredAll = selected.every(c => order.includes(c)) && order.length === selected.length;
          if (!acnePinnedOk) newErrors.concernPriority = 'Acne must be the top priority when selected.';
          else if (!coveredAll) newErrors.concernPriority = 'Please order all selected concerns.';
        }
        if (currentConcernStep === 'diet') {
          if (!formData.diet.trim()) newErrors.diet = 'Please select your diet type';
        } else if (currentConcernStep === 'water-intake') {
          if (!formData.waterIntake.trim()) newErrors.waterIntake = 'Please select your water intake level';
        } else if (currentConcernStep === 'sleep-hours') {
          if (!formData.sleepHours.trim()) newErrors.sleepHours = 'Please select your sleep hours';
        } else if (currentConcernStep === 'stress-levels') {
          if (!formData.stressLevels.trim()) newErrors.stressLevels = 'Please select your stress level';
        } else if (currentConcernStep === 'environment') {
          if (!formData.environment.trim()) newErrors.environment = 'Please select your environment type';
        // Individual preference questions
        } else if (currentConcernStep === 'routine-steps') {
          if (!formData.routineSteps.trim()) newErrors.routineSteps = 'Please select your preferred routine steps';
        } else if (currentConcernStep === 'serum-comfort') {
          if (!formData.serumComfort.trim()) newErrors.serumComfort = 'Please select your serum comfort level';
        } else if (currentConcernStep === 'moisturizer-texture') {
          if (!formData.moisturizerTexture.trim()) newErrors.moisturizerTexture = 'Please select your preferred moisturizer texture';
        } else if (currentConcernStep === 'legal-disclaimer') {
          const allChecked = formData.legalDisclaimerNotMedical && formData.legalDisclaimerConsultDermatologist && formData.legalDisclaimerPatchTest && formData.legalDisclaimerDiscontinueUse && formData.legalDisclaimerDiscloseInfo && formData.legalDisclaimerNoLiability;
          if (!allChecked) newErrors.legalDisclaimerAgreed = 'You must acknowledge all disclaimer points to continue';
        // brand-preference validation removed
        } else if (currentConcernStep && typeof currentConcernStep === 'object') {
          const { concern, step: stepType, questionIndex } = currentConcernStep as any;
          if (stepType === 'sensitivity-question' && typeof questionIndex === 'number') {
        const sensitivityFields = [
            'sensitivityRedness',
            'sensitivityDiagnosis',
            // Mapped to very-dry-baseline (repurposed key)
            'sensitivityCleansing',
            'sensitivityProducts',
            'sensitivitySun',
            'sensitivityCapillaries',
            // Mapped to age-under-20 (repurposed key)
            'sensitivitySeasonal'
          ];
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
              }
              const base = baseMap[concern] || concern.toLowerCase().replace(/[^a-z]/g, '')
              const concernsWithType = ['Pigmentation']
              let key = ''
              if (stepType === 'type') {
                key = base + 'Type'
              } else if (stepType === 'severity') {
                if (concernsWithType.includes(concern)) {
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
        setCurrentStep(prev => prev + 1);
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
      setCurrentStep(prev => prev - 1);
      return
    }
    // At the first step, delegate to external back handler (if any)
    try {
      onBack();
    } catch (e) {
      console.warn('onBack handler failed:', e)
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
      let effectiveForContext: any = effectiveBands && Object.keys(effectiveBands || {}).length ? effectiveBands : (decisionAudit.effectiveBands || {});
      try {
        const sens = computeSensitivityFromForm(formData as any, { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding } as any);
        effectiveForContext = { ...(effectiveForContext || {}), sensitivity: sens.band };
      } catch {}

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

      const recommendationContext: RecommendationContext = {
        skinType: formData.skinType,
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
          severeCysticAcne: formData.severeCysticAcne
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
      const payload = { ...(formData as any), triageOutcomes: triageOutcomesState, decisionAudit: decisionAuditState };
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
    // Maps a follow-up step to the form field key and UI copy
    const getFieldInfo = (
      c: string,
      s: 'type' | 'severity' | 'sensitivity-question',
      qIdx?: number
    ): { fieldKey: string | null; title: string; subtitle?: string } => {
      // Sensitivity universal screening (rarely routed here, but supported)
      if (s === 'sensitivity-question') {
        const sensitivityFields = [
          'sensitivityRedness',
          'sensitivityDiagnosis',
          'sensitivityCleansing',
          'sensitivityProducts',
          'sensitivitySun',
          'sensitivityCapillaries',
          'sensitivitySeasonal'
        ] as const;
        const titles = [
          'Do you flush or turn red easily?',
          'Have you been told by a professional you have “sensitive skin” or rosacea?',
          'Does your skin sting/burn when cleansing?',
          'Do many new products irritate your skin?',
          'Does sun exposure make your skin red or itchy?',
          'Do you see visible capillaries or broken veins?',
          'Is your skin more reactive in certain seasons?'
        ];
        const idx = typeof qIdx === 'number' ? qIdx : 0;
        const fieldKey = sensitivityFields[idx] ?? sensitivityFields[0];
        const title = titles[idx] ?? titles[0];
        return { fieldKey, title, subtitle: 'Choose Yes or No' };
      }

      // Helper to normalize base key
      const baseMap: Record<string, string> = {
        'Acne': 'acne',
        'Pigmentation': 'pigmentation',
        'Fine lines & wrinkles': 'wrinkles',
        'Large pores': 'pores',
        'Bumpy skin': 'texture',
        'Oiliness': 'oiliness',
        'Dryness': 'dryness',
      };
      const base = baseMap[c] || c.toLowerCase().replace(/[^a-z]/g, '');

      // Acne has custom UI (array-based); we only need headings
      if (c === 'Acne') {
        if (s === 'type') {
          return {
            fieldKey: null,
            title: 'What kinds of breakouts do you get?',
            subtitle: 'Pick all that apply'
          };
        }
        return {
          fieldKey: null,
          title: 'How noticeable are those breakouts?',
          subtitle: 'Choose a severity for each breakout type'
        };
      }

      // Pigmentation has a true type + severity
      if (c === 'Pigmentation') {
        if (s === 'type') {
          return {
            fieldKey: `${base}Type`,
            title: 'What kind of pigmentation is your main concern?',
            subtitle: 'Pick the option that best matches (Red vs Brown)'
          };
        }
        return {
          fieldKey: `${base}Severity`,
          title: 'How noticeable is the pigmentation?',
          subtitle: 'Choose the description closest to what you see'
        };
      }

      // Other concerns only persist into a single *Type* field, even on a “severity” page
      const fieldKey = `${base}Type`;
      let title = 'Tell us a bit more';
      let subtitle: string | undefined = 'Pick the description that fits you best';

      if (c === 'Fine lines & wrinkles') {
        title = 'How noticeable are your lines or sagging?';
      } else if (c === 'Large pores') {
        title = 'How noticeable are your pores?';
      } else if (c === 'Bumpy skin') {
        title = 'How noticeable is the uneven texture?';
      } else if (c === 'Oiliness') {
        title = 'How noticeable is the oiliness?';
      } else if (c === 'Dryness') {
        title = 'How noticeable is the dryness?';
      }

      return { fieldKey, title, subtitle };
    };
    // concernBaseKey not used
    const getAcneTypeBadge = (acneType: string) => {
      if (!acneType) return null;
      
      if (acneType.includes('Blackheads')) return 'Blackheads';
      if (acneType.includes('Whiteheads')) return 'Whiteheads';
      if (acneType.includes('Red pimples')) return 'Inflamed';
      if (acneType.includes('Large painful bumps') || acneType.includes('cystic')) return 'Cystic';
      if (acneType.includes('jawline') || acneType.includes('hormonal')) return 'Hormonal';
      
      return 'Acne';
    };

    const getConcernIcon = (concern: string) => {
      switch (concern) {
        case 'Acne': return <Shield className="w-8 h-8 text-amber-600" />;
        case 'Pigmentation': return <Sun className="w-8 h-8 text-amber-600" />;
  // 'Sensitivity' removed from main concerns; handled via universal screening
  case 'Sensitivity': return <FileText className="w-8 h-8 text-amber-600" />;
        case 'Fine lines & wrinkles': return <Clock className="w-8 h-8 text-amber-600" />;
        case 'Large pores': return <Droplets className="w-8 h-8 text-amber-600" />;
        case 'Bumpy skin': return <Sparkles className="w-8 h-8 text-amber-600" />;
        case 'Oiliness': return <Sun className="w-8 h-8 text-amber-600" />;
        case 'Dryness': return <Droplets className="w-8 h-8 text-amber-600" />;
        default: return <FileText className="w-8 h-8 text-amber-600" />;
      }
    };

    const getConcernOptions = (concern: string, stepType: 'type' | 'severity' | 'sensitivity-question', questionIndex?: number) => {
      if (stepType === 'sensitivity-question' && questionIndex !== undefined) {
        return ['Yes', 'No'];
      }
      switch (concern) {
        case 'Acne':
          return stepType === 'type' ? ACNE_TYPE_OPTIONS : [];
        case 'Pigmentation': {
          if (stepType === 'type') return ['Red', 'Brown'];
          if (stepType === 'severity') {
            const currentType = formData.pigmentationType || '';
            const isRed = /\bred\b|redness/i.test(currentType);
            if (isRed) {
              return [
                'Light red, only in a small area → Blue',
                'Moderate red, noticeable in several zones → Yellow',
                'Bright or deep red, widespread across the face → Red'
              ];
            }
            return [
              'Light brown patches, visible up close but small in size → Blue',
              'Moderate brown spots/patches, noticeable in several areas → Yellow',
              'Dark brown patches, large or widespread across the face → Red'
            ];
          }
          return [];
        }
        case 'Fine lines & wrinkles':
          return stepType === 'severity'
            ? [
                'A few fine lines or slight looseness in some spots → Blue',
                'Wrinkles or sagging you can see in several areas → Yellow',
                "Deep wrinkles or sagging that's easy to notice → Red",
              ]
            : [];
        case 'Large pores':
          return stepType === 'severity'
            ? [
                'Noticeable near the nose or small areas on close inspection → Blue',
                'Clearly visible on multiple zones (nose, cheeks, forehead) → Yellow',
                'Large, obvious pores across much of the face, visible from a distance → Red',
              ]
            : [];
        case 'Bumpy skin':
          return stepType === 'severity'
            ? [
                'A few small areas with bumps or rough patches (like nose or chin) → Blue',
                'Noticeable bumps or uneven texture in several areas of the face → Yellow',
                'Rough or bumpy texture across most of the face → Red',
              ]
            : [];
        default:
          return [];
      }
    };

    const acneBreakouts = Array.isArray(formData.acneBreakouts) ? formData.acneBreakouts : [];
    const toggleAcneBreakout = (option: string) => {
      const exists = acneBreakouts.find(item => item.type === option);
      if (exists) {
        updateFormData({ acneBreakouts: acneBreakouts.filter(item => item.type !== option) });
      } else {
        const category = (deriveAcneCategory(option) || 'Comedonal acne') as AcneCategory;
        updateFormData({ acneBreakouts: [...acneBreakouts, { type: option, severity: '', category }] });
      }
    };

    if (concern === 'Acne') {
      if (stepType === 'type') {
        const { title, subtitle } = getFieldInfo(concern, stepType, questionIndex);
        const options = ACNE_TYPE_OPTIONS;
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8 relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium border border-amber-200">
                <span className="mr-1">{React.cloneElement(getConcernIcon(concern) as React.ReactElement, { className: 'w-4 h-4 text-amber-600' })}</span>
                {concern}
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                {getConcernIcon(concern)}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">{title}</h2>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map(option => {
                  const isSelected = acneBreakouts.some(item => item.type === option);
                  const category = deriveAcneCategory(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleAcneBreakout(option)}
                      className={`px-6 py-4 text-left rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-lg'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{option}</p>
                          <p className="text-sm text-amber-600">{category || 'Acne'}</p>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-amber-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.acneBreakouts && <p className="text-red-500 text-sm mt-2">{errors.acneBreakouts}</p>}
            </div>
          </div>
        );
      }

      if (stepType === 'severity') {
        const { title, subtitle } = getFieldInfo(concern, stepType, questionIndex);
        if (!acneBreakouts.length) {
          return (
            <div className="space-y-12 flex flex-col justify-center h-full py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                  {getConcernIcon(concern)}
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">{title}</h2>
                <p className="text-gray-600">Select at least one breakout type to continue.</p>
              </div>
            </div>
          );
        }

        const setSeverity = (index: number, value: string) => {
          const next = acneBreakouts.map((item, idx) => {
            if (idx !== index) return item;
            const category = (deriveAcneCategory(item.type) || item.category) as AcneCategory;
            return { ...item, severity: value, category };
          });
          updateFormData({ acneBreakouts: next });
        };

        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8 relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium border border-amber-200">
                <span className="mr-1">{React.cloneElement(getConcernIcon(concern) as React.ReactElement, { className: 'w-4 h-4 text-amber-600' })}</span>
                {concern}
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                {getConcernIcon(concern)}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">{title}</h2>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {acneBreakouts.map((item, index) => {
                const severityOptions = getAcneSeverityOptions(item.type);
                const badge = getAcneTypeBadge(item.type);
                return (
                  <div key={`${item.type}-${index}`} className="bg-white/80 border border-amber-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        {badge && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium border border-blue-200">
                            {badge}
                          </span>
                        )}
                        <span className="text-lg font-semibold text-gray-900">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-amber-600">{deriveAcneCategory(item.type)}</span>
                        <button
                          type="button"
                          onClick={() => toggleAcneBreakout(item.type)}
                          className="text-sm text-amber-500 hover:text-amber-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {severityOptions.map(option => {
                        const isSelected = item.severity === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSeverity(index, option)}
                            className={`px-4 py-3 rounded-xl border-2 text-sm transition-all duration-300 ${
                              isSelected
                                ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-lg'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {errors.acneBreakouts && <p className="text-red-500 text-sm">{errors.acneBreakouts}</p>}
            </div>
          </div>
        );
      }
    }

    const { fieldKey, title, subtitle } = getFieldInfo(concern, stepType, questionIndex);
    const fieldValue = (fieldKey ? (formData as any)[fieldKey] : '') as string;
    const options = getConcernOptions(concern, stepType, questionIndex);
    const handleConcernOption = (option: string) => {
      if (!fieldKey) return;
      updateFormData({ [fieldKey]: option } as Partial<UpdatedConsultData>);
    };

    return (
      <div className="space-y-12 flex flex-col justify-center h-full py-8 relative">
        {/* Concern Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium border border-amber-200">
            <span className="mr-1">{React.cloneElement(getConcernIcon(concern) as React.ReactElement, { className: "w-4 h-4 text-amber-600" })}</span>
            {concern}
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
            {getConcernIcon(concern)}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        <div className="max-w-2xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-4">
              {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleConcernOption(option)}
                className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                  fieldValue === option
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {fieldKey && errors[fieldKey] && <p className="text-red-500 text-sm mt-2">{errors[fieldKey]}</p>}
        </div>
      </div>
    );
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
    if (currentConcernStep === 'concern-priority') {
      const selected = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : [];
      let order = Array.isArray(formData.concernPriority) ? formData.concernPriority.filter(c => selected.includes(c)) : [];
      // Ensure all selected present exactly once
      selected.forEach(c => { if (!order.includes(c)) order.push(c); });
      // Enforce Acne at top if selected
      if (selected.includes('Acne')) {
        order = ['Acne', ...order.filter(c => c !== 'Acne')];
      }

      const move = (c: string, dir: -1 | 1) => {
        if (c === 'Acne' && selected.includes('Acne')) return; // Acne pinned
        const idx = order.indexOf(c);
        if (idx < 0) return;
        const newIdx = idx + dir;
        if (newIdx < (selected.includes('Acne') ? 1 : 0) || newIdx >= order.length) return;
        const copy = [...order];
        const [item] = copy.splice(idx, 1);
        copy.splice(newIdx, 0, item);
        updateFormData({ concernPriority: copy });
      };

      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              What would you like to prioritize?
            </h2>
            <p className="text-gray-600">Drag to reorder or use the arrows. Acne stays #1 if selected.</p>
          </div>
          <div className="max-w-xl mx-auto w-full">
            <ul className="space-y-2">
              {order.map((c, idx) => (
                <li key={c} className={`flex items-center justify-between p-3 rounded-xl border ${c==='Acne' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full text-sm font-semibold ${idx===0 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{idx+1}</span>
                    <span className={`text-lg ${c==='Acne' ? 'text-red-700' : 'text-gray-800'}`}>{c}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => move(c, -1)} disabled={idx === (selected.includes('Acne') ? 1 : 0) || c==='Acne'} className="px-2 py-1 text-sm border rounded disabled:opacity-40">↑</button>
                    <button type="button" onClick={() => move(c, 1)} disabled={idx === order.length - 1} className="px-2 py-1 text-sm border rounded disabled:opacity-40">↓</button>
                  </div>
                </li>
              ))}
            </ul>
            {errors.concernPriority && <p className="text-red-500 text-sm mt-2">{errors.concernPriority}</p>}
          </div>
        </div>
      );
    }
    if (currentConcernStep === 'diet') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Heart className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              What type of diet do you follow?
            </h2>
          </div>
          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Balanced', 'Oily/Spicy', 'Vegetarian', 'High Sugar'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="diet"
                    value={option}
                    checked={formData.diet === option}
                    onChange={(e) => updateFormData({ diet: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.diet && <p className="text-red-500 text-sm mt-2">{errors.diet}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'water-intake') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Droplets className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              How much water do you typically drink daily?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Low', 'Medium', 'High'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="waterIntake"
                    value={option}
                    checked={formData.waterIntake === option}
                    onChange={(e) => updateFormData({ waterIntake: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.waterIntake && <p className="text-red-500 text-sm mt-2">{errors.waterIntake}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'sleep-hours') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              How many hours do you sleep on average?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Less than 5', '5-7', '7+'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="sleepHours"
                    value={option}
                    checked={formData.sleepHours === option}
                    onChange={(e) => updateFormData({ sleepHours: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.sleepHours && <p className="text-red-500 text-sm mt-2">{errors.sleepHours}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'stress-levels') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Heart className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              How would you rate your typical stress levels?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Low', 'Medium', 'High'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="stressLevels"
                    value={option}
                    checked={formData.stressLevels === option}
                    onChange={(e) => updateFormData({ stressLevels: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.stressLevels && <p className="text-red-500 text-sm mt-2">{errors.stressLevels}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'environment') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Sun className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              What type of environment do you spend most time in?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Polluted city', 'Humid climate', 'Dry weather', 'Indoors A/C', 'Outdoors sun'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="environment"
                    value={option}
                    checked={formData.environment === option}
                    onChange={(e) => updateFormData({ environment: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.environment && <p className="text-red-500 text-sm mt-2">{errors.environment}</p>}
          </div>
        </div>
      );
    }

    // Handle individual preference questions
    if (currentConcernStep === 'routine-steps') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              How many steps do you want in your skincare routine?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['3-step', '4-step', '5+ step'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="routineSteps"
                    value={option}
                    checked={formData.routineSteps === option}
                    onChange={(e) => updateFormData({ routineSteps: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.routineSteps && <p className="text-red-500 text-sm mt-2">{errors.routineSteps}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'serum-comfort') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Droplets className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              How many serums are you comfortable using?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['1', '2', '3'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="serumComfort"
                    value={option}
                    checked={formData.serumComfort === option}
                    onChange={(e) => updateFormData({ serumComfort: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.serumComfort && <p className="text-red-500 text-sm mt-2">{errors.serumComfort}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'moisturizer-texture') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Droplets className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              What texture do you prefer for your moisturizer?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Gel', 'Lotion', 'Cream', 'Rich Balm'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="moisturizerTexture"
                    value={option}
                    checked={formData.moisturizerTexture === option}
                    onChange={(e) => updateFormData({ moisturizerTexture: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.moisturizerTexture && <p className="text-red-500 text-sm mt-2">{errors.moisturizerTexture}</p>}
          </div>
        </div>
      );
    }

    // Legal Disclaimer
    if (currentConcernStep === 'legal-disclaimer') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Important Legal Disclaimer
            </h2>
            <p className="text-gray-600 mb-6">Please read and acknowledge the following before proceeding:</p>
          </div>

          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Before using this system, I understand and agree:</h3>
              <ul className="space-y-3 text-sm text-red-700">
                <li className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.legalDisclaimerNotMedical}
                    onChange={(e) => updateFormData({ legalDisclaimerNotMedical: e.target.checked })}
                    className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
                  />
                  <span>This tool provides general skincare guidance and is NOT a medical diagnosis</span>
                </li>
                <li className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.legalDisclaimerConsultDermatologist}
                    onChange={(e) => updateFormData({ legalDisclaimerConsultDermatologist: e.target.checked })}
                    className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
                  />
                  <span>I should consult a dermatologist for severe acne, suspicious moles, or worsening conditions</span>
                </li>
                <li className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.legalDisclaimerPatchTest}
                    onChange={(e) => updateFormData({ legalDisclaimerPatchTest: e.target.checked })}
                    className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
                  />
                  <span>I will perform a patch test for all new products before full-face application</span>
                </li>
                <li className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.legalDisclaimerDiscontinueUse}
                    onChange={(e) => updateFormData({ legalDisclaimerDiscontinueUse: e.target.checked })}
                    className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
                  />
                  <span>I will discontinue use immediately if irritation, redness, or allergic reaction occurs</span>
                </li>
                <li className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.legalDisclaimerDiscloseInfo}
                    onChange={(e) => updateFormData({ legalDisclaimerDiscloseInfo: e.target.checked })}
                    className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
                  />
                  <span>I am responsible for disclosing all allergies, medications, and health conditions accurately</span>
                </li>
                <li className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.legalDisclaimerNoLiability}
                    onChange={(e) => updateFormData({ legalDisclaimerNoLiability: e.target.checked })}
                    className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
                  />
                  <span>The salon and software provider are not liable for adverse reactions from product misuse or failure to disclose medical information</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center">
              <label className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-red-300 transition-all duration-300">
                <input
                  type="checkbox"
                  checked={formData.legalDisclaimerNotMedical && formData.legalDisclaimerConsultDermatologist && formData.legalDisclaimerPatchTest && formData.legalDisclaimerDiscontinueUse && formData.legalDisclaimerDiscloseInfo && formData.legalDisclaimerNoLiability}
                  onChange={() => {}} // Read-only, automatically checked when all individual checkboxes are checked
                  className="mr-3 h-5 w-5 text-red-600 border-gray-300 focus:ring-red-400"
                  disabled
                />
                <span className="text-lg text-gray-700">All disclaimer points acknowledged</span>
              </label>
            </div>
            {errors.legalDisclaimerAgreed && <p className="text-red-500 text-sm mt-2 text-center">{errors.legalDisclaimerAgreed}</p>}
          </div>
        </div>
      );
    }

    // brand-preference UI removed

    // Handle base steps (1-14)
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Name
              </h2>
              <p className="text-gray-600">What is your full name?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <input
                ref={currentStep === 1 ? firstInputRef : undefined}
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-amber-400 focus:bg-white focus:outline-none transition-all duration-300"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Phone Number
              </h2>
              <p className="text-gray-600">What is your phone number?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <input
                ref={currentStep === 2 ? firstInputRef : undefined}
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-amber-400 focus:bg-white focus:outline-none transition-all duration-300"
                placeholder="Enter your phone number"
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Date of Birth
              </h2>
              <p className="text-gray-600">What is your date of birth?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="flex justify-center">
                <div className="calendar-wrapper mx-auto w-fit" style={{
                  '--calendar-scale': 1,
                  '--cui-calendar-nav-date-color': '#d97706',
                  '--cui-calendar-nav-date-hover-color': '#92400e',
                  '--cui-calendar-nav-icon-color': '#6b7280',
                  '--cui-calendar-nav-icon-hover-color': '#92400e',
                  '--cui-calendar-nav-icon-width': 'calc(1rem * var(--calendar-scale))',
                  '--cui-calendar-nav-icon-height': 'calc(1rem * var(--calendar-scale))',
                  '--cui-calendar-cell-selected-bg': '#f59e0b',
                  '--cui-calendar-cell-selected-color': '#ffffff',
                  '--cui-calendar-cell-hover-bg': '#fef3c7',
                  '--cui-calendar-cell-hover-color': '#92400e',
                  '--cui-calendar-cell-today-color': '#f59e0b',
                  '--cui-calendar-nav-border-color': '#e5e7eb',
                  '--cui-calendar-cell-focus-box-shadow': '0 0 0 2px rgba(245, 158, 11, 0.3)',
                  '--cui-calendar-table-cell-size': 'calc(2.6rem * var(--calendar-scale))',
                  '--cui-calendar-nav-padding': 'calc(0.35rem * var(--calendar-scale))'
                } as React.CSSProperties}>
                  {/* Helper to format date consistently (local, no TZ shift) */}
                  
                  <DatePicker
                    defaultDate={new Date(2005, 0, 1)}
                    value={formData.dateOfBirth ? (() => {
                      try {
                        const dateStr = formData.dateOfBirth.includes('T') ? formData.dateOfBirth : formData.dateOfBirth + 'T00:00:00';
                        const date = new Date(dateStr);
                        return isNaN(date.getTime()) ? null : date;
                      } catch {
                        return null;
                      }
                    })() : null}
                    onChange={(val) => {
                      let d: any = val as any;
                      if (Array.isArray(d)) {
                        d = d.find(Boolean);
                      }
                      if (d && typeof d.toDate === 'function') {
                        d = d.toDate();
                      } else if (d && d.date) {
                        d = d.date;
                      } else if (typeof d === 'string') {
                        const parsed = new Date(d);
                        d = isNaN(parsed.getTime()) ? null : parsed;
                      }
                      if (!(d instanceof Date)) {
                        return; // ignore unexpected shape
                      }
                      const yyyy = d.getFullYear();
                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                      const dd = String(d.getDate()).padStart(2, '0');
                      updateFormData({ dateOfBirth: `${yyyy}-${mm}-${dd}` });
                    }}
                    getDayProps={(input: any) => {
                      const d = input instanceof Date
                        ? input
                        : input && input.date instanceof Date
                          ? input.date
                          : null;
                      return {
                        onClick: () => {
                          if (!d) return;
                          const yyyy = d.getFullYear();
                          const mm = String(d.getMonth() + 1).padStart(2, '0');
                          const dd = String(d.getDate()).padStart(2, '0');
                          updateFormData({ dateOfBirth: `${yyyy}-${mm}-${dd}` });
                        },
                      };
                    }}
                    defaultLevel="decade"
                    weekendDays={[]}
                    maxDate={new Date()}
                    allowDeselect={false}
                    size="md"
                    aria-label="Date of birth"
                  />
                </div>
              </div>
              {formData.dateOfBirth && (
                <div className="text-center mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Selected Date:</span> {new Date(formData.dateOfBirth).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-2 text-center">{errors.dateOfBirth}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Gender
              </h2>
              <p className="text-gray-600">What is your gender?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Male', 'Female', 'Other'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateFormData({ gender: option })}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.gender === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-sm mt-2">{errors.gender}</p>}
            </div>
          </div>
        );

      // Section 0 - Gates (Steps 5-9)
      case 5: // Pregnancy
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Safety Gate: Pregnancy
              </h2>
              <p className="text-gray-600">Are you currently pregnant or breastfeeding?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Yes', 'No'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleGateChange('pregnancy', option, gateQuestions[0].action)}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.pregnancy === option
                        ? option === 'Yes' 
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-green-400 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.pregnancy && <p className="text-red-500 text-sm mt-2">{errors.pregnancy}</p>}
            </div>
          </div>
        );

      case 6: // Recent Isotretinoin
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Safety Gate: Recent Medication
              </h2>
              <p className="text-gray-600">Have you used isotretinoin (Accutane) in the last 6 months?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Yes', 'No'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleGateChange('recentIsotretinoin', option, gateQuestions[1].action)}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.recentIsotretinoin === option
                        ? option === 'Yes' 
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-green-400 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.recentIsotretinoin && <p className="text-red-500 text-sm mt-2">{errors.recentIsotretinoin}</p>}
            </div>
          </div>
        );

      case 7: // Severe Cystic Acne
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Safety Gate: Severe Acne
              </h2>
              <p className="text-gray-600">Do you have severe or cystic acne that is painful or scarring?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Yes', 'No'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleGateChange('severeCysticAcne', option, gateQuestions[2].action)}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.severeCysticAcne === option
                        ? option === 'Yes' 
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-green-400 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.severeCysticAcne && <p className="text-red-500 text-sm mt-2">{errors.severeCysticAcne}</p>}
            </div>
          </div>
        );

      case 8: // Allergy Conflict
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Safety Gate: Allergies
              </h2>
              <p className="text-gray-600">Do you have any known allergies to skincare ingredients?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Yes', 'No'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleGateChange('allergyConflict', option, gateQuestions[3].action)}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.allergyConflict === option
                        ? option === 'Yes' 
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-green-400 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.allergyConflict && <p className="text-red-500 text-sm mt-2">{errors.allergyConflict}</p>}
            </div>
          </div>
        );

      case 9: // Barrier Stress High
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Safety Gate: Barrier Function
              </h2>
              <p className="text-gray-600">Is your skin currently very irritated, inflamed, or compromised?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Yes', 'No'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleGateChange('barrierStressHigh', option, gateQuestions[4].action)}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.barrierStressHigh === option
                        ? option === 'Yes' 
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-green-400 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.barrierStressHigh && <p className="text-red-500 text-sm mt-2">{errors.barrierStressHigh}</p>}
            </div>
          </div>
        );

      // Section A - Skin Basics (now starts at step 10)
      case 10: // Skin Type
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Droplets className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                What do you think your skin type is?
              </h2>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 gap-4">
                {SKIN_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateFormData({ skinType: option })}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.skinType === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.skinType && <p className="text-red-500 text-sm mt-2">{errors.skinType}</p>}
            </div>
          </div>
        );

      case 11: // Oil Levels
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Sun className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                How would you describe your skin's oil levels?
              </h2>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 gap-4">
                {[
                  'Comfortable, no shine or greasiness → Green',
                  'Slight shine only in T-zone, not bothersome → Blue', 
                  'Noticeable shine in multiple areas → Yellow',
                  'Very greasy/heavy shine across face, frequent blotting/wash needed → Red'
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateFormData({ oilLevels: option })}
                    className={`px-6 py-4 text-left rounded-xl border-2 transition-all duration-300 ${
                      formData.oilLevels === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.oilLevels && <p className="text-red-500 text-sm mt-2">{errors.oilLevels}</p>}
            </div>
          </div>
        );

      case 12: // Hydration Levels
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Droplets className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                How would you describe your skin's hydration levels?
              </h2>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 gap-4">
                {[
                  'Comfortable, no tightness → Green',
                  'Slight tightness or occasional dryness → Blue',
                  'Often feels tight, rough, or flaky → Yellow', 
                  'Always feels very tight, itchy, or cracks/peels → Red'
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateFormData({ hydrationLevels: option })}
                    className={`px-6 py-4 text-left rounded-xl border-2 transition-all duration-300 ${
                      formData.hydrationLevels === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.hydrationLevels && <p className="text-red-500 text-sm mt-2">{errors.hydrationLevels}</p>}
            </div>
          </div>
        );

      case 13: // Sensitivity screening (7 questions for everyone)
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Heart className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
                Sensitivity screening
              </h2>
              <p className="text-gray-600">Please answer the following about your skin.</p>
            </div>

            <div className="max-w-3xl mx-auto w-full space-y-4">
              {[
                {
                  key: 'sensitivityRedness',
                  label: 'Do you often experience redness, burning, or stinging when using skincare products?'
                },
                { key: 'sensitivityDiagnosis', label: 'Have you ever been diagnosed with sensitive skin, rosacea, or eczema?' },
                { key: 'sensitivityCleansing', label: 'Would you describe your skin baseline as very dry (tight, flaky, rough)?' },
                { key: 'sensitivityProducts', label: 'Have you noticed breakouts or irritation with actives (Vitamin C, AHAs, Niacinamide, Retinoids, etc.)?' },
                { key: 'sensitivitySun', label: 'Does your skin get easily irritated by sun, heat, wind, or pollution?' },
                { key: 'sensitivityCapillaries', label: 'Do you have visible broken capillaries or flushing (cheeks, nose, etc.)?' },
                { key: 'sensitivitySeasonal', label: 'Are you under 20 years of age?' }
              ].map((q) => (
                <div key={q.key} className="bg-white/80 border border-amber-200 rounded-2xl p-4">
                  <div className="flex flex-col gap-3">
                    <label className="text-gray-800 font-medium">{q.label}</label>
                    <div className="flex gap-3">
                      {['Yes', 'No'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => updateFormData({ [q.key]: opt } as any)}
                          className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                            ((formData as any)[q.key] || '') === opt
                              ? 'border-amber-400 bg-amber-50 text-amber-700'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {(errors as any)[q.key] && (
                      <p className="text-red-500 text-xs">{(errors as any)[q.key]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // Section B - Current Skin History
      case 14: // Diagnosed Skin Conditions
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Do you have any diagnosed skin conditions?
              </h2>
              <p className="text-gray-500 text-sm">(eczema, psoriasis, rosacea, acne grade, PCOS-related acne, etc.)</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <textarea
                value={formData.diagnosedConditions}
                onChange={(e) => updateFormData({ diagnosedConditions: e.target.value })}
                placeholder="Please describe any diagnosed skin conditions or type 'None' if not applicable..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.diagnosedConditions && <p className="text-red-500 text-sm mt-2">{errors.diagnosedConditions}</p>}
            </div>
          </div>
        );

      case 15: // Prescription Treatments
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Have you used prescription treatments?
              </h2>
              <p className="text-gray-500 text-sm">(Steroids, retinoids, antibiotics, hydroquinone, etc.)</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <textarea
                value={formData.prescriptionTreatments}
                onChange={(e) => updateFormData({ prescriptionTreatments: e.target.value })}
                placeholder="Please describe any prescription treatments you've used or type 'None' if not applicable..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.prescriptionTreatments && <p className="text-red-500 text-sm mt-2">{errors.prescriptionTreatments}</p>}
            </div>
          </div>
        );

      case 16: // Professional Treatments
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Have you had professional treatments in the last 6 months?
              </h2>
              <p className="text-gray-500 text-sm">(Chemical peel, laser, microneedling, facials, etc.)</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <textarea
                value={formData.professionalTreatments}
                onChange={(e) => updateFormData({ professionalTreatments: e.target.value })}
                placeholder="Please describe any professional treatments or type 'None' if not applicable..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.professionalTreatments && <p className="text-red-500 text-sm mt-2">{errors.professionalTreatments}</p>}
            </div>
          </div>
        );

      // Section C - Current Skincare Routine
      case 17: // Current Products
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                What products are you using daily?
              </h2>
              <p className="text-gray-500 text-sm">(cleanser, moisturizer, sunscreen, serum(s), toner, exfoliants, masks, oils)</p>
            </div>

            <div className="max-w-4xl mx-auto w-full">
              {/* Current Product List */}
              <div className="space-y-4 mb-6">
                {formData.currentProductsList && formData.currentProductsList.length > 0 ? (
                  formData.currentProductsList.map((product, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <ProductAutocomplete
                          value={product.name}
                          onChange={(value) => {
                            const updatedProducts = [...(formData.currentProductsList || [])];
                            updatedProducts[index] = { ...product, name: value };
                            updateFormData({ currentProductsList: updatedProducts });
                          }}
                          placeholder="e.g., CeraVe Foaming Cleanser, The Ordinary Niacinamide..."
                          className="w-full"
                        />
                      </div>
                      <div className="w-48">
                        <select
                          value={product.duration}
                          onChange={(e) => {
                            const updatedProducts = [...(formData.currentProductsList || [])];
                            updatedProducts[index] = { ...product, duration: e.target.value };
                            updateFormData({ currentProductsList: updatedProducts });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">How long?</option>
                          <option value="Less than 1 month">Less than 1 month</option>
                          <option value="1-3 months">1-3 months</option>
                          <option value="3-6 months">3-6 months</option>
                          <option value="6-12 months">6-12 months</option>
                          <option value="1-2 years">1-2 years</option>
                          <option value="2+ years">2+ years</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const updatedProducts = formData.currentProductsList?.filter((_, i) => i !== index) || [];
                          updateFormData({ currentProductsList: updatedProducts });
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        type="button"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No products added yet. Click "Add Product" to start.</p>
                  </div>
                )}
              </div>

              {/* Add Product Button */}
              <div className="text-center mb-6">
                <button
                  onClick={() => {
                    const currentList = formData.currentProductsList || [];
                    const newProduct = { name: '', duration: '' };
                    updateFormData({ currentProductsList: [...currentList, newProduct] });
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  type="button"
                >
                  + Add Product
                </button>
              </div>

              {errors.currentProductsList && <p className="text-red-500 text-sm mt-2 text-center">{errors.currentProductsList}</p>}
            </div>
          </div>
        );

      case 18: // Irritating Products
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Any product that caused irritation/breakouts/redness?
              </h2>
              <p className="text-gray-500 text-sm">(Specify)</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <TagInput
                value={(formData as any).productReactionsList || (formData.irritatingProducts ? formData.irritatingProducts.split(',').map(s=>s.trim()).filter(Boolean) : [])}
                onChange={(list) => updateFormData({ irritatingProducts: list.join(', '), productReactionsList: list } as any)}
                placeholder="Type a product, then use a comma or newline"
              />
              {errors.irritatingProducts && <p className="text-red-500 text-sm mt-2">{errors.irritatingProducts}</p>}
            </div>
          </div>
        );

      // Section D - Main Concerns
      case 19: // Main Concerns
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Main Concerns (customer picks 1–3, then gets detailed questions)
              </h2>
              <p className="text-sm text-red-600 mt-2">Selected: {formData.mainConcerns.length}/3</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Acne',
                  'Pigmentation', 
                  'Fine lines & wrinkles',
                  'Large pores',
                  'Bumpy skin'
                ].map((concern) => {
                  const isSelected = formData.mainConcerns.includes(concern);
                  const isDisabled = !isSelected && formData.mainConcerns.length >= 3;
                  
                  return (
                    <label key={concern} className={`flex items-center p-4 bg-gray-50 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-red-400 bg-red-50'
                        : isDisabled 
                        ? 'border-gray-200 cursor-not-allowed opacity-50' 
                        : 'border-gray-200 cursor-pointer hover:border-red-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => handleConcernToggle(concern)}
                        className="mr-3 h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-400 disabled:opacity-50"
                      />
                      <span className={`text-lg ${isDisabled ? 'text-gray-400' : isSelected ? 'text-red-700' : 'text-gray-700'}`}>{concern}</span>
                    </label>
                  );
                })}
              </div>
              {errors.mainConcerns && <p className="text-red-500 text-sm mt-2">{errors.mainConcerns}</p>}
            </div>
          </div>
        );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Dev: Machine Bands Box */}
        {machine && (
          <div className="fixed top-24 right-6 w-80 z-50 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E1 #F1F5F9' }}>
            <div className="bg-white/95 border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold">Machine Bands (Dev)</div>
              <div className="p-4 text-sm text-gray-800 space-y-1">
                <div><span className="font-medium">Moisture:</span> {machine.moisture || '-'} {machineRaw?.moisture !== undefined && <span className="text-gray-500">(val: {String(machineRaw.moisture)})</span>}</div>
                <div><span className="font-medium">Sebum:</span> {machine.sebum || '-'} {machineRaw?.sebum !== undefined && <span className="text-gray-500">(val: {String(machineRaw.sebum)})</span>}</div>
                <div><span className="font-medium">Texture:</span> {machine.texture || '-'} {machineRaw?.texture !== undefined && <span className="text-gray-500">(val: {String(machineRaw.texture)})</span>}</div>
                <div><span className="font-medium">Pores:</span> {machine.pores || '-'} {machineRaw?.pores !== undefined && <span className="text-gray-500">(val: {String(machineRaw.pores)})</span>}</div>
                <div><span className="font-medium">Acne:</span> {machine.acne || '-'} {machineRaw?.acne !== undefined && <span className="text-gray-500">(val: {String(machineRaw.acne)})</span>}</div>
                {machine.acneDetails?.breakouts?.length ? (
                  <div className="text-xs text-gray-600 pl-2 space-y-1">
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
                    <div><span className="font-medium">Pigmentation:</span> {combined}</div>
                  )
                })()}
                <div><span className="font-medium">Sensitivity:</span> {machine.sensitivity || '-'} {machineRaw?.sensitivity !== undefined && <span className="text-gray-500">(val: {String(machineRaw.sensitivity)})</span>}</div>
              </div>
            </div>
            <div className="bg-white/95 border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold">Effective Bands (Dev)</div>
              <div className="p-4 text-sm text-gray-800 space-y-1">
                <div><span className="font-medium">Moisture:</span> {effectiveBands?.moisture || '-'}</div>
                <div><span className="font-medium">Sebum:</span> {effectiveBands?.sebum || '-'}</div>
                <div><span className="font-medium">Texture:</span> {effectiveBands?.texture || '-'}</div>
                <div><span className="font-medium">Pores:</span> {effectiveBands?.pores || '-'}</div>
                <div><span className="font-medium">Acne:</span> {effectiveBands?.acne || '-'}</div>
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
            </div>
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
        )}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-amber-700 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Profile Selection</span>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Updated Client Consult</h1>
            <button
              onClick={fillWithDummyData}
              className="mt-2 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              type="button"
              title="Fill only empty fields with sample data, keeping your existing entries"
            >
              Fill Remaining (Test)
            </button>
          </div>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleFormSubmit} onKeyDownCapture={handleEnterAdvance} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl min-h-[600px] flex flex-col">
          <div className="flex-1 p-8">
            {!activeFollowUp && renderStep()}
            {activeFollowUp && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-amber-200">
                  <div className="px-6 py-4 border-b border-amber-200 bg-amber-50 rounded-t-2xl">
                    <div className="text-base font-semibold text-amber-900">Follow-up: {activeFollowUp.category === 'Grease' ? 'Sebum' : activeFollowUp.category}{activeFollowUp.dimension ? ` (${activeFollowUp.dimension})` : ''}</div>
                    <div className="text-xs text-amber-800/80">Resolve machine vs customer difference</div>
                  </div>
                  <div className="px-6 py-5 space-y-5">
                    {activeFollowUp.questions.map((q) => (
                      <div key={q.id}>
                        <div className="text-sm font-medium text-gray-900 mb-2">{q.prompt}</div>
                        {!q.multi ? (
                          <div className="flex flex-wrap gap-2">
                            {q.options.map(opt => (
                              <button
                                type="button"
                                key={opt}
                                onClick={() => toggleFollowUpOption(q.id, opt, false)}
                                className={`px-3 py-2 rounded-lg border text-sm ${followUpLocal[q.id] === opt ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
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
                                  className={`px-3 py-2 rounded-lg border text-sm ${selected ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                >
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-8 pt-0">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {!activeFollowUp ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === totalSteps ? 'Submit' : (followUp ? 'Resolve Follow-up' : 'Next')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitFollowUp}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatedConsultForm;