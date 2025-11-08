import { describe, it, expect } from 'vitest';
import {
  validateMainConcerns,
  validateConcernPriority,
  validateAcneType,
  validateAcneSeverity,
  validateConcernField,
  validatePostAcneScarring,
} from './concerns.validator';

describe('Concerns Validators', () => {
  describe('validateMainConcerns', () => {
    it('should pass for 1 concern', () => {
      const result = validateMainConcerns(['Acne']);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should pass for 3 concerns', () => {
      const result = validateMainConcerns(['Acne', 'Pigmentation', 'Fine lines & wrinkles']);
      expect(result.isValid).toBe(true);
    });

    it('should fail for 0 concerns', () => {
      const result = validateMainConcerns([]);
      expect(result.isValid).toBe(false);
      expect(result.errors.mainConcerns).toBe('Select at least one main concern');
    });

    it('should fail for more than 3 concerns', () => {
      const result = validateMainConcerns([
        'Acne',
        'Pigmentation',
        'Fine lines & wrinkles',
        'Large pores',
      ]);
      expect(result.isValid).toBe(false);
      expect(result.errors.mainConcerns).toBe('Please select a maximum of 3 main concerns');
    });
  });

  describe('validateConcernPriority', () => {
    it('should pass when Acne is #1 and all concerns ranked', () => {
      const mainConcerns = ['Acne', 'Pigmentation', 'Large pores'];
      const priority = ['Acne', 'Pigmentation', 'Large pores'];
      const result = validateConcernPriority(mainConcerns, priority);
      expect(result.isValid).toBe(true);
    });

    it('should pass when Acne is not selected', () => {
      const mainConcerns = ['Pigmentation', 'Large pores'];
      const priority = ['Pigmentation', 'Large pores'];
      const result = validateConcernPriority(mainConcerns, priority);
      expect(result.isValid).toBe(true);
    });

    it('should fail when Acne is selected but not #1', () => {
      const mainConcerns = ['Acne', 'Pigmentation'];
      const priority = ['Pigmentation', 'Acne'];
      const result = validateConcernPriority(mainConcerns, priority);
      expect(result.isValid).toBe(false);
      expect(result.errors.concernPriority).toBe('Acne must be the top priority when selected.');
    });

    it('should fail when not all concerns are ranked', () => {
      const mainConcerns = ['Acne', 'Pigmentation', 'Large pores'];
      const priority = ['Acne', 'Pigmentation'];
      const result = validateConcernPriority(mainConcerns, priority);
      expect(result.isValid).toBe(false);
      expect(result.errors.concernPriority).toBe('Please order all selected concerns.');
    });

    it('should fail when priority has more items than selected', () => {
      const mainConcerns = ['Acne', 'Pigmentation'];
      const priority = ['Acne', 'Pigmentation', 'Large pores'];
      const result = validateConcernPriority(mainConcerns, priority);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateAcneType', () => {
    it('should pass for valid breakout types', () => {
      const breakouts = [
        { type: 'Whitehead', severity: '' },
        { type: 'Cyst', severity: '' },
      ];
      const result = validateAcneType(breakouts);
      expect(result.isValid).toBe(true);
    });

    it('should fail for empty breakouts array', () => {
      const result = validateAcneType([]);
      expect(result.isValid).toBe(false);
      expect(result.errors.acneBreakouts).toBe('Select at least one breakout type');
    });
  });

  describe('validateAcneSeverity', () => {
    it('should pass when all breakouts have severity', () => {
      const breakouts = [
        { type: 'Whitehead', severity: 'mild' },
        { type: 'Cyst', severity: 'severe' },
      ];
      const result = validateAcneSeverity(breakouts);
      expect(result.isValid).toBe(true);
    });

    it('should fail when no breakouts', () => {
      const result = validateAcneSeverity([]);
      expect(result.isValid).toBe(false);
      expect(result.errors.acneBreakouts).toBe('Select at least one breakout type');
    });

    it('should fail when some breakouts missing severity', () => {
      const breakouts = [
        { type: 'Whitehead', severity: 'mild' },
        { type: 'Cyst', severity: '' },
      ];
      const result = validateAcneSeverity(breakouts);
      expect(result.isValid).toBe(false);
      expect(result.errors.acneBreakouts).toBe('Select a severity for each breakout type');
    });

    it('should fail when severity is undefined', () => {
      const breakouts = [
        { type: 'Whitehead', severity: 'mild' },
        { type: 'Cyst' } as any,
      ];
      const result = validateAcneSeverity(breakouts);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateConcernField', () => {
    it('should pass for valid type', () => {
      const result = validateConcernField('Pigmentation', 'type', 'Brown spots');
      expect(result.isValid).toBe(true);
    });

    it('should pass for valid severity', () => {
      const result = validateConcernField('Pigmentation', 'severity', 'Mild');
      expect(result.isValid).toBe(true);
    });

    it('should fail for empty type', () => {
      const result = validateConcernField('Pigmentation', 'type', '');
      expect(result.isValid).toBe(false);
      expect(result.errors['Pigmentation_type']).toBe('Pigmentation type is required');
    });

    it('should fail for empty severity', () => {
      const result = validateConcernField('Large pores', 'severity', '');
      expect(result.isValid).toBe(false);
      expect(result.errors['Large pores_severity']).toBe('Large pores severity is required');
    });
  });

  describe('validatePostAcneScarring', () => {
    it('should pass for pigmentation type with color', () => {
      const result = validatePostAcneScarring(
        'Post-inflammatory hyperpigmentation',
        '',
        'Dark brown'
      );
      expect(result.isValid).toBe(true);
    });

    it('should pass for atrophic type with severity', () => {
      const result = validatePostAcneScarring('Atrophic scars', 'Moderate', '');
      expect(result.isValid).toBe(true);
    });

    it('should fail for pigmentation type without color', () => {
      const result = validatePostAcneScarring('Post-inflammatory hyperpigmentation', '', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.postAcneScarringColor).toBe('Post Acne Scarring color is required');
    });

    it('should fail for atrophic type without severity', () => {
      const result = validatePostAcneScarring('Atrophic scars', '', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.postAcneScarringSeverity).toBe(
        'Post Acne Scarring severity is required'
      );
    });
  });
});
