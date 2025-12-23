"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BUDGET_OPTIONS, TIMELINE_OPTIONS, DEFAULT_SOURCE } from "@/constants/form";
import { submitLead, type LeadFormData } from "@/lib/api";
import { DEFAULT_FORM_DATA, type SubmissionState } from "@/types/form";
import { validateEmail, validateFullName, validateRequired } from "@/utils/validation";
import styles from "./LeadForm.module.css";

interface LeadFormProps {
  initialData?: Partial<LeadFormData>;
}

interface FieldErrors {
  full_name?: string;
  email?: string;
  message?: string;
}

export default function LeadForm({ initialData }: LeadFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<LeadFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });

  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const isSubmitDisabled = useMemo(
    () =>
      submissionState === "loading" ||
      !formData.full_name ||
      !formData.email ||
      !formData.message ||
      !!fieldErrors.full_name ||
      !!fieldErrors.email ||
      !!fieldErrors.message,
    [formData, submissionState, fieldErrors]
  );

  const validateField = (field: keyof LeadFormData, value: string) => {
    let error: string | undefined;

    switch (field) {
      case "email":
        const emailValidation = validateEmail(value);
        if (!emailValidation.isValid) {
          error = emailValidation.error;
        }
        break;
      case "full_name":
        const nameValidation = validateFullName(value);
        if (!nameValidation.isValid) {
          error = nameValidation.error;
        }
        break;
      case "message":
        const messageValidation = validateRequired(value, "Project details");
        if (!messageValidation.isValid) {
          error = messageValidation.error;
        }
        break;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    return !error;
  };

  const handleChange =
    (field: keyof LeadFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear general error when user starts typing
      if (errorMessage) {
        setErrorMessage("");
      }

      // Validate field if it has been touched
      if (touchedFields.has(field)) {
        validateField(field, value);
      }
    };

  const handleBlur = (field: keyof LeadFormData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
    validateField(field, formData[field]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Mark all fields as touched
    const allFields: (keyof LeadFormData)[] = ["full_name", "email", "message"];
    allFields.forEach((field) => {
      setTouchedFields((prev) => new Set(prev).add(field));
    });

    // Validate all fields
    let isValid = true;
    allFields.forEach((field) => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) {
        isValid = false;
      }
    });

    if (!isValid) {
      setErrorMessage("Please fix the errors before submitting.");
      return;
    }

    setSubmissionState("loading");
    setErrorMessage("");

    try {
      const response = await submitLead(formData);
      
      // Redirect to success page
      router.push("/success");
    } catch (error: any) {
      setSubmissionState("error");
      
      // Handle validation errors from backend
      if (error?.field && error?.message) {
        setFieldErrors((prev) => ({
          ...prev,
          [error.field]: error.message,
        }));
        setErrorMessage(error.message);
      } else {
        setErrorMessage(error?.message || "Something went wrong. Please try again.");
      }
      console.error("Lead submission error:", error);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.shell}>
        <div className={styles.header}>
          <span className={styles.badge}>Lead capture</span>
          <h1>Tell us about your project</h1>
          <p>We will review and follow up to scope the next steps.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Full name</span>
              <input
                name="full_name"
                placeholder="John Smith"
                value={formData.full_name}
                onChange={handleChange("full_name")}
                onBlur={() => handleBlur("full_name")}
                required
                disabled={submissionState === "loading"}
                className={fieldErrors.full_name ? styles.inputError : ""}
              />
              {fieldErrors.full_name && (
                <span className={styles.fieldError}>{fieldErrors.full_name}</span>
              )}
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange("email")}
                onBlur={() => handleBlur("email")}
                required
                disabled={submissionState === "loading"}
                className={fieldErrors.email ? styles.inputError : ""}
              />
              {fieldErrors.email && (
                <span className={styles.fieldError}>{fieldErrors.email}</span>
              )}
            </label>
          </div>

          <label className={styles.field}>
            <span>Company</span>
            <input
              name="company"
              placeholder="Acme Inc"
              value={formData.company}
              onChange={handleChange("company")}
              disabled={submissionState === "loading"}
            />
          </label>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Budget</span>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange("budget")}
                disabled={submissionState === "loading"}
              >
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Timeline</span>
              <select
                name="timeline"
                value={formData.timeline}
                onChange={handleChange("timeline")}
                disabled={submissionState === "loading"}
              >
                {TIMELINE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>Project details</span>
            <textarea
              name="message"
              placeholder="Share goals, use cases, and any context for AI prompts."
              value={formData.message}
              onChange={handleChange("message")}
              onBlur={() => handleBlur("message")}
              rows={5}
              required
              disabled={submissionState === "loading"}
              className={fieldErrors.message ? styles.inputError : ""}
            />
            {fieldErrors.message && (
              <span className={styles.fieldError}>{fieldErrors.message}</span>
            )}
          </label>

          <input type="hidden" name="source" value={formData.source} />

          <div className={styles.actions}>
            <button type="submit" disabled={isSubmitDisabled}>
              {submissionState === "loading" ? "Sending..." : "Submit lead"}
            </button>
            <p className={styles.helper}>We typically respond within one business day.</p>
          </div>

          {submissionState === "error" && errorMessage && (
            <div className={`${styles.alert} ${styles.error}`} role="alert" aria-live="polite">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => {
                  setSubmissionState("idle");
                  setErrorMessage("");
                }}
                className={styles.closeButton}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

