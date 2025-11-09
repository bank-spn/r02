import { Parcel, STATUS_COLORS, STATUS_LABELS } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ParcelCardProps {
  parcel: Parcel;
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ParcelCard({
  parcel,
  onViewDetails,
  onDelete,
}: ParcelCardProps) {
  const lastUpdate = parcel.history.length > 0
    ? parcel.history[parcel.history.length - 1].timestamp
    : parcel.updatedAt;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Tracking Number */}
          <div className="mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Tracking Number
            </p>
            <p className="font-mono font-semibold text-gray-900 break-all">
              {parcel.trackingNumber}
            </p>
          </div>

          {/* Country & Status */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              To: {parcel.country}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[parcel.status]}`}>
              {STATUS_LABELS[parcel.status]}
            </span>
          </div>

          {/* Last Updated */}
          <p className="text-xs text-gray-500">
            Updated: {format(new Date(lastUpdate), "MMM dd, yyyy HH:mm")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(parcel.id)}
            className="gap-1"
          >
            Details
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(parcel.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
