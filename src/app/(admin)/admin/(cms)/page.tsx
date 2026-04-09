import Link from "next/link";
import { adminNavGroups, adminNavItems } from "@/components/admin/admin-nav";
import { connectDB } from "@/lib/db";
import { AnnouncementsModel, ContactSubmissionModel, EventsModel, GalleryModel } from "@/lib/models";
import { sectionNames, sectionRegistry } from "@/lib/section-registry";

export const dynamic = "force-dynamic";

function displayValue(value: number | null) {
  return value === null ? "--" : String(value);
}

// Map nav href slug to registry key (kebab-case to camelCase)
const slugToRegistryKey: Record<string, string> = {
  "hero": "hero",
  "about": "about",
  "academics": "academics",
  "why-us": "whyUs",
  "hall-of-fame": "hallOfFame",
  "gallery": "gallery",
  "events": "events",
  "admissions": "admissions",
  "contact": "contact",
  "announcements": "announcements",
  "footer": "footer"
};

export default async function AdminDashboardPage() {
  let totalSubmissions: number | null = null;
  let unreadSubmissions: number | null = null;
  let collectionItems: number | null = null;
  let databaseReady = true;

  try {
    await connectDB();

    const [submissionCount, unreadCount, galleryCount, eventCount, announcementCount] = await Promise.all([
      ContactSubmissionModel.countDocuments({}),
      ContactSubmissionModel.countDocuments({ isRead: false }),
      GalleryModel.countDocuments({}),
      EventsModel.countDocuments({}),
      AnnouncementsModel.countDocuments({})
    ]);

    totalSubmissions = submissionCount;
    unreadSubmissions = unreadCount;
    collectionItems = galleryCount + eventCount + announcementCount;
  } catch {
    databaseReady = false;
  }

  // Get content section items from nav groups
  const contentSectionItems = adminNavGroups[0].items;
  const implementedCount = contentSectionItems.filter((item) => item.implemented).length;

  // Quick actions for the dashboard
  const quickActions = [
    { label: "Edit Hero Section", href: "/admin/sections/hero", icon: "fa-solid fa-house", description: "Homepage banner and intro" },
    { label: "Edit About Section", href: "/admin/sections/about", icon: "fa-solid fa-circle-info", description: "School overview content" },
    { label: "Edit Contact Info", href: "/admin/sections/contact", icon: "fa-solid fa-address-book", description: "Address, phone, email" },
    { label: "View Submissions", href: "/admin/contact-submissions", icon: "fa-solid fa-envelope-open-text", description: `${displayValue(totalSubmissions)} total messages` }
  ];

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Dashboard</h2>
            <p>Manage your website content and review contact submissions.</p>
          </div>
          <span className={`admin-pill ${databaseReady ? "read" : "unread"}`.trim()}>
            {databaseReady ? "Database Ready" : "Database Offline"}
          </span>
        </div>
        {!databaseReady ? (
          <div className="admin-status info">
            The admin UI is in place, but live counts and content saves still require a working MongoDB connection.
          </div>
        ) : null}
      </section>

      <section className="admin-grid stats">
        <article className="admin-stat">
          <div className="admin-stat-icon">
            <i className="fa-solid fa-layer-group" />
          </div>
          <h3>Total CMS Sections</h3>
          <strong>{sectionNames.length}</strong>
          <p>All public sections are mapped in the registry.</p>
        </article>
        <article className="admin-stat">
          <div className="admin-stat-icon">
            <i className="fa-solid fa-check-circle" />
          </div>
          <h3>Editors Implemented</h3>
          <strong>{implementedCount}</strong>
          <p>{implementedCount} of {contentSectionItems.length} sections are ready.</p>
        </article>
        <article className="admin-stat">
          <div className="admin-stat-icon">
            <i className="fa-solid fa-envelope" />
          </div>
          <h3>Unread Submissions</h3>
          <strong>{displayValue(unreadSubmissions)}</strong>
          <p>New contact form leads waiting for review.</p>
        </article>
        <article className="admin-stat">
          <div className="admin-stat-icon">
            <i className="fa-solid fa-database" />
          </div>
          <h3>Collection Items</h3>
          <strong>{displayValue(collectionItems)}</strong>
          <p>Gallery, Events, and Announcements entries.</p>
        </article>
      </section>

      <section className="admin-panel">
        <h2>Content Sections</h2>
        <p>Overview of all CMS sections and their implementation status.</p>
        <div className="admin-section-grid" style={{ marginTop: "1rem" }}>
          {contentSectionItems.map((item) => {
            const slug = item.href.replace("/admin/sections/", "");
            const registryKey = slugToRegistryKey[slug] as keyof typeof sectionRegistry;
            const sectionType = sectionRegistry[registryKey]?.type ?? "singleton";
            const isImplemented = item.implemented;

            const cardContent = (
              <>
                <div className="admin-section-card-icon">
                  <i className={item.icon} />
                </div>
                <div className="admin-section-card-info">
                  <h4>{item.label}</h4>
                  <span>{sectionType === "collection" ? "Collection" : "Singleton"}</span>
                </div>
                <span className={`admin-section-card-badge ${isImplemented ? "live" : "coming"}`}>
                  {isImplemented ? "Live" : "Coming Soon"}
                </span>
              </>
            );

            if (isImplemented) {
              return (
                <Link key={item.href} href={item.href} className="admin-section-card clickable">
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={item.href} className="admin-section-card dimmed">
                {cardContent}
              </div>
            );
          })}
        </div>
      </section>

      <section className="admin-panel">
        <h2>Quick Actions</h2>
        <p>Jump into common administrative tasks.</p>
        <div className="admin-quick-links" style={{ marginTop: "1rem" }}>
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="admin-quick-link">
              <i className={action.icon} style={{ marginRight: "0.5rem" }} />
              {action.label}
              <span style={{ display: "block", fontSize: "0.8rem", fontWeight: "400", color: "#64748b", marginTop: "0.25rem" }}>
                {action.description}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
