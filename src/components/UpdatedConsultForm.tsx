import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, ArrowLeft, ArrowRight, FileText, Droplets, Shield, Heart, Sparkles, Sun, Clock } from 'lucide-react';
import { DatePicker } from '@mantine/dates';
import { saveConsultationData } from '../services/newConsultationService';
import {
  deriveSelfBandsFromForm,
  startSession,
  deriveSelfBands as deriveSelfBandsRt,
  getFollowUpQuestions as getFollowUpsRt,
  decideBandUpdates as decideBandRt,
  decideAllBandUpdates as decideAllRt,
  mergeBands as mergeBandsRt,
} from '../lib/decisionEngine';
import { UpdatedConsultData } from '../types';
import ProductAutocomplete from './ProductAutocomplete';

interface UpdatedConsultFormProps {
  onBack: () => void;
  onComplete: () => void;
  machine?: {
    moisture?: 'green'|'blue'|'yellow'|'red';
    sebum?: 'green'|'blue'|'yellow'|'red';
    texture?: 'green'|'blue'|'yellow'|'red';
    pores?: 'green'|'blue'|'yellow'|'red';
    acne?: 'green'|'blue'|'yellow'|'red';
    pigmentation_brown?: 'green'|'blue'|'yellow'|'red';
    pigmentation_red?: 'green'|'blue'|'yellow'|'red';
    sensitivity?: 'green'|'blue'|'yellow'|'red';
  };
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
  
  // Section A – Skin Basics
  skinType: '',
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
  acneType: '',
  acneSeverity: '',
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
  brandPreference: '',
  budget: '',
  
  // Additional fields
  allergies: '',
  pregnancyBreastfeeding: '',
  medications: '',
};

// Dummy data for testing
const dummyFormData: UpdatedConsultData = {
  // Personal Information
  name: 'Priya Sharma',
  phoneNumber: '9876543210',
  dateOfBirth: '1995-03-15',
  gender: 'Female',
  
  // Section A – Skin Basics
  skinType: 'Combination',
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
  currentProductsList: [
    { name: 'CeraVe Foaming Cleanser', duration: '6 months' },
    { name: 'The Ordinary Niacinamide', duration: '3 months' },
    { name: 'Neutrogena Moisturizer', duration: '1 year' }
  ],
  productDuration: '',
  irritatingProducts: '',
  
  // Section D – Main Concerns
  mainConcerns: ['Acne', 'Pigmentation', 'Large pores'],
  acneType: 'Red pimples (inflamed, sometimes pus-filled)',
  acneSeverity: '',
  acneDuration: '',
  pigmentationType: 'Moderate brown spots/patches, noticeable in several areas → Yellow',
  pigmentationSeverity: '',
  pigmentationDuration: '',
  rednessType: '',
  rednessDuration: '',
  dullnessType: '',
  dullnessDuration: '',
  wrinklesType: '',
  wrinklesDuration: '',
  poresType: 'Clearly visible on multiple zones (nose, cheeks, forehead) → Yellow',
  poresDuration: '',
  oilinessType: '',
  oilinessDuration: '',
  drynessType: '',
  drynessDuration: '',
  
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
  environment: 'Polluted city',
  
  // Section F - Willingness & Preferences
  routineSteps: '4-step',
  serumComfort: '2',
  moisturizerTexture: 'Gel',
  brandPreference: 'Tech-driven',
  budget: '',
  
  // Additional fields
  allergies: 'No known allergies',
  pregnancyBreastfeeding: 'No',
  medications: 'None',
};

