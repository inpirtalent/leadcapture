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

export interface ProgressUpdate {
  progress: number;
  message: string;
  error?: boolean;
  data?: any;
}

/**
 * Submit lead form data to the API with progress tracking
 * @param formData - Lead form data
 * @param onProgress - Callback function for progress updates
 * @returns Promise with API response
 * @throws ApiError if request fails
 */
export async function submitLead(
  formData: LeadFormData,
  onProgress?: (update: ProgressUpdate) => void
): Promise<ApiResponse> {
  try {
    // Submit lead and get session ID
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

    // If we have a session ID and progress callback, listen for progress updates
    if (data.sessionId && onProgress) {
      await listenToProgress(data.sessionId, onProgress);
      
      // Return the final data from progress
      return {
        status: "success",
        message: "Lead captured successfully",
        data: data.data || { leadId: data.sessionId },
      } as ApiResponse;
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

/**
 * Listen to progress updates via Server-Sent Events
 * @param sessionId - Session ID from initial submission
 * @param onProgress - Callback function for progress updates
 */
async function listenToProgress(
  sessionId: string,
  onProgress: (update: ProgressUpdate) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(
      `${API_BASE_URL}${API_ENDPOINTS.LEAD}/progress/${sessionId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const update: ProgressUpdate = JSON.parse(event.data);
        onProgress(update);

        // If complete or error, close connection
        if (update.progress === 100 || update.error) {
          eventSource.close();
          if (update.error) {
            reject(new Error(update.message));
          } else {
            resolve();
          }
        }
      } catch (error) {
        console.error("Error parsing progress update:", error);
      }
    };

    eventSource.onerror = (error) => {
      eventSource.close();
      reject(new Error("Connection to progress stream failed"));
    };

    // Timeout after 60 seconds
    setTimeout(() => {
      eventSource.close();
      reject(new Error("Progress stream timeout"));
    }, 60000);
  });
}

