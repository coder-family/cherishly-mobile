import { sanitizeId, sanitizeObjectId } from '../app/utils/validation';

describe('Memory Service - NoSQL Injection Prevention', () => {
  describe('sanitizeObjectId', () => {
    it('should accept valid MongoDB ObjectId strings', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(sanitizeObjectId(validId)).toBe(validId);
    });

    it('should trim whitespace from valid IDs', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(sanitizeObjectId(` ${validId} `)).toBe(validId);
    });

    it('should throw error for invalid ObjectId format', () => {
      expect(() => sanitizeObjectId('invalid-id')).toThrow('Invalid ID: ID must be a valid 24-character hexadecimal string');
      expect(() => sanitizeObjectId('507f1f77bcf86cd79943901')).toThrow('Invalid ID: ID must be a valid 24-character hexadecimal string');
      expect(() => sanitizeObjectId('507f1f77bcf86cd7994390111')).toThrow('Invalid ID: ID must be a valid 24-character hexadecimal string');
      expect(() => sanitizeObjectId('507f1f77bcf86cd79943901g')).toThrow('Invalid ID: ID must be a valid 24-character hexadecimal string');
    });

    it('should throw error for empty or null values', () => {
      expect(() => sanitizeObjectId('')).toThrow('Invalid ID: ID must be a non-empty string');
      expect(() => sanitizeObjectId('   ')).toThrow('Invalid ID: ID cannot be empty or whitespace only');
      expect(() => sanitizeObjectId(null as any)).toThrow('Invalid ID: ID must be a non-empty string');
      expect(() => sanitizeObjectId(undefined as any)).toThrow('Invalid ID: ID must be a non-empty string');
    });

    it('should validate MongoDB ObjectId format correctly', () => {
      // Valid ObjectIds
      expect(sanitizeObjectId('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011');
      expect(sanitizeObjectId('507f1f77bcf86cd799439012')).toBe('507f1f77bcf86cd799439012');
      
      // Invalid ObjectIds
      expect(() => sanitizeObjectId('507f1f77bcf86cd79943901')).toThrow(); // Too short
      expect(() => sanitizeObjectId('507f1f77bcf86cd7994390111')).toThrow(); // Too long
      expect(() => sanitizeObjectId('507f1f77bcf86cd79943901g')).toThrow(); // Invalid character
    });
  });

  describe('sanitizeId', () => {
    it('should accept valid alphanumeric IDs', () => {
      expect(sanitizeId('abc123')).toBe('abc123');
      expect(sanitizeId('ABC_123-def')).toBe('ABC_123-def');
      expect(sanitizeId('user123')).toBe('user123');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeId("user<script>alert('xss')</script>")).toBe('userscriptalertxssscript');
      expect(sanitizeId("user'; DROP TABLE users; --")).toBe('userDROPTABLEusers--');
      expect(sanitizeId('user$()[]{}|\\')).toBe('user');
    });

    it('should trim whitespace', () => {
      expect(sanitizeId(' abc123 ')).toBe('abc123');
    });

    it('should throw error for empty results after sanitization', () => {
      expect(() => sanitizeId('$%^&*()')).toThrow('Invalid ID: ID contains no valid characters after sanitization');
      expect(() => sanitizeId('')).toThrow('Invalid ID: ID must be a non-empty string');
      expect(() => sanitizeId('   ')).toThrow('Invalid ID: ID cannot be empty or whitespace only');
    });

    it('should throw error for IDs that are too long', () => {
      const longId = 'a'.repeat(101);
      expect(() => sanitizeId(longId)).toThrow('Invalid ID: ID is too long (maximum 100 characters)');
    });

    it('should accept IDs at the maximum length', () => {
      const maxLengthId = 'a'.repeat(100);
      expect(sanitizeId(maxLengthId)).toBe(maxLengthId);
    });

    it('should throw error for null or undefined values', () => {
      expect(() => sanitizeId(null as any)).toThrow('Invalid ID: ID must be a non-empty string');
      expect(() => sanitizeId(undefined as any)).toThrow('Invalid ID: ID must be a non-empty string');
    });
  });

  describe('NoSQL Injection Prevention', () => {
    it('should prevent common NoSQL injection attempts', () => {
      const injectionAttempts = [
        "'; DROP TABLE memories; --",
        "'; db.memories.drop(); --",
        "'; db.memories.find({}); --",
        "'; return db.memories.find(); --",
        "'; while(true){} --",
        "'; for(var i=0;i<1000000;i++){} --",
        "'; db.memories.find({$where: function() { return true; }}); --",
        "'; db.memories.find({$ne: null}); --",
        "'; db.memories.find({$gt: ''}); --",
      ];

      for (const attempt of injectionAttempts) {
        // These should be rejected by sanitizeObjectId
        expect(() => sanitizeObjectId(attempt)).toThrow('Invalid ID: ID must be a valid 24-character hexadecimal string');
        
        // These should be sanitized by sanitizeId (removing dangerous chars)
        const sanitized = sanitizeId(attempt);
        expect(sanitized).not.toContain(';');
        expect(sanitized).not.toContain("'");
        expect(sanitized).not.toContain('"');
        expect(sanitized).not.toContain('$');
        expect(sanitized).not.toContain('(');
        expect(sanitized).not.toContain(')');
        expect(sanitized).not.toContain('[');
        expect(sanitized).not.toContain(']');
        expect(sanitized).not.toContain('{');
        expect(sanitized).not.toContain('}');
        expect(sanitized).not.toContain('|');
        expect(sanitized).not.toContain('\\');
      }
    });

    it('should validate that sanitized IDs are safe for database queries', () => {
      const maliciousInputs = [
        "'; DROP TABLE memories; --",
        "'; db.memories.drop(); --",
        "'; db.memories.find({}); --",
      ];

      for (const input of maliciousInputs) {
        // Test that sanitizeObjectId rejects these completely
        expect(() => sanitizeObjectId(input)).toThrow();
        
        // Test that sanitizeId removes dangerous parts
        const sanitized = sanitizeId(input);
        // The sanitized version should not contain dangerous characters
        expect(sanitized).not.toContain(';');
        expect(sanitized).not.toContain("'");
        expect(sanitized).not.toContain('"');
        expect(sanitized).not.toContain('$');
        expect(sanitized).not.toContain('(');
        expect(sanitized).not.toContain(')');
        expect(sanitized).not.toContain('[');
        expect(sanitized).not.toContain(']');
        expect(sanitized).not.toContain('{');
        expect(sanitized).not.toContain('}');
        expect(sanitized).not.toContain('|');
        expect(sanitized).not.toContain('\\');
        
        // The sanitized version should be safe for database queries
        // It may still contain some words but without dangerous syntax
        expect(sanitized.length).toBeLessThan(100); // Length limit
        expect(typeof sanitized).toBe('string');
        expect(sanitized.trim()).toBe(sanitized); // No leading/trailing whitespace
      }
    });
  });
}); 