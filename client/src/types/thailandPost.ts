/**
 * Type definitions for Thailand Post API
 * API Documentation: https://trackapi.thailandpost.co.th/
 */

/**
 * Thailand Post tracking event from API response
 */
export interface ThailandPostTrackingEvent {
  barcode: string;
  status: string; // Status code (e.g., "103", "201", "301")
  status_description: string; // Status description in English (e.g., "DEPOSIT", "EXPORT_CENTER")
  status_date: string; // Date in Thai format: "DD/MM/BBBB HH:mm:ss+07:00" (Buddhist Era)
  statusDetail: string; // Detailed status message in Thai
  location: string; // Location code
  postcode: string;
  delivery_status: string | null;
  delivery_description: string | null;
  delivery_datetime: string | null;
  receiver_name: string | null;
  signature: string | null;
  delivery_officer_name?: string | null;
  delivery_officer_tel?: string | null;
  office_name?: string | null;
  office_tel?: string | null;
  call_center_tel?: string;
}

/**
 * Track count information
 */
export interface ThailandPostTrackCount {
  track_date: string; // Date in Thai format: "DD/MM/BBBB"
  count_number: number; // Number of tracking requests made today
  track_count_limit: number; // Daily limit (usually 1500)
}

/**
 * Thailand Post API response structure
 */
export interface ThailandPostAPIResponse {
  response: {
    items: {
      [trackingNumber: string]: ThailandPostTrackingEvent[];
    };
    track_count: ThailandPostTrackCount;
  };
  message: string; // "successful" or error message
  status: boolean; // true if successful
}

/**
 * Thailand Post API request body
 */
export interface ThailandPostAPIRequest {
  status: "all" | string; // "all" to get all status updates
  language: "TH" | "EN"; // Language for response
  barcode: string[]; // Array of tracking numbers
}

/**
 * Thailand Post status code mapping
 * Reference: https://track.thailandpost.co.th/
 */
export const THAILAND_POST_STATUS_CODES = {
  // Acceptance
  "100": "ACCEPTANCE",
  "101": "DROP_OFF",
  "102": "PICK_UP",
  "103": "DEPOSIT",
  
  // In Transit
  "200": "IN_TRANSIT",
  "201": "EXPORT_CENTER",
  "202": "IMPORT_CENTER",
  "203": "ARRIVAL_AT_OUTWARD_OE",
  "204": "DEPARTURE_FROM_OUTWARD_OE",
  "205": "ARRIVAL_AT_TRANSIT_OE",
  "206": "DEPARTURE_FROM_TRANSIT_OE",
  "207": "ARRIVAL_AT_INWARD_OE",
  
  // Delivery
  "300": "OUT_FOR_DELIVERY",
  "301": "DELIVERY",
  "302": "SUCCESSFUL_DELIVERY",
  "303": "UNSUCCESSFUL_DELIVERY",
  "304": "AWAITING_COLLECTION",
  
  // Return
  "400": "RETURN_TO_SENDER",
  "401": "RETURN",
  "402": "FINAL_DELIVERY",
  
  // Customs
  "500": "HELD_BY_CUSTOMS",
  "501": "CUSTOMS_CLEARANCE",
  
  // Others
  "600": "REFUSED",
  "601": "UNCLAIMED",
  "602": "UNDELIVERABLE",
  "700": "INFORMATION_RECEIVED",
} as const;

/**
 * Status code type
 */
export type ThailandPostStatusCode = keyof typeof THAILAND_POST_STATUS_CODES;

/**
 * Error response from Thailand Post API
 */
export interface ThailandPostAPIError {
  message: string;
  status: false;
  error?: string;
}
