export const salonKeys = {
  all: ["salons"],
  list: (params) => ["salons", "list", params],
  detail: (salonId) => ["salons", "detail", salonId],
  reviews: (salonId, limit) => ["salons", "detail", salonId, "reviews", limit],
  availability: (salonId, params) => ["salons", "detail", salonId, "availability", params],
};

export const appointmentKeys = {
  all: ["appointments"],
  list: (scope) => ["appointments", "list", scope],
  detail: (appointmentId) => ["appointments", "detail", appointmentId],
};

export const notificationKeys = {
  all: ["notifications"],
  list: (audience) => ["notifications", audience],
};

export const userKeys = {
  all: ["users"],
  reviews: () => ["users", "me", "reviews"],
};

export const panelKeys = {
  all: ["panel"],
  salon: () => ["panel", "salon"],
  dashboard: () => ["panel", "dashboard"],
  services: () => ["panel", "services"],
  workingHours: (salonId) => ["panel", "working-hours", salonId],
  blockedDates: (salonId) => ["panel", "blocked-dates", salonId],
  portfolio: () => ["panel", "portfolio"],
  appointments: (range) => ["panel", "appointments", range],
};

export const authKeys = {
  session: ["auth", "session"],
};
