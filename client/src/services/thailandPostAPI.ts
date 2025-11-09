import {
  ThailandPostAPIRequest,
  ThailandPostAPIResponse,
  ThailandPostAPIError,
  ThailandPostTrackingEvent,
} from "@/types/thailandPost";
import { APIResponse, TrackingEvent, ParcelStatus } from "@/types";
import { mapThailandPostStatus, convertThaiDateToISO, getMostRecentStatus } from "@/utils/statusMapper";

/**
 * Thailand Post API Configuration
 */
const THAILAND_POST_CONFIG = {
  apiUrl: import.meta.env.VITE_THAILAND_POST_API_URL || "https://trackapi.thailandpost.co.th/post/api/v1/track",
  apiToken: import.meta.env.VITE_THAILAND_POST_API_TOKEN || "",
  language: "EN" as const,
  timeout: 30000, // 30 seconds
};

/**
 * Cache for API responses to reduce API calls
 * Key: tracking number, Value: { response, timestamp }
 */
const responseCache = new Map<string, { response: APIResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if API is configured
 */
export function isThailandPostAPIConfigured(): boolean {
  return Boolean(THAILAND_POST_CONFIG.apiToken && THAILAND_POST_CONFIG.apiToken.length > 0);
}

/**
 * Get cached response if available and not expired
 */
function getCachedResponse(trackingNumber: string): APIResponse | null {
  const cached = responseCache.get(trackingNumber);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    responseCache.delete(trackingNumber);
    return null;
  }
  
  return cached.response;
}

/**
 * Set cached response
 */
function setCachedResponse(trackingNumber: string, response: APIResponse): void {
  responseCache.set(trackingNumber, {
    response,
    timestamp: Date.now(),
  });
}

/**
 * Clear cache for a specific tracking number or all cache
 */
export function clearCache(trackingNumber?: string): void {
  if (trackingNumber) {
    responseCache.delete(trackingNumber);
  } else {
    responseCache.clear();
  }
}

/**
 * Transform Thailand Post tracking events to application format
 */
function transformTrackingEvents(events: ThailandPostTrackingEvent[]): TrackingEvent[] {
  return events.map((event) => ({
    timestamp: convertThaiDateToISO(event.status_date),
    location: event.statusDetail || event.location || "Unknown",
    message: event.status_description || "Status update",
  }));
}

/**
 * Fetch tracking information from Thailand Post API
 * 
 * @param trackingNumber - The tracking number to query
 * @param forceRefresh - Force refresh even if cached data exists
 * @returns APIResponse with tracking information
 */
export async function fetchThailandPostTracking(
  trackingNumber: string,
  forceRefresh: boolean = false
): Promise<APIResponse> {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedResponse(trackingNumber);
    if (cached) {
      console.log(`Using cached data for ${trackingNumber}`);
      return cached;
    }
  }
  
  // Check if API is configured
  if (!isThailandPostAPIConfigured()) {
    throw new Error("Thailand Post API is not configured. Please set VITE_THAILAND_POST_API_TOKEN in environment variables.");
  }
  
  try {
    // Prepare request body
    const requestBody: ThailandPostAPIRequest = {
      status: "all",
      language: THAILAND_POST_CONFIG.language,
      barcode: [trackingNumber],
    };
    
    console.log(`Fetching tracking data for ${trackingNumber} from Thailand Post API...`);
    
    // Make API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), THAILAND_POST_CONFIG.timeout);
    
    const response = await fetch(THAILAND_POST_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": THAILAND_POST_CONFIG.apiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Check response status
    if (!response.ok) {
      throw new Error(`Thailand Post API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse response
    const data: ThailandPostAPIResponse | ThailandPostAPIError = await response.json();
    
    // Check if response is successful
    if (!data.status) {
      const errorData = data as ThailandPostAPIError;
      throw new Error(errorData.message || "Unknown error from Thailand Post API");
    }
    
    const successData = data as ThailandPostAPIResponse;
    
    // Extract tracking events for this tracking number
    const trackingEvents = successData.response.items[trackingNumber];
    
    if (!trackingEvents || trackingEvents.length === 0) {
      // No tracking data found
      const result: APIResponse = {
        status: "unknown" as ParcelStatus,
        history: [],
        lastUpdated: new Date().toISOString(),
      };
      
      setCachedResponse(trackingNumber, result);
      return result;
    }
    
    // Transform tracking events
    const history = transformTrackingEvents(trackingEvents);
    
    // Get most recent status
    const status = getMostRecentStatus(trackingEvents);
    
    // Construct response
    const result: APIResponse = {
      status,
      history,
      lastUpdated: new Date().toISOString(),
    };
    
    // Cache the response
    setCachedResponse(trackingNumber, result);
    
    console.log(`Successfully fetched tracking data for ${trackingNumber}`);
    console.log(`Track count: ${successData.response.track_count.count_number}/${successData.response.track_count.track_count_limit}`);
    
    return result;
    
  } catch (error) {
    // Handle errors
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout: Thailand Post API did not respond in time");
      }
      throw error;
    }
    throw new Error("Unknown error occurred while fetching tracking data");
  }
}

/**
 * Fetch tracking information for multiple tracking numbers
 * 
 * @param trackingNumbers - Array of tracking numbers
 * @param forceRefresh - Force refresh even if cached data exists
 * @returns Map of tracking number to APIResponse
 */
export async function fetchMultipleTrackings(
  trackingNumbers: string[],
  forceRefresh: boolean = false
): Promise<Map<string, APIResponse>> {
  const results = new Map<string, APIResponse>();
  
  // Thailand Post API supports batch requests, but we'll implement sequential for now
  // to avoid rate limiting issues
  for (const trackingNumber of trackingNumbers) {
    try {
      const response = await fetchThailandPostTracking(trackingNumber, forceRefresh);
      results.set(trackingNumber, response);
    } catch (error) {
      console.error(`Error fetching tracking for ${trackingNumber}:`, error);
      // Set error response
      results.set(trackingNumber, {
        status: "unknown" as ParcelStatus,
        history: [],
        lastUpdated: new Date().toISOString(),
      });
    }
  }
  
  return results;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: responseCache.size,
    entries: Array.from(responseCache.keys()),
  };
}
