import {
  MachineScanBands,
  deriveSelfBands,
  getFollowUpQuestions,
  decideAllBandUpdates,
} from '../src/lib/decisionEngine';
import { lookupMatrixEntry } from '../src/data/concernMatrix';
import { generateRecommendations, RecommendationContext, EnhancedRecommendation } from '../src/services/recommendationEngine';

type AnswersByRule = Record<string, Record<string, string | string[]>>;

function logSection(title: string): void {
  console.log('\n=== ' + title + ' ===');
}

function runScenario() {
  const machine: MachineScanBands = {
    acne: 'red',
    sebum: 'red',
    pigmentation_brown: 'yellow',
    pores: 'blue',
  };

  const formData = {
    name: 'Scenario Test',
    skinType: 'Oily',
    mainConcerns: ['Acne', 'Pigmentation', 'Large pores'],
    concernPriority: ['Acne', 'Pigmentation', 'Large pores'],
    oilLevels: 'Slight shine only in T-zone – Blue',
    hydrationLevels: 'Comfortable, no tightness – Green',
    acneBreakouts: [
      {
        type: 'Red pimples (inflamed, sometimes pus-filled)',
        severity: '1-5 – Blue',
        category: 'Inflammatory acne',
      },
    ],
    pigmentationType: 'Moderate brown spots/patches, noticeable in several areas – Yellow',
    poresType: 'Clearly visible on multiple zones (nose, cheeks, forehead) – Yellow',
    serumComfort: '3',
    pregnancy: 'No',
    pregnancyBreastfeeding: 'No',
    allergies: '',
    recentIsotretinoin: 'No',
    severeCysticAcne: 'No',
    barrierStressHigh: 'No',
  };

  const self = deriveSelfBands(formData as any, {
    dateOfBirth: '1992-08-04',
    pregnancyBreastfeeding: formData.pregnancyBreastfeeding,
  } as any);

  logSection('Derived Self Bands');
  console.dir(self, { depth: null });

  const followUps = getFollowUpQuestions(machine as any, self);
  logSection('Follow-up Questions Triggered');
  console.dir(followUps, { depth: null });

  const acneAnswers: Record<string, string> = {
    Q1: 'Several',
    Q2: 'No',
    Q3: 'No',
    Q4: 'Yes',
    Q5: '1-5',
  };

  const answersByRule: AnswersByRule = {
    acne_machinePresence_customerNone: acneAnswers,
  };

  const { effectiveBands, decisions } = decideAllBandUpdates(
    machine as any,
    self,
    answersByRule,
    {
      dateOfBirth: '1992-08-04',
      pregnancyBreastfeeding: formData.pregnancyBreastfeeding,
    } as any
  );

  logSection('Decision Engine Output');
  console.log('Effective Bands:');
  console.dir(effectiveBands, { depth: null });
  console.log('Decisions:');
  console.dir(decisions, { depth: null });

  const acneCategories = ['Inflammatory acne'];
  const recommendationContext: RecommendationContext = {
    skinType: formData.skinType,
    decisionEngine: {
      effectiveBands,
      flags: {
        acneSubtype: acneCategories[0],
        acneHormonal: false,
        dermatologistReferral: false,
        barrierOverride: false,
        textureSubtype: formData.textureType || '',
        pigmentationSubtype: formData.pigmentationType || '',
      },
    },
    effectiveBands,
    acneCategories,
    decisions,
    formData: {
      ...formData,
    },
  };

  const recommendation: EnhancedRecommendation = generateRecommendations(recommendationContext);

  logSection('Recommendation Result');
  console.dir(recommendation, { depth: null });

  const primaryMatrixRow = lookupMatrixEntry({
    concern: 'acne',
    subtype: 'Inflammatory',
    skinType: 'Oily',
    band: 'yellow',
  });

  const pigmentationSubtype = 'PIH';
  const pigmentationRow = lookupMatrixEntry({
    concern: 'pigmentation',
    subtype: pigmentationSubtype,
    skinType: 'Oily',
    band: effectiveBands.pigmentation_brown || 'yellow',
  });

  const poresRow = lookupMatrixEntry({
    concern: 'pores',
    subtype: 'General',
    skinType: 'Oily',
    band: effectiveBands.pores || 'blue',
  });

  logSection('Matrix Rows Used');
  console.log('Primary Concern (Acne - Inflammatory - Oily - Yellow):');
  console.dir(primaryMatrixRow, { depth: null });
  console.log(`Secondary Concern (Pigmentation - ${pigmentationSubtype} - Oily - ${effectiveBands.pigmentation_brown || 'yellow'}):`);
  console.dir(pigmentationRow, { depth: null });
  console.log(`Tertiary Concern (Pores - General - Oily - ${effectiveBands.pores || 'blue'}):`);
  console.dir(poresRow, { depth: null });
}

runScenario();
