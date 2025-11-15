import { describe, expect, it } from 'vitest';
import { buildFacialProtocol } from './facialProtocol';

const findStep = (steps: ReturnType<typeof buildFacialProtocol>, target: number) =>
  steps.find(step => step.step === target);

describe('buildFacialProtocol', () => {
  it('skips the pre-cleanser for dry skin profiles', () => {
    const steps = buildFacialProtocol({
      skinType: 'Dry - Dehydrated',
      mainConcerns: [],
      concernPriority: [],
      sensitivityAnswer: 'No',
    });

    const preCleanser = findStep(steps, 1);
    expect(preCleanser).toBeDefined();
    expect(preCleanser?.skipped).toBe(true);
    expect(preCleanser?.product).toContain('Skip');
  });

  it('prefers the gentle brightening essence for sensitive pigmentation concerns', () => {
    const steps = buildFacialProtocol({
      skinType: 'Combination - Hydrated',
      mainConcerns: ['Pigmentation'],
      concernPriority: ['Pigmentation'],
      sensitivityAnswer: 'Yes',
    });

    const essence = findStep(steps, 7);
    expect(essence?.product).toBe('Beauty of Joseon Ginseng Essence Water');
    expect(essence?.productType).toBe('Gentle brightening essence');
  });

  it('chooses the hydrating mask when acne and sensitivity collide', () => {
    const steps = buildFacialProtocol({
      skinType: 'Oily - Dehydrated',
      mainConcerns: ['Acne'],
      concernPriority: ['Acne'],
      sensitivityBand: 'Yellow',
    });

    const mask = findStep(steps, 8);
    expect(mask?.productType).toBe('Hydrating mask');
    expect(mask?.product).toBe('Beauty of Joseon Rice Mask');
  });
});
