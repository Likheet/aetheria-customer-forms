import { generateRecommendations, RecommendationContext, EnhancedRecommendation } from '../src/services/recommendationEngine';

type ScenarioExpectation = {
  expectAmSerum?: boolean;
  expectPmSerum?: boolean;
  amScheduleIncludes?: string;
  amScheduleExcludes?: string;
  pmScheduleIncludes?: string;
  pmScheduleExcludes?: string;
};

type Scenario = {
  label: string;
  context: RecommendationContext;
  expectation: ScenarioExpectation;
};

const scenarios: Scenario[] = [
  {
    label: 'Inflammatory Acne - Yellow Band (BPO AM)',
    context: {
      skinType: 'Oily',
      decisionEngine: {
        effectiveBands: { acne: 'yellow' },
        flags: { acneSubtype: 'Inflammatory' },
      },
      effectiveBands: { acne: 'yellow' },
      acneCategories: ['Inflammatory acne'],
      formData: {
        name: 'Matrix Test User',
        skinType: 'Oily',
        mainConcerns: ['Acne'],
        concernPriority: ['Acne'],
        pregnancy: 'No',
        pregnancyBreastfeeding: 'No',
        sensitivity: 'No',
        serumComfort: '1',
        routineSteps: 'Simple',
        moisturizerTexture: 'Gel',
        allergies: '',
        recentIsotretinoin: 'No',
        severeCysticAcne: 'No',
        barrierStressHigh: 'No',
      },
    },
    expectation: {
      expectAmSerum: true,
      expectPmSerum: false,
      amScheduleIncludes: 'Benzoyl Peroxide 2.5% AM',
      pmScheduleExcludes: 'Benzoyl Peroxide 2.5% AM',
    },
  },
  {
    label: 'Inflammatory Acne - Blue Band (Adapalene PM)',
    context: {
      skinType: 'Combo',
      decisionEngine: {
        effectiveBands: { acne: 'blue' },
        flags: { acneSubtype: 'Inflammatory' },
      },
      effectiveBands: { acne: 'blue' },
      acneCategories: ['Inflammatory acne'],
      formData: {
        name: 'Matrix Test User',
        skinType: 'Combo',
        mainConcerns: ['Acne'],
        concernPriority: ['Acne'],
        pregnancy: 'No',
        pregnancyBreastfeeding: 'No',
        sensitivity: 'No',
        serumComfort: '1',
        routineSteps: 'Simple',
        moisturizerTexture: 'Gel',
        allergies: '',
        recentIsotretinoin: 'No',
        severeCysticAcne: 'No',
        barrierStressHigh: 'No',
      },
    },
    expectation: {
      expectAmSerum: false,
      expectPmSerum: true,
      pmScheduleIncludes: 'Adapalene 0.1% PM',
      amScheduleExcludes: 'Adapalene 0.1% PM',
    },
  },
];

function validateRoutine(label: string, result: EnhancedRecommendation, expectation: ScenarioExpectation) {
  const am = Array.isArray(result.am) ? result.am : [];
  const pm = Array.isArray(result.pm) ? result.pm : [];
  const allAmEntriesValid = am.every(item => !!item && item !== 'undefined' && item !== 'null');
  const allPmEntriesValid = pm.every(item => !!item && item !== 'undefined' && item !== 'null');
  const scheduleAmProducts = result.schedule?.am?.map(step => step.product) ?? [];
  const schedulePmProducts = result.schedule
    ? Object.values(result.schedule.pmByDay).flatMap(day => day.map(step => step.product))
    : [];

  const amHasCleanser = am.includes(result.cleanser);
  const amHasSerum = am.includes(result.coreSerum) || am.includes(result.secondarySerum || '') || am.includes(result.tertiarySerum || '');
  const amHasMoisturizer = am.includes(result.moisturizer);
  const amHasSunscreen = am.includes(result.sunscreen);

  const pmHasCleanser = pm.includes(result.cleanser);
  const pmHasSerum = pm.includes(result.coreSerum) || pm.includes(result.secondarySerum || '') || pm.includes(result.tertiarySerum || '');
  const pmHasMoisturizer = pm.includes(result.moisturizer);

  const warnings = result.schedule?.warnings ?? [];

  const summary = {
    scenario: label,
    returnedResult: !!result,
    primaryConcern: result.primaryConcern,
    amSteps: am,
    pmSteps: pm,
    amHasCleanser,
    amHasSerum,
    amHasMoisturizer,
    amHasSunscreen,
    pmHasCleanser,
    pmHasSerum,
    pmHasMoisturizer,
    amEntriesValid: allAmEntriesValid,
    pmEntriesValid: allPmEntriesValid,
    warningCount: warnings.length,
    warnings,
    scheduleAmProducts,
    schedulePmProducts,
  };

  console.log('--- Recommendation Result ---');
  console.log(JSON.stringify(result, null, 2));
  console.log('--- Validation Summary ---');
  console.table(summary);

  if (expectation.expectAmSerum && !amHasSerum) {
    throw new Error(`[${label}] Expected serum in AM routine but none found.`);
  }
  if (expectation.expectPmSerum && !pmHasSerum) {
    throw new Error(`[${label}] Expected serum in PM routine but none found.`);
  }
  if (expectation.expectAmSerum === false && amHasSerum) {
    throw new Error(`[${label}] Expected no serum in AM routine but one was present.`);
  }
  if (!allAmEntriesValid || !allPmEntriesValid) {
    throw new Error(`[${label}] AM/PM routine contains invalid entries.`);
  }
  if (expectation.amScheduleIncludes) {
    if (!scheduleAmProducts.includes(expectation.amScheduleIncludes)) {
      throw new Error(`[${label}] Expected AM schedule to include "${expectation.amScheduleIncludes}" but it was missing.`);
    }
  }
  if (expectation.amScheduleExcludes) {
    if (scheduleAmProducts.includes(expectation.amScheduleExcludes)) {
      throw new Error(`[${label}] Expected AM schedule to exclude "${expectation.amScheduleExcludes}" but it was present.`);
    }
  }
  if (expectation.pmScheduleIncludes) {
    if (!schedulePmProducts.includes(expectation.pmScheduleIncludes)) {
      throw new Error(`[${label}] Expected PM schedule to include "${expectation.pmScheduleIncludes}" but it was missing.`);
    }
  }
  if (expectation.pmScheduleExcludes) {
    if (schedulePmProducts.includes(expectation.pmScheduleExcludes)) {
      throw new Error(`[${label}] Expected PM schedule to exclude "${expectation.pmScheduleExcludes}" but it was present.`);
    }
  }
}

for (const scenario of scenarios) {
  try {
    const recommendation = generateRecommendations(scenario.context);
    validateRoutine(scenario.label, recommendation, scenario.expectation);
    console.log(`[${scenario.label}] completed successfully.`);
  } catch (error) {
    console.error(`[${scenario.label}] failed:`);
    console.error(error);
    process.exitCode = 1;
  }
}
