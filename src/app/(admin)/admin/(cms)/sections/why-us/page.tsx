"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import SaveButton from "@/components/admin/SaveButton";
import type { WhyUsContent, WhyUsFeature, LocalizedText } from "@/types/content";

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

const emptyWhyUs: WhyUsContent = {
  features: [{ title: { ...emptyText }, description: { ...emptyText }, icon: "" }]
};

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

function normalizeWhyUs(value?: Partial<WhyUsContent> | null): WhyUsContent {
  const features = Array.isArray(value?.features) && value.features.length > 0
    ? value.features.map((feature: Partial<WhyUsFeature>) => ({
        title: normalizeText(feature?.title),
        description: normalizeText(feature?.description),
        icon: feature?.icon ?? ""
      }))
    : emptyWhyUs.features;

  return { features };
}

export default function WhyUsSectionPage() {
  const [form, setForm] = useState<WhyUsContent>(emptyWhyUs);
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
        const response = await fetch("/api/admin/sections/whyUs", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load why-us content.");
        }

        if (!cancelled) {
          setForm(normalizeWhyUs(result));
        }
      } catch (error) {
        if (!cancelled) {
          setForm(emptyWhyUs);
          setStatus(error instanceof Error ? error.message : "Unable to load why-us content.");
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
      const response = await fetch("/api/admin/sections/whyUs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save why-us content.");
      }

      setForm(normalizeWhyUs(result));
      setStatus("Why-us content saved successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save why-us content.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  function addFeature() {
    setForm((current) => ({
      ...current,
      features: [...current.features, { title: { ...emptyText }, description: { ...emptyText }, icon: "" }]
    }));
  }

  function removeFeature(index: number) {
    setForm((current) => ({
      ...current,
      features: current.features.filter((_, featureIndex) => featureIndex !== index)
    }));
  }

  function updateFeature(index: number, field: keyof WhyUsFeature, value: LocalizedText | string) {
    setForm((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? { ...feature, [field]: value } : feature
      )
    }));
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Why Choose Us Section</h2>
        <p>Manage the features that highlight why families should choose this school.</p>
        {loading ? <div className="admin-status info">Loading why-us content...</div> : null}
      </section>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>Features</h2>
        <p>Each feature includes a bilingual title, description, and an icon class.</p>

        <div className="admin-array-list">
          {form.features.map((feature, index) => (
            <div className="admin-array-item" key={`why-us-feature-${index}`}>
              <div className="admin-array-item-header">
                <strong>Feature {index + 1}</strong>
                {form.features.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeFeature(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <BilingualInput
                label={`Feature ${index + 1} Title`}
                value={feature.title}
                onChange={(value) => updateFeature(index, "title", value)}
              />
              <BilingualInput
                label={`Feature ${index + 1} Description`}
                value={feature.description}
                onChange={(value) => updateFeature(index, "description", value)}
                multiline
                rows={4}
              />
              <div className="admin-field">
                <label htmlFor={`why-us-icon-${index}`}>Icon Class</label>
                <input
                  id={`why-us-icon-${index}`}
                  type="text"
                  value={feature.icon}
                  onChange={(event) => updateFeature(index, "icon", event.target.value)}
                  placeholder="fa-solid fa-star"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="admin-button-row">
          <button type="button" className="admin-secondary-button" onClick={addFeature}>
            Add Feature
          </button>
          <SaveButton loading={saving} />
        </div>

        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </form>
    </div>
  );
}
