import {
  deriveSelfBands,
  getFollowUpQuestions,
  decideAllBandUpdates,
} from '../src/lib/decisionEngine';
import type {
  Band4,
  MachineScanBands,
} from '../src/lib/decisionEngine';
import {
  generateRecommendations,
  type RecommendationContext,
  type EnhancedRecommendation,
  type DecisionEngineFlags,
} from '../src/services/recommendationEngine';
import type { UpdatedConsultData } from '../src/types';
import {
  evaluateAcneSubtypeFlow,
  buildAcneSubtypeQuestions,
  type AcneFlowContext,
  type AcneFlowEvaluationResult,
  type AcneFlowQuestion,
  type AcneSubtypeKey,
} from '../src/lib/acneFlowEvaluator';

interface ScenarioExpectations {
  acneBand?: Band4;
  flagIncludes?: string[];
  safetyIncludes?: string[];
  routineIncludes?: string[];
  routineExcludes?: string[];
  noteIncludes?: string[];
  pregnancySafeReplacement?: boolean;
  evaluationBand?: Band4;
  evaluationSubtype?: AcneSubtypeKey;
}

interface ScenarioDefinition {
  id: string;
  title: string;
  description: string;
  machine: MachineScanBands;
  formOverrides?: Partial<UpdatedConsultData>;
  followUp: {
    ruleId: string;
    answers: Record<string, string>;
  };
  evaluation?: {
    subtype: AcneSubtypeKey;
    answers: Record<string, string>;
    context?: AcneFlowContext;
  };
  expected: ScenarioExpectations;
}

interface ScenarioRunResult {
  scenario: ScenarioDefinition;
  formData: UpdatedConsultData;
  followUps: ReturnType<typeof getFollowUpQuestions>;
  effectiveBands: Record<string, string>;
  decisions: Array<{ flags?: string[]; safety?: string[]; ruleId: string }>;
  flagSet: Set<string>;
  safetySet: Set<string>;
  acneCategories: string[];
  contextFlags: DecisionEngineFlags;
  recommendation: EnhancedRecommendation;
  evaluation?: AcneFlowEvaluationResult;
  allProducts: Set<string>;
  errors: string[];
  diagnostics: string[];
}

function createBaseFormData(): UpdatedConsultData {
  return {
    name: 'Test User',
    phoneNumber: '+919999999999',
    dateOfBirth: '1995-01-01',
    gender: 'Female',
    pregnancy: 'No',
    recentIsotretinoin: 'No',
    severeCysticAcne: 'No',
    allergyConflict: 'No',
    barrierStressHigh: 'No',
    gateActions: '',
    skinType: 'Combination – Balanced',
    skinTypeFlag: 'Combination',
    oilLevels: 'Comfortable, no shine or greasiness → Green',
    hydrationLevels: 'Comfortable, no tightness → Green',
    sensitivity: 'No',
    sensitivityTriggers: '',
    diagnosedConditions: '',
    prescriptionTreatments: '',
    professionalTreatments: '',
    currentProducts: '',
    currentProductsList: [],
    productDuration: '',
    irritatingProducts: '',
    mainConcerns: ['Acne'],
    concernPriority: ['Acne'],
    acneBreakouts: [],
    acneBreakoutType: undefined,
    acnePendingSubtype: undefined,
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
    sensitivityRedness: 'No',
    sensitivityDiagnosis: 'No',
    sensitivityCleansing: 'No',
    sensitivityProducts: 'No',
    sensitivitySun: 'No',
    sensitivityCapillaries: 'No',
    sensitivitySeasonal: 'No',
    diet: 'Balanced',
    waterIntake: '2-3 litres',
    sleepHours: '7-8 hours',
    stressLevels: 'Moderate',
    environment: 'Urban',
    routineSteps: 'Balanced (AM+PM)',
    serumComfort: '3',
    moisturizerTexture: 'Gel',
    budget: 'Flexible',
    legalDisclaimerAgreed: true,
    legalDisclaimerNotMedical: true,
    legalDisclaimerConsultDermatologist: true,
    legalDisclaimerPatchTest: true,
    legalDisclaimerDiscontinueUse: true,
    legalDisclaimerDiscloseInfo: true,
    legalDisclaimerNoLiability: true,
    allergies: '',
    pregnancyBreastfeeding: 'No',
    medications: '',
  };
}

