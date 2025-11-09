import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Trash2, Loader2 } from "lucide-react";
import Timeline from "@/components/Timeline";
import { Parcel, STATUS_COLORS, STATUS_LABELS } from "@/types";
import { getParcelById, updateParcel, deleteParcel } from "@/utils/parcelStorage";
import { fetchTrackingStatus } from "@/utils/api";
import { format } from "date-fns";

export default function ParcelDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/parcel/:id");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load parcel on mount
  useEffect(() => {
    if (params?.id) {
      const loaded = getParcelById(params.id);
      if (loaded) {
        setParcel(loaded);
      } else {
        setLocation("/");
      }
    }
  }, [params?.id, setLocation]);

  const handleRefresh = async () => {
    if (!parcel) return;

    setIsRefreshing(true);
    setError(null);
    try {
      const apiResponse = await fetchTrackingStatus(parcel.trackingNumber, true);
      const updated = updateParcel(parcel.id, {
        status: apiResponse.status,
        history: apiResponse.history || parcel.history,
      });

      if (updated) {
        setParcel(updated);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh tracking data";
      setError(errorMessage);
      console.error("Error refreshing tracking data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = () => {
    if (!parcel) return;

    if (confirm("Are you sure you want to delete this parcel?")) {
      deleteParcel(parcel.id);
      setLocation("/");
    }
  };

  if (!match || !parcel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Parcel not found</p>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 lg:pt-0">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 lg:px-8">
        {/* Parcel Info Card */}
        <Card className="p-4 md:p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Tracking Number
              </p>
              <p className="font-mono text-2xl font-bold text-gray-900 break-all">
                {parcel.trackingNumber}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[parcel.status]}`}
            >
              {STATUS_LABELS[parcel.status]}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Destination Country
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {parcel.country}
              </p>
            </div>

            {parcel.senderName && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Sender Name
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {parcel.senderName}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Added
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(parcel.createdAt), "MMM dd, yyyy HH:mm")}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Last Updated
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(parcel.updatedAt), "MMM dd, yyyy HH:mm")}
              </p>
            </div>
          </div>

          {parcel.description && (
            <div className="pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Notes
              </p>
              <p className="text-gray-700">{parcel.description}</p>
            </div>
          )}
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button
                onClick={() => setError(null)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        <Card className="p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Tracking Timeline
            </h2>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          <Timeline events={parcel.history} />
        </Card>

        {/* Delete Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Parcel
          </Button>
        </div>
      </main>
    </div>
  );
}
