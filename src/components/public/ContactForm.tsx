"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";

type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
};

export default function ContactForm() {
  const t = useTranslations();
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [statusColor, setStatusColor] = useState("#1d4ed8");

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to submit the form.");
      }

      setValues(initialValues);
      setStatus(t("form_submit") + " successful.");
      setStatusColor("#047857");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to submit the form.");
      setStatusColor("#b91c1c");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          {t("form_name")}
        </label>
        <input
          id="name"
          name="name"
          className="form-input"
          placeholder={t("placeholder_name")}
          type="text"
          value={values.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          {t("form_email")}
        </label>
        <input
          id="email"
          name="email"
          className="form-input"
          placeholder={t("placeholder_email")}
          type="email"
          value={values.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          {t("form_phone")}
        </label>
        <input
          id="phone"
          name="phone"
          className="form-input"
          placeholder={t("placeholder_phone")}
          type="tel"
          value={values.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="subject" className="form-label">
          {t("form_subject")}
        </label>
        <select
          id="subject"
          name="subject"
          className="form-select"
          value={values.subject}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            {t("subject_placeholder")}
          </option>
          <option value="admission">{t("subject_admission")}</option>
          <option value="general">{t("subject_general")}</option>
          <option value="feedback">{t("subject_feedback")}</option>
          <option value="other">{t("subject_other")}</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="message" className="form-label">
          {t("form_message")}
        </label>
        <textarea
          id="message"
          name="message"
          className="form-textarea"
          placeholder={t("placeholder_message")}
          rows={5}
          value={values.message}
          onChange={handleChange}
          required
        />
      </div>

      {status ? (
        <p style={{ color: statusColor, fontWeight: 600, marginBottom: "1rem" }}>{status}</p>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? t("form_sending") : t("form_submit")}
      </button>
    </form>
  );
}