function cloneFormData(base: UpdatedConsultData): UpdatedConsultData {
  return {
    ...base,
    mainConcerns: [...base.mainConcerns],
    concernPriority: [...(base.concernPriority || [])],
    acneBreakouts: base.acneBreakouts.map(entry => ({ ...entry })),
    currentProductsList: base.currentProductsList.map(product => ({ ...product })),
  };
}

function applyOverrides(
  base: UpdatedConsultData,
  overrides: Partial<UpdatedConsultData> = {}
): UpdatedConsultData {
  const clone = cloneFormData(base);

  for (const key of Object.keys(overrides) as Array<keyof UpdatedConsultData>) {
    const value = overrides[key];
    if (Array.isArray(value)) {
      if (key === 'acneBreakouts') {
        clone.acneBreakouts = value.map(entry => ({ ...entry })) as UpdatedConsultData['acneBreakouts'];
      } else if (key === 'currentProductsList') {
        clone.currentProductsList = value.map(product => ({ ...product })) as UpdatedConsultData['currentProductsList'];
      } else if (key === 'mainConcerns') {
        clone.mainConcerns = [...value] as UpdatedConsultData['mainConcerns'];
      } else if (key === 'concernPriority') {
        clone.concernPriority = [...value] as UpdatedConsultData['concernPriority'];
      } else {
        (clone as any)[key] = [...value];
      }
    } else {
      (clone as any)[key] = value;
    }
  }

  return clone;
}

function mapAcneCategoryFlag(flag: string): string | undefined {
  const raw = flag.includes(':') ? flag.split(':')[1] : flag;
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized.includes('comedonal')) return 'Comedonal acne';
  if (normalized.includes('nodulocystic') || normalized.includes('cystic')) return 'Cystic acne';
  if (normalized.includes('hormonal')) return 'Hormonal acne';
  if (normalized.includes('situational')) return 'Situational acne';
  if (normalized.includes('inflammatory')) return 'Inflammatory acne';
  if (normalized.includes('mild inflammatory')) return 'Inflammatory acne';
  return undefined;
}

function deriveSubtypeFromCategories(categories: string[]): string | undefined {
  for (const category of categories) {
    const normalized = category.toLowerCase();
    if (normalized.includes('comedonal')) return 'Comedonal';
    if (normalized.includes('cystic')) return 'Nodulocystic';
    if (normalized.includes('hormonal')) return 'Hormonal';
    if (normalized.includes('inflammatory')) return 'Inflammatory';
  }
  return undefined;
}

function makeDecisionFlags(
  categories: string[],
  flagSet: Set<string>,
  safetySet: Set<string>,
  fallbackSubtype?: string
): DecisionEngineFlags {
  const subtype = deriveSubtypeFromCategories(categories) || fallbackSubtype;
  const situational = Array.from(flagSet).some(flag => flag.toLowerCase().includes('situational acne'));
  const hormonal = Array.from(flagSet).some(flag => flag.toLowerCase().includes('hormonal'));
  const referDerm = safetySet.has('refer-derm');
  const pregnancyFilter = safetySet.has('pregnancy-filter');

  return {
    ...(subtype ? { acneSubtype: subtype } : {}),
    ...(hormonal ? { acneHormonal: true } : {}),
    ...(referDerm ? { referDerm: true, dermatologistReferral: true } : {}),
    ...(situational ? { situationalAcne: true } : {}),
    ...(pregnancyFilter ? { pregnancySafe: true } : {}),
  };
}

function ensureEvaluationAnswersValid(
  questions: AcneFlowQuestion[],
  answers: Record<string, string>
): string[] {
  const errors: string[] = [];
  const questionMap = new Map(questions.map(q => [q.id, q]));
  for (const [qid, value] of Object.entries(answers)) {
    const question = questionMap.get(qid);
    if (!question) {
      errors.push(`Evaluation answer provided for unknown question ${qid}`);
      continue;
    }
    const normalizedValue = value.trim();
    if (question.options.length && !question.options.some(opt => opt === normalizedValue)) {
      errors.push(`Answer "${value}" is not a valid option for question ${qid}`);
    }
  }
  return errors;
}

function collectProducts(recommendation: EnhancedRecommendation): Set<string> {
  const set = new Set<string>();
  const add = (value?: string) => {
    if (value && value.trim()) set.add(value.trim());
  };

  (recommendation.am || []).forEach(add);
  (recommendation.pm || []).forEach(add);

  if (recommendation.schedule) {
    recommendation.schedule.am.forEach(step => add(step.product));
    Object.values(recommendation.schedule.pmByDay).forEach(day => day.forEach(step => add(step.product)));
  }

  return set;
}

