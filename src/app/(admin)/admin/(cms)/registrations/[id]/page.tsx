"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Registration {
  _id: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  class: string;
  previousSchool: string;
  address: string;
  aadharNumber: string;
  category: string;
  stream?: string;
  previousMarks?: string;
  photoUrl?: string;
  marksheetUrl?: string;
  registrationNumber: string;
  academicSession: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentStatus: string;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
}

function getStatusStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "4px 12px",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: 600,
  };
  switch (status) {
    case "paid":
      return { ...base, background: "#dcfce7", color: "#166534" };
    case "pending":
      return { ...base, background: "#fef3c7", color: "#92400e" };
    case "failed":
      return { ...base, background: "#fee2e2", color: "#991b1b" };
    default:
      return base;
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.15rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.95rem" }}>{value}</div>
    </div>
  );
}

export default function RegistrationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/admin/registrations/${id}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled) {
          if (res.ok) {
            setRegistration(data);
          } else {
            setRegistration(null);
          }
        }
      } catch {
        if (!cancelled) setRegistration(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/registrations");
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete registration.");
      }
    } catch {
      alert("Failed to delete registration.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-page-stack">
      <div>
        <Link
          href="/admin/registrations"
          style={{ color: "#3b82f6", textDecoration: "none" }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Registrations
        </Link>
      </div>

      {loading ? (
        <p className="admin-status">Loading...</p>
      ) : !registration ? (
        <p className="admin-status error">Registration not found.</p>
      ) : (
        <>
          {/* Header with status badge and actions */}
          <div className="admin-panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>{registration.studentName}</h2>
                <p style={{ color: "#64748b", margin: "0.25rem 0" }}>
                  {registration.registrationNumber}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={getStatusStyle(registration.paymentStatus)}>
                  {registration.paymentStatus.toUpperCase()}
                </span>
                {registration.paymentStatus !== "paid" && (
                  <button
                    className="admin-danger-button"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="admin-panel">
            <h3>Personal Details</h3>
            <div className="admin-field-grid two">
              <DetailRow label="Student Name" value={registration.studentName} />
              <DetailRow label="Father's Name" value={registration.fatherName} />
              <DetailRow label="Mother's Name" value={registration.motherName} />
              <DetailRow label="Date of Birth" value={registration.dob} />
              <DetailRow label="Gender" value={registration.gender} />
              <DetailRow label="Category" value={registration.category} />
              <DetailRow label="Aadhar Number" value={registration.aadharNumber} />
            </div>
          </div>

          {/* Academic Details */}
          <div className="admin-panel">
            <h3>Academic Details</h3>
            <div className="admin-field-grid two">
              <DetailRow label="Class" value={registration.class} />
              {registration.stream && (
                <DetailRow label="Stream" value={registration.stream} />
              )}
              <DetailRow
                label="Previous School"
                value={registration.previousSchool}
              />
              {registration.previousMarks && (
                <DetailRow
                  label="Previous Marks"
                  value={registration.previousMarks}
                />
              )}
              <DetailRow
                label="Academic Session"
                value={registration.academicSession}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="admin-panel">
            <h3>Contact Details</h3>
            <div className="admin-field-grid two">
              <DetailRow label="Phone" value={registration.phone} />
              <DetailRow label="Email" value={registration.email} />
            </div>
            <DetailRow label="Address" value={registration.address} />
          </div>

          {/* Documents */}
          <div className="admin-panel">
            <h3>Documents</h3>
            <div className="admin-field-grid two">
              {registration.photoUrl && (
                <div>
                  <label
                    style={{
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Photo
                  </label>
                  <img
                    src={registration.photoUrl}
                    alt="Student Photo"
                    style={{ maxWidth: "200px", borderRadius: "8px" }}
                  />
                </div>
              )}
              {registration.marksheetUrl && (
                <div>
                  <label
                    style={{
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Marksheet
                  </label>
                  {registration.marksheetUrl.endsWith(".pdf") ? (
                    <a
                      href={registration.marksheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#3b82f6" }}
                    >
                      <i className="fa-solid fa-file-pdf"></i> View PDF
                    </a>
                  ) : (
                    <img
                      src={registration.marksheetUrl}
                      alt="Marksheet"
                      style={{ maxWidth: "200px", borderRadius: "8px" }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="admin-panel">
            <h3>Payment Details</h3>
            <div className="admin-field-grid two">
              <DetailRow label="Status" value={registration.paymentStatus} />
              <DetailRow
                label="Amount"
                value={`₹${(registration.amountPaid / 100).toLocaleString("en-IN")}`}
              />
              {registration.razorpayOrderId && (
                <DetailRow
                  label="Order ID"
                  value={registration.razorpayOrderId}
                />
              )}
              {registration.razorpayPaymentId && (
                <DetailRow
                  label="Payment ID"
                  value={registration.razorpayPaymentId}
                />
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="admin-panel">
            <div className="admin-field-grid two">
              <DetailRow
                label="Registered At"
                value={new Date(registration.createdAt).toLocaleString("en-IN")}
              />
              <DetailRow
                label="Last Updated"
                value={new Date(registration.updatedAt).toLocaleString("en-IN")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
