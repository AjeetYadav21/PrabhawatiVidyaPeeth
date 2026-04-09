export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  implemented?: boolean;
};

export type AdminNavGroup = {
  label: string;
  icon: string;
  items: AdminNavItem[];
  defaultOpen?: boolean;
};

// Content Sections group items - all 11 CMS section editors
const contentSectionItems: AdminNavItem[] = [
  { label: "Hero", href: "/admin/sections/hero", icon: "fa-solid fa-house", implemented: true },
  { label: "About", href: "/admin/sections/about", icon: "fa-solid fa-circle-info", implemented: true },
  { label: "Academics", href: "/admin/sections/academics", icon: "fa-solid fa-book-open", implemented: true },
  { label: "Why Us", href: "/admin/sections/why-us", icon: "fa-solid fa-star", implemented: true },
  { label: "Hall of Fame", href: "/admin/sections/hall-of-fame", icon: "fa-solid fa-trophy", implemented: true },
  { label: "Gallery", href: "/admin/sections/gallery", icon: "fa-solid fa-image", implemented: true },
  { label: "Events", href: "/admin/sections/events", icon: "fa-solid fa-calendar-days", implemented: true },
  { label: "Admissions", href: "/admin/sections/admissions", icon: "fa-solid fa-file-signature", implemented: true },
  { label: "Contact Info", href: "/admin/sections/contact", icon: "fa-solid fa-address-book", implemented: true },
  { label: "Announcements", href: "/admin/sections/announcements", icon: "fa-solid fa-bullhorn", implemented: true },
  { label: "Footer", href: "/admin/sections/footer", icon: "fa-solid fa-shoe-prints", implemented: true }
];

// Registration group items
export const registrationNavItems: AdminNavItem[] = [
  { label: "Settings", href: "/admin/registration-settings", icon: "fa-solid fa-gear", implemented: true },
  { label: "All Registrations", href: "/admin/registrations", icon: "fa-solid fa-list", implemented: true },
];

// Grouped navigation structure
export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Content Sections",
    icon: "fa-solid fa-layer-group",
    items: contentSectionItems,
    defaultOpen: true
  },
  {
    label: "Registration",
    icon: "fa-solid fa-clipboard-list",
    items: registrationNavItems,
    defaultOpen: true
  }
];

// Standalone nav items (not in groups)
export const dashboardNavItem: AdminNavItem = {
  label: "Dashboard",
  href: "/admin",
  icon: "fa-solid fa-gauge"
};

export const contactSubmissionsNavItem: AdminNavItem = {
  label: "Contact Submissions",
  href: "/admin/contact-submissions",
  icon: "fa-solid fa-envelope-open-text"
};

// Flat array for backward compatibility (used by dashboard quick links)
export const adminNavItems: AdminNavItem[] = [
  dashboardNavItem,
  ...contentSectionItems,
  contactSubmissionsNavItem
];

export const adminSectionTitles: Record<string, string> = {
  hero: "Hero",
  about: "About",
  academics: "Academics",
  "why-us": "Why Us",
  "hall-of-fame": "Hall of Fame",
  gallery: "Gallery",
  events: "Events",
  admissions: "Admissions",
  contact: "Contact Info",
  announcements: "Announcements",
  footer: "Footer"
};