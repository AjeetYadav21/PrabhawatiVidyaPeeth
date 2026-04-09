"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import SaveButton from "@/components/admin/SaveButton";

type SettingsForm = {
  class10Enabled: boolean;
  class12Enabled: boolean;
  class10Fee: string;
  class12Fee: string;
  class10StartDate: string;
  class10EndDate: string;
  class12StartDate: string;
  class12EndDate: string;
  academicSession: string;
};

const defaultSettings: SettingsForm = {
  class10Enabled: false,
  class12Enabled: false,
  class10Fee: "",
  class12Fee: "",
  class10StartDate: "",
  class10EndDate: "",
  class12StartDate: "",
  class12EndDate: "",
  academicSession: "2026-27"
};

export default function RegistrationSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setStatus("");

      try {
        const response = await fetch("/api/admin/registration-settings", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load registration settings.");
        }

        if (!cancelled) {
          setForm({
            class10Enabled: result.class10Enabled ?? false,
            class12Enabled: result.class12Enabled ?? false,
            class10Fee: result.class10Fee ? (result.class10Fee / 100).toString() : "",
            class12Fee: result.class12Fee ? (result.class12Fee / 100).toString() : "",
            class10StartDate: result.class10StartDate ?? "",
            class10EndDate: result.class10EndDate ?? "",
            class12StartDate: result.class12StartDate ?? "",
            class12EndDate: result.class12EndDate ?? "",
            academicSession: result.academicSession ?? "2026-27"
          });
        }
      } catch (error) {
        if (!cancelled) {
          setForm(defaultSettings);
          setStatus(error instanceof Error ? error.message : "Unable to load registration settings.");
          setStatusType("error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/registration-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          class10Enabled: form.class10Enabled,
          class12Enabled: form.class12Enabled,
          class10Fee: form.class10Fee ? Math.round(parseFloat(form.class10Fee) * 100) : 0,
          class12Fee: form.class12Fee ? Math.round(parseFloat(form.class12Fee) * 100) : 0,
          class10StartDate: form.class10StartDate,
          class10EndDate: form.class10EndDate,
          class12StartDate: form.class12StartDate,
          class12EndDate: form.class12EndDate,
          academicSession: form.academicSession
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save registration settings.");
      }

      setForm({
        class10Enabled: result.class10Enabled ?? false,
        class12Enabled: result.class12Enabled ?? false,
        class10Fee: result.class10Fee ? (result.class10Fee / 100).toString() : "",
        class12Fee: result.class12Fee ? (result.class12Fee / 100).toString() : "",
        class10StartDate: result.class10StartDate ?? "",
        class10EndDate: result.class10EndDate ?? "",
        class12StartDate: result.class12StartDate ?? "",
        class12EndDate: result.class12EndDate ?? "",
        academicSession: result.academicSession ?? "2026-27"
      });
      setStatus("Registration settings saved successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save registration settings.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Registration Settings</h2>
        <p>Configure registration windows and fees for each class.</p>
        {loading ? <div className="admin-status info">Loading registration settings...</div> : null}
      </section>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label htmlFor="reg-academic-session">Academic Session</label>
          <input
            id="reg-academic-session"
            type="text"
            value={form.academicSession}
            onChange={(event) => setForm((current) => ({ ...current, academicSession: event.target.value }))}
            placeholder="2026-27"
          />
        </div>

        <div className="admin-panel" style={{ marginBottom: "1rem" }}>
          <h3>Class 10th</h3>
          <div className="admin-field">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={form.class10Enabled}
                onChange={(event) => setForm((current) => ({ ...current, class10Enabled: event.target.checked }))}
              />
              Enable Registration
            </label>
          </div>
          <div className="admin-field-grid two">
            <div className="admin-field">
              <label htmlFor="reg-class10-fee">Fee (in Rupees)</label>
              <input
                id="reg-class10-fee"
                type="number"
                min="0"
                step="1"
                value={form.class10Fee}
                onChange={(event) => setForm((current) => ({ ...current, class10Fee: event.target.value }))}
                placeholder="500"
              />
            </div>
          </div>
          <div className="admin-field-grid two">
            <div className="admin-field">
              <label htmlFor="reg-class10-start">Start Date</label>
              <input
                id="reg-class10-start"
                type="date"
                value={form.class10StartDate}
                onChange={(event) => setForm((current) => ({ ...current, class10StartDate: event.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="reg-class10-end">End Date</label>
              <input
                id="reg-class10-end"
                type="date"
                value={form.class10EndDate}
                onChange={(event) => setForm((current) => ({ ...current, class10EndDate: event.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="admin-panel" style={{ marginBottom: "1rem" }}>
          <h3>Class 12th</h3>
          <div className="admin-field">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={form.class12Enabled}
                onChange={(event) => setForm((current) => ({ ...current, class12Enabled: event.target.checked }))}
              />
              Enable Registration
            </label>
          </div>
          <div className="admin-field-grid two">
            <div className="admin-field">
              <label htmlFor="reg-class12-fee">Fee (in Rupees)</label>
              <input
                id="reg-class12-fee"
                type="number"
                min="0"
                step="1"
                value={form.class12Fee}
                onChange={(event) => setForm((current) => ({ ...current, class12Fee: event.target.value }))}
                placeholder="500"
              />
            </div>
          </div>
          <div className="admin-field-grid two">
            <div className="admin-field">
              <label htmlFor="reg-class12-start">Start Date</label>
              <input
                id="reg-class12-start"
                type="date"
                value={form.class12StartDate}
                onChange={(event) => setForm((current) => ({ ...current, class12StartDate: event.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="reg-class12-end">End Date</label>
              <input
                id="reg-class12-end"
                type="date"
                value={form.class12EndDate}
                onChange={(event) => setForm((current) => ({ ...current, class12EndDate: event.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="admin-button-row">
          <SaveButton loading={saving} />
        </div>

        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </form>
    </div>
  );
}
