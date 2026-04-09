"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import SaveButton from "@/components/admin/SaveButton";
import type {
  AdmissionsContent,
  AdmissionStep,
  AdmissionDocument,
  InquiryInfo,
  LocalizedText
} from "@/types/content";

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

const emptyAdmissions: AdmissionsContent = {
  steps: [{ number: 1, title: { ...emptyText }, description: { ...emptyText } }],
  documents: [{ text: { ...emptyText } }],
  inquiryInfo: { phone: "", email: "", text: { ...emptyText } }
};

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

function normalizeAdmissions(value?: Partial<AdmissionsContent> | null): AdmissionsContent {
  const steps = Array.isArray(value?.steps) && value.steps.length > 0
    ? value.steps.map((step: Partial<AdmissionStep>, index: number) => ({
        number: step.number ?? index + 1,
        title: normalizeText(step?.title),
        description: normalizeText(step?.description)
      }))
    : emptyAdmissions.steps;

  const documents = Array.isArray(value?.documents) && value.documents.length > 0
    ? value.documents.map((doc: Partial<AdmissionDocument>) => ({
        text: normalizeText(doc?.text)
      }))
    : emptyAdmissions.documents;

  const inquiryInfo: InquiryInfo = {
    phone: value?.inquiryInfo?.phone ?? "",
    email: value?.inquiryInfo?.email ?? "",
    text: normalizeText(value?.inquiryInfo?.text)
  };

  return { steps, documents, inquiryInfo };
}

export default function AdmissionsSectionPage() {
  const [form, setForm] = useState<AdmissionsContent>(emptyAdmissions);
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
        const response = await fetch("/api/admin/sections/admissions", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load admissions content.");
        }

        if (!cancelled) {
          setForm(normalizeAdmissions(result));
        }
      } catch (error) {
        if (!cancelled) {
          setForm(emptyAdmissions);
          setStatus(error instanceof Error ? error.message : "Unable to load admissions content.");
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
      const response = await fetch("/api/admin/sections/admissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save admissions content.");
      }

      setForm(normalizeAdmissions(result));
      setStatus("Admissions content saved successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save admissions content.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  function addStep() {
    setForm((current) => ({
      ...current,
      steps: [
        ...current.steps,
        { number: current.steps.length + 1, title: { ...emptyText }, description: { ...emptyText } }
      ]
    }));
  }

  function removeStep(index: number) {
    setForm((current) => ({
      ...current,
      steps: current.steps.filter((_, stepIndex) => stepIndex !== index)
    }));
  }

  function updateStep(index: number, field: keyof AdmissionStep, value: LocalizedText | number) {
    setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [field]: value } : step
      )
    }));
  }

  function addDocument() {
    setForm((current) => ({
      ...current,
      documents: [...current.documents, { text: { ...emptyText } }]
    }));
  }

  function removeDocument(index: number) {
    setForm((current) => ({
      ...current,
      documents: current.documents.filter((_, docIndex) => docIndex !== index)
    }));
  }

  function updateDocument(index: number, value: LocalizedText) {
    setForm((current) => ({
      ...current,
      documents: current.documents.map((doc, docIndex) =>
        docIndex === index ? { ...doc, text: value } : doc
      )
    }));
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Admissions Section</h2>
        <p>Manage admission steps, required documents, and inquiry contact information shown on the frontend.</p>
        {loading ? <div className="admin-status info">Loading admissions content...</div> : null}
      </section>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <h2>Admission Steps</h2>

        <div className="admin-array-list">
          {form.steps.map((step, index) => (
            <div className="admin-array-item" key={`admission-step-${index}`}>
              <div className="admin-array-item-header">
                <strong>Step {index + 1}</strong>
                {form.steps.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeStep(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="admin-field">
                <label htmlFor={`step-number-${index}`}>Step Number</label>
                <input
                  id={`step-number-${index}`}
                  type="number"
                  value={step.number}
                  onChange={(event) => updateStep(index, "number", Number(event.target.value))}
                />
              </div>
              <BilingualInput
                label={`Step ${index + 1} Title`}
                value={step.title}
                onChange={(value) => updateStep(index, "title", value)}
              />
              <BilingualInput
                label={`Step ${index + 1} Description`}
                value={step.description}
                onChange={(value) => updateStep(index, "description", value)}
                multiline
                rows={3}
              />
            </div>
          ))}
        </div>

        <h2>Required Documents</h2>

        <div className="admin-array-list">
          {form.documents.map((doc, index) => (
            <div className="admin-array-item" key={`admission-doc-${index}`}>
              <div className="admin-array-item-header">
                <strong>Document {index + 1}</strong>
                {form.documents.length > 1 ? (
                  <button
                    type="button"
                    className="admin-danger-button"
                    onClick={() => removeDocument(index)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <BilingualInput
                label={`Document ${index + 1} Text`}
                value={doc.text}
                onChange={(value) => updateDocument(index, value)}
              />
            </div>
          ))}
        </div>

        <h2>Inquiry Information</h2>

        <div className="admin-field-grid two">
          <div className="admin-field">
            <label htmlFor="inquiry-phone">Phone</label>
            <input
              id="inquiry-phone"
              type="text"
              value={form.inquiryInfo.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  inquiryInfo: { ...current.inquiryInfo, phone: event.target.value }
                }))
              }
              placeholder="+91 945274 6680"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="inquiry-email">Email</label>
            <input
              id="inquiry-email"
              type="email"
              value={form.inquiryInfo.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  inquiryInfo: { ...current.inquiryInfo, email: event.target.value }
                }))
              }
              placeholder="prabhawati9452@gmail.com"
            />
          </div>
        </div>

        <BilingualInput
          label="Inquiry Text"
          value={form.inquiryInfo.text}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              inquiryInfo: { ...current.inquiryInfo, text: value }
            }))
          }
          multiline
          rows={3}
        />

        <div className="admin-button-row">
          <button type="button" className="admin-secondary-button" onClick={addStep}>
            Add Step
          </button>
          <button type="button" className="admin-secondary-button" onClick={addDocument}>
            Add Document
          </button>
          <SaveButton loading={saving} />
        </div>

        {status ? <div className={`admin-status ${statusType}`.trim()}>{status}</div> : null}
      </form>
    </div>
  );
}
