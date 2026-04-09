"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import Script from "next/script";

/* ---------- Types ---------- */

type RegistrationSettings = {
  class10Enabled: boolean;
  class12Enabled: boolean;
  class10Fee: number;
  class12Fee: number;
  class10StartDate: string | null;
  class10EndDate: string | null;
  class12StartDate: string | null;
  class12EndDate: string | null;
  academicSession: string;
};

type FormFields = {
  studentName: string;
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  class: string;
  previousSchool: string;
  address: string;
  aadharNumber: string;
  category: string;
  stream: string;
  previousMarks: string;
};

type Props = {
  locale: "en" | "hi";
};

/* ---------- Labels ---------- */

const labels: Record<"en" | "hi", Record<string, string>> = {
  en: {
    title: "Student Registration",
    closed: "Registration is currently closed. Please check back later.",
    step1: "Personal Details",
    step2: "Academic Details",
    step3: "Contact Details",
    step4: "Documents & Payment",
    step5: "Confirmation",
    studentName: "Student Name",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    dob: "Date of Birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    category: "Category",
    general: "General",
    obc: "OBC",
    sc: "SC",
    st: "ST",
    class: "Class",
    stream: "Stream",
    sciencePcm: "Science (PCM)",
    sciencePcb: "Science (PCB)",
    commerce: "Commerce",
    arts: "Arts",
    previousSchool: "Previous School",
    previousMarks: "Previous Marks (%)",
    phone: "Phone Number",
    email: "Email Address",
    address: "Full Address",
    aadharNumber: "Aadhar Number",
    photo: "Student Photo",
    photoHint: "JPEG, PNG, or WebP (max 2MB)",
    marksheet: "Previous Marksheet",
    marksheetHint: "JPEG, PNG, WebP, or PDF (max 5MB)",
    fee: "Registration Fee",
    payNow: "Pay Now",
    next: "Next",
    previous: "Previous",
    submitting: "Processing...",
    successTitle: "Registration Successful!",
    successMsg: "Your registration number is:",
    successNote: "Please save this number for future reference. A confirmation email has been sent.",
    required: "This field is required",
    invalidPhone: "Phone must be exactly 10 digits",
    invalidEmail: "Please enter a valid email address",
    invalidAadhar: "Aadhar must be exactly 12 digits",
    photoRequired: "Student photo is required",
    marksheetRequired: "Marksheet is required",
    streamRequired: "Stream is required for Class 12th",
    duplicateAadhar: "A registration with this Aadhar already exists for this session.",
    paymentFailed: "Payment verification failed. Please contact support.",
    paymentCancelled: "Payment was cancelled. You can retry.",
    loading: "Loading...",
    selectStream: "Select stream",
  },
  hi: {
    title: "\u091B\u093E\u0924\u094D\u0930 \u092A\u0902\u091C\u0940\u0915\u0930\u0923",
    closed: "\u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u092C\u0902\u0926 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u092C\u093E\u0926 \u092E\u0947\u0902 \u092A\u0941\u0928\u0903 \u091C\u093E\u0901\u091A \u0915\u0930\u0947\u0902\u0964",
    step1: "\u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u0935\u093F\u0935\u0930\u0923",
    step2: "\u0936\u0948\u0915\u094D\u0937\u0923\u093F\u0915 \u0935\u093F\u0935\u0930\u0923",
    step3: "\u0938\u0902\u092A\u0930\u094D\u0915 \u0935\u093F\u0935\u0930\u0923",
    step4: "\u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C \u0914\u0930 \u092D\u0941\u0917\u0924\u093E\u0928",
    step5: "\u092A\u0941\u0937\u094D\u091F\u093F",
    studentName: "\u091B\u093E\u0924\u094D\u0930 \u0915\u093E \u0928\u093E\u092E",
    fatherName: "\u092A\u093F\u0924\u093E \u0915\u093E \u0928\u093E\u092E",
    motherName: "\u092E\u093E\u0924\u093E \u0915\u093E \u0928\u093E\u092E",
    dob: "\u091C\u0928\u094D\u092E \u0924\u093F\u0925\u093F",
    gender: "\u0932\u093F\u0902\u0917",
    male: "\u092A\u0941\u0930\u0941\u0937",
    female: "\u092E\u0939\u093F\u0932\u093E",
    other: "\u0905\u0928\u094D\u092F",
    category: "\u0936\u094D\u0930\u0947\u0923\u0940",
    general: "\u0938\u093E\u092E\u093E\u0928\u094D\u092F",
    obc: "\u0913\u092C\u0940\u0938\u0940",
    sc: "\u090F\u0938\u0938\u0940",
    st: "\u090F\u0938\u091F\u0940",
    class: "\u0915\u0915\u094D\u0937\u093E",
    stream: "\u0938\u094D\u091F\u094D\u0930\u0940\u092E",
    sciencePcm: "\u0935\u093F\u091C\u094D\u091E\u093E\u0928 (PCM)",
    sciencePcb: "\u0935\u093F\u091C\u094D\u091E\u093E\u0928 (PCB)",
    commerce: "\u0935\u093E\u0923\u093F\u091C\u094D\u092F",
    arts: "\u0915\u0932\u093E",
    previousSchool: "\u092A\u0942\u0930\u094D\u0935 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F",
    previousMarks: "\u092A\u0942\u0930\u094D\u0935 \u0905\u0902\u0915 (%)",
    phone: "\u092B\u094B\u0928 \u0928\u0902\u092C\u0930",
    email: "\u0908\u092E\u0947\u0932",
    address: "\u092A\u0942\u0930\u093E \u092A\u0924\u093E",
    aadharNumber: "\u0906\u0927\u093E\u0930 \u0928\u0902\u092C\u0930",
    photo: "\u091B\u093E\u0924\u094D\u0930 \u092B\u094B\u091F\u094B",
    photoHint: "JPEG, PNG, \u092F\u093E WebP (\u0905\u0927\u093F\u0915\u0924\u092E 2MB)",
    marksheet: "\u092A\u0942\u0930\u094D\u0935 \u092E\u093E\u0930\u094D\u0915\u0936\u0940\u091F",
    marksheetHint: "JPEG, PNG, WebP, \u092F\u093E PDF (\u0905\u0927\u093F\u0915\u0924\u092E 5MB)",
    fee: "\u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0936\u0941\u0932\u094D\u0915",
    payNow: "\u0905\u092D\u0940 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0930\u0947\u0902",
    next: "\u0905\u0917\u0932\u093E",
    previous: "\u092A\u093F\u091B\u0932\u093E",
    submitting: "\u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E \u0939\u094B \u0930\u0939\u0940 \u0939\u0948...",
    successTitle: "\u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0938\u092B\u0932!",
    successMsg: "\u0906\u092A\u0915\u093E \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0928\u0902\u092C\u0930 \u0939\u0948:",
    successNote: "\u0915\u0943\u092A\u092F\u093E \u0907\u0938 \u0928\u0902\u092C\u0930 \u0915\u094B \u092D\u0935\u093F\u0937\u094D\u092F \u0915\u0947 \u0938\u0902\u0926\u0930\u094D\u092D \u0915\u0947 \u0932\u093F\u090F \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930\u0916\u0947\u0902\u0964 \u092A\u0941\u0937\u094D\u091F\u093F \u0908\u092E\u0947\u0932 \u092D\u0947\u091C\u0940 \u0917\u0908 \u0939\u0948\u0964",
    required: "\u092F\u0939 \u092B\u0940\u0932\u094D\u0921 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948",
    invalidPhone: "\u092B\u094B\u0928 \u0928\u0902\u092C\u0930 10 \u0905\u0902\u0915\u094B\u0902 \u0915\u093E \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F",
    invalidEmail: "\u0915\u0943\u092A\u092F\u093E \u090F\u0915 \u0935\u0948\u0927 \u0908\u092E\u0947\u0932 \u092A\u0924\u093E \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902",
    invalidAadhar: "\u0906\u0927\u093E\u0930 \u0928\u0902\u092C\u0930 12 \u0905\u0902\u0915\u094B\u0902 \u0915\u093E \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F",
    photoRequired: "\u091B\u093E\u0924\u094D\u0930 \u092B\u094B\u091F\u094B \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948",
    marksheetRequired: "\u092E\u093E\u0930\u094D\u0915\u0936\u0940\u091F \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948",
    streamRequired: "\u0915\u0915\u094D\u0937\u093E 12\u0935\u0940\u0902 \u0915\u0947 \u0932\u093F\u090F \u0938\u094D\u091F\u094D\u0930\u0940\u092E \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948",
    duplicateAadhar: "\u0907\u0938 \u0938\u0924\u094D\u0930 \u0915\u0947 \u0932\u093F\u090F \u0907\u0938 \u0906\u0927\u093E\u0930 \u0938\u0947 \u092A\u0939\u0932\u0947 \u0938\u0947 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u092E\u094C\u091C\u0942\u0926 \u0939\u0948\u0964",
    paymentFailed: "\u092D\u0941\u0917\u0924\u093E\u0928 \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0935\u093F\u092B\u0932\u0964 \u0915\u0943\u092A\u092F\u093E \u0938\u0939\u093E\u092F\u0924\u093E \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964",
    paymentCancelled: "\u092D\u0941\u0917\u0924\u093E\u0928 \u0930\u0926\u094D\u0926 \u0915\u0930 \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964 \u0906\u092A \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964",
    loading: "\u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
    selectStream: "\u0938\u094D\u091F\u094D\u0930\u0940\u092E \u091A\u0941\u0928\u0947\u0902",
  },
};

