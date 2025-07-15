import { registerSchema } from '../app/utils/validation';

const mockRegister = jest.fn();
jest.mock('../app/services/authService', () => ({
  __esModule: true,
  default: {
    register: mockRegister,
    getCurrentUser: jest.fn(),
  },
}));

describe('Register Validation Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockImplementation((data) =>
      Promise.resolve({
        user: { id: '1', email: data.email, firstName: data.firstName },
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      })
    );
  });

  describe('firstName validation', () => {
    it('should pass with valid first name', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent"
      };

      await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should fail with empty first name', async () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('First name is required');
    });

    it('should fail with missing first name', async () => {
      const invalidData = {
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('First name is required');
    });
  });

  describe('lastName validation', () => {
    it('should pass with valid last name', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should fail with empty last name', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: '',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Last name is required');
    });
  });

  describe('dateOfBirth validation', () => {
    it('should pass with valid date of birth', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should fail with empty date of birth', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Date of birth is required');
    });
  });

  describe('email validation', () => {
    it('should pass with valid email', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should fail with invalid email format', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'invalid-email',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Email is invalid');
    });

    it('should fail with empty email', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: '',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Email is required');
    });

    it('should pass with various valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@example.com',
      ];

      for (const email of validEmails) {
        const validData = {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          email,
          password: 'Password123@',
          confirmPassword: 'Password123@',
          role: "parent",
        };

        await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
      }
    });
  });

  describe('password validation', () => {
    it('should pass with valid password', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should fail with password shorter than 6 characters', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: '123',
        confirmPassword: '123',
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Password must be at least 6 characters');
    });

    it('should pass with password exactly 6 characters', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: '123456',
        confirmPassword: '123456',
        role: "parent",
      };

      await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should fail with empty password', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: '',
        confirmPassword: '',
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Confirm password is required');
    });
  });

  describe('confirmPassword validation', () => {
    it('should pass when passwords match', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent",
      };

      await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should fail when passwords do not match', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'differentpassword',
        role: "parent",
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Passwords do not match');
    });

    it('should fail with empty confirm password', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        role: "parent",
        confirmPassword: '',
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Passwords do not match');
    });
  });

  describe('complete form validation', () => {
    it('should pass with all valid fields', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'Password123@',
        confirmPassword: 'Password123@',
        role: "parent"
      };

      await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should fail with multiple validation errors', async () => {
      const invalidData = {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: 'invalid-email',
        password: '123',
        confirmPassword: 'different',
        role: "parent"
      };

      try {
        await registerSchema.validate(invalidData);
        throw new Error('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Passwords do not match');
      }
    });
  });
}); 