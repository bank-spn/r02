import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import AddParcelModal from "@/components/AddParcelModal";
import ParcelCard from "@/components/ParcelCard";
import { Parcel } from "@/types";
import { addParcel, getAllParcels, deleteParcel } from "@/utils/parcelStorage";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load parcels on mount
  useEffect(() => {
    const loaded = getAllParcels();
    setParcels(loaded);
  }, []);

  const handleAddParcel = (parcelData: Omit<Parcel, "id" | "createdAt" | "updatedAt">) => {
    setIsLoading(true);
    try {
      const newParcel = addParcel(parcelData);
      setParcels((prev) => [newParcel, ...prev]);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    setLocation(`/parcel/${id}`);
  };

  const handleDeleteParcel = (id: string) => {
    if (confirm("Are you sure you want to delete this parcel?")) {
      deleteParcel(id);
      setParcels((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 lg:pt-0">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                International Parcel Tracker
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8 lg:px-8">
        {parcels.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No parcels yet
            </h2>
            <p className="text-gray-600 mb-6 text-center max-w-sm">
              Add your first parcel to start tracking your international shipments
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Your First Parcel
            </Button>
          </div>
        ) : (
          // Parcel List
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Parcels ({parcels.length})
              </h2>
            </div>

            <div className="grid gap-4">
              {parcels.map((parcel) => (
                <ParcelCard
                  key={parcel.id}
                  parcel={parcel}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDeleteParcel}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl active:scale-95 lg:bottom-8 lg:right-8"
        title="Add new parcel"
        aria-label="Add new parcel"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Parcel Modal */}
      <AddParcelModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleAddParcel}
        isLoading={isLoading}
      />
    </div>
  );
}