const UpdatedConsultForm: React.FC<UpdatedConsultFormProps> = ({ onBack, onComplete, machine, machineRaw, sessionId, prefill }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UpdatedConsultData>({ ...initialFormData, ...(prefill || {}) });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // RULE_SPECS runtime state
  const [runtimeSelf, setRuntimeSelf] = useState<any>({});
  const [followUp, setFollowUp] = useState<null | { ruleId: string; category: string; dimension?: 'brown'|'red'; questions: Array<{ id: string; prompt: string; options: string[]; multi?: boolean }> }>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, Record<string, string | string[]>>>({});
  const [followUpLocal, setFollowUpLocal] = useState<Record<string, string | string[]>>({});
  const [effectiveBands, setEffectiveBands] = useState<any>(machine || {});
  const [decisions, setDecisions] = useState<any[]>([]);
  
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

  // ---- Runtime: compute self bands and immediate mandatory follow-ups on base-answer edits
  useEffect(() => {
    // Derive self bands from current answers
    const self = deriveSelfBandsRt(formData as any, { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding });
    setRuntimeSelf(self);
    const m = (machine || {}) as any;
    const qsets = getFollowUpsRt(m, self);
    // Process rules in order: auto-apply rules with no questions; present the first with questions as REQUIRED follow-up
    const process = () => {
      let idx = 0;
      while (idx < qsets.length) {
        const r = qsets[idx];
        // skip if already answered
        if (followUpAnswers[r.ruleId]) { idx++; continue; }
        if (!r.questions || r.questions.length === 0) {
          // auto-apply decision for no-question rules
          const decision = decideBandRt(r.ruleId, {}, { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding } as any) || { updates: {} };
          setDecisions(prev => [...prev, { ruleId: r.ruleId, ...decision, decidedAt: new Date().toISOString(), specVersion: 'live' }]);
          setEffectiveBands((prev: any) => ({ ...prev, ...(decision.updates || {}) }));
          setFollowUpAnswers(prev => ({ ...prev, [r.ruleId]: {} }));
          idx++;
          continue;
        }
        // present this rule's questions as mandatory follow-up
        setFollowUp({ ruleId: r.ruleId, category: r.category as any, dimension: r.dimension as any, questions: r.questions });
        setFollowUpLocal({});
        return;
      }
      // none left
      setFollowUp(null);
    };
    process();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.oilLevels, formData.hydrationLevels, formData.acneType, formData.acneSeverity, formData.pigmentationType, formData.pigmentationSeverity, formData.poresType, formData.wrinklesType, formData.mainConcerns, formData.dateOfBirth, formData.pregnancyBreastfeeding]);

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
    if (!followUp) return;
    // Ensure all questions answered
    const allAnswered = (followUp.questions || []).every(q => followUpLocal[q.id] !== undefined && (Array.isArray(followUpLocal[q.id]) ? (followUpLocal[q.id] as any[]).length > 0 : String(followUpLocal[q.id]).length > 0))
    if (!allAnswered) return; // required
    const ruleId = followUp.ruleId
    const decision = decideBandRt(ruleId, followUpLocal, { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding } as any) || { updates: {} };
    setDecisions(prev => [...prev, { ruleId, ...decision, decidedAt: new Date().toISOString(), specVersion: 'live' }]);
    setEffectiveBands((prev: any) => ({ ...prev, ...(decision.updates || {}) }));
    // Compute updated answers synchronously for next-step selection
    const updatedAnswers = { ...followUpAnswers, [ruleId]: followUpLocal } as Record<string, Record<string, string | string[]>>
    setFollowUpAnswers(updatedAnswers)
    setFollowUp(null)
    // Trigger re-evaluation for any remaining mismatches
    const self = deriveSelfBandsRt(formData as any, { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding } as any)
    const m = (machine || {}) as any
    const qsets = getFollowUpsRt(m, self)
    // Auto-apply any remaining no-question rules first
    for (const r of qsets) {
      if (updatedAnswers[r.ruleId]) continue
      if (!r.questions || r.questions.length === 0) {
        const dec2 = decideBandRt(r.ruleId, {}, { dateOfBirth: formData.dateOfBirth, pregnancyBreastfeeding: formData.pregnancyBreastfeeding } as any) || { updates: {} }
        setDecisions(prev => [...prev, { ruleId: r.ruleId, ...dec2, decidedAt: new Date().toISOString(), specVersion: 'live' }])
        setEffectiveBands((prev: any) => ({ ...prev, ...(dec2.updates || {}) }))
        updatedAnswers[r.ruleId] = {}
      }
    }
    // Then present the next unanswered rule that has questions
    const next = qsets.find(q => !updatedAnswers[q.ruleId] && q.questions && q.questions.length)
    if (next) {
      setFollowUp({ ruleId: next.ruleId, category: next.category as any, dimension: next.dimension as any, questions: next.questions || [] })
      setFollowUpLocal({})
    }
  }

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
        <p className="text-xs text-gray-400 mt-2">Press Enter, comma or Tab to add a product.</p>
      </div>
    );
  };

  const getTotalSteps = (concerns: string[] = formData.mainConcerns) => {
    // Base steps: 4 (personal info) + 4 (skin basics) + 3 (history) + 3 (routine) = 14  
    let totalSteps = 14;
    
    // Add dynamic steps for each selected concern
    concerns.forEach(concern => {
      if (concern === 'Pigmentation') {
        totalSteps += 2; // Type + Severity
      } else if (concern === 'Acne') {
        totalSteps += 2; // Type + Severity
      } else if (concern === 'Redness/Sensitivity') {
        totalSteps += 7; // 7 sensitivity questions
      } else {
        totalSteps += 1; // Just severity
      }
    });
    
    // Add lifestyle questions: 5 (diet, water, sleep, stress, environment)
    totalSteps += 5;
    
    // Add preference questions: 4 (routine-steps, serum-comfort, moisturizer-texture, brand-preference)
    totalSteps += 4;
    
    return totalSteps;
  };

  const fillWithDummyData = () => {
    // Smart fill: only fill empty/default values, preserve existing data
    setFormData(prevData => {
      // Determine concerns to base dynamic answers on (existing or dummy fallback)
      const nextMainConcerns = prevData.mainConcerns.length > 0 ? prevData.mainConcerns : dummyFormData.mainConcerns;
      return ({
        // Personal Information - only fill if empty
        name: prevData.name.trim() !== '' ? prevData.name : dummyFormData.name,
        phoneNumber: prevData.phoneNumber.trim() !== '' ? prevData.phoneNumber : dummyFormData.phoneNumber,
        dateOfBirth: prevData.dateOfBirth !== '' ? prevData.dateOfBirth : dummyFormData.dateOfBirth,
        gender: prevData.gender !== '' ? prevData.gender : dummyFormData.gender,
      
      // Section A - Skin Basics
      skinType: prevData.skinType !== '' ? prevData.skinType : dummyFormData.skinType,
      oilLevels: prevData.oilLevels !== '' ? prevData.oilLevels : (dummyFormData.oilLevels || 'Noticeable shine in multiple areas \u001a Yellow'),
      hydrationLevels: prevData.hydrationLevels !== '' ? prevData.hydrationLevels : (dummyFormData.hydrationLevels || 'Often feels tight, rough, or flaky \u001a Yellow'),
      sensitivity: prevData.sensitivity !== '' ? prevData.sensitivity : (dummyFormData.sensitivity || 'No'),
      sensitivityTriggers: prevData.sensitivityTriggers !== '' ? prevData.sensitivityTriggers : dummyFormData.sensitivityTriggers,
      
      // Section B - Current Skin History
      diagnosedConditions: prevData.diagnosedConditions !== '' ? prevData.diagnosedConditions : dummyFormData.diagnosedConditions,
      prescriptionTreatments: prevData.prescriptionTreatments !== '' ? prevData.prescriptionTreatments : dummyFormData.prescriptionTreatments,
      professionalTreatments: prevData.professionalTreatments !== '' ? prevData.professionalTreatments : dummyFormData.professionalTreatments,
      
        // Section C - Current Routine
        currentProducts: prevData.currentProducts,
        currentProductsList: prevData.currentProductsList.length > 0 ? prevData.currentProductsList : dummyFormData.currentProductsList,
        productDuration: prevData.productDuration,
        irritatingProducts: prevData.irritatingProducts !== '' ? prevData.irritatingProducts : dummyFormData.irritatingProducts,        // Section D - Main Concerns
        mainConcerns: nextMainConcerns,
        // For dynamic concerns: only fill fields relevant to selected concerns
        acneType: nextMainConcerns.includes('Acne') && !prevData.acneType ? (dummyFormData.acneType || 'Red pimples (inflamed, sometimes pus-filled)') : prevData.acneType,
        acneSeverity: prevData.acneSeverity,
        acneDuration: prevData.acneDuration, // not asked; do not fabricate
        pigmentationType: nextMainConcerns.includes('Pigmentation') && !prevData.pigmentationType ? (dummyFormData.pigmentationType || 'PIH brown') : prevData.pigmentationType,
        pigmentationSeverity: prevData.pigmentationSeverity,
        pigmentationDuration: nextMainConcerns.includes('Pigmentation') && !prevData.pigmentationDuration ? (dummyFormData.pigmentationDuration || 'Recent') : prevData.pigmentationDuration,
        rednessType: prevData.rednessType,
        rednessDuration: prevData.rednessDuration,
        dullnessType: nextMainConcerns.includes('Dullness') && !prevData.dullnessType ? (dummyFormData.dullnessType || 'Occasional') : prevData.dullnessType,
        dullnessDuration: prevData.dullnessDuration, // not asked; do not fabricate
        wrinklesType: nextMainConcerns.includes('Fine lines & wrinkles') && !prevData.wrinklesType ? (dummyFormData.wrinklesType || 'Forehead lines') : prevData.wrinklesType,
        wrinklesDuration: prevData.wrinklesDuration, // not asked; do not fabricate
        poresType: nextMainConcerns.includes('Large pores') && !prevData.poresType ? (dummyFormData.poresType || 'Always present') : prevData.poresType,
        poresDuration: prevData.poresDuration, // not asked; do not fabricate
        oilinessType: nextMainConcerns.includes('Oiliness') && !prevData.oilinessType ? (dummyFormData.oilinessType || 'T-zone only') : prevData.oilinessType,
        oilinessDuration: prevData.oilinessDuration, // not asked; do not fabricate
        drynessType: nextMainConcerns.includes('Dryness') && !prevData.drynessType ? (dummyFormData.drynessType || 'Tight/rough') : prevData.drynessType,
        drynessDuration: prevData.drynessDuration, // not asked; do not fabricate
      
      // Sensitivity questions
        ...(nextMainConcerns.includes('Redness/Sensitivity') ? {
          sensitivityRedness: prevData.sensitivityRedness || dummyFormData.sensitivityRedness,
          sensitivityDiagnosis: prevData.sensitivityDiagnosis || dummyFormData.sensitivityDiagnosis,
          sensitivityCleansing: prevData.sensitivityCleansing || dummyFormData.sensitivityCleansing,
          sensitivityProducts: prevData.sensitivityProducts || dummyFormData.sensitivityProducts,
          sensitivitySun: prevData.sensitivitySun || dummyFormData.sensitivitySun,
          sensitivityCapillaries: prevData.sensitivityCapillaries || dummyFormData.sensitivityCapillaries,
          sensitivitySeasonal: prevData.sensitivitySeasonal || dummyFormData.sensitivitySeasonal,
        } : {
          sensitivityRedness: prevData.sensitivityRedness || '',
          sensitivityDiagnosis: prevData.sensitivityDiagnosis || '',
          sensitivityCleansing: prevData.sensitivityCleansing || '',
          sensitivityProducts: prevData.sensitivityProducts || '',
          sensitivitySun: prevData.sensitivitySun || '',
          sensitivityCapillaries: prevData.sensitivityCapillaries || '',
          sensitivitySeasonal: prevData.sensitivitySeasonal || '',
        }),
      
      // Section E - Lifestyle Inputs
      diet: prevData.diet !== '' ? prevData.diet : dummyFormData.diet,
      waterIntake: prevData.waterIntake !== '' ? prevData.waterIntake : dummyFormData.waterIntake,
      sleepHours: prevData.sleepHours !== '' ? prevData.sleepHours : dummyFormData.sleepHours,
      stressLevels: prevData.stressLevels !== '' ? prevData.stressLevels : dummyFormData.stressLevels,
      environment: prevData.environment !== '' ? prevData.environment : dummyFormData.environment,
      
      // Section F - Willingness & Preferences
      routineSteps: prevData.routineSteps !== '' ? prevData.routineSteps : dummyFormData.routineSteps,
      serumComfort: prevData.serumComfort !== '' ? prevData.serumComfort : dummyFormData.serumComfort,
      moisturizerTexture: prevData.moisturizerTexture !== '' ? prevData.moisturizerTexture : dummyFormData.moisturizerTexture,
        brandPreference: prevData.brandPreference !== '' ? prevData.brandPreference : dummyFormData.brandPreference,
        budget: prevData.budget,      // Additional fields
      // Only fill these when the corresponding UI steps exist; keeping them as-is otherwise
      allergies: prevData.allergies, 
      pregnancyBreastfeeding: prevData.pregnancyBreastfeeding, 
      medications: prevData.medications,
      });
    });
    
    setErrors({}); // Clear all errors
    
    // Calculate total steps based on concerns (use existing or dummy data) and go to final step
    const concerns = formData.mainConcerns.length > 0 ? formData.mainConcerns : dummyFormData.mainConcerns;
    const totalSteps = getTotalSteps(concerns);
    setCurrentStep(totalSteps);
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
      } else if (concern === 'Redness/Sensitivity') {
        // Add 7 sensitivity questions
        for (let i = 0; i < 7; i++) {
          concernSteps.push({concern, step: 'sensitivity-question', questionIndex: i});
        }
      } else {
        concernSteps.push({concern, step: 'severity'});
      }
    });
    
    return concernSteps;
  };

  const getCurrentConcernStep = () => {
    if (currentStep <= 14) return null; // Main concerns is at step 14
    
    const concernSteps = getConcernSteps();
    const lifestyleStartStep = 15 + concernSteps.length; // Start after main concerns and concern follow-ups
    
    // Individual lifestyle questions (5 questions)
    if (currentStep === lifestyleStartStep) return 'diet';
    if (currentStep === lifestyleStartStep + 1) return 'water-intake';
    if (currentStep === lifestyleStartStep + 2) return 'sleep-hours';
    if (currentStep === lifestyleStartStep + 3) return 'stress-levels';
    if (currentStep === lifestyleStartStep + 4) return 'environment';
    
    // Individual preference questions (4 questions)
    const preferenceStartStep = lifestyleStartStep + 5;
    if (currentStep === preferenceStartStep) return 'routine-steps';
    if (currentStep === preferenceStartStep + 1) return 'serum-comfort';
    if (currentStep === preferenceStartStep + 2) return 'moisturizer-texture';
    if (currentStep === preferenceStartStep + 3) return 'brand-preference';
    
    const concernIndex = currentStep - 15; // Start after main concerns step (14)
    return concernSteps[concernIndex] || null;
  };

  const validateStep = (step: number): boolean => {
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
      // Section A - Skin Basics
      case 5: // Skin Type
        if (!formData.skinType.trim()) newErrors.skinType = 'Skin type is required';
        break;
      case 6: // Oil Levels
        if (!formData.oilLevels.trim()) newErrors.oilLevels = 'Oil level description is required';
        break;
      case 7: // Hydration Levels
        if (!formData.hydrationLevels.trim()) newErrors.hydrationLevels = 'Hydration level description is required';
        break;
      case 8: // Sensitivity
        if (!formData.sensitivity.trim()) newErrors.sensitivity = 'Sensitivity information is required';
        break;
      // Section B - Current Skin History
      case 9: // Diagnosed Conditions - Optional
        break;
      case 10: // Prescription Treatments - Optional
        break;
      case 11: // Professional Treatments - Optional
        break;
      // Section C - Current Routine
      case 12: // Current Products
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
      case 13: // Irritating Products - Optional
        break;
      // Section D - Main Concerns
      case 14: // Main Concerns
        if (formData.mainConcerns.length === 0) newErrors.mainConcerns = 'Select at least one main concern';
        if (formData.mainConcerns.length > 3) newErrors.mainConcerns = 'Please select a maximum of 3 main concerns';
        break;
      default: // Dynamic steps
        // Individual lifestyle questions
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
        } else if (currentConcernStep === 'brand-preference') {
          if (!formData.brandPreference.trim()) newErrors.brandPreference = 'Please select your brand preference';
        } else if (currentConcernStep && typeof currentConcernStep === 'object') {
          const { concern, step: stepType, questionIndex } = currentConcernStep as any;
          if (stepType === 'sensitivity-question' && typeof questionIndex === 'number') {
            const sensitivityFields = [
              'sensitivityRedness',
              'sensitivityDiagnosis',
              'sensitivityCleansing',
              'sensitivityProducts',
              'sensitivitySun',
              'sensitivityCapillaries',
              'sensitivitySeasonal'
            ];
            const key = sensitivityFields[questionIndex] as keyof UpdatedConsultData;
            const val = (formData[key] as string) || '';
            if (!val.trim()) newErrors[key as string] = 'Please select an option';
          } else {
            const baseMap: Record<string, string> = {
              'Acne': 'acne',
              'Pigmentation': 'pigmentation',
              'Dullness': 'dullness',
              'Fine lines & wrinkles': 'wrinkles',
              'Large pores': 'pores',
            };
            const base = baseMap[concern] || concern.toLowerCase().replace(/[^a-z]/g, '');
            const concernsWithType = ['Acne', 'Pigmentation'];
            let key = '';
            if (stepType === 'type') {
              key = base + 'Type';
            } else if (stepType === 'severity') {
              if (concernsWithType.includes(concern)) {
                key = base + 'Severity';
              } else {
                key = base + 'Type';
              }
            }
            const val = (formData[key as keyof UpdatedConsultData] as string) || '';
            if (!val.trim()) newErrors[key as string] = `${concern} ${stepType === 'severity' ? 'severity' : 'type'} is required`;
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < getTotalSteps()) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Build audit and final effective bands using RULE_SPECS runtime
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

      const payload = { ...(formData as any), triageOutcomes, decisionAudit };
      console.log('Submitting consultation data:', payload);
      const createdSessionId = await saveConsultationData(payload, { sessionId });
      console.log('Consultation saved successfully with session ID:', createdSessionId);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit consultation:', error);
      alert('Failed to submit consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow pressing Enter to trigger Next (except in textareas)
  const handleEnterAdvance = (e: React.KeyboardEvent) => {
  if (e.key !== 'Enter') return;
  // If we're on the irritating products step, let the local TagInput handle Enter
  if (currentStep === 13) return;
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'textarea') return; // keep newline behavior in textareas
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
      handleSubmit();
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
    updateFormData({ mainConcerns: newConcerns });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Questionnaire Complete!</h1>
          <p className="text-gray-600 mb-6">Customer questionnaire has been submitted successfully.</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">You may now return to the staff portal.</p>
          </div>
          <button
            onClick={onComplete}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:from-green-700 hover:to-emerald-700"
          >
            Back to Staff Portal
          </button>
        </div>
      </div>
    );
  }

  const renderConcernFollowUp = (concern: string, stepType: 'type' | 'severity' | 'sensitivity-question', questionIndex?: number) => {
    const concernBaseKey = (c: string): string | null => {
      switch (c) {
        case 'Acne': return 'acne';
        case 'Pigmentation': return 'pigmentation';
        case 'Redness/Sensitivity': return null; // handled separately
        case 'Dullness': return 'dullness';
        case 'Fine lines & wrinkles': return 'wrinkles';
        case 'Large pores': return 'pores';
        case 'Oiliness': return 'oiliness';
        case 'Dryness': return 'dryness';
        default: return c.toLowerCase().replace(/[^a-z]/g, '') || null;
      }
    };
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
        case 'Redness/Sensitivity': return <Heart className="w-8 h-8 text-amber-600" />;
        case 'Dullness': return <Sparkles className="w-8 h-8 text-amber-600" />;
        case 'Fine lines & wrinkles': return <Clock className="w-8 h-8 text-amber-600" />;
        case 'Large pores': return <Droplets className="w-8 h-8 text-amber-600" />;
        case 'Oiliness': return <Sun className="w-8 h-8 text-amber-600" />;
        case 'Dryness': return <Droplets className="w-8 h-8 text-amber-600" />;
        default: return <FileText className="w-8 h-8 text-amber-600" />;
      }
    };

    const getConcernOptions = (concern: string, stepType: 'type' | 'severity' | 'sensitivity-question', questionIndex?: number) => {
      if (stepType === 'sensitivity-question' && questionIndex !== undefined) {
        const sensitivityQuestions = [
          ['Yes', 'No'],
          ['Yes', 'No'],
          ['Yes', 'No'],
          ['Yes', 'No'],
          ['Yes', 'No'],
          ['Yes', 'No'],
          ['Yes', 'No']
        ];
        return sensitivityQuestions[questionIndex] || ['Yes', 'No'];
      }

      switch (concern) {
        case 'Acne':
          if (stepType === 'type') {
            return [
              'Blackheads (tiny dark dots in pores)',
              'Whiteheads (small white bumps under the skin)',
              'Red pimples (inflamed, sometimes pus-filled)',
              'Large painful bumps (deep cystic acne)',
              'Mostly around jawline/chin, often before periods (hormonal)'
            ];
          } else if (stepType === 'severity') {
            const acneType = formData.acneType;
            if (acneType.includes('Blackheads')) {
              return [
                'A few, mostly on the nose (≤10) → Blue',
                'Many in the T-zone (11–30) → Yellow',
                'Widespread across face (30+) → Red'
              ];
            } else if (acneType.includes('Whiteheads')) {
              return [
                'A few, small area (≤10) → Blue',
                'Many in several areas (11–20) → Yellow',
                'Widespread across face (20+) → Red'
              ];
            } else if (acneType.includes('Red pimples')) {
              return [
                'A few (1–3), mild → Blue',
                'Several (4–10), some painful → Yellow',
                'Many (10+), inflamed/widespread → Red'
              ];
            } else if (acneType.includes('Large painful bumps') || acneType.includes('cystic')) {
              return [
                'Rare (1 in last 2 weeks) → Blue',
                'Frequent (1–3 per week) → Yellow',
                'Persistent (4+ per week or multiple at once) → Red'
              ];
            } else if (acneType.includes('jawline') || acneType.includes('hormonal')) {
              return [
                'Mild monthly flare (1–3 pimples) → Blue',
                'Clear monthly flare (several pimples/cyst lasting a week) → Yellow',
                'Strong monthly flare (multiple cysts lasting >1 week) → Red'
              ];
            }
            // Default fallback
            return [
              'Mild (few breakouts) → Blue',
              'Moderate (several breakouts) → Yellow',
              'Severe (many breakouts) → Red'
            ];
          }
          return [];
        case 'Pigmentation':
          if (stepType === 'type') {
            return ['Red', 'Brown'];
          } else if (stepType === 'severity') {
            // Check if pigmentationType contains "Red" or "Brown" to determine which severity options to show
            const currentType = formData.pigmentationType;
            if (currentType === 'Red' || currentType.includes('red') || currentType.includes('Red') || currentType.includes('redness')) {
              return [
                'Light red, only in a small area → Blue',
                'Moderate red, noticeable in several zones → Yellow',
                'Bright or deep red, widespread across the face → Red'
              ];
            } else if (currentType === 'Brown' || currentType.includes('brown') || currentType.includes('Brown') || currentType.includes('pigmentation')) {
              return [
                'Light brown patches, visible up close but small in size → Blue',
                'Moderate brown spots/patches, noticeable in several areas → Yellow',
                'Dark brown patches, large or widespread across the face → Red'
              ];
            }
            // Default to brown options if type is not clearly determined
            return [
              'Light brown patches, visible up close but small in size → Blue',
              'Moderate brown spots/patches, noticeable in several areas → Yellow',
              'Dark brown patches, large or widespread across the face → Red'
            ];
          }
          return [];
        case 'Fine lines & wrinkles':
          if (stepType === 'severity') {
            return [
              'A few fine lines or slight looseness in some spots → Blue',
              'Wrinkles or sagging you can see in several areas → Yellow',
              'Deep wrinkles or sagging that\'s easy to notice → Red'
            ];
          }
          return [];
        case 'Large pores':
          if (stepType === 'severity') {
            return [
              'Noticeable near the nose or small areas on close inspection → Blue',
              'Clearly visible on multiple zones (nose, cheeks, forehead) → Yellow',
              'Large, obvious pores across much of the face, visible from a distance → Red'
            ];
          }
          return [];
        case 'Dullness':
          if (stepType === 'severity') {
            return [
              'Occasional dullness that comes and goes → Blue',
              'Frequently dull skin that needs regular brightening → Yellow',
              'Persistent dullness across the face → Red'
            ];
          }
          return [];
        default:
          return [];
      }
    };

    const getFieldInfo = (concern: string, stepType: 'type' | 'severity' | 'sensitivity-question', questionIndex?: number) => {
      if (stepType === 'sensitivity-question' && questionIndex !== undefined) {
        const sensitivityFields = [
          'sensitivityRedness',
          'sensitivityDiagnosis',
          'sensitivityCleansing',
          'sensitivityProducts',
          'sensitivitySun',
          'sensitivityCapillaries',
          'sensitivitySeasonal'
        ];
        const sensitivityTitles = [
          'Do you often experience redness, burning, or stinging when using skincare products?',
          'Have you ever been diagnosed with sensitive skin, rosacea, or eczema?',
          'Does your skin get easily irritated by sun, heat, wind, or pollution?',
          'Have you noticed breakouts or irritation when using active ingredients (Vitamin C, AHAs, Niacinamide, Retinoids, etc.)?',
          'Do you have visible broken capillaries or flushing on your skin (cheeks, nose, etc.)?',
          'Are you under 20 years of age?',
          'Would you describe your skin baseline as very dry (tight, flaky, rough)?'
        ];
        return {
          fieldKey: sensitivityFields[questionIndex],
          title: sensitivityTitles[questionIndex],
          subtitle: 'Please select the option that best describes you'
        };
      }

      const base = concernBaseKey(concern);
      const concernsWithType = ['Acne', 'Pigmentation'];
      let title = '';
      let subtitle = '';

      if (stepType === 'type') {
        if (concern === 'Pigmentation') {
          title = 'What type do you experience?';
        } else if (concern === 'Acne') {
          title = 'What kind of breakouts do you usually notice?';
        } else {
          title = 'What type do you experience?';
        }
      } else if (stepType === 'severity') {
        if (concern === 'Pigmentation') {
          title = 'How would you describe the severity?';
        } else if (concern === 'Acne') {
          title = 'How would you describe the severity?';
        } else if (concern === 'Fine lines & wrinkles') {
          title = 'How would you describe the severity?';
        } else if (concern === 'Large pores') {
          title = 'How would you describe the severity?';
        } else if (concern === 'Dullness') {
          title = 'How would you describe the severity?';
        } else {
          title = 'What type do you experience?';
        }
      }

      let fieldKey = '';
      if (stepType === 'type') {
        fieldKey = base + 'Type';
      } else if (stepType === 'severity') {
        if (concernsWithType.includes(concern)) {
          fieldKey = base + 'Severity';
        } else {
          fieldKey = base + 'Type';
        }
      }
      
      return { fieldKey, title, subtitle };
    };

    const { fieldKey, title, subtitle } = getFieldInfo(concern, stepType, questionIndex);
    const fieldValue = (fieldKey ? (formData as any)[fieldKey] : '') as string;
    const options = getConcernOptions(concern, stepType, questionIndex);

    return (
      <div className="space-y-12 flex flex-col justify-center h-full py-8 relative">
        {/* Concern Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium border border-amber-200">
            <span className="mr-1">{React.cloneElement(getConcernIcon(concern), { className: "w-4 h-4 text-amber-600" })}</span>
            {concern}
          </div>
          
          {/* Acne Type Badge - only show for Acne severity step */}
          {concern === 'Acne' && stepType === 'severity' && getAcneTypeBadge(formData.acneType) && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium border border-blue-200">
              <span className="mr-1">{React.cloneElement(getConcernIcon(concern), { className: "w-4 h-4 text-blue-600" })}</span>
              {getAcneTypeBadge(formData.acneType)}
            </div>
          )}
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
                onClick={() => fieldKey && updateFormData({ [fieldKey]: option } as any)}
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
          {errors[fieldKey] && <p className="text-red-500 text-sm mt-2">{errors[fieldKey]}</p>}
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

    if (currentConcernStep === 'brand-preference') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              What type of skincare approach do you prefer?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 gap-4">
              {['Natural', 'Minimal', 'Tech-driven', 'Active-based', 'Luxury'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="brandPreference"
                    value={option}
                    checked={formData.brandPreference === option}
                    onChange={(e) => updateFormData({ brandPreference: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.brandPreference && <p className="text-red-500 text-sm mt-2">{errors.brandPreference}</p>}
          </div>
        </div>
      );
    }

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
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth + 'T00:00:00') : null}
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

      // Section A - Skin Basics
      case 5: // Skin Type
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Normal', 'Oily', 'Dry', 'Combination'].map((option) => (
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

      case 6: // Oil Levels
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

      case 7: // Hydration Levels
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

      case 8: // Sensitivity
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Do you experience sensitivity?
              </h2>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Yes', 'No', 'Sometimes'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateFormData({ sensitivity: option })}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.sensitivity === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {formData.sensitivity === 'Sometimes' && (
                <div className="max-w-2xl mx-auto w-full mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify triggers (sun, actives, fragrance, pollution):
                  </label>
                  <input
                    type="text"
                    value={formData.sensitivityTriggers || ''}
                    onChange={(e) => updateFormData({ sensitivityTriggers: e.target.value })}
                    placeholder="e.g., sun, fragrance, harsh products..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              )}
              {errors.sensitivity && <p className="text-red-500 text-sm mt-2">{errors.sensitivity}</p>}
            </div>
          </div>
        );

      // Section B - Current Skin History
      case 9: // Diagnosed Skin Conditions
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
                ref={currentStep === 9 ? firstTextareaRef : undefined}
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

      case 10: // Prescription Treatments
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
                ref={currentStep === 10 ? firstTextareaRef : undefined}
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

      case 11: // Professional Treatments
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
      case 12: // Current Products
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

      case 13: // Irritating Products
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
                placeholder="Type a product and press Enter, comma or Tab"
              />
              {errors.irritatingProducts && <p className="text-red-500 text-sm mt-2">{errors.irritatingProducts}</p>}
            </div>
          </div>
        );

      // Section D - Main Concerns
      case 14: // Main Concerns
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
                  'Redness/Sensitivity',
                  'Dullness',
                  'Fine lines & wrinkles',
                  'Large pores'
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Consultation Complete!</h1>
          <p className="text-gray-600 mb-6">The consultation has been submitted successfully.</p>
          <button
            onClick={onComplete}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:from-green-700 hover:to-emerald-700"
          >
            Back to Profile Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Dev: Machine Bands Box */}
        {machine && (
          <div className="fixed top-24 right-6 w-80 z-50 space-y-4">
            <div className="bg-white/95 border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold">Machine Bands (Dev)</div>
              <div className="p-4 text-sm text-gray-800 space-y-1">
                <div><span className="font-medium">Moisture:</span> {machine.moisture || '-'} {machineRaw?.moisture !== undefined && <span className="text-gray-500">(val: {String(machineRaw.moisture)})</span>}</div>
                <div><span className="font-medium">Sebum:</span> {machine.sebum || '-'} {machineRaw?.sebum !== undefined && <span className="text-gray-500">(val: {String(machineRaw.sebum)})</span>}</div>
                <div><span className="font-medium">Texture:</span> {machine.texture || '-'} {machineRaw?.texture !== undefined && <span className="text-gray-500">(val: {String(machineRaw.texture)})</span>}</div>
                <div><span className="font-medium">Pores:</span> {machine.pores || '-'} {machineRaw?.pores !== undefined && <span className="text-gray-500">(val: {String(machineRaw.pores)})</span>}</div>
                <div><span className="font-medium">Acne:</span> {machine.acne || '-'} {machineRaw?.acne !== undefined && <span className="text-gray-500">(val: {String(machineRaw.acne)})</span>}</div>
                <div><span className="font-medium">Pigment (Brown):</span> {machine.pigmentation_brown || '-'} {machineRaw?.brown_areas !== undefined ? <span className="text-gray-500">(val: {String(machineRaw.brown_areas)})</span> : machineRaw?.pigmentation_uv !== undefined ? <span className="text-gray-500">(uv: {String(machineRaw.pigmentation_uv)})</span> : null}</div>
                <div><span className="font-medium">Pigment (Red):</span> {machine.pigmentation_red || '-'} {machineRaw?.redness !== undefined && <span className="text-gray-500">(val: {String(machineRaw.redness)})</span>}</div>
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
                <div><span className="font-medium">Pigment (Brown):</span> {effectiveBands?.pigmentation_brown || '-'}</div>
                <div><span className="font-medium">Pigment (Red):</span> {effectiveBands?.pigmentation_red || '-'}</div>
                <div className="pt-2">
                  <div className="text-xs text-gray-600 mb-1">Flags</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(decisions.flatMap(d => d.flags || []))).map(f => {
                      const label = f.replace(/^Grease\s*:/i, 'Sebum:')
                      return (
                        <span key={f} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs border border-amber-200">{label}</span>
                      )
                    })}
                    {decisions.length === 0 && <span className="text-gray-400">—</span>}
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
            {renderStep()}
            {/* Mandatory follow-ups (RULE_SPECS) */}
            {followUp && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-amber-200">
                  <div className="px-6 py-4 border-b border-amber-200 bg-amber-50 rounded-t-2xl">
                    <div className="text-base font-semibold text-amber-900">Follow-up Required: {followUp.category === 'Grease' ? 'Sebum' : followUp.category}{followUp.dimension ? ` (${followUp.dimension})` : ''}</div>
                    <div className="text-xs text-amber-800/80">Resolve machine vs customer difference</div>
                  </div>
                  <div className="px-6 py-5 space-y-5">
                    {followUp.questions.map((q) => (
                      <div key={q.id} className="">
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
                  <div className="px-6 py-4 border-t border-amber-200 flex justify-end gap-3 rounded-b-2xl bg-gray-50">
                    <button type="button" disabled className="px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-400 cursor-not-allowed">Back</button>
                    <button type="button" onClick={handleSubmitFollowUp} className="px-4 py-2 rounded-lg text-sm bg-amber-600 text-white hover:bg-amber-700">Continue</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-8 pt-0">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || !!followUp}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentStep === 1 || !!followUp
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !!followUp}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === totalSteps ? 'Submit' : 'Next'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatedConsultForm;
