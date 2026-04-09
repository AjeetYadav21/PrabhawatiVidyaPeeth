"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Submission = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short"
});

export default function ContactSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSubmissions() {
      setLoading(true);
      setStatus("");

      try {
        const response = await fetch("/api/admin/contact-submissions", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load submissions.");
        }

        if (!cancelled) {
          setSubmissions(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error instanceof Error ? error.message : "Unable to load submissions.");
          setStatusType("error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSubmissions();

    return () => {
      cancelled = true;
    };
  }, []);

  async function updateReadState(id: string, isRead: boolean) {
    setActionId(id);
    setStatus("");

    try {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isRead })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update submission.");
      }

      setSubmissions((current) =>
        current.map((submission) =>
          submission._id === id ? { ...submission, isRead: result.isRead } : submission
        )
      );
      setStatus(isRead ? "Submission marked as read." : "Submission marked as unread.");
      setStatusType("success");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update submission.");
      setStatusType("error");
    } finally {
      setActionId("");
    }
  }

  async function deleteSubmission(id: string) {
    const shouldDelete = window.confirm("Delete this contact submission?");

    if (!shouldDelete) {
      return;
    }

    setActionId(id);
    setStatus("");

    try {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete submission.");
      }

      setSubmissions((current) => current.filter((submission) => submission._id !== id));
      setStatus("Submission deleted.");
      setStatusType("success");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete submission.");
      setStatusType("error");
    } finally {
      setActionId("");
    }
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Contact Submissions</h2>
            <p>Review inbound messages, mark them as read, and clear processed leads.</p>
          </div>
          <span className={`admin-pill ${submissions.some((item) => !item.isRead) ? "unread" : "read"}`.trim()}>
            {submissions.filter((item) => !item.isRead).length} unread
          </span>
        </div>
        {loading ? <div className="admin-status info">Loading submissions...</div> : null}
        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </section>

      <section className="admin-table-wrap">
        <h2>Inbox</h2>
        <p>New form submissions arrive here from the public contact form.</p>

        {submissions.length === 0 && !loading ? (
          <div className="admin-empty" style={{ marginTop: "1rem" }}>
            No contact submissions yet.
          </div>
        ) : null}

        {submissions.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => {
                const isBusy = actionId === submission._id;

                return (
                  <tr key={submission._id}>
                    <td>
                      <strong>{submission.name}</strong>
                      <div>
                        <a href={`mailto:${submission.email}`} className="admin-inline-link">
                          {submission.email}
                        </a>
                      </div>
                      <div>
                        <a href={`tel:${submission.phone}`} className="admin-inline-link">
                          {submission.phone}
                        </a>
                      </div>
                    </td>
                    <td>{submission.subject}</td>
                    <td>{dateFormatter.format(new Date(submission.createdAt))}</td>
                    <td>
                      <span className={`admin-pill ${submission.isRead ? "read" : "unread"}`.trim()}>
                        {submission.isRead ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="admin-table-message">
                      <div className="admin-message-preview">
                        {submission.message.length > 140
                          ? `${submission.message.slice(0, 140)}...`
                          : submission.message}
                      </div>
                      {submission.message.length > 140 ? (
                        <details style={{ marginTop: "0.5rem" }}>
                          <summary>View full message</summary>
                          <p style={{ marginTop: "0.5rem" }}>{submission.message}</p>
                        </details>
                      ) : null}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-secondary-button"
                          disabled={isBusy}
                          onClick={() => updateReadState(submission._id, !submission.isRead)}
                        >
                          {submission.isRead ? "Mark Unread" : "Mark Read"}
                        </button>
                        <button
                          type="button"
                          className="admin-danger-button"
                          disabled={isBusy}
                          onClick={() => deleteSubmission(submission._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </section>
    </div>
  );
}
