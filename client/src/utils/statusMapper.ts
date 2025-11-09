import { ParcelStatus } from "@/types";
import { ThailandPostStatusCode } from "@/types/thailandPost";

/**
 * Map Thailand Post status codes to application ParcelStatus
 * 
 * Thailand Post uses numeric status codes (e.g., "103", "201", "301")
 * We need to map these to our internal status enum
 */
export function mapThailandPostStatus(statusCode: string): ParcelStatus {
  // Remove any whitespace and convert to uppercase
  const code = statusCode.trim();
  
  // Map status codes to ParcelStatus
  switch (code) {
    // Acceptance statuses -> pending_dispatch
    case "100": // ACCEPTANCE
    case "101": // DROP_OFF
    case "102": // PICK_UP
    case "103": // DEPOSIT
    case "700": // INFORMATION_RECEIVED
      return "pending_dispatch";
    
    // In transit statuses -> in_transit
    case "200": // IN_TRANSIT
    case "201": // EXPORT_CENTER
    case "202": // IMPORT_CENTER
    case "203": // ARRIVAL_AT_OUTWARD_OE
    case "204": // DEPARTURE_FROM_OUTWARD_OE
    case "205": // ARRIVAL_AT_TRANSIT_OE
    case "206": // DEPARTURE_FROM_TRANSIT_OE
    case "207": // ARRIVAL_AT_INWARD_OE
    case "300": // OUT_FOR_DELIVERY
      return "in_transit";
    
    // Arrival statuses -> arrived_at_destination
    case "304": // AWAITING_COLLECTION
      return "arrived_at_destination";
    
    // Delivery statuses -> delivered
    case "301": // DELIVERY
    case "302": // SUCCESSFUL_DELIVERY
    case "402": // FINAL_DELIVERY
      return "delivered";
    
    // Return statuses -> returned
    case "303": // UNSUCCESSFUL_DELIVERY
    case "400": // RETURN_TO_SENDER
    case "401": // RETURN
    case "600": // REFUSED
    case "601": // UNCLAIMED
    case "602": // UNDELIVERABLE
      return "returned";
    
    // Customs statuses -> customs_inspection
    case "500": // HELD_BY_CUSTOMS
    case "501": // CUSTOMS_CLEARANCE
      return "customs_inspection";
    
    // Unknown status
    default:
      console.warn(`Unknown Thailand Post status code: ${code}`);
      return "unknown";
  }
}

/**
 * Convert Thai Buddhist Era date to ISO 8601 format
 * 
 * Thailand Post returns dates in format: "DD/MM/BBBB HH:mm:ss+07:00"
 * where BBBB is Buddhist Era year (Gregorian year + 543)
 * 
 * @param thaiDate - Date string in Thai format
 * @returns ISO 8601 date string
 */
export function convertThaiDateToISO(thaiDate: string): string {
  try {
    // Parse the Thai date format: "19/07/2562 18:12:26+07:00"
    const datePattern = /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})([\+\-]\d{2}:\d{2})/;
    const match = thaiDate.match(datePattern);
    
    if (!match) {
      console.error(`Invalid Thai date format: ${thaiDate}`);
      return new Date().toISOString();
    }
    
    const [, day, month, buddhistYear, hour, minute, second, timezone] = match;
    
    // Convert Buddhist Era year to Gregorian year
    const gregorianYear = parseInt(buddhistYear) - 543;
    
    // Construct ISO date string
    const isoDate = `${gregorianYear}-${month}-${day}T${hour}:${minute}:${second}${timezone}`;
    
    // Validate by parsing
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      console.error(`Invalid date after conversion: ${isoDate}`);
      return new Date().toISOString();
    }
    
    return date.toISOString();
  } catch (error) {
    console.error(`Error converting Thai date: ${thaiDate}`, error);
    return new Date().toISOString();
  }
}

/**
 * Get the most recent status from tracking events
 * 
 * @param events - Array of tracking events
 * @returns The most recent ParcelStatus
 */
export function getMostRecentStatus(events: Array<{ status: string; status_date: string }>): ParcelStatus {
  if (!events || events.length === 0) {
    return "unknown";
  }
  
  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = convertThaiDateToISO(a.status_date);
    const dateB = convertThaiDateToISO(b.status_date);
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  
  // Get the most recent status
  const mostRecentEvent = sortedEvents[0];
  return mapThailandPostStatus(mostRecentEvent.status);
}
