import Link from "next/link";
import { notFound } from "next/navigation";
import { adminSectionTitles } from "@/components/admin/admin-nav";

export default async function PendingSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = adminSectionTitles[section];

  if (!title) {
    notFound();
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel admin-section-placeholder">
        <h2>{title}</h2>
        <p>This is the generic CMS fallback route for sections without a dedicated editor page.</p>
        <div className="admin-status info">
          The model and API wiring are already in place. If this appears for a listed section, add or restore its slug-specific editor page.
        </div>
      </section>

      <section className="admin-grid two">
        <div className="admin-panel">
          <h2>Current State</h2>
          <p>Most sections now use dedicated pages. This fallback mainly exists to catch future sections during development.</p>
          <div className="admin-quick-links" style={{ marginTop: "1rem" }}>
            <Link href="/admin/sections/hero" className="admin-quick-link">
              Hero Editor
            </Link>
            <Link href="/admin/sections/about" className="admin-quick-link">
              About Editor
            </Link>
            <Link href="/admin/sections/contact" className="admin-quick-link">
              Contact Editor
            </Link>
          </div>
        </div>

        <div className="admin-panel">
          <h2>Next Step</h2>
          <p>Create a dedicated page only if {title} needs a custom editing experience beyond the generic route.</p>
        </div>
      </section>
    </div>
  );
}
