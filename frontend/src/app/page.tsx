"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import styles from "./page.module.css";

type SubmissionState = "idle" | "loading" | "success" | "error";

const BUDGET_OPTIONS = [
  "< $1k",
  "$1k – $5k",
  "$5k – $10k",
  "$10k – $50k",
  "$50k – $250k",
  "$250k – $1m",
];

const TIMELINE_OPTIONS = [
  "ASAP",
  "Less than a week",
  "Less than a month",
  "2 to 6 months",
  "Less than a year",
];

export default function Home() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    company: "",
    budget: BUDGET_OPTIONS[1],
    timeline: TIMELINE_OPTIONS[0],
    message: "",
    source: "website",
  });

  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [feedback, setFeedback] = useState<string>("");

  const isSubmitDisabled = useMemo(
    () =>
      submissionState === "loading" ||
      !formData.full_name ||
      !formData.email ||
      !formData.message,
    [formData, submissionState],
  );

  const handleChange =
    (field: keyof typeof formData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionState("loading");
    setFeedback("");

    try {
      const response = await fetch("http://localhost:3001/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      setSubmissionState("success");
      setFeedback(data?.message ?? "Lead captured successfully");
      setFormData((prev) => ({
        ...prev,
        full_name: "",
        email: "",
        company: "",
        budget: BUDGET_OPTIONS[1],
        timeline: TIMELINE_OPTIONS[0],
        message: "",
      }));
    } catch (error) {
      setSubmissionState("error");
      setFeedback("Something went wrong. Please try again.");
      console.error(error);
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
                required
              />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange("email")}
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Company</span>
            <input
              name="company"
              placeholder="Acme Inc"
              value={formData.company}
              onChange={handleChange("company")}
            />
          </label>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Budget</span>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange("budget")}
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
              rows={5}
              required
            />
          </label>

          <input type="hidden" name="source" value={formData.source} />

          <div className={styles.actions}>
            <button type="submit" disabled={isSubmitDisabled}>
              {submissionState === "loading" ? "Sending..." : "Submit lead"}
            </button>
            <p className={styles.helper}>We typically respond within one business day.</p>
          </div>

          {submissionState !== "idle" && (
            <div
              className={`${styles.alert} ${
                submissionState === "success" ? styles.success : styles.error
              }`}
              role="status"
              aria-live="polite"
            >
              {feedback}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