function containsSubstring(collection: Iterable<string>, needles: string[]): boolean {
  const items = Array.from(collection).map(value => value.toLowerCase());
  return needles.every(needle => items.some(item => item.includes(needle.toLowerCase())));
}

function excludesSubstring(collection: Iterable<string>, needles: string[]): boolean {
  const items = Array.from(collection).map(value => value.toLowerCase());
  return needles.every(needle => items.every(item => !item.includes(needle.toLowerCase())));
}

function runScenario(scenario: ScenarioDefinition): ScenarioRunResult {
  const diagnostics: string[] = [];
  const errors: string[] = [];

  const baseForm = createBaseFormData();
  const formData = applyOverrides(baseForm, scenario.formOverrides);

  const contextForBands = {
    dateOfBirth: formData.dateOfBirth,
    pregnancyBreastfeeding: formData.pregnancyBreastfeeding,
  } as const;

  const selfBands = deriveSelfBands(formData as any, contextForBands as any);
  const followUps = getFollowUpQuestions(scenario.machine as any, selfBands);

  const followUpIds = followUps.map(f => f.ruleId);
  if (!followUpIds.includes(scenario.followUp.ruleId)) {
    errors.push(
      `Expected follow-up ${scenario.followUp.ruleId} to trigger, but received: ${followUpIds.join(', ') || 'none'}`
    );
  }

  const answersByRule: Record<string, Record<string, string | string[]>> = {
    [scenario.followUp.ruleId]: { ...scenario.followUp.answers },
  };

  const { effectiveBands, decisions } = decideAllBandUpdates(
    scenario.machine as any,
    selfBands,
    answersByRule,
    contextForBands as any
  );

  const flagSet = new Set<string>();
  const safetySet = new Set<string>();
  for (const decision of decisions) {
    for (const flag of decision.flags || []) {
      flagSet.add(flag);
    }
    for (const safety of decision.safety || []) {
      safetySet.add(safety);
    }
  }

  const acneCategories: string[] = [];
  for (const flag of flagSet) {
    const category = mapAcneCategoryFlag(flag);
    if (category && !acneCategories.includes(category)) {
      acneCategories.push(category);
    }
  }

  let evaluation: AcneFlowEvaluationResult | undefined;
  if (scenario.evaluation) {
    const evaluationContext: AcneFlowContext = {
      pregnancy: scenario.evaluation.context?.pregnancy ?? formData.pregnancy,
      pregnancyBreastfeeding:
        scenario.evaluation.context?.pregnancyBreastfeeding ?? formData.pregnancyBreastfeeding,
    };

    const questions = buildAcneSubtypeQuestions(scenario.evaluation.subtype, evaluationContext);
    const evalErrors = ensureEvaluationAnswersValid(questions, scenario.evaluation.answers);
    if (evalErrors.length) {
      evalErrors.forEach(msg => errors.push(`Evaluation config error: ${msg}`));
    }

    evaluation = evaluateAcneSubtypeFlow(
      scenario.evaluation.subtype,
      scenario.evaluation.answers,
      evaluationContext
    );
  }

  const fallbackSubtype = evaluation?.subtype;
  const contextFlags = makeDecisionFlags(acneCategories, flagSet, safetySet, fallbackSubtype);

  const recommendationContext: RecommendationContext = {
    skinType: formData.skinType,
    decisionEngine: {
      effectiveBands,
      flags: contextFlags,
    },
    effectiveBands,
    acneCategories,
    decisions,
    formData: formData as any,
  };

  const recommendation = generateRecommendations(recommendationContext);
  const allProducts = collectProducts(recommendation);

  const validationErrors = validateScenario(
    scenario,
    effectiveBands,
    flagSet,
    safetySet,
    recommendation,
    allProducts,
    evaluation
  );
  validationErrors.forEach(err => errors.push(err));

  return {
    scenario,
    formData,
    followUps,
    effectiveBands,
    decisions,
    flagSet,
    safetySet,
    acneCategories,
    contextFlags,
    recommendation,
    evaluation,
    allProducts,
    errors,
    diagnostics,
  };
}

