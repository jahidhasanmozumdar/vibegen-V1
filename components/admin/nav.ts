import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Inbox,
  LayoutDashboard,
  Layers,
  Newspaper,
  Quote,
  Settings,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNav: { title: string; items: AdminNavItem[] }[] = [
  {
    title: "Pipeline",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Leads", href: "/admin/leads", icon: Users },
      { label: "Audit Requests", href: "/admin/audits", icon: ClipboardCheck },
      { label: "Contact Messages", href: "/admin/messages", icon: Inbox },
      { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Case Studies", href: "/admin/case-studies", icon: FileText },
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
      { label: "Services", href: "/admin/services", icon: Layers },
      { label: "Pricing", href: "/admin/pricing", icon: Tag },
      { label: "Industries", href: "/admin/industries", icon: Building2 },
    ],
  },
  {
    title: "Workspace",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

/** Labels for breadcrumb segments. Unknown segments (ids) render as "Details". */
export const segmentLabels: Record<string, string> = {
  admin: "Admin",
  leads: "Leads",
  audits: "Audit Requests",
  messages: "Contact Messages",
  bookings: "Bookings",
  analytics: "Analytics",
  "case-studies": "Case Studies",
  blog: "Blog",
  testimonials: "Testimonials",
  services: "Services",
  pricing: "Pricing",
  industries: "Industries",
  settings: "Settings",
  notifications: "Notifications",
  search: "Search",
  new: "New",
};
