"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import type { HeroContent, LocalizedText } from "@/types/content";

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

const emptyHero: HeroContent = {
  title: { ...emptyText },
  subtitle1: { ...emptyText },
  subtitle2: { ...emptyText },
  ctaButtons: [
    {
      text: { ...emptyText },
      link: ""
    }
  ],
  backgroundImage: ""
};

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

function normalizeHero(value?: Partial<HeroContent> | null): HeroContent {
  const ctaButtons = Array.isArray(value?.ctaButtons) && value.ctaButtons.length > 0
    ? value.ctaButtons.map((button) => ({
        text: normalizeText(button?.text),
        link: button?.link ?? ""
      }))
    : emptyHero.ctaButtons;

  return {
    title: normalizeText(value?.title),
    subtitle1: normalizeText(value?.subtitle1),
    subtitle2: normalizeText(value?.subtitle2),
    ctaButtons,
    backgroundImage: value?.backgroundImage ?? ""
  };
}

export default function HeroSectionPage() {
  const [form, setForm] = useState<HeroContent>(emptyHero);
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
        const response = await fetch("/api/admin/sections/hero", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load hero content.");
        }

        if (!cancelled) {
          setForm(normalizeHero(result));
        }
      } catch (error) {
        if (!cancelled) {
          setForm(emptyHero);
          setStatus(error instanceof Error ? error.message : "Unable to load hero content.");
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
      const response = await fetch("/api/admin/sections/hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save hero content.");
      }

      setForm(normalizeHero(result));
      setStatus("Hero content saved successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save hero content.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  function updateButton(index: number, value: HeroContent["ctaButtons"][number]) {
    setForm((current) => ({
      ...current,
      ctaButtons: current.ctaButtons.map((button, buttonIndex) =>
        buttonIndex === index ? value : button
      )
    }));
  }

  function addButton() {
    setForm((current) => ({
      ...current,
      ctaButtons: [
        ...current.ctaButtons,
        {
          text: { ...emptyText },
          link: ""
        }
      ]
    }));
  }

  function removeButton(index: number) {
    setForm((current) => ({
      ...current,
      ctaButtons: current.ctaButtons.filter((_, buttonIndex) => buttonIndex !== index)
    }));
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Hero Section</h2>
        <p>Edit the main homepage headline, intro copy, CTA buttons, and hero background image.</p>
        {loading ? <div className="admin-status info">Loading hero content...</div> : null}
      </section>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>Hero Content</h2>
        <p>The save action updates the singleton <code>hero</code> document used by the CMS APIs.</p>

        <BilingualInput
          label="Title"
          value={form.title}
          onChange={(value) => setForm((current) => ({ ...current, title: value }))}
        />
        <BilingualInput
          label="Subtitle Line 1"
          value={form.subtitle1}
          onChange={(value) => setForm((current) => ({ ...current, subtitle1: value }))}
        />
        <BilingualInput
          label="Subtitle Line 2"
          value={form.subtitle2}
          onChange={(value) => setForm((current) => ({ ...current, subtitle2: value }))}
        />
        <ImageUpload
          label="Background Image"
          value={form.backgroundImage}
          onChange={(value) => setForm((current) => ({ ...current, backgroundImage: value }))}
        />

        <div className="admin-array-list">
          {form.ctaButtons.map((button, index) => (
            <div className="admin-array-item" key={`hero-cta-${index}`}>
              <div className="admin-array-item-header">
                <strong>CTA Button {index + 1}</strong>
                {form.ctaButtons.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeButton(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <BilingualInput
                label={`CTA ${index + 1} Text`}
                value={button.text}
                onChange={(value) => updateButton(index, { ...button, text: value })}
              />

              <div className="admin-field">
                <label htmlFor={`hero-link-${index}`}>CTA Link</label>
                <input
                  id={`hero-link-${index}`}
                  type="text"
                  value={button.link}
                  onChange={(event) => updateButton(index, { ...button, link: event.target.value })}
                  placeholder="#admissions or /page-slug"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="admin-button-row">
          <button type="button" className="admin-secondary-button" onClick={addButton}>
            Add CTA Button
          </button>
          <SaveButton loading={saving} />
        </div>

        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </form>
    </div>
  );
}