/* ---------- Initial form state ---------- */

const initialForm: FormFields = {
  studentName: "",
  fatherName: "",
  motherName: "",
  phone: "",
  email: "",
  dob: "",
  gender: "",
  class: "",
  previousSchool: "",
  address: "",
  aadharNumber: "",
  category: "",
  stream: "",
  previousMarks: "",
};

/* ---------- Styles ---------- */

const styles = {
  wrapper: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "1.5rem 1rem",
    fontFamily: "var(--font-body, system-ui, sans-serif)",
  } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: "var(--border-radius-md, 12px)",
    boxShadow: "var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))",
    padding: "2rem",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  title: {
    textAlign: "center" as const,
    color: "var(--color-primary, #1e3a8a)",
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: "0.25rem",
  } as React.CSSProperties,
  stepBar: {
    display: "flex",
    justifyContent: "center",
    gap: "0.25rem",
    marginBottom: "2rem",
  } as React.CSSProperties,
  stepDot: (active: boolean, done: boolean): React.CSSProperties => ({
    flex: "1",
    maxWidth: "120px",
    height: "4px",
    borderRadius: "2px",
    background: done ? "var(--color-primary, #1e3a8a)" : active ? "var(--color-primary, #1e3a8a)" : "#d1d5db",
    opacity: active || done ? 1 : 0.5,
    transition: "all 0.3s",
  }),
  stepLabel: {
    textAlign: "center" as const,
    color: "#6b7280",
    fontSize: "0.875rem",
    marginBottom: "1.5rem",
    fontWeight: 500,
  } as React.CSSProperties,
  fieldGroup: {
    marginBottom: "1.25rem",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: "0.375rem",
    fontSize: "0.9rem",
    color: "#1f2937",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "var(--border-radius-md, 8px)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  inputError: {
    borderColor: "#dc2626",
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "var(--border-radius-md, 8px)",
    fontSize: "0.95rem",
    outline: "none",
    resize: "vertical" as const,
    minHeight: "80px",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  select: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "var(--border-radius-md, 8px)",
    fontSize: "0.95rem",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  radioGroup: {
    display: "flex",
    gap: "1.25rem",
    flexWrap: "wrap" as const,
    marginTop: "0.25rem",
  } as React.CSSProperties,
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    cursor: "pointer",
    fontSize: "0.95rem",
  } as React.CSSProperties,
  error: {
    color: "#dc2626",
    fontSize: "0.8rem",
    marginTop: "0.25rem",
  } as React.CSSProperties,
  globalError: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "0.75rem 1rem",
    borderRadius: "var(--border-radius-md, 8px)",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  } as React.CSSProperties,
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginTop: "1.5rem",
  } as React.CSSProperties,
  btnPrimary: {
    background: "var(--color-primary, #1e3a8a)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--border-radius-md, 8px)",
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  } as React.CSSProperties,
  btnSecondary: {
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "var(--border-radius-md, 8px)",
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity 0.2s",
  } as React.CSSProperties,
  feeBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "var(--border-radius-md, 8px)",
    padding: "1rem 1.25rem",
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  feeAmount: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--color-primary, #1e3a8a)",
  } as React.CSSProperties,
  fileHint: {
    color: "#6b7280",
    fontSize: "0.8rem",
    marginTop: "0.25rem",
  } as React.CSSProperties,
  successCard: {
    textAlign: "center" as const,
    padding: "3rem 2rem",
  } as React.CSSProperties,
  successIcon: {
    width: "64px",
    height: "64px",
    background: "#dcfce7",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
    fontSize: "2rem",
    color: "#16a34a",
  } as React.CSSProperties,
  regNumber: {
    background: "#f0f9ff",
    border: "2px dashed var(--color-primary, #1e3a8a)",
    borderRadius: "var(--border-radius-md, 8px)",
    padding: "1rem",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--color-primary, #1e3a8a)",
    letterSpacing: "0.05em",
    margin: "1rem auto",
    display: "inline-block",
  } as React.CSSProperties,
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  } as React.CSSProperties,
  loadingWrapper: {
    textAlign: "center" as const,
    padding: "3rem",
    color: "#6b7280",
    fontSize: "1rem",
  } as React.CSSProperties,
};

