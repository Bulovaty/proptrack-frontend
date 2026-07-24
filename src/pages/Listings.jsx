import { useState, useEffect, useRef } from "react";
import { IconHome, IconMapPin, IconUsers, IconBuilding, IconCheck, IconCopy } from "../components/Icons";
import EmptyState from "../components/EmptyState";

const API = import.meta.env.VITE_API_URL + "/api";
const getToken = () => localStorage.getItem("proptrack_token");

const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const EMPTY = { title: "", location: "", rent: "", type: "Apartment", beds: 1, baths: 1, description: "", contact: "", image_url: "", images: [] };

// Resize + compress image client-side before converting to base64
const fileToCompressedBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [copied, setCopied] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(null);
const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/listings")
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const available = listings.filter(l => l.status === "available").length;

const handleImageSelect = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  const remaining = 10 - form.images.length;
  if (remaining <= 0) { alert("Maximum 10 images allowed"); return; }
  const toProcess = files.slice(0, remaining);
  setUploading(true);
  try {
    const base64s = await Promise.all(toProcess.map(fileToCompressedBase64));
    setForm(f => ({
      ...f,
      images: [...f.images, ...base64s],
      image_url: f.image_url || base64s[0]
    }));
  } catch {
    alert("Failed to process image");
  }
  setUploading(false);
};

  const addListing = async () => {
    if (!form.title || !form.location || !form.rent) return;
    try {
      const newListing = await apiFetch("/listings", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setListings([newListing, ...listings]);
      setForm(EMPTY);
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (listing) => {
    const newStatus = listing.status === "available" ? "taken" : "available";
    try {
      const updated = await apiFetch(`/listings/${listing.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setListings(listings.map(l => l.id === listing.id ? updated : l));
    } catch (err) {
      alert(err.message);
    }
  };
  const editListing = (l) => {
  setEditing(l);
  setForm({
    title: l.title,
    location: l.location,
    rent: l.rent,
    type: l.type,
    beds: l.beds,
    baths: l.baths,
    description: l.description || "",
    contact: l.contact || "",
    image_url: l.image_url || "",
    images: l.images || [],
  });
  setShowModal(true);
};
const saveListing = async () => {
  if (!form.title || !form.location || !form.rent) return;
  setSaving(true);
  try {
    const updated = await apiFetch(`/listings/${editing.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
    setListings(listings.map(l => l.id === editing.id ? updated : l));
    setForm(EMPTY);
    setEditing(null);
    setShowModal(false);
  } catch (err) {
    alert(err.message);
  }
  setSaving(false);
};

  const copyLink = (id) => {
    navigator.clipboard.writeText(`https://proptrack.co.ke/listings/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div style={{ padding: 40, color: "var(--text-secondary)" }}>Loading listings...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Listings</h1>
          <p className="page-subtitle">{available} units available for rent</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Post Listing
        </button>
      </div>

      {listings.length === 0 && (
        <EmptyState
          icon={<IconHome size={36} />}
          title="No listings yet"
          subtitle="Post your first vacant unit to start attracting tenants"
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {listings.map(l => (
          <div key={l.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Image */}
            <div style={{
              width: "100%", height: 160,
              background: (l.images?.[0] || l.image_url)
  ? `url(${l.images?.[0] || l.image_url}) center/cover no-repeat`
  : "linear-gradient(135deg, var(--accent-dim), var(--bg-secondary))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, position: "relative"
            }}>
              {!l.image_url && <span style={{ color: "var(--accent)", opacity: 0.5 }}><IconHome size={40} /></span>}
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                <span className={`badge badge-${l.status === "available" ? "success" : "neutral"}`}>
                  {l.status === "available" ? "Available" : "Taken"}
                </span>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                {l.title}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <IconMapPin size={13} /> {l.location}
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}><IconHome size={13} /> {l.beds} Bed</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}><IconUsers size={13} /> {l.baths} Bath</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}><IconBuilding size={13} /> {l.type}</span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-display)", marginBottom: 8 }}>
                Ksh {Number(l.rent).toLocaleString()}
                <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" }}>/mo</span>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
                {l.description}
              </p>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: "center", minWidth: 80 }}
    onClick={() => editListing(l)}>
    ✏️ Edit
  </button>
  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: "center", gap: 5, minWidth: 80 }}
    onClick={() => copyLink(l.id)}>
    {copied === l.id ? <><IconCheck size={13} /> Copied!</> : <><IconCopy size={13} /> Share</>}
  </button>
  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: "center", minWidth: 80 }}
    onClick={() => toggleStatus(l)}>
    {l.status === "available" ? "Mark Taken" : "Available"}
  </button>
</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Listing Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditing(null); setForm(EMPTY); }}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editing ? "Edit Listing" : "Post New Listing"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Image Upload */}
<div className="form-group">
  <label>Property Photos (up to 10)</label>
  
  {/* Image previews */}
  {form.images.length > 0 && (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 10 }}>
      {form.images.map((img, i) => (
        <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden" }}>
          <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button
            onClick={() => setForm(f => ({
              ...f,
              images: f.images.filter((_, idx) => idx !== i),
              image_url: i === 0 ? (f.images[1] || "") : f.image_url
            }))}
            style={{
              position: "absolute", top: 4, right: 4,
              background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%",
              width: 20, height: 20, cursor: "pointer", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12
            }}
          >✕</button>
          {i === 0 && (
            <div style={{
              position: "absolute", bottom: 4, left: 4,
              background: "var(--accent)", color: "#080c14",
              fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20
            }}>MAIN</div>
          )}
        </div>
      ))}
      {form.images.length < 10 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            aspectRatio: "1", borderRadius: 8, border: "1px dashed var(--border)",
            background: "var(--bg-secondary)", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", fontSize: 24
          }}
        >+</div>
      )}
    </div>
  )}

  {form.images.length === 0 && (
    <div
      onClick={() => fileInputRef.current?.click()}
      style={{
        width: "100%", height: 120, borderRadius: 10,
        border: "1px dashed var(--border)", background: "var(--bg-secondary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--text-muted)", fontSize: 13
      }}
    >
      {uploading ? "Processing..." : "Click to upload photos (up to 10)"}
    </div>
  )}

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    multiple
    style={{ display: "none" }}
    onChange={handleImageSelect}
  />
  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
    {form.images.length}/10 photos · First photo is the main image
  </div>
</div>

              <div className="form-group">
                <label>Property Title</label>
                <input className="input" placeholder="e.g. 2 Bedroom Apartment" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Location</label>
                  <input className="input" placeholder="e.g. Kasarani, Nairobi" value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Monthly Rent (Ksh)</label>
                  <input className="input" type="number" placeholder="e.g. 15000" value={form.rent}
                    onChange={e => setForm({ ...form, rent: e.target.value })} />
                </div>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label>Type</label>
                  <select className="input" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option>Apartment</option>
                    <option>Bedsitter</option>
                    <option>Studio</option>
                    <option>Maisonette</option>
                    <option>Bungalow</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Bedrooms</label>
                  <input className="input" type="number" min="1" value={form.beds}
                    onChange={e => setForm({ ...form, beds: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Bathrooms</label>
                  <input className="input" type="number" min="1" value={form.baths}
                    onChange={e => setForm({ ...form, baths: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input" rows={3} placeholder="Describe the property..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ resize: "vertical" }} />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input className="input" placeholder="07XXXXXXXX" value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setShowModal(false); setEditing(null); setForm(EMPTY); }}>Cancel</button>
              <button className="btn btn-primary" onClick={editing ? saveListing : addListing} disabled={uploading || saving}>
  {saving ? "Saving..." : editing ? "Save Changes" : "Post Listing"}
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
