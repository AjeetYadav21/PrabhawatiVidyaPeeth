"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Registration = {
  _id: string;
  registrationNumber: string;
  studentName: string;
  fatherName: string;
  phone: string;
  class: string;
  paymentStatus: string;
  amountPaid: number;
  createdAt: string;
};

type Stats = {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  revenue: number;
  byClass: Record<string, Record<string, number>>;
};

const badgeStyles: Record<string, React.CSSProperties> = {
  paid: {
    background: "#dcfce7",
    color: "#166534",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem"
  },
  pending: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem"
  },
  failed: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem"
  }
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium"
});

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (classFilter) params.set("class", classFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/admin/registrations?${params.toString()}`, {
        cache: "no-store"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to load registrations.");
      }

      setRegistrations(result.registrations);
      setTotalPages(result.totalPages);
    } catch {
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [page, classFilter, statusFilter, search]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/registrations/stats", {
        cache: "no-store"
      });
      const result = await response.json();

      if (response.ok) {
        setStats(result);
      }
    } catch {
      // Stats are non-critical; silently ignore errors
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  function handleExport() {
    const params = new URLSearchParams();
    if (classFilter) params.set("class", classFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    window.open(`/api/admin/registrations/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="admin-page-stack">
      {/* Stats Cards */}
      {stats ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem"
          }}
        >
          <div className="admin-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats.total}</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Total Registrations</div>
          </div>
          <div className="admin-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem", color: "#166534" }}>
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats.paid}</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Paid</div>
          </div>
          <div className="admin-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem", color: "#92400e" }}>
              <i className="fa-solid fa-clock"></i>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats.pending}</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Pending</div>
          </div>
          <div className="admin-panel" style={{ textAlign: "center", padding: "1.25rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem", color: "#166534" }}>
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>
              {"\u20B9"}{(stats.revenue / 100).toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Revenue</div>
          </div>
        </div>
      ) : null}

      {/* Filter Bar */}
      <div className="admin-panel">
        <div className="admin-field-grid two" style={{ alignItems: "end" }}>
          <div className="admin-field">
            <label htmlFor="reg-search">Search</label>
            <input
              id="reg-search"
              type="text"
              placeholder="Name, phone, or reg. number"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="reg-class-filter">Class</label>
            <select
              id="reg-class-filter"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Classes</option>
              <option value="10th">Class 10th</option>
              <option value="12th">Class 12th</option>
            </select>
          </div>
        </div>
        <div className="admin-field-grid two" style={{ alignItems: "end", marginTop: "0.5rem" }}>
          <div className="admin-field">
            <label htmlFor="reg-status-filter">Payment Status</label>
            <select
              id="reg-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="admin-field">
            <button type="button" className="admin-secondary-button" onClick={handleExport}>
              <i className="fa-solid fa-download"></i> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Registration Table */}
      <div className="admin-panel">
        {loading ? (
          <p className="admin-status info">Loading registrations...</p>
        ) : registrations.length === 0 ? (
          <div className="admin-empty">No registrations found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reg. No.</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id}>
                  <td>{reg.registrationNumber}</td>
                  <td>{reg.studentName}</td>
                  <td>{reg.class}</td>
                  <td>{reg.phone}</td>
                  <td>
                    <span style={badgeStyles[reg.paymentStatus] || {}}>
                      {reg.paymentStatus}
                    </span>
                  </td>
                  <td>{dateFormatter.format(new Date(reg.createdAt))}</td>
                  <td>
                    <Link href={`/admin/registrations/${reg._id}`} className="admin-inline-link">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 ? (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "1rem"
            }}
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="admin-secondary-button"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="admin-secondary-button"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
