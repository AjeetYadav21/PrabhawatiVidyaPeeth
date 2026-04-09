"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export default function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("error");

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatus("");
  }

  function handleClose() {
    resetForm();
    setOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (newPassword !== confirmPassword) {
      setStatus("New passwords do not match.");
      setStatusType("error");
      return;
    }

    if (newPassword.length < 8) {
      setStatus("New password must be at least 8 characters.");
      setStatusType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to change password.");
      }

      setStatus("Password changed successfully.");
      setStatusType("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => handleClose(), 2000);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to change password.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="admin-secondary-button"
        onClick={() => setOpen(true)}
        style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
      >
        <i className="fa-solid fa-key" style={{ marginRight: "0.35rem" }} />
        Password
      </button>
    );
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}
        onClick={handleClose}
      >
        <div
          className="admin-panel"
          style={{ maxWidth: "420px", width: "100%", position: "relative" }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ marginBottom: "1rem" }}>Change Password</h3>

          <form onSubmit={handleSubmit}>
            <div className="admin-field">
              <label htmlFor="cp-current">Current Password</label>
              <input
                id="cp-current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="admin-field">
              <label htmlFor="cp-new">New Password</label>
              <input
                id="cp-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="cp-confirm">Confirm New Password</label>
              <input
                id="cp-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {status ? (
              <div className={`admin-status ${statusType}`} style={{ marginBottom: "0.75rem" }}>
                {status}
              </div>
            ) : null}

            <div className="admin-button-row">
              <button className="admin-button" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Change Password"}
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
