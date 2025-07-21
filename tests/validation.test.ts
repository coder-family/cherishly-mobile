import {
  createMemorySchema,
  isValidRecordingId,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sanitizeId,
  sanitizeObjectId,
  updateMemorySchema,
} from "../app/utils/validation";

describe("Validation Utils", () => {
  describe("isValidRecordingId", () => {
    it("should return true for valid recording IDs", () => {
      expect(isValidRecordingId("recording_123_abc123")).toBe(true);
      expect(isValidRecordingId("recording_0_xyz789")).toBe(true);
    });

    it("should return false for invalid recording IDs", () => {
      expect(isValidRecordingId("invalid_id")).toBe(false);
      expect(isValidRecordingId("recording_123")).toBe(false);
      expect(isValidRecordingId("recording_abc_123")).toBe(false);
      expect(isValidRecordingId("")).toBe(false);
    });
  });

  describe("sanitizeObjectId", () => {
    it("should accept valid MongoDB ObjectId strings", () => {
      const validId = "507f1f77bcf86cd799439011";
      expect(sanitizeObjectId(validId)).toBe(validId);
    });

    it("should trim whitespace from valid IDs", () => {
      const validId = "507f1f77bcf86cd799439011";
      expect(sanitizeObjectId(` ${validId} `)).toBe(validId);
    });

    it("should throw error for invalid ObjectId format", () => {
      expect(() => sanitizeObjectId("invalid-id")).toThrow("Invalid ID: ID must be a valid 24-character hexadecimal string");
      expect(() => sanitizeObjectId("507f1f77bcf86cd79943901")).toThrow("Invalid ID: ID must be a valid 24-character hexadecimal string");
      expect(() => sanitizeObjectId("507f1f77bcf86cd7994390111")).toThrow("Invalid ID: ID must be a valid 24-character hexadecimal string");
      expect(() => sanitizeObjectId("507f1f77bcf86cd79943901g")).toThrow("Invalid ID: ID must be a valid 24-character hexadecimal string");
    });

    it("should throw error for empty or null values", () => {
      expect(() => sanitizeObjectId("")).toThrow("Invalid ID: ID must be a non-empty string");
      expect(() => sanitizeObjectId("   ")).toThrow("Invalid ID: ID cannot be empty or whitespace only");
      expect(() => sanitizeObjectId(null as any)).toThrow("Invalid ID: ID must be a non-empty string");
      expect(() => sanitizeObjectId(undefined as any)).toThrow("Invalid ID: ID must be a non-empty string");
    });
  });

  describe("sanitizeId", () => {
    it("should accept valid alphanumeric IDs", () => {
      expect(sanitizeId("abc123")).toBe("abc123");
      expect(sanitizeId("ABC_123-def")).toBe("ABC_123-def");
      expect(sanitizeId("user123")).toBe("user123");
    });

    it("should remove dangerous characters", () => {
      expect(sanitizeId("user<script>alert('xss')</script>")).toBe("userscriptalertxssscript");
      expect(sanitizeId("user'; DROP TABLE users; --")).toBe("userDROPTABLEusers--");
      expect(sanitizeId("user$()[]{}|\\")).toBe("user");
    });

    it("should trim whitespace", () => {
      expect(sanitizeId(" abc123 ")).toBe("abc123");
    });

    it("should throw error for empty results after sanitization", () => {
      expect(() => sanitizeId("$%^&*()")).toThrow("Invalid ID: ID contains no valid characters after sanitization");
      expect(() => sanitizeId("")).toThrow("Invalid ID: ID must be a non-empty string");
      expect(() => sanitizeId("   ")).toThrow("Invalid ID: ID cannot be empty or whitespace only");
    });

    it("should throw error for IDs that are too long", () => {
      const longId = "a".repeat(101);
      expect(() => sanitizeId(longId)).toThrow("Invalid ID: ID is too long (maximum 100 characters)");
    });

    it("should accept IDs at the maximum length", () => {
      const maxLengthId = "a".repeat(100);
      expect(sanitizeId(maxLengthId)).toBe(maxLengthId);
    });

    it("should throw error for null or undefined values", () => {
      expect(() => sanitizeId(null as any)).toThrow("Invalid ID: ID must be a non-empty string");
      expect(() => sanitizeId(undefined as any)).toThrow("Invalid ID: ID must be a non-empty string");
    });
  });

  describe("loginSchema", () => {
    it("should validate correct login data", async () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await loginSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it("should reject invalid email", async () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow("Email is invalid");
    });

    it("should reject missing fields", async () => {
      await expect(loginSchema.validate({ email: "test@example.com" })).rejects.toThrow("Password is required");
      await expect(loginSchema.validate({ password: "password123" })).rejects.toThrow("Email is required");
    });
  });

  describe("registerSchema", () => {
    it("should validate correct registration data", async () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "parent",
      };

      const result = await registerSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it("should reject mismatched passwords", async () => {
      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow("Passwords do not match");
    });

    it("should reject short passwords", async () => {
      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        email: "john@example.com",
        password: "123",
        confirmPassword: "123",
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow("Password must be at least 6 characters");
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate correct reset password data", async () => {
      const validData = {
        password: "newpassword123",
        confirmPassword: "newpassword123",
      };

      const result = await resetPasswordSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it("should reject mismatched passwords", async () => {
      const invalidData = {
        password: "newpassword123",
        confirmPassword: "differentpassword",
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow("Passwords do not match");
    });
  });

  describe("createMemorySchema", () => {
    it("should validate correct memory data", async () => {
      const validData = {
        title: "My Memory",
        content: "This is a memory content",
        childId: "507f1f77bcf86cd799439011",
        date: "2023-01-01T00:00:00.000Z",
        tags: ["fun", "family"],
        visibility: "private" as const,
        location: {
          type: "Point" as const,
          coordinates: [-122.4194, 37.7749], // San Francisco coordinates
        },
      };

      const result = await createMemorySchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it("should reject invalid coordinates", async () => {
      const invalidData = {
        title: "My Memory",
        content: "This is a memory content",
        childId: "507f1f77bcf86cd799439011",
        date: "2023-01-01T00:00:00.000Z",
        location: {
          type: "Point" as const,
          coordinates: [200, 100], // Invalid longitude/latitude
        },
      };

      await expect(createMemorySchema.validate(invalidData)).rejects.toThrow("Invalid coordinates values");
    });
  });

  describe("updateMemorySchema", () => {
    it("should validate location when provided", async () => {
      const validData = {
        title: "Updated Memory",
        location: {
          type: "Point" as const,
          coordinates: [-122.4194, 37.7749], // San Francisco coordinates
        },
      };

      const result = await updateMemorySchema.validate(validData);
      expect(result).toEqual(validData);
    });
  });
}); 