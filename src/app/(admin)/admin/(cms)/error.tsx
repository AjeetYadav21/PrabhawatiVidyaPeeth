"use client";

export default function AdminError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Something went wrong</h2>
            <p>An unexpected error occurred. Please try again or return to the dashboard.</p>
          </div>
        </div>
        <div className="admin-status error" style={{ marginTop: "1rem" }}>
          An error occurred while loading this page. If the problem persists, contact the developer.
        </div>
        <div className="admin-button-row" style={{ marginTop: "1rem" }}>
          <button onClick={reset} className="admin-button" type="button">
            <i className="fa-solid fa-rotate-right" /> Try Again
          </button>
          <a href="/admin" className="admin-secondary-button">
            <i className="fa-solid fa-gauge" /> Back to Dashboard
          </a>
        </div>
      </section>
    </div>
  );
}
