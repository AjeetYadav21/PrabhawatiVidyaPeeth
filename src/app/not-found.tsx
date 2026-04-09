import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Page Not Found | ${SITE_NAME}`,
  description: "The page you are looking for does not exist."
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
        color: "#fff",
        fontFamily: "var(--font-poppins), sans-serif"
      }}
    >
      <h1
        style={{
          fontSize: "clamp(5rem, 15vw, 10rem)",
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: "0.5rem",
          opacity: 0.9
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "clamp(1.25rem, 3vw, 2rem)",
          fontWeight: 600,
          marginBottom: "1rem",
          opacity: 0.95
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          fontSize: "1.1rem",
          maxWidth: "480px",
          marginBottom: "2rem",
          opacity: 0.8,
          lineHeight: 1.6
        }}
      >
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/en"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.75rem",
            background: "#f97316",
            color: "#fff",
            borderRadius: "0.5rem",
            fontWeight: 600,
            fontSize: "1rem",
            transition: "opacity 0.2s"
          }}
        >
          <i className="fa-solid fa-house" />
          Go Home
        </Link>
        <Link
          href="/en#contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.75rem",
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            borderRadius: "0.5rem",
            fontWeight: 600,
            fontSize: "1rem",
            border: "1px solid rgba(255,255,255,0.3)",
            transition: "opacity 0.2s"
          }}
        >
          <i className="fa-solid fa-envelope" />
          Contact Us
        </Link>
      </div>
      <p style={{ marginTop: "3rem", fontSize: "0.85rem", opacity: 0.5 }}>
        {SITE_NAME}
      </p>
    </div>
  );
}