/* ---------- Component ---------- */

export default function RegistrationForm({ locale }: Props) {
  const t = labels[locale];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormFields>(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [marksheet, setMarksheet] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [settings, setSettings] = useState<RegistrationSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [closed, setClosed] = useState(false);

  /* --- Load settings on mount --- */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/registration/settings");
        if (!res.ok) {
          if (!cancelled) setClosed(true);
          return;
        }
        const data: RegistrationSettings = await res.json();
        if (cancelled) return;

        // Check if any class is enabled
        if (!data.class10Enabled && !data.class12Enabled) {
          setClosed(true);
          return;
        }

        // Check date windows — at least one class must be in its open window
        const now = new Date();
        let anyOpen = false;

        if (data.class10Enabled) {
          const start = data.class10StartDate ? new Date(data.class10StartDate) : null;
          const end = data.class10EndDate ? new Date(data.class10EndDate) : null;
          if (!start || !end || (now >= start && now <= end)) anyOpen = true;
        }

        if (data.class12Enabled) {
          const start = data.class12StartDate ? new Date(data.class12StartDate) : null;
          const end = data.class12EndDate ? new Date(data.class12EndDate) : null;
          if (!start || !end || (now >= start && now <= end)) anyOpen = true;
        }

        if (!anyOpen) {
          setClosed(true);
          return;
        }

        setSettings(data);
      } catch {
        if (!cancelled) setClosed(true);
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  /* --- Handlers --- */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      setGlobalError("");
    },
    [],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, field: "photo" | "marksheet") => {
      const file = e.target.files?.[0] ?? null;
      if (field === "photo") setPhoto(file);
      else setMarksheet(file);
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  /* --- Validation --- */
  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!form.studentName.trim()) errs.studentName = t.required;
      if (!form.fatherName.trim()) errs.fatherName = t.required;
      if (!form.motherName.trim()) errs.motherName = t.required;
      if (!form.dob) errs.dob = t.required;
      if (!form.gender) errs.gender = t.required;
      if (!form.category) errs.category = t.required;
    }

    if (s === 2) {
      if (!form.class) errs.class = t.required;
      if (form.class === "12th" && !form.stream) errs.stream = t.streamRequired;
      if (!form.previousSchool.trim()) errs.previousSchool = t.required;
    }

    if (s === 3) {
      if (!form.phone.trim()) errs.phone = t.required;
      else if (!/^\d{10}$/.test(form.phone.trim())) errs.phone = t.invalidPhone;
      if (!form.email.trim()) errs.email = t.required;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = t.invalidEmail;
      if (!form.address.trim()) errs.address = t.required;
      if (!form.aadharNumber.trim()) errs.aadharNumber = t.required;
      else if (!/^\d{12}$/.test(form.aadharNumber.trim())) errs.aadharNumber = t.invalidAadhar;
    }

    if (s === 4) {
      if (!photo) errs.photo = t.photoRequired;
      if (!marksheet) errs.marksheet = t.marksheetRequired;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (validateStep(step)) setStep((s) => s + 1);
  }

  function goPrev() {
    setStep((s) => Math.max(1, s - 1));
  }

  /* --- Submit & Pay --- */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(4) || !settings) return;

    setSubmitting(true);
    setGlobalError("");

    try {
      /* Step A — Upload registration */
      const fd = new FormData();
      for (const [key, value] of Object.entries(form)) {
        if (key === "stream" && form.class !== "12th") continue;
        if (value) fd.append(key, value);
      }
      fd.append("academicSession", settings.academicSession);
      if (photo) fd.append("photo", photo);
      if (marksheet) fd.append("marksheet", marksheet);

      const submitRes = await fetch("/api/registration/submit", { method: "POST", body: fd });

      if (submitRes.status === 409) {
        setGlobalError(t.duplicateAadhar);
        setSubmitting(false);
        return;
      }

      if (!submitRes.ok) {
        const errData = await submitRes.json().catch(() => null);
        setGlobalError(errData?.error ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const submitData = await submitRes.json();
      const { registrationId } = submitData;

      /* Step B — Create Razorpay order */
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => null);
        setGlobalError(errData?.error ?? "Could not create payment order.");
        setSubmitting(false);
        return;
      }

      const orderData = await orderRes.json();
      const { orderId, amount, currency, keyId } = orderData;

      /* Step C — Open Razorpay modal */
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Prabhawati Vidyapeeth",
        description: `Registration Fee - Class ${form.class}`,
        order_id: orderId,
        handler: async (response: Record<string, string>) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (verifyRes.ok) {
              const data = await verifyRes.json();
              setRegistrationNumber(data.registrationNumber);
              setStep(5);
            } else {
              setGlobalError(t.paymentFailed);
            }
          } catch {
            setGlobalError(t.paymentFailed);
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setGlobalError(t.paymentCancelled);
            setSubmitting(false);
          },
        },
        prefill: {
          name: form.studentName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#1e40af" },
      };

      const rzp = new (window as unknown as Record<string, new (opts: typeof options) => { open: () => void }>).Razorpay(options);
      rzp.open();
    } catch {
      setGlobalError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  /* --- Loading / Closed states --- */
  if (settingsLoading) {
    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.card, ...styles.loadingWrapper }}>{t.loading}</div>
      </div>
    );
  }

  if (closed || !settings) {
    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.card, textAlign: "center", padding: "3rem 2rem" }}>
          <h2 style={styles.title}>{t.title}</h2>
          <p style={{ color: "#6b7280", marginTop: "1rem", fontSize: "1.05rem" }}>{t.closed}</p>
        </div>
      </div>
    );
  }

  /* --- Step 5: Confirmation --- */
  if (step === 5) {
    return (
      <div style={styles.wrapper}>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <div style={{ ...styles.card, ...styles.successCard }}>
          <div style={styles.successIcon}>
            <span aria-hidden="true">{"\u2713"}</span>
          </div>
          <h2 style={{ ...styles.title, color: "#16a34a" }}>{t.successTitle}</h2>
          <p style={{ color: "#374151", margin: "0.75rem 0 0.5rem", fontSize: "1.05rem" }}>{t.successMsg}</p>
          <div style={styles.regNumber}>{registrationNumber}</div>
          <p style={{ color: "#6b7280", marginTop: "1rem", fontSize: "0.9rem", maxWidth: "400px", margin: "1rem auto 0" }}>
            {t.successNote}
          </p>
        </div>
      </div>
    );
  }

  /* --- Fee calculation --- */
  const feeInPaise = form.class === "10th" ? settings.class10Fee : form.class === "12th" ? settings.class12Fee : 0;
  const feeDisplay = feeInPaise > 0 ? `\u20B9${(feeInPaise / 100).toLocaleString("en-IN")}` : "";

  /* --- Step names for indicator --- */
  const stepNames = [t.step1, t.step2, t.step3, t.step4];

  /* --- Render helpers --- */
  function renderField(name: keyof FormFields, label: string, type = "text", placeholder = "") {
    return (
      <div style={styles.fieldGroup}>
        <label htmlFor={`reg-${name}`} style={styles.label}>{label}</label>
        <input
          id={`reg-${name}`}
          name={name}
          type={type}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          style={{ ...styles.input, ...(errors[name] ? styles.inputError : {}) }}
        />
        {errors[name] ? <div style={styles.error}>{errors[name]}</div> : null}
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <h1 style={styles.title}>{t.title}</h1>

      {/* Step indicator bar */}
      <div style={styles.stepBar}>
        {stepNames.map((_, i) => (
          <div key={i} style={styles.stepDot(i + 1 === step, i + 1 < step)} />
        ))}
      </div>
      <p style={styles.stepLabel}>
        {step}/{stepNames.length} &mdash; {stepNames[step - 1]}
      </p>

      {globalError ? <div style={styles.globalError}>{globalError}</div> : null}

      <form onSubmit={handleSubmit}>
        <div style={styles.card}>
          {/* --- STEP 1: Personal --- */}
          {step === 1 && (
            <>
              {renderField("studentName", t.studentName)}
              <div style={styles.twoCol}>
                {renderField("fatherName", t.fatherName)}
                {renderField("motherName", t.motherName)}
              </div>
              {renderField("dob", t.dob, "date")}

              {/* Gender radios */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>{t.gender}</label>
                <div style={styles.radioGroup}>
                  {(["male", "female", "other"] as const).map((g) => (
                    <label key={g} style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={form.gender === g}
                        onChange={handleChange}
                      />
                      {t[g]}
                    </label>
                  ))}
                </div>
                {errors.gender ? <div style={styles.error}>{errors.gender}</div> : null}
              </div>

              {/* Category select */}
              <div style={styles.fieldGroup}>
                <label htmlFor="reg-category" style={styles.label}>{t.category}</label>
                <select
                  id="reg-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{ ...styles.select, ...(errors.category ? styles.inputError : {}) }}
                >
                  <option value="">&mdash;</option>
                  {(["general", "obc", "sc", "st"] as const).map((c) => (
                    <option key={c} value={c}>{t[c]}</option>
                  ))}
                </select>
                {errors.category ? <div style={styles.error}>{errors.category}</div> : null}
              </div>
            </>
          )}

          {/* --- STEP 2: Academic --- */}
          {step === 2 && (
            <>
              {/* Class radios */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>{t.class}</label>
                <div style={styles.radioGroup}>
                  {settings.class10Enabled && (
                    <label style={styles.radioLabel}>
                      <input type="radio" name="class" value="10th" checked={form.class === "10th"} onChange={handleChange} />
                      10th
                    </label>
                  )}
                  {settings.class12Enabled && (
                    <label style={styles.radioLabel}>
                      <input type="radio" name="class" value="12th" checked={form.class === "12th"} onChange={handleChange} />
                      12th
                    </label>
                  )}
                </div>
                {errors.class ? <div style={styles.error}>{errors.class}</div> : null}
              </div>

              {/* Stream — only when 12th */}
              {form.class === "12th" && (
                <div style={styles.fieldGroup}>
                  <label htmlFor="reg-stream" style={styles.label}>{t.stream}</label>
                  <select
                    id="reg-stream"
                    name="stream"
                    value={form.stream}
                    onChange={handleChange}
                    style={{ ...styles.select, ...(errors.stream ? styles.inputError : {}) }}
                  >
                    <option value="">{t.selectStream}</option>
                    <option value="science-pcm">{t.sciencePcm}</option>
                    <option value="science-pcb">{t.sciencePcb}</option>
                    <option value="commerce">{t.commerce}</option>
                    <option value="arts">{t.arts}</option>
                  </select>
                  {errors.stream ? <div style={styles.error}>{errors.stream}</div> : null}
                </div>
              )}

              {renderField("previousSchool", t.previousSchool)}
              {renderField("previousMarks", t.previousMarks, "text")}
            </>
          )}

          {/* --- STEP 3: Contact --- */}
          {step === 3 && (
            <>
              <div style={styles.twoCol}>
                {renderField("phone", t.phone, "tel")}
                {renderField("email", t.email, "email")}
              </div>
              <div style={styles.fieldGroup}>
                <label htmlFor="reg-address" style={styles.label}>{t.address}</label>
                <textarea
                  id="reg-address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  style={{ ...styles.textarea, ...(errors.address ? styles.inputError : {}) }}
                />
                {errors.address ? <div style={styles.error}>{errors.address}</div> : null}
              </div>
              {renderField("aadharNumber", t.aadharNumber, "text")}
            </>
          )}

          {/* --- STEP 4: Documents & Payment --- */}
          {step === 4 && (
            <>
              {/* Photo upload */}
              <div style={styles.fieldGroup}>
                <label htmlFor="reg-photo" style={styles.label}>{t.photo}</label>
                <input
                  id="reg-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileChange(e, "photo")}
                  style={{ ...styles.input, padding: "0.5rem" }}
                />
                <div style={styles.fileHint}>{t.photoHint}</div>
                {errors.photo ? <div style={styles.error}>{errors.photo}</div> : null}
              </div>

              {/* Marksheet upload */}
              <div style={styles.fieldGroup}>
                <label htmlFor="reg-marksheet" style={styles.label}>{t.marksheet}</label>
                <input
                  id="reg-marksheet"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => handleFileChange(e, "marksheet")}
                  style={{ ...styles.input, padding: "0.5rem" }}
                />
                <div style={styles.fileHint}>{t.marksheetHint}</div>
                {errors.marksheet ? <div style={styles.error}>{errors.marksheet}</div> : null}
              </div>

              {/* Fee display */}
              {form.class && feeDisplay ? (
                <div style={styles.feeBox}>
                  <span style={{ fontWeight: 500, color: "#374151" }}>{t.fee}</span>
                  <span style={styles.feeAmount}>{feeDisplay}</span>
                </div>
              ) : null}
            </>
          )}

          {/* --- Navigation buttons --- */}
          <div style={styles.buttonRow}>
            {step > 1 ? (
              <button type="button" onClick={goPrev} style={styles.btnSecondary} disabled={submitting}>
                {t.previous}
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button type="button" onClick={goNext} style={styles.btnPrimary}>
                {t.next}
              </button>
            ) : (
              <button type="submit" style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                {submitting ? t.submitting : t.payNow}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
