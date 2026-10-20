export const services = [
  { id: "balayage", name: "Balayage", duration: 180, price: 2500, active: true },
  { id: "kesim", name: "Saç Kesimi", duration: 45, price: 600, active: true },
  { id: "boya", name: "Boya", duration: 120, price: 1800, active: true },
  { id: "ombre", name: "Ombre", duration: 150, price: 2200, active: true },
  { id: "rofle", name: "Röfle", duration: 120, price: 1900, active: true },
  { id: "fon", name: "Fön", duration: 30, price: 350, active: true },
  { id: "gelin", name: "Gelin Saçı", duration: 120, price: 3500, active: true },
];

export const serviceCategories = [
  { id: "kesim", label: "Saç Kesimi", icon: "scissors", serviceId: "kesim" },
  { id: "boya", label: "Boya", icon: "droplet", serviceId: "boya" },
  { id: "balayage", label: "Balayage", icon: "sparkle", serviceId: "balayage" },
  { id: "ombre", label: "Ombre", icon: "contrast", serviceId: "ombre" },
  { id: "rofle", label: "Röfle", icon: "waves", serviceId: "rofle" },
  { id: "fon", label: "Fön", icon: "wind", serviceId: "fon" },
  { id: "gelin", label: "Gelin Saçı", icon: "crown", serviceId: "gelin" },
  { id: "diger", label: "Diğer", icon: "grid", serviceId: null },
];

export const hairStyles = ["Kısa", "Orta boy", "Uzun", "Bob", "Kıvırcık", "Dalgalı"];

export const popularSearches = [
  { label: "Balayage", serviceId: "balayage" },
  { label: "Kısa bob", hairStyle: "Bob" },
  { label: "Gelin saçı", serviceId: "gelin" },
  { label: "Ombre", serviceId: "ombre" },
];
