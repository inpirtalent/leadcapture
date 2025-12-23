/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === "") {
    return {
      isValid: false,
      error: "Email is required",
    };
  }

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  // Check for common invalid patterns
  if (email.includes("..") || email.startsWith(".") || email.endsWith(".")) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  // Check length limits
  if (email.length > 254) {
    return {
      isValid: false,
      error: "Email address is too long",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validate required field
 * @param value - Field value to validate
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult
 */
export function validateRequired(value: string, fieldName: string = "Field"): ValidationResult {
  if (!value || value.trim() === "") {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  return {
    isValid: true,
  };
}

/**
 * Validate full name
 * @param name - Full name to validate
 * @returns ValidationResult
 */
export function validateFullName(name: string): ValidationResult {
  const required = validateRequired(name, "Full name");
  if (!required.isValid) {
    return required;
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: "Full name must be at least 2 characters",
    };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error: "Full name is too long",
    };
  }

  return {
    isValid: true,
  };
}

