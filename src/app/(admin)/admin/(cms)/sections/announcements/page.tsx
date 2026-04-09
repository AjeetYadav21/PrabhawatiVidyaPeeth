"use client";

import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import SaveButton from "@/components/admin/SaveButton";
import type { Announcement, LocalizedText } from "@/types/content";

type AnnouncementWithId = Announcement & { _id: string };

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

function formatDateForInput(dateString: string): string {
  if (!dateString) return new Date().toISOString().split("T")[0];
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return new Date().toISOString().split("T")[0];
  return date.toISOString().split("T")[0];
}

function formatDateForDisplay(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function createEmptyAnnouncement(): Announcement {
  return {
    title: { en: "", hi: "" },
    content: { en: "", hi: "" },
    date: new Date().toISOString().split("T")[0],
    isActive: true
  };
}

function normalizeAnnouncement(item: Partial<Announcement>): Announcement {
  return {
    title: normalizeText(item.title),
    content: normalizeText(item.content),
    date: item.date ?? new Date().toISOString().split("T")[0],
    isActive: item.isActive ?? true
  };
}

export default function AnnouncementsSectionPage() {
  const [items, setItems] = useState<AnnouncementWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [editingItem, setEditingItem] = useState<AnnouncementWithId | null>(null);
  const [newItem, setNewItem] = useState<Announcement>(createEmptyAnnouncement);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setLoading(true);
      setStatus("");

      try {
        const response = await fetch("/api/admin/sections/announcements", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load announcements.");
        }

        if (!cancelled) {
          const normalized = Array.isArray(result)
            ? result.map((item: AnnouncementWithId) => ({
                _id: item._id,
                ...normalizeAnnouncement(item)
              }))
            : [];
          setItems(normalized);
        }
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setStatus(error instanceof Error ? error.message : "Unable to load announcements.");
          setStatusType("error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdd() {
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/sections/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create announcement.");
      }

      const created: AnnouncementWithId = {
        _id: result._id,
        ...normalizeAnnouncement(result)
      };

      setItems((current) => [created, ...current]);
      setNewItem(createEmptyAnnouncement());
      setShowAddForm(false);
      setStatus("Announcement created successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create announcement.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!editingItem) return;

    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(`/api/admin/sections/announcements/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingItem.title,
          content: editingItem.content,
          date: editingItem.date,
          isActive: editingItem.isActive
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update announcement.");
      }

      const updated: AnnouncementWithId = {
        _id: result._id,
        ...normalizeAnnouncement(result)
      };

      setItems((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
      setEditingItem(null);
      setStatus("Announcement updated successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update announcement.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(`/api/admin/sections/announcements/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete announcement.");
      }

      setItems((current) => current.filter((item) => item._id !== id));

      if (editingItem?._id === id) {
        setEditingItem(null);
      }

      setStatus("Announcement deleted successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete announcement.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Announcements</h2>
        <p>
          Manage school announcements and notices. Announcements are sorted by date (newest first).
        </p>
        {loading ? (
          <div className="admin-status info">Loading announcements...</div>
        ) : null}
        {status ? (
          <div className={`admin-status ${statusType}`}>{status}</div>
        ) : null}
      </section>

      <section className="admin-panel">
        <div className="admin-button-row">
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => {
              setShowAddForm((current) => !current);
              setEditingItem(null);
            }}
          >
            <i className="fa-solid fa-plus" />{" "}
            {showAddForm ? "Cancel" : "Add New Announcement"}
          </button>
        </div>
      </section>

      {showAddForm ? (
        <form
          className="admin-form-card"
          onSubmit={(event) => {
            event.preventDefault();
            handleAdd();
          }}
        >
          <h2>New Announcement</h2>

          <BilingualInput
            label="Title"
            value={newItem.title}
            onChange={(value) => setNewItem((current) => ({ ...current, title: value }))}
          />

          <BilingualInput
            label="Content"
            value={newItem.content}
            onChange={(value) => setNewItem((current) => ({ ...current, content: value }))}
            multiline
            rows={4}
          />

          <div className="admin-field-grid two">
            <div className="admin-field">
              <label htmlFor="new-announcement-date">Date</label>
              <input
                id="new-announcement-date"
                type="date"
                value={formatDateForInput(newItem.date)}
                onChange={(event) =>
                  setNewItem((current) => ({ ...current, date: event.target.value }))
                }
              />
            </div>

            <div className="admin-field">
              <label htmlFor="new-announcement-active">Status</label>
              <label>
                <input
                  id="new-announcement-active"
                  type="checkbox"
                  checked={newItem.isActive}
                  onChange={(event) =>
                    setNewItem((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />{" "}
                Active
              </label>
            </div>
          </div>

          <div className="admin-button-row">
            <SaveButton loading={saving} label="Create Announcement" />
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => {
                setShowAddForm(false);
                setNewItem(createEmptyAnnouncement());
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {editingItem ? (
        <form
          className="admin-form-card"
          onSubmit={(event) => {
            event.preventDefault();
            handleEdit();
          }}
        >
          <h2>Edit Announcement</h2>

          <BilingualInput
            label="Edit Title"
            value={editingItem.title}
            onChange={(value) =>
              setEditingItem((current) => (current ? { ...current, title: value } : null))
            }
          />

          <BilingualInput
            label="Edit Content"
            value={editingItem.content}
            onChange={(value) =>
              setEditingItem((current) => (current ? { ...current, content: value } : null))
            }
            multiline
            rows={4}
          />

          <div className="admin-field-grid two">
            <div className="admin-field">
              <label htmlFor="edit-announcement-date">Date</label>
              <input
                id="edit-announcement-date"
                type="date"
                value={formatDateForInput(editingItem.date)}
                onChange={(event) =>
                  setEditingItem((current) =>
                    current ? { ...current, date: event.target.value } : null
                  )
                }
              />
            </div>

            <div className="admin-field">
              <label htmlFor="edit-announcement-active">Status</label>
              <label>
                <input
                  id="edit-announcement-active"
                  type="checkbox"
                  checked={editingItem.isActive}
                  onChange={(event) =>
                    setEditingItem((current) =>
                      current ? { ...current, isActive: event.target.checked } : null
                    )
                  }
                />{" "}
                Active
              </label>
            </div>
          </div>

          <div className="admin-button-row">
            <SaveButton loading={saving} label="Update Announcement" />
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setEditingItem(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {!loading && items.length === 0 ? (
        <section className="admin-panel">
          <p>No announcements found. Click &quot;Add New Announcement&quot; to create one.</p>
        </section>
      ) : null}

      {items.length > 0 ? (
        <div className="admin-array-list">
          {items.map((item) => (
            <div className="admin-array-item" key={item._id}>
              <div className="admin-array-item-header">
                <strong>{item.title.en || item.title.hi || "Untitled"}</strong>
                <span>
                  {formatDateForDisplay(item.date)}
                  {" — "}
                  {item.isActive ? (
                    <span className="admin-status success">Active</span>
                  ) : (
                    <span className="admin-status info">Inactive</span>
                  )}
                </span>
              </div>
              <div className="admin-button-row">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => {
                    setEditingItem({ ...item });
                    setShowAddForm(false);
                  }}
                >
                  <i className="fa-solid fa-pen-to-square" /> Edit
                </button>
                <button
                  type="button"
                  className="admin-danger-button"
                  onClick={() => handleDelete(item._id)}
                >
                  <i className="fa-solid fa-trash" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
