"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import type { AboutContent, LocalizedText } from "@/types/content";

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

const emptyAbout: AboutContent = {
  campusImage: "",
  paragraphs: [{ text: { ...emptyText } }],
  upBoardLink: "",
  principalMessage: {
    name: { ...emptyText },
    image: "",
    message: { ...emptyText }
  }
};

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

function normalizeAbout(value?: Partial<AboutContent> | null): AboutContent {
  const paragraphs = Array.isArray(value?.paragraphs) && value.paragraphs.length > 0
    ? value.paragraphs.map((paragraph) => ({ text: normalizeText(paragraph?.text) }))
    : emptyAbout.paragraphs;

  return {
    campusImage: value?.campusImage ?? "",
    paragraphs,
    upBoardLink: value?.upBoardLink ?? "",
    principalMessage: {
      name: normalizeText(value?.principalMessage?.name),
      image: value?.principalMessage?.image ?? "",
      message: normalizeText(value?.principalMessage?.message)
    }
  };
}

export default function AboutSectionPage() {
  const [form, setForm] = useState<AboutContent>(emptyAbout);
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
        const response = await fetch("/api/admin/sections/about", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load about content.");
        }

        if (!cancelled) {
          setForm(normalizeAbout(result));
        }
      } catch (error) {
        if (!cancelled) {
          setForm(emptyAbout);
          setStatus(error instanceof Error ? error.message : "Unable to load about content.");
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
      const response = await fetch("/api/admin/sections/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save about content.");
      }

      setForm(normalizeAbout(result));
      setStatus("About content saved successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save about content.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  function updateParagraph(index: number, value: LocalizedText) {
    setForm((current) => ({
      ...current,
      paragraphs: current.paragraphs.map((paragraph, paragraphIndex) =>
        paragraphIndex === index ? { text: value } : paragraph
      )
    }));
  }

  function addParagraph() {
    setForm((current) => ({
      ...current,
      paragraphs: [...current.paragraphs, { text: { ...emptyText } }]
    }));
  }

  function removeParagraph(index: number) {
    setForm((current) => ({
      ...current,
      paragraphs: current.paragraphs.filter((_, paragraphIndex) => paragraphIndex !== index)
    }));
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>About Section</h2>
        <p>Manage campus imagery, introduction paragraphs, the board link, and the principal message block.</p>
        {loading ? <div className="admin-status info">Loading about content...</div> : null}
      </section>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>About Content</h2>
        <p>These fields power the main story section of the frontend.</p>

        <ImageUpload
          label="Campus Image"
          value={form.campusImage}
          onChange={(value) => setForm((current) => ({ ...current, campusImage: value }))}
        />

        <div className="admin-array-list">
          {form.paragraphs.map((paragraph, index) => (
            <div className="admin-array-item" key={`about-paragraph-${index}`}>
              <div className="admin-array-item-header">
                <strong>Paragraph {index + 1}</strong>
                {form.paragraphs.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeParagraph(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <BilingualInput
                label={`Paragraph ${index + 1}`}
                value={paragraph.text}
                onChange={(value) => updateParagraph(index, value)}
                multiline
                rows={5}
              />
            </div>
          ))}
        </div>

        <div className="admin-field">
          <label htmlFor="up-board-link">UP Board Link</label>
          <input
            id="up-board-link"
            type="url"
            value={form.upBoardLink}
            onChange={(event) => setForm((current) => ({ ...current, upBoardLink: event.target.value }))}
            placeholder="https://upmsp.edu.in/"
          />
        </div>

        <div className="admin-panel" style={{ marginTop: "1rem" }}>
          <h2>Principal Message</h2>
          <p>Keep the principal name, image, and bilingual message in sync here.</p>

          <BilingualInput
            label="Principal Name"
            value={form.principalMessage.name}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                principalMessage: { ...current.principalMessage, name: value }
              }))
            }
          />
          <ImageUpload
            label="Principal Image"
            value={form.principalMessage.image}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                principalMessage: { ...current.principalMessage, image: value }
              }))
            }
          />
          <BilingualInput
            label="Principal Message"
            value={form.principalMessage.message}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                principalMessage: { ...current.principalMessage, message: value }
              }))
            }
            multiline
            rows={6}
          />
        </div>

        <div className="admin-button-row">
          <button type="button" className="admin-secondary-button" onClick={addParagraph}>
            Add Paragraph
          </button>
          <SaveButton loading={saving} />
        </div>

        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </form>
    </div>
  );
}
