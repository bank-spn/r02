import { TrackingEvent } from "@/types";
import { format } from "date-fns";
import { MapPin, Calendar } from "lucide-react";

interface TimelineProps {
  events: TrackingEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tracking events yet</p>
      </div>
    );
  }

  // Sort events by timestamp, newest first
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-0">
      {sortedEvents.map((event, index) => (
        <div key={index} className="flex gap-4 pb-6 last:pb-0">
          {/* Timeline marker */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50" />
            {index !== sortedEvents.length - 1 && (
              <div className="w-0.5 h-16 bg-gray-200 mt-2" />
            )}
          </div>

          {/* Event content */}
          <div className="flex-1 pt-0.5">
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">{event.message}</h4>
              </div>

              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {format(new Date(event.timestamp), "MMM dd, yyyy HH:mm:ss")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
