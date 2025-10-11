import assert from 'node:assert/strict';

import { generateRecommendations } from '../src/services/recommendationEngine';
import type { RecommendationContext } from '../src/services/recommendationEngineMatrix';

function pickRecommendedRoutine(context: RecommendationContext) {
  const result = generateRecommendations(context);
  return result.routines[result.selectedIndex];
}

const context1: RecommendationContext = {
  skinType: 'Oily',
  decisionEngine: {
    effectiveBands: {
      acne: 'yellow',
      sebum: 'yellow',
      moisture: 'green',
    },
    flags: {
      textureSubtype: 'pie',
    },
  },
  formData: {
    mainConcerns: ['Acne scars'],
    concernPriority: ['Acne scars'],
    oilLevels: 'Noticeable shine in multiple areas → Yellow',
    hydrationLevels: 'Comfortable, no tightness → Green',
  },
};

const routine1 = pickRecommendedRoutine(context1);
assert.equal(routine1.cleanser, 'Gel-based cleanser', 'Should respect explicit matrix cleanser for this row');
assert.equal(routine1.moisturizer, 'Oil-free gel moisturizer', 'Oily-Hydrated profiles should pick oil-free gel');
assert.equal(routine1.sunscreen, 'Lightweight gel sunscreen SPF 50', 'Oily-Hydrated profiles should map to lightweight gel sunscreen defaults');

const context2: RecommendationContext = {
  skinType: 'Combo',
  decisionEngine: {
    effectiveBands: {
      acne: 'blue',
      sebum: 'blue',
      moisture: 'yellow',
    },
    flags: {
      acneSubtype: 'Hormonal',
    },
  },
  formData: {
    mainConcerns: ['Acne'],
    concernPriority: ['Acne'],
    oilLevels: 'Slight shine only in T-zone, not bothersome → Blue',
    hydrationLevels: 'Often feels tight, rough, or flaky → Yellow',
  },
};

const routine2 = pickRecommendedRoutine(context2);
assert.equal(routine2.cleanser, 'Cream cleanser', 'Combo-Dehydrated should resolve to cream cleanser');
assert.equal(routine2.moisturizer, 'Gel-cream moisturizer', 'Combo-Dehydrated should resolve to gel-cream');
assert.equal(routine2.sunscreen, 'Hybrid sunscreen SPF 50', 'Combo-Dehydrated should resolve to hybrid sunscreen');

const context3: RecommendationContext = {
  skinType: 'Combo',
  decisionEngine: {
    effectiveBands: {
      acne: 'blue',
      sebum: 'blue',
    },
  },
  formData: {
    mainConcerns: ['Acne'],
    concernPriority: ['Acne'],
    oilLevels: 'Slight shine only in T-zone, not bothersome → Blue',
    hydrationLevels: 'Comfortable, no tightness → Green',
  },
};

const routine3 = pickRecommendedRoutine(context3);
assert.equal(routine3.cleanser, 'Gentle foaming cleanser', 'Matrix overrides should remain when specific products are provided');
assert.equal(routine3.sunscreen, 'Hybrid sunscreen SPF 50', 'Skin-type defaults should still populate SKINTYPE_DEFAULT entries');

console.log('✅ Skin-type product resolution tests passed.');
