"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import type { ContactContent, LocalizedText } from "@/types/content";

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

const emptyContact: ContactContent = {
  info: {
    address: { ...emptyText },
    phone: "",
    email: "",
    hours: { ...emptyText }
  },
  tourImage: ""
};

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

function normalizeContact(value?: Partial<ContactContent> | null): ContactContent {
  return {
    info: {
      address: normalizeText(value?.info?.address),
      phone: value?.info?.phone ?? "",
      email: value?.info?.email ?? "",
      hours: normalizeText(value?.info?.hours)
    },
    tourImage: value?.tourImage ?? ""
  };
}

export default function ContactSectionPage() {
  const [form, setForm] = useState<ContactContent>(emptyContact);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      setLoading(true);
      setStatus("");

      try {
        const response = await fetch("/api/admin/sections/contact", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load contact content.");
        }

        if (!cancelled) {
          setForm(normalizeContact(result));
        }
      } catch (error) {
        if (!cancelled) {
          setForm(emptyContact);
          setStatus(error instanceof Error ? error.message : "Unable to load contact content.");
          setStatusType("error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/sections/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save contact content.");
      }

      setForm(normalizeContact(result));
      setStatus("Contact content saved successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save contact content.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Contact Section</h2>
        <p>Update address, phone, email, visiting hours, and the campus tour image shown on the frontend.</p>
        {loading ? <div className="admin-status info">Loading contact content...</div> : null}
      </section>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>Contact Information</h2>
        <p>This singleton section powers the frontend contact card and visit prompts.</p>

        <BilingualInput
          label="Address"
          value={form.info.address}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              info: { ...current.info, address: value }
            }))
          }
          multiline
          rows={4}
        />

        <div className="admin-field-grid two">
          <div className="admin-field">
            <label htmlFor="contact-phone">Phone</label>
            <input
              id="contact-phone"
              type="text"
              value={form.info.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  info: { ...current.info, phone: event.target.value }
                }))
              }
              placeholder="+91 945274 6680"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              value={form.info.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  info: { ...current.info, email: event.target.value }
                }))
              }
              placeholder="prabhawati9452@gmail.com"
            />
          </div>
        </div>

        <BilingualInput
          label="Visiting Hours"
          value={form.info.hours}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              info: { ...current.info, hours: value }
            }))
          }
        />

        <ImageUpload
          label="Campus Tour Image"
          value={form.tourImage}
          onChange={(value) => setForm((current) => ({ ...current, tourImage: value }))}
        />

        <div className="admin-button-row">
          <SaveButton loading={saving} />
        </div>

        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </form>
    </div>
  );
}
