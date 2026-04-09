"use client";

type SaveButtonProps = {
  loading: boolean;
  label?: string;
};

export default function SaveButton({ loading, label = "Save Changes" }: SaveButtonProps) {
  return (
    <button type="submit" className="admin-save-button" disabled={loading}>
      {loading ? "Saving..." : label}
    </button>
  );
}
