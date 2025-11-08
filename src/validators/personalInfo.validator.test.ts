import { describe, it, expect } from 'vitest';
import {
  validateName,
  validatePhone,
  validateDateOfBirth,
  validateGender,
  validatePersonalInfo,
} from './personalInfo.validator';

describe('Personal Info Validators', () => {
  describe('validateName', () => {
    it('should pass for valid name', () => {
      const result = validateName('John Doe');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail for empty name', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });

    it('should fail for whitespace-only name', () => {
      const result = validateName('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });
  });

  describe('validatePhone', () => {
    describe('E.164 format', () => {
      it('should accept valid E.164 Indian number', () => {
        const result = validatePhone('+919876543210');
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should accept valid E.164 US number', () => {
        const result = validatePhone('+12125551234');
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject E.164 starting with 0', () => {
        const result = validatePhone('+01234567890');
        expect(result.isValid).toBe(false);
      });
    });

    describe('Indian 10-digit format', () => {
      it('should accept valid Indian mobile starting with 9', () => {
        const result = validatePhone('9876543210');
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should accept valid Indian mobile starting with 8', () => {
        const result = validatePhone('8765432109');
        expect(result.isValid).toBe(true);
      });

      it('should accept valid Indian mobile starting with 7', () => {
        const result = validatePhone('7654321098');
        expect(result.isValid).toBe(true);
      });

      it('should accept valid Indian mobile starting with 6', () => {
        const result = validatePhone('6543210987');
        expect(result.isValid).toBe(true);
      });

      it('should reject 10-digit number starting with 5', () => {
        const result = validatePhone('5432109876');
        expect(result.isValid).toBe(false);
      });
    });

    describe('International format', () => {
      it('should accept international number with 11 digits', () => {
        const result = validatePhone('12345678901');
        expect(result.isValid).toBe(true);
      });

      it('should accept international number with 15 digits', () => {
        const result = validatePhone('123456789012345');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Invalid formats', () => {
      it('should reject empty phone number', () => {
        const result = validatePhone('');
        expect(result.isValid).toBe(false);
        expect(result.errors.phoneNumber).toBe('Phone number is required');
      });

      it('should reject too short number', () => {
        const result = validatePhone('123');
        expect(result.isValid).toBe(false);
        expect(result.errors.phoneNumber).toBe('Enter a valid phone number');
      });

      it('should reject alphabetic characters', () => {
        const result = validatePhone('abcdefghij');
        expect(result.isValid).toBe(false);
      });

      it('should reject special characters only', () => {
        const result = validatePhone('!!!@@@###');
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validateDateOfBirth', () => {
    it('should pass for valid date', () => {
      const result = validateDateOfBirth('1990-01-15');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail for empty date', () => {
      const result = validateDateOfBirth('');
      expect(result.isValid).toBe(false);
      expect(result.errors.dateOfBirth).toBe('Date of birth is required');
    });

    it('should fail for whitespace-only date', () => {
      const result = validateDateOfBirth('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors.dateOfBirth).toBe('Date of birth is required');
    });
  });

  describe('validateGender', () => {
    it('should pass for Male', () => {
      const result = validateGender('Male');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should pass for Female', () => {
      const result = validateGender('Female');
      expect(result.isValid).toBe(true);
    });

    it('should pass for Non-binary', () => {
      const result = validateGender('Non-binary');
      expect(result.isValid).toBe(true);
    });

    it('should fail for empty gender', () => {
      const result = validateGender('');
      expect(result.isValid).toBe(false);
      expect(result.errors.gender).toBe('Gender is required');
    });
  });

  describe('validatePersonalInfo', () => {
    it('should pass for all valid fields', () => {
      const result = validatePersonalInfo({
        name: 'John Doe',
        phoneNumber: '+919876543210',
        dateOfBirth: '1990-01-15',
        gender: 'Male',
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail for multiple invalid fields', () => {
      const result = validatePersonalInfo({
        name: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
      });
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(4);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.phoneNumber).toBeDefined();
      expect(result.errors.dateOfBirth).toBeDefined();
      expect(result.errors.gender).toBeDefined();
    });

    it('should fail for invalid phone but valid other fields', () => {
      const result = validatePersonalInfo({
        name: 'John Doe',
        phoneNumber: '123',
        dateOfBirth: '1990-01-15',
        gender: 'Male',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.phoneNumber).toBe('Enter a valid phone number');
      expect(result.errors.name).toBeUndefined();
      expect(result.errors.dateOfBirth).toBeUndefined();
      expect(result.errors.gender).toBeUndefined();
    });
  });
});
