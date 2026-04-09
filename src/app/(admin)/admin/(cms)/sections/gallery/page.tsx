"use client";

import { useEffect, useState } from "react";
import BilingualInput from "@/components/admin/BilingualInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import type { GalleryItem, LocalizedText } from "@/types/content";

type GalleryItemWithId = GalleryItem & { _id: string };

const CATEGORIES = ["campus", "events", "sports", "activities"] as const;

const emptyText: LocalizedText = { en: "", hi: "" };

const emptyItem: GalleryItem = {
  image: "",
  caption: { ...emptyText },
  category: "campus"
};

function normalizeText(value?: Partial<LocalizedText> | null): LocalizedText {
  return {
    en: value?.en ?? "",
    hi: value?.hi ?? ""
  };
}

export default function GallerySectionPage() {
  const [items, setItems] = useState<GalleryItemWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [editingItem, setEditingItem] = useState<GalleryItemWithId | null>(null);
  const [newItem, setNewItem] = useState<GalleryItem>({ ...emptyItem, caption: { ...emptyText } });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setLoading(true);
      setStatus("");

      try {
        const response = await fetch("/api/admin/sections/gallery", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load gallery items.");
        }

        if (!cancelled) {
          const normalized = Array.isArray(result)
            ? result.map((item: GalleryItemWithId) => ({
                _id: item._id,
                image: item.image ?? "",
                caption: normalizeText(item.caption),
                category: item.category ?? "campus"
              }))
            : [];
          setItems(normalized);
        }
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setStatus(error instanceof Error ? error.message : "Unable to load gallery items.");
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
      const response = await fetch("/api/admin/sections/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to add gallery item.");
      }

      const created: GalleryItemWithId = {
        _id: result._id,
        image: result.image ?? "",
        caption: normalizeText(result.caption),
        category: result.category ?? "campus"
      };

      setItems((current) => [...current, created]);
      setNewItem({ ...emptyItem, caption: { ...emptyText } });
      setShowAddForm(false);
      setStatus("Gallery item added successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to add gallery item.");
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
      const response = await fetch(`/api/admin/sections/gallery/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: editingItem.image,
          caption: editingItem.caption,
          category: editingItem.category
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update gallery item.");
      }

      const updated: GalleryItemWithId = {
        _id: result._id ?? editingItem._id,
        image: result.image ?? "",
        caption: normalizeText(result.caption),
        category: result.category ?? "campus"
      };

      setItems((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
      setEditingItem(null);
      setStatus("Gallery item updated successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update gallery item.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this gallery item?")) {
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(`/api/admin/sections/gallery/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Unable to delete gallery item.");
      }

      setItems((current) => current.filter((item) => item._id !== id));

      if (editingItem?._id === id) {
        setEditingItem(null);
      }

      setStatus("Gallery item deleted successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete gallery item.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(item: GalleryItemWithId) {
    setEditingItem({
      ...item,
      caption: { ...item.caption }
    });
    setShowAddForm(false);
  }

  function cancelEditing() {
    setEditingItem(null);
  }

  function cancelAdd() {
    setShowAddForm(false);
    setNewItem({ ...emptyItem, caption: { ...emptyText } });
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <h2>Gallery</h2>
        <p>Manage gallery images displayed on the public site. Add, edit, or remove gallery items by category.</p>
        {loading ? <div className="admin-status info">Loading gallery items...</div> : null}
        {status ? <div className={`admin-status ${statusType}`}>{status}</div> : null}
      </section>

      {!loading ? (
        <>
          <section className="admin-panel">
            <div className="admin-button-row">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingItem(null);
                }}
              >
                <i className="fa-solid fa-plus" /> {showAddForm ? "Cancel" : "Add New Item"}
              </button>
            </div>
          </section>

          {showAddForm ? (
            <div className="admin-form-card">
              <h2>Add New Gallery Item</h2>

              <ImageUpload
                label="Image"
                value={newItem.image}
                onChange={(value) => setNewItem((current) => ({ ...current, image: value }))}
              />

              <BilingualInput
                label="Caption"
                value={newItem.caption}
                onChange={(value) => setNewItem((current) => ({ ...current, caption: value }))}
              />

              <div className="admin-field">
                <label htmlFor="new-item-category">Category</label>
                <select
                  id="new-item-category"
                  value={newItem.category}
                  onChange={(event) =>
                    setNewItem((current) => ({ ...current, category: event.target.value }))
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-button-row">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleAdd();
                  }}
                >
                  <SaveButton loading={saving} label="Add Item" />
                </form>
                <button type="button" className="admin-secondary-button" onClick={cancelAdd}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="admin-array-list">
            {items.map((item) =>
              editingItem?._id === item._id ? (
                <div className="admin-array-item" key={item._id}>
                  <div className="admin-array-item-header">
                    <strong>Editing: {item.caption.en || "Untitled"}</strong>
                  </div>

                  <ImageUpload
                    label="Image"
                    value={editingItem.image}
                    onChange={(value) =>
                      setEditingItem((current) =>
                        current ? { ...current, image: value } : current
                      )
                    }
                  />

                  <BilingualInput
                    label="Caption"
                    value={editingItem.caption}
                    onChange={(value) =>
                      setEditingItem((current) =>
                        current ? { ...current, caption: value } : current
                      )
                    }
                  />

                  <div className="admin-field">
                    <label htmlFor={`edit-category-${item._id}`}>Category</label>
                    <select
                      id={`edit-category-${item._id}`}
                      value={editingItem.category}
                      onChange={(event) =>
                        setEditingItem((current) =>
                          current ? { ...current, category: event.target.value } : current
                        )
                      }
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-button-row">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleEdit();
                      }}
                    >
                      <SaveButton loading={saving} label="Save Changes" />
                    </form>
                    <button type="button" className="admin-secondary-button" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="admin-array-item" key={item._id}>
                  <div className="admin-array-item-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.caption.en || "Gallery image"}
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "cover",
                            borderRadius: 8
                          }}
                        />
                      ) : null}
                      <div>
                        <strong>{item.caption.en || "Untitled"}</strong>
                        <br />
                        <span className="admin-secondary-button" style={{ pointerEvents: "none", fontSize: "0.8em" }}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="admin-button-row">
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => startEditing(item)}
                      >
                        <i className="fa-solid fa-pen" /> Edit
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
                </div>
              )
            )}

            {items.length === 0 ? (
              <div className="admin-status info">No gallery items found. Add your first item above.</div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
