import { BUDGET_OPTIONS, TIMELINE_OPTIONS, DEFAULT_SOURCE } from "@/constants/form";

export type SubmissionState = "idle" | "loading" | "success" | "error";

export interface LeadFormData {
  full_name: string;
  email: string;
  company: string;
  budget: string;
  timeline: string;
  message: string;
  source: string;
}

export const DEFAULT_FORM_DATA: LeadFormData = {
  full_name: "",
  email: "",
  company: "",
  budget: BUDGET_OPTIONS[1],
  timeline: TIMELINE_OPTIONS[0],
  message: "",
  source: DEFAULT_SOURCE,
};

