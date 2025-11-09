import { APIResponse, ParcelStatus, TrackingEvent } from "@/types";

/**
 * Placeholder REST API for Thailand Post tracking
 * Future integration point for real API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.example.com/v1/track";

/**
 * Mock tracking data for demonstration
 */
const MOCK_TRACKING_DATA: Record<string, APIResponse> = {
  "EP123456789TH": {
    status: "in_transit",
    history: [
      {
        timestamp: "2025-11-01T10:00:00Z",
        location: "Bangkok",
        message: "Accepted by post office",
      },
      {
        timestamp: "2025-11-02T15:30:00Z",
        location: "Outbound Center",
        message: "Departed Thailand",
      },
      {
        timestamp: "2025-11-05T08:15:00Z",
        location: "Tokyo",
        message: "Arrived at international hub",
      },
    ],
  },
  "EP987654321TH": {
    status: "delivered",
    history: [
      {
        timestamp: "2025-10-28T09:00:00Z",
        location: "Bangkok",
        message: "Accepted by post office",
      },
      {
        timestamp: "2025-10-29T14:20:00Z",
        location: "Outbound Center",
        message: "Departed Thailand",
      },
      {
        timestamp: "2025-11-02T10:00:00Z",
        location: "New York",
        message: "Delivered successfully",
      },
    ],
  },
};

/**
 * Fetch tracking status from API (placeholder)
 * In production, replace with actual Thailand Post API
 */
export async function fetchTrackingStatus(
  trackingNumber: string
): Promise<APIResponse> {
  try {
    // Check if we have mock data for this tracking number
    if (MOCK_TRACKING_DATA[trackingNumber]) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_TRACKING_DATA[trackingNumber];
    }

    // Attempt to fetch from real API (when configured)
    if (API_BASE_URL !== "https://api.example.com/v1/track") {
      const response = await fetch(`${API_BASE_URL}/${trackingNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    }

    // Return unknown status if no mock data and no real API
    return {
      status: "unknown" as ParcelStatus,
      history: [],
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching tracking status:", error);
    return {
      status: "unknown" as ParcelStatus,
      history: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Generate mock tracking history for demo purposes
 */
export function generateMockHistory(
  country: string,
  status: ParcelStatus
): TrackingEvent[] {
  const baseEvents: TrackingEvent[] = [
    {
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Bangkok",
      message: "Accepted by post office",
    },
    {
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Bangkok Outbound Center",
      message: "Departed Thailand",
    },
  ];

  if (status === "delivered") {
    baseEvents.push({
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: country,
      message: "Arrived at destination",
    });
    baseEvents.push({
      timestamp: new Date().toISOString(),
      location: country,
      message: "Delivered successfully",
    });
  } else if (status === "in_transit") {
    baseEvents.push({
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: "International Hub",
      message: "In transit to destination",
    });
  }

  return baseEvents;
}
