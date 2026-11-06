// Centralized labels and destinations used by the site navbar.
export const navbarContent = {
  // Placeholder deadline from the reference; replace when the official date is confirmed.
  registrationDeadline: "2027-02-15T23:59:00+05:00",
  brand: {
    label: "PROCOM'27",
    to: "/",
  },
  navigationLabel: "Main navigation",
  menu: {
    openLabel: "Open navigation menu",
    closeLabel: "Close navigation menu",
    id: "mobile-navigation",
  },
  links: [
    { label: "HOME", to: "/" },
    { label: "COMPETITIONS", to: "/competitions" },
    { label: "TEAMS", to: "/excom" },
    { label: "SCHEDULE", to: "/schedule" },
    { label: "ABOUT", to: "/about" },
  ],
  register: {
    label: "REGISTER",
    to: "/register",
    arrow: "→",
  },
};
