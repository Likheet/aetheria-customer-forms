import {
  generateRecommendations,
  type RecommendationContext,
  type RoutineVariant,
} from '../src/services/recommendationEngine';

const sampleContext: RecommendationContext = {
  skinType: 'Normal',
  formData: {
    mainConcerns: ['Acne', 'Pigmentation', 'Fine lines & wrinkles'],
    concernPriority: ['Acne', 'Pigmentation', 'Fine lines & wrinkles'],
    serumComfort: '2',
    pregnancy: 'no',
    pregnancyBreastfeeding: 'no',
    sensitivity: 'no',
    allergies: '',
  },
};

const result = generateRecommendations(sampleContext);

if (!result || !Array.isArray(result.routines)) {
  throw new Error('generateRecommendations did not return { routines: [...] }');
}

const { routines, selectedIndex } = result;

const expectedTypes: Array<RoutineVariant['type']> = ['conservative', 'balanced', 'comprehensive'];
if (routines.length < expectedTypes.length) {
  throw new Error(`Expected at least ${expectedTypes.length} routines, received ${routines.length}`);
}

expectedTypes.forEach(type => {
  if (!routines.some(r => r.type === type)) {
    throw new Error(`Missing routine type: ${type}`);
  }
});

const balancedRoutine = routines.find(r => r.type === 'balanced');
if (!balancedRoutine) {
  throw new Error('Balanced routine not found.');
}
if (!balancedRoutine.recommended) {
  throw new Error('Balanced routine should be marked recommended.');
}
if (selectedIndex === undefined || selectedIndex < 0 || selectedIndex >= routines.length) {
  throw new Error(`Selected index ${selectedIndex} is invalid.`);
}

const conservative = routines.find(r => r.type === 'conservative');
const comprehensive = routines.find(r => r.type === 'comprehensive');
if (!conservative || !comprehensive) {
  throw new Error('Missing conservative or comprehensive routine.');
}

if (conservative.serumCount > balancedRoutine.serumCount) {
  throw new Error('Conservative routine should not have more serums than Balanced.');
}

if (comprehensive.available && comprehensive.serumCount < balancedRoutine.serumCount) {
  throw new Error('Comprehensive routine should have at least as many serums as Balanced when available.');
}

const requiredFields: Array<keyof RoutineVariant> = [
  'label',
  'description',
  'irritationRisk',
  'am',
  'pm',
  'notes',
  'schedule',
];
routines.forEach(routine => {
  requiredFields.forEach(field => {
    if (routine[field] === undefined) {
      throw new Error(`Routine ${routine.type} is missing field ${String(field)}`);
    }
  });
});

console.log('✅ Multi-routine generation verified.');
console.table(
  routines.map(r => ({
    type: r.type,
    label: r.label,
    recommended: !!r.recommended,
    available: r.available,
    serumCount: r.serumCount,
  })),
);
