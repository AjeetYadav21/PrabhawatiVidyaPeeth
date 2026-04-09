"use client";

import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import type { EventItem, LocalizedText } from "@/types/content";

type EventWithId = EventItem & { _id: string };

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

function createEmptyEvent(): EventItem {
  return {
    title: { en: "", hi: "" },
    description: { en: "", hi: "" },
    date: new Date().toISOString().split("T")[0],
    image: ""
  };
}

function normalizeEvent(item: Partial<EventItem>): EventItem {
  return {
    title: normalizeText(item.title),
    description: normalizeText(item.description),
    date: item.date ?? new Date().toISOString().split("T")[0],
    image: item.image ?? ""
  };
}

export default function EventsSectionPage() {
  const [items, setItems] = useState<EventWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [editingItem, setEditingItem] = useState<EventWithId | null>(null);
  const [newItem, setNewItem] = useState<EventItem>(createEmptyEvent);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setLoading(true);
      setStatus("");

      try {
        const response = await fetch("/api/admin/sections/events", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load events.");
        }

        if (!cancelled) {
          const normalized = Array.isArray(result)
            ? result.map((item: EventWithId) => ({
                _id: item._id,
                ...normalizeEvent(item)
              }))
            : [];
          setItems(normalized);
        }
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setStatus(error instanceof Error ? error.message : "Unable to load events.");
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
      const response = await fetch("/api/admin/sections/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create event.");
      }

      const created: EventWithId = {
        _id: result._id,
        ...normalizeEvent(result)
      };

      setItems((current) => [created, ...current]);
      setNewItem(createEmptyEvent());
      setShowAddForm(false);
      setStatus("Event created successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create event.");
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
      const response = await fetch(`/api/admin/sections/events/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          date: editingItem.date,
          image: editingItem.image
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update event.");
      }

      const updated: EventWithId = {
        _id: result._id,
        ...normalizeEvent(result)
      };

      setItems((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
      setEditingItem(null);
      setStatus("Event updated successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update event.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(`/api/admin/sections/events/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete event.");
      }

      setItems((current) => current.filter((item) => item._id !== id));

      if (editingItem?._id === id) {
        setEditingItem(null);
      }

      setStatus("Event deleted successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete event.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Events</h2>
        <p>
          Manage school events. Events are sorted by date (newest first).
        </p>
        {loading ? (
          <div className="admin-status info">Loading events...</div>
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
            {showAddForm ? "Cancel" : "Add New Event"}
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
          <h2>New Event</h2>

          <BilingualInput
            label="Title"
            value={newItem.title}
            onChange={(value) => setNewItem((current) => ({ ...current, title: value }))}
          />

          <BilingualInput
            label="Description"
            value={newItem.description}
            onChange={(value) => setNewItem((current) => ({ ...current, description: value }))}
            multiline
            rows={3}
          />

          <div className="admin-field-grid two">
            <div className="admin-field">
              <label htmlFor="new-event-date">Date</label>
              <input
                id="new-event-date"
                type="date"
                value={formatDateForInput(newItem.date)}
                onChange={(event) =>
                  setNewItem((current) => ({ ...current, date: event.target.value }))
                }
              />
            </div>
          </div>

          <ImageUpload
            label="Event Image"
            value={newItem.image}
            onChange={(value) => setNewItem((current) => ({ ...current, image: value }))}
          />

          <div className="admin-button-row">
            <SaveButton loading={saving} label="Create Event" />
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => {
                setShowAddForm(false);
                setNewItem(createEmptyEvent());
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
          <h2>Edit Event</h2>

          <BilingualInput
            label="Edit Title"
            value={editingItem.title}
            onChange={(value) =>
              setEditingItem((current) => (current ? { ...current, title: value } : null))
            }
          />

          <BilingualInput
            label="Edit Description"
            value={editingItem.description}
            onChange={(value) =>
              setEditingItem((current) => (current ? { ...current, description: value } : null))
            }
            multiline
            rows={3}
          />

          <div className="admin-field-grid two">
            <div className="admin-field">
              <label htmlFor="edit-event-date">Date</label>
              <input
                id="edit-event-date"
                type="date"
                value={formatDateForInput(editingItem.date)}
                onChange={(event) =>
                  setEditingItem((current) =>
                    current ? { ...current, date: event.target.value } : null
                  )
                }
              />
            </div>
          </div>

          <ImageUpload
            label="Edit Event Image"
            value={editingItem.image}
            onChange={(value) =>
              setEditingItem((current) => (current ? { ...current, image: value } : null))
            }
          />

          <div className="admin-button-row">
            <SaveButton loading={saving} label="Update Event" />
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
          <p>No events found. Click &quot;Add New Event&quot; to create one.</p>
        </section>
      ) : null}

      {items.length > 0 ? (
        <div className="admin-array-list">
          {items.map((item) => (
            <div className="admin-array-item" key={item._id}>
              <div className="admin-array-item-header">
                <strong>{item.title.en || item.title.hi || "Untitled"}</strong>
                <span>{formatDateForDisplay(item.date)}</span>
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
