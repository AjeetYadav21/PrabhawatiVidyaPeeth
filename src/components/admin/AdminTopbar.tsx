"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import ChangePasswordButton from "./ChangePasswordButton";
import { adminSectionTitles } from "./admin-nav";

type AdminTopbarProps = {
  email: string;
};

type PageInfo = {
  title: string;
  breadcrumbs: { label: string; href?: string }[];
  subtitle: string;
};

function getPageInfo(pathname: string): PageInfo {
  // Dashboard
  if (pathname === "/admin") {
    return {
      title: "Dashboard",
      breadcrumbs: [{ label: "Dashboard" }],
      subtitle: "Overview of your content management system"
    };
  }

  // Section editors: /admin/sections/[slug]
  const sectionMatch = pathname.match(/^\/admin\/sections\/([^/]+)$/);
  if (sectionMatch) {
    const slug = sectionMatch[1];
    const sectionTitle = adminSectionTitles[slug] || slug;
    return {
      title: sectionTitle,
      breadcrumbs: [
        { label: "Dashboard", href: "/admin" },
        { label: "Content" },
        { label: sectionTitle }
      ],
      subtitle: `Edit the ${sectionTitle} section content`
    };
  }

  // Registration Settings
  if (pathname === "/admin/registration-settings") {
    return {
      title: "Registration Settings",
      breadcrumbs: [{ label: "Dashboard", href: "/admin" }, { label: "Registration Settings" }],
      subtitle: "Configure registration windows and fees"
    };
  }

  // All Registrations
  if (pathname === "/admin/registrations") {
    return {
      title: "Registrations",
      breadcrumbs: [{ label: "Dashboard", href: "/admin" }, { label: "Registrations" }],
      subtitle: "View and manage student registrations"
    };
  }

  // Registration Detail
  if (pathname.startsWith("/admin/registrations/")) {
    return {
      title: "Registration Detail",
      breadcrumbs: [{ label: "Dashboard", href: "/admin" }, { label: "Registrations", href: "/admin/registrations" }, { label: "Detail" }],
      subtitle: "View registration details"
    };
  }

  // Contact Submissions
  if (pathname === "/admin/contact-submissions") {
    return {
      title: "Contact Submissions",
      breadcrumbs: [
        { label: "Dashboard", href: "/admin" },
        { label: "Contact Submissions" }
      ],
      subtitle: "Review and manage contact form submissions"
    };
  }

  // Fallback
  return {
    title: "Admin Panel",
    breadcrumbs: [{ label: "Dashboard", href: "/admin" }],
    subtitle: "Manage your website content"
  };
}

export default function AdminTopbar({ email }: AdminTopbarProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-content">
        <div>
          <nav className="admin-topbar-breadcrumbs">
            {pageInfo.breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {index > 0 && (
                  <span className="admin-topbar-separator">
                    <i className="fa-solid fa-chevron-right"></i>
                  </span>
                )}
                {crumb.href ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1>{pageInfo.title}</h1>
          <p>{pageInfo.subtitle}</p>
        </div>
        <div className="admin-topbar-meta">
          <span className="admin-user-chip">{email}</span>
          <ChangePasswordButton />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}