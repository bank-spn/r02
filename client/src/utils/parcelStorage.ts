import { Parcel } from "@/types";

const STORAGE_KEY = "parcels_tracker_data";

/**
 * Get all parcels from localStorage
 */
export function getAllParcels(): Parcel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading parcels from storage:", error);
    return [];
  }
}

/**
 * Get a single parcel by ID
 */
export function getParcelById(id: string): Parcel | null {
  const parcels = getAllParcels();
  return parcels.find((p) => p.id === id) || null;
}

/**
 * Add a new parcel
 */
export function addParcel(parcel: Omit<Parcel, "id" | "createdAt" | "updatedAt">): Parcel {
  const newParcel: Parcel = {
    ...parcel,
    id: `parcel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const parcels = getAllParcels();
  parcels.push(newParcel);
  saveParcels(parcels);

  return newParcel;
}

/**
 * Update an existing parcel
 */
export function updateParcel(id: string, updates: Partial<Parcel>): Parcel | null {
  const parcels = getAllParcels();
  const index = parcels.findIndex((p) => p.id === id);

  if (index === -1) return null;

  const updatedParcel: Parcel = {
    ...parcels[index],
    ...updates,
    id: parcels[index].id, // Prevent ID changes
    createdAt: parcels[index].createdAt, // Prevent creation date changes
    updatedAt: new Date().toISOString(),
  };

  parcels[index] = updatedParcel;
  saveParcels(parcels);

  return updatedParcel;
}

/**
 * Delete a parcel
 */
export function deleteParcel(id: string): boolean {
  const parcels = getAllParcels();
  const filtered = parcels.filter((p) => p.id !== id);

  if (filtered.length === parcels.length) return false; // Not found

  saveParcels(filtered);
  return true;
}

/**
 * Save all parcels to localStorage
 */
function saveParcels(parcels: Parcel[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
  } catch (error) {
    console.error("Error saving parcels to storage:", error);
  }
}

/**
 * Clear all parcels (for testing/reset)
 */
export function clearAllParcels(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing parcels storage:", error);
  }
}

/**
 * Export parcels as JSON
 */
export function exportParcels(): string {
  const parcels = getAllParcels();
  return JSON.stringify(parcels, null, 2);
}

/**
 * Import parcels from JSON
 */
export function importParcels(jsonData: string): boolean {
  try {
    const parcels = JSON.parse(jsonData);
    if (Array.isArray(parcels)) {
      saveParcels(parcels);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error importing parcels:", error);
    return false;
  }
}
