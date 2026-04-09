"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  adminNavGroups,
  dashboardNavItem,
  contactSubmissionsNavItem,
  AdminNavGroup
} from "./admin-nav";

type AdminSidebarProps = {
  unreadCount?: number;
};

export default function AdminSidebar({ unreadCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    adminNavGroups.forEach((group) => {
      initial[group.label] = group.defaultOpen ?? false;
    });
    return initial;
  });

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupLabel]: !current[groupLabel]
    }));
  };

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(href);
  };

  const renderNavItem = (
    item: { label: string; href: string; icon: string; implemented?: boolean },
    withBadge?: number
  ) => {
    const isActive = isItemActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`admin-nav-link ${isActive ? "active" : ""}`.trim()}
        onClick={() => setIsOpen(false)}
      >
        <span className="admin-nav-link-content">
          <i className={item.icon} />
          <span className="admin-nav-link-label">{item.label}</span>
          {item.implemented === false && (
            <span className="admin-nav-status-dot coming-soon" title="Coming soon" />
          )}
          {item.implemented === true && (
            <span className="admin-nav-status-dot implemented" title="Implemented" />
          )}
        </span>
        {withBadge !== undefined && withBadge > 0 ? (
          <span className="admin-nav-link-badge">{withBadge}</span>
        ) : null}
      </Link>
    );
  };

  const renderNavGroup = (group: AdminNavGroup) => {
    const isGroupOpen = openGroups[group.label];

    return (
      <div key={group.label} className="admin-nav-group">
        <button
          type="button"
          className="admin-nav-group-header"
          onClick={() => toggleGroup(group.label)}
          aria-expanded={isGroupOpen}
        >
          <span className="admin-nav-group-header-label">
            <i className={group.icon} />
            {group.label}
          </span>
          <i className={`fa-solid fa-chevron-down chevron ${isGroupOpen ? "open" : ""}`} />
        </button>
        <div className={`admin-nav-group-items ${isGroupOpen ? "open" : ""}`}>
          {group.items.map((item) => renderNavItem(item))}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        className="admin-sidebar-toggle"
        aria-label="Toggle admin navigation"
        onClick={() => setIsOpen((current) => !current)}
      >
        <i className="fa-solid fa-bars" />
      </button>

      {isOpen ? <div className="admin-sidebar-overlay" onClick={() => setIsOpen(false)} /> : null}

      <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`.trim()}>
        <div className="admin-sidebar-brand">
          <img src="/images/logo.png" alt="Prabhawati Vidyapeeth" />
          <div>
            <h2>Prabhawati Vidyapeeth</h2>
            <p>Admin CMS</p>
          </div>
        </div>

        <nav className="admin-nav">
          {/* Dashboard - standalone at top */}
          {renderNavItem(dashboardNavItem)}

          {/* Collapsible groups */}
          {adminNavGroups.map(renderNavGroup)}

          {/* Contact Submissions - standalone at bottom */}
          {renderNavItem(contactSubmissionsNavItem, unreadCount)}
        </nav>

        <div className="admin-sidebar-footer">
          <small>Single-admin CMS for school content management.</small>
        </div>
      </aside>
    </>
  );
}