import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Parcel, COUNTRIES } from "@/types";
import { generateMockHistory } from "@/utils/api";
import { Loader2 } from "lucide-react";

interface AddParcelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (parcel: Omit<Parcel, "id" | "createdAt" | "updatedAt">) => void;
  isLoading?: boolean;
}

export default function AddParcelModal({
  open,
  onOpenChange,
  onSave,
  isLoading = false,
}: AddParcelModalProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [senderName, setSenderName] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!trackingNumber.trim()) {
      newErrors.trackingNumber = "Tracking number is required";
    } else if (trackingNumber.trim().length < 3) {
      newErrors.trackingNumber = "Tracking number must be at least 3 characters";
    }

    if (!country) {
      newErrors.country = "Destination country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newParcel: Omit<Parcel, "id" | "createdAt" | "updatedAt"> = {
      trackingNumber: trackingNumber.trim(),
      senderName: senderName.trim() || undefined,
      country,
      description: description.trim() || undefined,
      status: "pending_dispatch",
      history: generateMockHistory(country, "pending_dispatch"),
    };

    onSave(newParcel);

    // Reset form
    setTrackingNumber("");
    setSenderName("");
    setCountry("");
    setDescription("");
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTrackingNumber("");
      setSenderName("");
      setCountry("");
      setDescription("");
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Parcel</DialogTitle>
          <DialogDescription>
            Enter your parcel details to start tracking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tracking Number */}
          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking Number *</Label>
            <Input
              id="tracking"
              placeholder="e.g., EP123456789TH"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                if (errors.trackingNumber) {
                  setErrors({ ...errors, trackingNumber: "" });
                }
              }}
              disabled={isLoading}
              className={errors.trackingNumber ? "border-red-500" : ""}
            />
            {errors.trackingNumber && (
              <p className="text-sm text-red-500">{errors.trackingNumber}</p>
            )}
          </div>

          {/* Sender Name */}
          <div className="space-y-2">
            <Label htmlFor="sender">Sender Name (Optional)</Label>
            <Input
              id="sender"
              placeholder="e.g., John Doe"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Destination Country *</Label>
            <Select value={country} onValueChange={setCountry} disabled={isLoading}>
              <SelectTrigger
                id="country"
                className={errors.country ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-red-500">{errors.country}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any notes about this parcel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Parcel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
