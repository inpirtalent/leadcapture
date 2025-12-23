import { API_BASE_URL, API_ENDPOINTS } from "@/constants/form";

export interface LeadFormData {
  full_name: string;
  email: string;
  company: string;
  budget: string;
  timeline: string;
  message: string;
  source: string;
}

export interface ApiResponse {
  status: "success" | "error";
  message: string;
  code?: string;
  data?: any;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  field?: string;
}

/**
 * Submit lead form data to the API
 * @param formData - Lead form data
 * @returns Promise with API response
 * @throws ApiError if request fails
 */
export async function submitLead(formData: LeadFormData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEAD}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || "Request failed",
        code: data.code,
        status: response.status,
        field: data.field || data.error?.field,
      } as ApiError;
    }

    return data as ApiResponse;
  } catch (error) {
    if (error && typeof error === "object" && "message" in error) {
      throw error as ApiError;
    }
    throw {
      message: "Network error. Please check your connection and try again.",
      code: "NETWORK_ERROR",
    } as ApiError;
  }
}

