"use client";

import type { ChangeEvent } from "react";
import type { LocalizedText } from "@/types/content";

type BilingualInputProps = {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
  rows?: number;
};

export default function BilingualInput({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4
}: BilingualInputProps) {
  const InputTag = multiline ? "textarea" : "input";

  const updateField = (field: keyof LocalizedText) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({
      ...value,
      [field]: event.target.value
    });
  };

  return (
    <div className="admin-bilingual">
      <span>{label}</span>
      <div className="admin-bilingual-grid">
        <div className="admin-bilingual-input">
          <label className="admin-bilingual-tag" htmlFor={`${label}-en`}>
            EN
          </label>
          <InputTag
            id={`${label}-en`}
            value={value.en}
            onChange={updateField("en")}
            rows={multiline ? rows : undefined}
          />
        </div>
        <div className="admin-bilingual-input">
          <label className="admin-bilingual-tag" htmlFor={`${label}-hi`}>
            HI
          </label>
          <InputTag
            id={`${label}-hi`}
            value={value.hi}
            onChange={updateField("hi")}
            rows={multiline ? rows : undefined}
          />
        </div>
      </div>
    </div>
  );
}
