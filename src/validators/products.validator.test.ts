import { describe, it, expect } from 'vitest';
import { validateCurrentProducts } from './products.validator';

describe('Products Validators', () => {
  describe('validateCurrentProducts', () => {
    it('should pass for valid products list', () => {
      const products = [
        { name: 'CeraVe Cleanser', duration: '6 months' },
        { name: 'The Ordinary Niacinamide', duration: '3 months' },
      ];
      const result = validateCurrentProducts(products);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should pass for single product', () => {
      const products = [{ name: 'Cetaphil Moisturizer', duration: '1 year' }];
      const result = validateCurrentProducts(products);
      expect(result.isValid).toBe(true);
    });

    it('should fail for empty products list', () => {
      const result = validateCurrentProducts([]);
      expect(result.isValid).toBe(false);
      expect(result.errors.currentProductsList).toBe('Please add at least one product');
    });

    it('should fail for product with empty name', () => {
      const products = [
        { name: '', duration: '6 months' },
        { name: 'Product 2', duration: '3 months' },
      ];
      const result = validateCurrentProducts(products);
      expect(result.isValid).toBe(false);
      expect(result.errors.currentProductsList).toBe(
        'Please fill in all product names and durations'
      );
    });

    it('should fail for product with empty duration', () => {
      const products = [
        { name: 'Product 1', duration: '' },
        { name: 'Product 2', duration: '3 months' },
      ];
      const result = validateCurrentProducts(products);
      expect(result.isValid).toBe(false);
      expect(result.errors.currentProductsList).toBe(
        'Please fill in all product names and durations'
      );
    });

    it('should fail for product with whitespace-only name', () => {
      const products = [{ name: '   ', duration: '6 months' }];
      const result = validateCurrentProducts(products);
      expect(result.isValid).toBe(false);
    });

    it('should fail for product with whitespace-only duration', () => {
      const products = [{ name: 'Product 1', duration: '   ' }];
      const result = validateCurrentProducts(products);
      expect(result.isValid).toBe(false);
    });
  });
});
