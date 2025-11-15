import { describe, expect, it } from 'vitest';
import { generateConsultAutoFill } from './consultAutoFill';
import type { UpdatedConsultData } from '../types';

const constantRng = () => 0.1;

const createBaseForm = (overrides: Partial<UpdatedConsultData>): UpdatedConsultData =>
  ({
    ...overrides,
  } as UpdatedConsultData);

describe('generateConsultAutoFill', () => {
  it('fills post acne scarring follow-ups when the concern is selected', () => {
    const base = createBaseForm({
      mainConcerns: ['Post Acne Scarring'],
      concernPriority: ['Post Acne Scarring'],
    });

    const { formData } = generateConsultAutoFill({ base, rng: constantRng });

    expect(formData.mainConcerns).toContain('Post Acne Scarring');
    expect(formData.postAcneScarringType).toBeTruthy();
    expect(formData.postAcneScarringSubtype).toBeTruthy();
    expect(formData.postAcneScarringColor || formData.postAcneScarringSeverity).not.toBe('');
  });

  it('keeps acne pinned to the top of concern priority', () => {
    const base = createBaseForm({
      mainConcerns: ['Large pores', 'Acne', 'Pigmentation'],
      concernPriority: ['Large pores', 'Pigmentation', 'Acne'],
    });

    const { formData } = generateConsultAutoFill({ base, rng: constantRng });

    expect(formData.concernPriority?.[0]).toBe('Acne');
    expect(formData.concernPriority?.length).toBeGreaterThan(0);
  });
});
