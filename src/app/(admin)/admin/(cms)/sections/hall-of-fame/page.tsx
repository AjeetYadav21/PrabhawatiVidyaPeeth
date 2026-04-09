"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import type { HallOfFameContent, Topper, Achievement, LocalizedText } from "@/types/content";

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

const emptyHallOfFame: HallOfFameContent = {
  toppers: [{ name: "", class: "", year: "", image: "", score: "" }],
  achievements: [{ title: { ...emptyText }, description: { ...emptyText }, icon: "" }]
};

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

function normalizeHallOfFame(value?: Partial<HallOfFameContent> | null): HallOfFameContent {
  const toppers = Array.isArray(value?.toppers) && value.toppers.length > 0
    ? value.toppers.map((topper: Partial<Topper>) => ({
        name: topper?.name ?? "",
        class: topper?.class ?? "",
        year: topper?.year ?? "",
        image: topper?.image ?? "",
        score: topper?.score ?? ""
      }))
    : emptyHallOfFame.toppers;

  const achievements = Array.isArray(value?.achievements) && value.achievements.length > 0
    ? value.achievements.map((achievement: Partial<Achievement>) => ({
        title: normalizeText(achievement?.title),
        description: normalizeText(achievement?.description),
        icon: achievement?.icon ?? ""
      }))
    : emptyHallOfFame.achievements;

  return { toppers, achievements };
}

export default function HallOfFameSectionPage() {
  const [form, setForm] = useState<HallOfFameContent>(emptyHallOfFame);
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
        const response = await fetch("/api/admin/sections/hallOfFame", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load hall of fame content.");
        }

        if (!cancelled) {
          setForm(normalizeHallOfFame(result));
        }
      } catch (error) {
        if (!cancelled) {
          setForm(emptyHallOfFame);
          setStatus(error instanceof Error ? error.message : "Unable to load hall of fame content.");
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
      const response = await fetch("/api/admin/sections/hallOfFame", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save hall of fame content.");
      }

      setForm(normalizeHallOfFame(result));
      setStatus("Hall of fame content saved successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save hall of fame content.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  function addTopper() {
    setForm((current) => ({
      ...current,
      toppers: [...current.toppers, { name: "", class: "", year: "", image: "", score: "" }]
    }));
  }

  function removeTopper(index: number) {
    setForm((current) => ({
      ...current,
      toppers: current.toppers.filter((_, topperIndex) => topperIndex !== index)
    }));
  }

  function updateTopper(index: number, field: keyof Topper, value: string) {
    setForm((current) => ({
      ...current,
      toppers: current.toppers.map((topper, topperIndex) =>
        topperIndex === index ? { ...topper, [field]: value } : topper
      )
    }));
  }

  function addAchievement() {
    setForm((current) => ({
      ...current,
      achievements: [...current.achievements, { title: { ...emptyText }, description: { ...emptyText }, icon: "" }]
    }));
  }

  function removeAchievement(index: number) {
    setForm((current) => ({
      ...current,
      achievements: current.achievements.filter((_, achievementIndex) => achievementIndex !== index)
    }));
  }

  function updateAchievement(index: number, field: keyof Achievement, value: LocalizedText | string) {
    setForm((current) => ({
      ...current,
      achievements: current.achievements.map((achievement, achievementIndex) =>
        achievementIndex === index ? { ...achievement, [field]: value } : achievement
      )
    }));
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Hall of Fame Section</h2>
        <p>Manage school toppers and notable achievements displayed on the public site.</p>
        {loading ? <div className="admin-status info">Loading hall of fame content...</div> : null}
      </section>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>Toppers</h2>
        <p>Add student toppers with their name, class, year, score, and photo.</p>

        <div className="admin-array-list">
          {form.toppers.map((topper, index) => (
            <div className="admin-array-item" key={`hall-of-fame-topper-${index}`}>
              <div className="admin-array-item-header">
                <strong>Topper {index + 1}</strong>
                {form.toppers.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeTopper(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="admin-field-grid two">
                <div className="admin-field">
                  <label htmlFor={`topper-name-${index}`}>Name</label>
                  <input
                    id={`topper-name-${index}`}
                    type="text"
                    value={topper.name}
                    onChange={(event) => updateTopper(index, "name", event.target.value)}
                    placeholder="Student name"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`topper-class-${index}`}>Class</label>
                  <input
                    id={`topper-class-${index}`}
                    type="text"
                    value={topper.class}
                    onChange={(event) => updateTopper(index, "class", event.target.value)}
                    placeholder="10th"
                  />
                </div>
              </div>
              <div className="admin-field-grid two">
                <div className="admin-field">
                  <label htmlFor={`topper-year-${index}`}>Year</label>
                  <input
                    id={`topper-year-${index}`}
                    type="text"
                    value={topper.year}
                    onChange={(event) => updateTopper(index, "year", event.target.value)}
                    placeholder="2024"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`topper-score-${index}`}>Score</label>
                  <input
                    id={`topper-score-${index}`}
                    type="text"
                    value={topper.score}
                    onChange={(event) => updateTopper(index, "score", event.target.value)}
                    placeholder="95%"
                  />
                </div>
              </div>
              <ImageUpload
                label={`Topper ${index + 1} Photo`}
                value={topper.image}
                onChange={(value) => updateTopper(index, "image", value)}
              />
            </div>
          ))}
        </div>

        <h2>Achievements</h2>
        <p>Add notable school achievements with bilingual title, description, and an icon class.</p>

        <div className="admin-array-list">
          {form.achievements.map((achievement, index) => (
            <div className="admin-array-item" key={`hall-of-fame-achievement-${index}`}>
              <div className="admin-array-item-header">
                <strong>Achievement {index + 1}</strong>
                {form.achievements.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeAchievement(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <BilingualInput
                label={`Achievement ${index + 1} Title`}
                value={achievement.title}
                onChange={(value) => updateAchievement(index, "title", value)}
              />
              <BilingualInput
                label={`Achievement ${index + 1} Description`}
                value={achievement.description}
                onChange={(value) => updateAchievement(index, "description", value)}
                multiline
                rows={3}
              />
              <div className="admin-field">
                <label htmlFor={`achievement-icon-${index}`}>Icon Class</label>
                <input
                  id={`achievement-icon-${index}`}
                  type="text"
                  value={achievement.icon}
                  onChange={(event) => updateAchievement(index, "icon", event.target.value)}
                  placeholder="fa-solid fa-trophy"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="admin-button-row">
          <button type="button" className="admin-secondary-button" onClick={addTopper}>
            Add Topper
          </button>
          <button type="button" className="admin-secondary-button" onClick={addAchievement}>
            Add Achievement
          </button>
          <SaveButton loading={saving} />
        </div>

        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </form>
    </div>
  );
}
