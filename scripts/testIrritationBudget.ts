import assert from 'node:assert/strict';

import { buildWeeklyPlan, type DayKey } from '../src/services/scheduler';

function summarizeActiveNights(plan: ReturnType<typeof buildWeeklyPlan>['plan']) {
  const nights: Array<{ day: string; cost: number; actives: string[] }> = [];
  const nightlyCost: Partial<Record<DayKey, number>> = plan.nightlyCost ?? {};
  const nightlyActives: Partial<Record<DayKey, string[]>> = plan.nightlyActives ?? {};
  for (const day of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const) {
    const cost = nightlyCost[day] ?? 0;
    const actives = nightlyActives[day] ?? [];
    nights.push({ day, cost, actives });
  }
  return nights;
}

function runScenarioLowSensitivity() {
  const { plan } = buildWeeklyPlan({
    cleanser: 'Gentle foaming cleanser',
    coreSerumKey: 'adapalene',
    coreSerumName: 'Adapalene 0.1%',
    coreSerumRawName: 'Adapalene 0.1%',
    secondarySerumKey: 'azelaic-acid',
    secondarySerumName: 'Azelaic acid 10%',
    secondarySerumRawName: 'Azelaic acid 10%',
    tertiarySerumKey: undefined,
    moisturizer: 'Gel-cream moisturizer',
    sunscreen: 'Pure mineral sunscreen SPF 50',
    flags: {
      serumComfort: 2,
      sensitivityScore: 1,
    },
  });

  assert.equal(plan.restNights?.length ?? 0, 2, 'Low sensitivity should keep 2 rest nights');
  const nights = summarizeActiveNights(plan);
  const activeNights = nights.filter(n => n.actives.length > 0);
  assert(activeNights.length >= 5, 'Should utilise most nights for actives');
  activeNights.forEach(n => {
    assert(n.cost <= 100, 'Nightly cost should stay within 100 units for low sensitivity');
    assert(n.actives.includes('Adapalene 0.1%') && n.actives.includes('Azelaic acid 10%'));
  });
  console.log('Test 1 (Low sensitivity) ✅');
}

function runScenarioModerateSensitivity() {
  const { plan } = buildWeeklyPlan({
    cleanser: 'Gentle foaming cleanser',
    coreSerumKey: 'benzoyl-peroxide',
    coreSerumName: 'Benzoyl Peroxide 2.5%',
    coreSerumRawName: 'Benzoyl Peroxide 2.5%',
    secondarySerumKey: 'azelaic-acid',
    secondarySerumName: 'Azelaic acid 10%',
    secondarySerumRawName: 'Azelaic acid 10%',
    tertiarySerumKey: 'niacinamide',
    tertiarySerumName: 'Niacinamide serum',
    tertiarySerumRawName: 'Niacinamide serum',
    additionalSerums: [],
    moisturizer: 'Gel-cream moisturizer',
    sunscreen: 'Pure mineral sunscreen SPF 50',
    flags: {
      serumComfort: 2,
      sensitivityScore: 3,
    },
  });

  assert.equal(plan.restNights?.length ?? 0, 3, 'Moderate sensitivity should enforce 3 rest nights');
  const nights = summarizeActiveNights(plan);
  const activeNights = nights.filter(n => n.actives.length > 0);
  activeNights.forEach(n => {
    assert(n.cost <= 70, `Nightly cost ${n.cost} should not exceed 70 units`);
  });
  const patterns = new Set(activeNights.map(n => n.actives.sort().join('+')));
  assert(patterns.size >= 2, 'Should alternate between at least two routines');
  console.log('Test 2 (Moderate sensitivity alternating) ✅');
}

function runScenarioHighSensitivity() {
  const { plan } = buildWeeklyPlan({
    cleanser: 'Gentle foaming cleanser',
    coreSerumKey: 'adapalene',
    coreSerumName: 'Adapalene 0.1%',
    coreSerumRawName: 'Adapalene 0.1%',
    secondarySerumKey: undefined,
    moisturizer: 'Barrier repair cream',
    sunscreen: 'Pure mineral sunscreen SPF 50',
    flags: {
      serumComfort: 1,
      sensitivityScore: 5,
    },
  });

  assert.equal(plan.restNights?.length ?? 0, 4, 'High sensitivity should create 4 rest nights');
  const nights = summarizeActiveNights(plan);
  const activeNights = nights.filter(n => n.actives.length > 0);
  assert(activeNights.length <= 3, 'Active nights should be limited to reduced frequency');
  activeNights.forEach(n => {
    assert(n.actives.includes('Adapalene 0.1%'));
  });
  console.log('Test 3 (High sensitivity reduced frequency) ✅');
}

function runScenarioBarrierOnly() {
  const { plan } = buildWeeklyPlan({
    cleanser: 'Gentle foaming cleanser',
    coreSerumKey: 'adapalene',
    coreSerumName: 'Adapalene 0.1%',
    coreSerumRawName: 'Adapalene 0.1%',
    secondarySerumKey: 'azelaic-acid',
    secondarySerumName: 'Azelaic acid 10%',
    secondarySerumRawName: 'Azelaic acid 10%',
    moisturizer: 'Barrier repair cream',
    sunscreen: 'Pure mineral sunscreen SPF 50',
    flags: {
      serumComfort: 2,
      sensitivityScore: 7,
    },
  });

  assert.equal(plan.restNights?.length ?? 0, 7, 'Very high sensitivity should rest all nights');
  const nights = summarizeActiveNights(plan);
  nights.forEach(n => {
    assert.equal(n.cost, 0, 'Rest nights should have zero irritation cost');
    assert.equal(n.actives.length, 0, 'No actives should be scheduled');
  });
  console.log('Test 4 (Barrier-only) ✅');
}

function main() {
  runScenarioLowSensitivity();
  runScenarioModerateSensitivity();
  runScenarioHighSensitivity();
  runScenarioBarrierOnly();
  console.log('\nAll irritation budget scenarios passed.');
}

main();
