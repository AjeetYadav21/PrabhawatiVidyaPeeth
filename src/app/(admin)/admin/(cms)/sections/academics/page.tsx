"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import SaveButton from "@/components/admin/SaveButton";
import type { AcademicsContent, AcademicLevel, AcademicSubject, AcademicLanguage, LocalizedText } from "@/types/content";

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

const emptyAcademics: AcademicsContent = {
  levels: [
    {
      name: { ...emptyText },
      icon: "",
      grades: { ...emptyText },
      description: { ...emptyText }
    }
  ],
  subjects: [
    {
      name: { ...emptyText },
      icon: ""
    }
  ],
  languages: [
    {
      name: { ...emptyText }
    }
  ]
};

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

function normalizeAcademics(value?: Partial<AcademicsContent> | null): AcademicsContent {
  const levels = Array.isArray(value?.levels) && value.levels.length > 0
    ? value.levels.map((level) => ({
        name: normalizeText(level?.name),
        icon: level?.icon ?? "",
        grades: normalizeText(level?.grades),
        description: normalizeText(level?.description)
      }))
    : emptyAcademics.levels;

  const subjects = Array.isArray(value?.subjects) && value.subjects.length > 0
    ? value.subjects.map((subject) => ({
        name: normalizeText(subject?.name),
        icon: subject?.icon ?? ""
      }))
    : emptyAcademics.subjects;

  const languages = Array.isArray(value?.languages) && value.languages.length > 0
    ? value.languages.map((language) => ({
        name: normalizeText(language?.name)
      }))
    : emptyAcademics.languages;

  return {
    levels,
    subjects,
    languages
  };
}

export default function AcademicsSectionPage() {
  const [form, setForm] = useState<AcademicsContent>(emptyAcademics);
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
        const response = await fetch("/api/admin/sections/academics", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load academics content.");
        }

        if (!cancelled) {
          setForm(normalizeAcademics(result));
        }
      } catch (error) {
        if (!cancelled) {
          setForm(emptyAcademics);
          setStatus(error instanceof Error ? error.message : "Unable to load academics content.");
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
      const response = await fetch("/api/admin/sections/academics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save academics content.");
      }

      setForm(normalizeAcademics(result));
      setStatus("Academics content saved successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save academics content.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  function updateLevel(index: number, value: AcademicLevel) {
    setForm((current) => ({
      ...current,
      levels: current.levels.map((level, levelIndex) =>
        levelIndex === index ? value : level
      )
    }));
  }

  function addLevel() {
    setForm((current) => ({
      ...current,
      levels: [
        ...current.levels,
        {
          name: { ...emptyText },
          icon: "",
          grades: { ...emptyText },
          description: { ...emptyText }
        }
      ]
    }));
  }

  function removeLevel(index: number) {
    setForm((current) => ({
      ...current,
      levels: current.levels.filter((_, levelIndex) => levelIndex !== index)
    }));
  }

  function updateSubject(index: number, value: AcademicSubject) {
    setForm((current) => ({
      ...current,
      subjects: current.subjects.map((subject, subjectIndex) =>
        subjectIndex === index ? value : subject
      )
    }));
  }

  function addSubject() {
    setForm((current) => ({
      ...current,
      subjects: [
        ...current.subjects,
        {
          name: { ...emptyText },
          icon: ""
        }
      ]
    }));
  }

  function removeSubject(index: number) {
    setForm((current) => ({
      ...current,
      subjects: current.subjects.filter((_, subjectIndex) => subjectIndex !== index)
    }));
  }

  function updateLanguage(index: number, value: AcademicLanguage) {
    setForm((current) => ({
      ...current,
      languages: current.languages.map((language, languageIndex) =>
        languageIndex === index ? value : language
      )
    }));
  }

  function addLanguage() {
    setForm((current) => ({
      ...current,
      languages: [
        ...current.languages,
        {
          name: { ...emptyText }
        }
      ]
    }));
  }

  function removeLanguage(index: number) {
    setForm((current) => ({
      ...current,
      languages: current.languages.filter((_, languageIndex) => languageIndex !== index)
    }));
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Academics Section</h2>
        <p>Edit academic levels, subjects offered, and languages of instruction.</p>
        {loading ? <div className="admin-status info">Loading academics content...</div> : null}
      </section>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>Academic Content</h2>
        <p>The save action updates the singleton <code>academics</code> document used by the CMS APIs.</p>

        <div className="admin-array-list">
          {form.levels.map((level, index) => (
            <div className="admin-array-item" key={`academics-level-${index}`}>
              <div className="admin-array-item-header">
                <strong>Academic Level {index + 1}</strong>
                {form.levels.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeLevel(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <BilingualInput
                label={`Level ${index + 1} Name`}
                value={level.name}
                onChange={(value) => updateLevel(index, { ...level, name: value })}
              />

              <div className="admin-field">
                <label htmlFor={`academics-level-icon-${index}`}>Icon Class</label>
                <input
                  id={`academics-level-icon-${index}`}
                  type="text"
                  value={level.icon}
                  onChange={(event) => updateLevel(index, { ...level, icon: event.target.value })}
                  placeholder="fa-solid fa-graduation-cap"
                />
              </div>

              <BilingualInput
                label={`Level ${index + 1} Grades`}
                value={level.grades}
                onChange={(value) => updateLevel(index, { ...level, grades: value })}
              />

              <BilingualInput
                label={`Level ${index + 1} Description`}
                value={level.description}
                onChange={(value) => updateLevel(index, { ...level, description: value })}
              />
            </div>
          ))}
        </div>

        <div className="admin-array-list">
          {form.subjects.map((subject, index) => (
            <div className="admin-array-item" key={`academics-subject-${index}`}>
              <div className="admin-array-item-header">
                <strong>Subject {index + 1}</strong>
                {form.subjects.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeSubject(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <BilingualInput
                label={`Subject ${index + 1} Name`}
                value={subject.name}
                onChange={(value) => updateSubject(index, { ...subject, name: value })}
              />

              <div className="admin-field">
                <label htmlFor={`academics-subject-icon-${index}`}>Icon Class</label>
                <input
                  id={`academics-subject-icon-${index}`}
                  type="text"
                  value={subject.icon}
                  onChange={(event) => updateSubject(index, { ...subject, icon: event.target.value })}
                  placeholder="fa-solid fa-graduation-cap"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="admin-array-list">
          {form.languages.map((language, index) => (
            <div className="admin-array-item" key={`academics-language-${index}`}>
              <div className="admin-array-item-header">
                <strong>Language {index + 1}</strong>
                {form.languages.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeLanguage(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <BilingualInput
                label={`Language ${index + 1} Name`}
                value={language.name}
                onChange={(value) => updateLanguage(index, { ...language, name: value })}
              />
            </div>
          ))}
        </div>

        <div className="admin-button-row">
          <button type="button" className="admin-secondary-button" onClick={addLevel}>
            Add Academic Level
          </button>
          <button type="button" className="admin-secondary-button" onClick={addSubject}>
            Add Subject
          </button>
          <button type="button" className="admin-secondary-button" onClick={addLanguage}>
            Add Language
          </button>
          <SaveButton loading={saving} />
        </div>

        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </form>
    </div>
  );
}
