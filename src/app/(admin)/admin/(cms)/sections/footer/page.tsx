"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import SaveButton from "@/components/admin/SaveButton";
import type { FooterContent, FooterLink, LocalizedText } from "@/types/content";

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

const emptyFooter: FooterContent = {
  aboutText: { ...emptyText },
  quickLinks: [{ text: { ...emptyText }, href: "" }],
  academicLinks: [{ text: { ...emptyText }, href: "" }]
};

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

function normalizeFooter(value?: Partial<FooterContent> | null): FooterContent {
  const quickLinks = Array.isArray(value?.quickLinks) && value.quickLinks.length > 0
    ? value.quickLinks.map((link: Partial<FooterLink>) => ({
        text: normalizeText(link?.text),
        href: link?.href ?? ""
      }))
    : emptyFooter.quickLinks;

  const academicLinks = Array.isArray(value?.academicLinks) && value.academicLinks.length > 0
    ? value.academicLinks.map((link: Partial<FooterLink>) => ({
        text: normalizeText(link?.text),
        href: link?.href ?? ""
      }))
    : emptyFooter.academicLinks;

  return {
    aboutText: normalizeText(value?.aboutText),
    quickLinks,
    academicLinks
  };
}

export default function FooterSectionPage() {
  const [form, setForm] = useState<FooterContent>(emptyFooter);
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
        const response = await fetch("/api/admin/sections/footer", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load footer content.");
        }

        if (!cancelled) {
          setForm(normalizeFooter(result));
        }
      } catch (error) {
        if (!cancelled) {
          setForm(emptyFooter);
          setStatus(error instanceof Error ? error.message : "Unable to load footer content.");
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
      const response = await fetch("/api/admin/sections/footer", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save footer content.");
      }

      setForm(normalizeFooter(result));
      setStatus("Footer content saved successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save footer content.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  function addQuickLink() {
    setForm((current) => ({
      ...current,
      quickLinks: [...current.quickLinks, { text: { ...emptyText }, href: "" }]
    }));
  }

  function removeQuickLink(index: number) {
    setForm((current) => ({
      ...current,
      quickLinks: current.quickLinks.filter((_, linkIndex) => linkIndex !== index)
    }));
  }

  function updateQuickLink(index: number, field: keyof FooterLink, value: LocalizedText | string) {
    setForm((current) => ({
      ...current,
      quickLinks: current.quickLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      )
    }));
  }

  function addAcademicLink() {
    setForm((current) => ({
      ...current,
      academicLinks: [...current.academicLinks, { text: { ...emptyText }, href: "" }]
    }));
  }

  function removeAcademicLink(index: number) {
    setForm((current) => ({
      ...current,
      academicLinks: current.academicLinks.filter((_, linkIndex) => linkIndex !== index)
    }));
  }

  function updateAcademicLink(index: number, field: keyof FooterLink, value: LocalizedText | string) {
    setForm((current) => ({
      ...current,
      academicLinks: current.academicLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      )
    }));
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Footer Section</h2>
        <p>Manage the footer about text, quick links, and academic links shown on every page.</p>
        {loading ? <div className="admin-status info">Loading footer content...</div> : null}
      </section>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <BilingualInput
          label="About Text"
          value={form.aboutText}
          onChange={(value) => setForm((current) => ({ ...current, aboutText: value }))}
          multiline
          rows={4}
        />

        <h2>Quick Links</h2>
        <div className="admin-array-list">
          {form.quickLinks.map((link, index) => (
            <div className="admin-array-item" key={`quick-link-${index}`}>
              <div className="admin-array-item-header">
                <strong>Quick Link {index + 1}</strong>
                {form.quickLinks.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeQuickLink(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <BilingualInput
                label={`Quick Link ${index + 1} Text`}
                value={link.text}
                onChange={(value) => updateQuickLink(index, "text", value)}
              />
              <div className="admin-field">
                <label htmlFor={`quick-link-href-${index}`}>Link URL</label>
                <input
                  id={`quick-link-href-${index}`}
                  type="text"
                  value={link.href}
                  onChange={(event) => updateQuickLink(index, "href", event.target.value)}
                  placeholder="/about or #section"
                />
              </div>
            </div>
          ))}
        </div>

        <h2>Academic Links</h2>
        <div className="admin-array-list">
          {form.academicLinks.map((link, index) => (
            <div className="admin-array-item" key={`academic-link-${index}`}>
              <div className="admin-array-item-header">
                <strong>Academic Link {index + 1}</strong>
                {form.academicLinks.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeAcademicLink(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <BilingualInput
                label={`Academic Link ${index + 1} Text`}
                value={link.text}
                onChange={(value) => updateAcademicLink(index, "text", value)}
              />
              <div className="admin-field">
                <label htmlFor={`academic-link-href-${index}`}>Link URL</label>
                <input
                  id={`academic-link-href-${index}`}
                  type="text"
                  value={link.href}
                  onChange={(event) => updateAcademicLink(index, "href", event.target.value)}
                  placeholder="/about or #section"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="admin-button-row">
          <button type="button" className="admin-secondary-button" onClick={addQuickLink}>
            Add Quick Link
          </button>
          <button type="button" className="admin-secondary-button" onClick={addAcademicLink}>
            Add Academic Link
          </button>
          <SaveButton loading={saving} />
        </div>

        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </form>
    </div>
  );
}
