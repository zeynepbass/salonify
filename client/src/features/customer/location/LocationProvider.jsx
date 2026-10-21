"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { defaultLocation } from "@/data/catalog";
import LocationDialog from "@/features/customer/location/LocationDialog";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(defaultLocation);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openLocationDialog = useCallback(() => setDialogOpen(true), []);
  const closeLocationDialog = useCallback(() => setDialogOpen(false), []);

  const value = useMemo(
    () => ({
      location,
      locationLabel: `${location.city}, ${location.district}`,
      hasCoordinates: location.lat !== undefined && location.lng !== undefined,
      openLocationDialog,
    }),
    [location, openLocationDialog],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
      {dialogOpen && <LocationDialog current={location} onApply={setLocation} onClose={closeLocationDialog} />}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation yalnızca LocationProvider içinde kullanılabilir.");
  return context;
}
