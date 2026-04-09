import Link from "next/link";

export default function LocaleNotFound() {
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
      <h1
        style={{
          fontSize: "clamp(4rem, 12vw, 8rem)",
          fontWeight: 800,
          color: "var(--color-primary)",
          lineHeight: 1,
          marginBottom: "0.5rem"
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        Page Not Found
      </h2>
      <p
        style={{
          maxWidth: "480px",
          color: "var(--color-gray-500)",
          marginBottom: "2rem",
          lineHeight: 1.6
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn btn-primary">
        <i className="fa-solid fa-house" style={{ marginRight: "0.5rem" }} />
        Go to Homepage
      </Link>
    </section>
  );
}
