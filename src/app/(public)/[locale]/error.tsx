"use client";

export default function PublicError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "3rem 1.5rem"
      }}
    >
      <div
        style={{
          fontSize: "3rem",
          marginBottom: "1rem",
          color: "var(--color-secondary)"
        }}
      >
        <i className="fa-solid fa-triangle-exclamation" />
      </div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        Something went wrong
      </h2>
      <p
        style={{
          maxWidth: "480px",
          color: "var(--color-gray-500)",
          marginBottom: "2rem",
          lineHeight: 1.6
        }}
      >
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <button onClick={reset} className="btn btn-primary" type="button">
        <i className="fa-solid fa-rotate-right" style={{ marginRight: "0.5rem" }} />
        Try Again
      </button>
    </section>
  );
}