function validateScenario(
  scenario: ScenarioDefinition,
  effectiveBands: Record<string, string>,
  flagSet: Set<string>,
  safetySet: Set<string>,
  recommendation: EnhancedRecommendation,
  allProducts: Set<string>,
  evaluation?: AcneFlowEvaluationResult
): string[] {
  const errors: string[] = [];
  const expected = scenario.expected;

  if (expected.acneBand && effectiveBands.acne !== expected.acneBand) {
    errors.push(
      `Expected acne band to be ${expected.acneBand} but received ${effectiveBands.acne || 'undefined'}`
    );
  }

  if (expected.flagIncludes) {
    for (const needle of expected.flagIncludes) {
      const match = Array.from(flagSet).some(flag => flag.toLowerCase().includes(needle.toLowerCase()));
      if (!match) {
        errors.push(`Expected decision flags to include substring "${needle}".`);
      }
    }
  }

  if (expected.safetyIncludes) {
    for (const needle of expected.safetyIncludes) {
      const match = Array.from(safetySet).some(safety => safety.toLowerCase().includes(needle.toLowerCase()));
      if (!match) {
        errors.push(`Expected safety flags to include "${needle}".`);
      }
    }
  }

  if (expected.routineIncludes) {
    if (!containsSubstring(allProducts, expected.routineIncludes)) {
      errors.push(`Routine missing expected product(s): ${expected.routineIncludes.join(', ')}`);
    }
  }

  if (expected.routineExcludes) {
    if (!excludesSubstring(allProducts, expected.routineExcludes)) {
      errors.push(`Routine unexpectedly contains restricted product(s): ${expected.routineExcludes.join(', ')}`);
    }
  }

  if (expected.noteIncludes) {
    const notes = [...(recommendation.notes || []), ...(recommendation.schedule?.warnings || [])];
    for (const needle of expected.noteIncludes) {
      const match = notes.some(note => note.toLowerCase().includes(needle.toLowerCase()));
      if (!match) {
        errors.push(`Expected routine notes to mention "${needle}".`);
      }
    }
  }

  if (expected.pregnancySafeReplacement) {
    const highRisk = ['adapalene', 'benzoyl peroxide', 'retinol', 'salicylic'];
    const hasHighRisk = Array.from(allProducts).some(product =>
      highRisk.some(keyword => product.toLowerCase().includes(keyword))
    );
    if (hasHighRisk) {
      errors.push('Pregnancy scenario still contains high-risk actives (retinoids/BPO/salicylic).');
    }
  }

  if (expected.evaluationBand && evaluation && evaluation.band !== expected.evaluationBand) {
    errors.push(
      `Expected evaluation band ${expected.evaluationBand} but received ${evaluation.band || 'undefined'}`
    );
  }

  if (expected.evaluationSubtype && evaluation && evaluation.subtype !== expected.evaluationSubtype) {
    errors.push(
      `Expected evaluation subtype ${expected.evaluationSubtype} but received ${evaluation.subtype}`
    );
  }

  return errors;
}

const scenarios: ScenarioDefinition[] = [
  {
    id: 'S1',
    title: 'Machine acne detected but client denies breakouts',
    description: 'Validates mismatch path that shifts focus to pigmentation follow-ups.',
    machine: { acne: 'red' },
    formOverrides: {
      mainConcerns: ['Pigmentation', 'Large pores'],
      concernPriority: ['Pigmentation', 'Large pores'],
      acneBreakouts: [],
      acneBreakoutType: undefined,
      acnePendingSubtype: undefined,
    },
    followUp: {
      ruleId: 'acne_machinePresence_customerNone',
      answers: {
        Q1: '1-2',
        Q2: 'Yes',
        Q3: 'No',
        Q4: 'No',
        Q5: 'None',
      },
    },
    expected: {
      acneBand: 'green',
      flagIncludes: ['shift-focus-to-PIH/PIE'],
      routineExcludes: ['Benzoyl Peroxide', 'Adapalene'],
    },
  },
  {
    id: 'S2',
    title: 'Comedonal congestion with machine clear reading',
    description: 'Ensures comedonal subtype elevates acne band to yellow and drives retinoid-centric plan.',
    machine: { acne: 'blue' },
    formOverrides: {
      mainConcerns: ['Acne'],
      concernPriority: ['Acne'],
      acneBreakouts: [
        {
          type: 'Blackheads (tiny dark dots in pores)',
          severity: 'Many in the T-zone (11–30) → Yellow',
          category: 'Comedonal acne',
        },
      ],
      acneBreakoutType: 'Blackheads',
      acnePendingSubtype: 'Comedonal',
    },
    followUp: {
      ruleId: 'acne_machineClear_customerPresence',
      answers: {
        Q1: 'None',
        Q2: 'No',
        Q3: '10-20',
        Q4: 'No',
        Q5: 'No',
      },
    },
    evaluation: {
      subtype: 'Comedonal',
      answers: {
        Q1: 'Yes',
        Q2: '10-20',
        Q3: 'None',
      },
    },
    expected: {
      acneBand: 'yellow',
      flagIncludes: ['acne-category:Comedonal'],
      routineIncludes: ['Adapalene 0.1%'],
      routineExcludes: ['Benzoyl Peroxide'],
      evaluationBand: 'yellow',
      evaluationSubtype: 'Comedonal',
    },
  },
  {
    id: 'S3',
    title: 'Moderate inflammatory lesions escalated to red',
    description: 'Confirms inflammatory rule promotes BPO AM routine.',
    machine: { acne: 'blue' },
    formOverrides: {
      mainConcerns: ['Acne'],
      concernPriority: ['Acne'],
      acneBreakouts: [
        {
          type: 'Red pimples (inflamed, sometimes pus-filled)',
          severity: 'Several (4–10), some painful → Yellow',
          category: 'Inflammatory acne',
        },
      ],
      acneBreakoutType: 'RedPimples',
      acnePendingSubtype: 'Inflammatory',
    },
    followUp: {
      ruleId: 'acne_machineClear_customerPresence',
      answers: {
        Q1: '6-15',
        Q2: 'No',
        Q3: '<10',
        Q4: 'No',
        Q5: 'No',
      },
    },
    evaluation: {
      subtype: 'Inflammatory',
      answers: {
        Q1: '6-15',
        Q2: 'No',
        Q3: '<10',
        Q4: 'No',
        Q5: 'No',
      },
    },
    expected: {
      acneBand: 'red',
      flagIncludes: ['acne-category:Inflammatory'],
      routineIncludes: ['Benzoyl Peroxide 2.5% AM'],
      evaluationBand: 'red',
      evaluationSubtype: 'Inflammatory',
    },
  },
  {
    id: 'S4',
    title: 'Machine-detected severe flare triggers referral',
    description: 'mismatch rule should escalate to dermatologist referral for hidden severe acne.',
    machine: { acne: 'yellow' },
    formOverrides: {
      mainConcerns: ['Pigmentation'],
      concernPriority: ['Pigmentation'],
      acneBreakouts: [],
    },
    followUp: {
      ruleId: 'acne_machinePresence_customerNone',
      answers: {
        Q1: 'Several',
        Q2: 'No',
        Q3: 'No',
        Q4: 'No',
        Q5: '>15',
      },
    },
    expected: {
      acneBand: 'red',
      safetyIncludes: ['refer-derm'],
    },
  },
  {
    id: 'S5',
    title: 'Customer reports nodulocystic lesions',
    description: 'Validates customer-declared nodules trigger refer-derm safety gate.',
    machine: { acne: 'blue' },
    formOverrides: {
      mainConcerns: ['Acne'],
      concernPriority: ['Acne'],
      severeCysticAcne: 'Yes',
      acneBreakouts: [
        {
          type: 'Large painful bumps (deep cystic acne)',
          severity: 'Frequent (1–3 per week) → Yellow',
          category: 'Cystic acne',
        },
      ],
      acneBreakoutType: 'PainfulBumps',
      acnePendingSubtype: 'Nodulocystic',
    },
    followUp: {
      ruleId: 'acne_machineClear_customerPresence',
      answers: {
        Q1: '6-15',
        Q2: 'Yes',
        Q3: '10-20',
        Q4: 'No',
        Q5: 'No',
      },
    },
    expected: {
      acneBand: 'red',
      safetyIncludes: ['refer-derm'],
      flagIncludes: ['acne-category:Nodulocystic'],
    },
  },
  {
    id: 'S6',
    title: 'Situational flare from triggers',
    description: 'Ensures situational acne remains blue band with Adapalene nighttime support.',
    machine: { acne: 'blue' },
    formOverrides: {
      mainConcerns: ['Acne'],
      concernPriority: ['Acne'],
      acneBreakouts: [
        {
          type: 'Red pimples (inflamed, sometimes pus-filled)',
          severity: 'Several (4–10), some painful → Yellow',
          category: 'Inflammatory acne',
        },
      ],
      acneBreakoutType: 'RedPimples',
      acnePendingSubtype: 'Inflammatory',
    },
    followUp: {
      ruleId: 'acne_machineClear_customerPresence',
      answers: {
        Q1: '1-5',
        Q2: 'No',
        Q3: '<10',
        Q4: 'Yes',
        Q5: 'No',
      },
    },
    evaluation: {
      subtype: 'Inflammatory',
      answers: {
        Q1: '1-5',
        Q2: 'No',
        Q3: '<10',
        Q4: 'Yes',
        Q5: 'No',
      },
    },
    expected: {
      acneBand: 'blue',
      flagIncludes: ['situational acne'],
      routineIncludes: ['Adapalene 0.1%'],
      evaluationBand: 'yellow',
    },
  },
  {
    id: 'S7',
    title: 'Pregnancy-safe substitutions',
    description: 'Pregnancy flag should remove retinoids and benzoyl peroxide.',
    machine: { acne: 'blue' },
    formOverrides: {
      mainConcerns: ['Acne'],
      concernPriority: ['Acne'],
      pregnancy: 'Yes',
      pregnancyBreastfeeding: 'Yes',
      acneBreakouts: [
        {
          type: 'Red pimples (inflamed, sometimes pus-filled)',
          severity: 'Several (4–10), some painful → Yellow',
          category: 'Inflammatory acne',
        },
      ],
    },
    followUp: {
      ruleId: 'acne_machineClear_customerPresence',
      answers: {
        Q1: '1-5',
        Q2: 'No',
        Q3: '<10',
        Q4: 'No',
        Q5: 'Yes',
      },
    },
    expected: {
      acneBand: 'blue',
      safetyIncludes: ['pregnancy-filter'],
      routineExcludes: ['Adapalene', 'Benzoyl Peroxide'],
      pregnancySafeReplacement: true,
    },
  },
  {
    id: 'S8',
    title: 'Hormonal pattern despite customer downplaying acne',
    description: 'Monthly jawline flares should classify as hormonal and keep band blue.',
    machine: { acne: 'yellow' },
    formOverrides: {
      mainConcerns: ['Dullness'],
      concernPriority: ['Dullness'],
      acneBreakoutType: 'JawlineFlares',
      acnePendingSubtype: 'Hormonal',
      acneBreakouts: [],
    },
    followUp: {
      ruleId: 'acne_machinePresence_customerNone',
      answers: {
        Q1: '1-2',
        Q2: 'No',
        Q3: 'Yes',
        Q4: 'No',
        Q5: 'None',
      },
    },
    evaluation: {
      subtype: 'Hormonal',
      answers: {
        Q1: 'Yes',
        Q2: 'Yes',
        Q3: 'Yes',
        Q4: 'None',
        Q5: 'No',
      },
    },
    expected: {
      acneBand: 'blue',
      flagIncludes: ['Hormonal'],
      evaluationBand: 'blue',
      evaluationSubtype: 'Hormonal',
    },
  },
];

const results = scenarios.map(runScenario);

const summaryRows = results.map(result => {
  const { scenario, effectiveBands, contextFlags, recommendation, errors } = result;
  const status = errors.length ? 'FAIL' : 'PASS';
  return {
    Scenario: `${scenario.id} – ${scenario.title}`,
    Band: effectiveBands.acne || '-',
    Subtype: contextFlags.acneSubtype || '-',
    PrimarySerum: recommendation.coreSerum,
    Status: status,
    Issues: errors[0] || '',
  };
});

console.table(summaryRows);

const failures = results.filter(result => result.errors.length);
if (failures.length) {
  console.log('\nDetailed diagnostics for failing scenarios:\n');
  for (const failure of failures) {
    console.log(`❌ ${failure.scenario.id} – ${failure.scenario.title}`);
    failure.errors.forEach((err, idx) => console.log(`  ${idx + 1}. ${err}`));
    console.log('  Decision flags:', Array.from(failure.flagSet).join(', ') || 'none');
    console.log('  Safety flags:', Array.from(failure.safetySet).join(', ') || 'none');
    console.log('  Products:', Array.from(failure.allProducts).join(' | ') || 'none');
    if (failure.evaluation) {
      console.log('  Evaluation:', failure.evaluation);
    }
    console.log('');
  }
  process.exitCode = 1;
} else {
  console.log('\nAll acne scenarios passed ✅');
}
