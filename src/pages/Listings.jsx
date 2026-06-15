import { useState, useEffect, useRef } from "react";

const API = "https://proptrack-backend-production-a3e9.up.railway.app/api";
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

const EMPTY = { title: "", location: "", rent: "", type: "Apartment", beds: 1, baths: 1, description: "", contact: "", image_url: "" };

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

  useEffect(() => {
    apiFetch("/listings")
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const available = listings.filter(l => l.status === "available").length;

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToCompressedBase64(file);
      setForm(f => ({ ...f, image_url: base64 }));
    } catch (err) {
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
        <div className="empty-state">
          <div className="empty-state-icon">&#127968;</div>
          <div className="empty-state-title">No listings yet</div>
          <p>Post your first vacant unit to start attracting tenants</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {listings.map(l => (
          <div key={l.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Image */}
            <div style={{
              width: "100%", height: 160,
              background: l.image_url
                ? `url(${l.image_url}) center/cover no-repeat`
                : "linear-gradient(135deg, var(--accent-dim), var(--bg-secondary))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, position: "relative"
            }}>
              {!l.image_url && <span style={{ fontSize: 40 }}>&#127968;</span>}
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
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 12 }}>
                &#128205; {l.location}
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>&#128719; {l.beds} Bed</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>&#128703; {l.baths} Bath</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>&#127959; {l.type}</span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-display)", marginBottom: 8 }}>
                Ksh {Number(l.rent).toLocaleString()}
                <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" }}>/mo</span>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
                {l.description}
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: "center" }}
                  onClick={() => copyLink(l.id)}>
                  {copied === l.id ? "✓ Copied!" : "🔗 Share Link"}
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: "center" }}
                  onClick={() => toggleStatus(l)}>
                  {l.status === "available" ? "Mark Taken" : "Mark Available"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Listing Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Post New Listing</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Image Upload */}
              <div className="form-group">
                <label>Property Photo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%", height: 140, borderRadius: 10,
                    border: "1px dashed var(--border)",
                    background: form.image_url
                      ? `url(${form.image_url}) center/cover no-repeat`
                      : "var(--bg-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", position: "relative", overflow: "hidden"
                  }}
                >
                  {!form.image_url && (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                      {uploading ? "Processing image..." : "Click to upload a photo"}
                    </div>
                  )}
                  {form.image_url && (
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      background: "rgba(0,0,0,0.6)", borderRadius: 6,
                      padding: "4px 8px", fontSize: 11, color: "#fff"
                    }}>
                      Change photo
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageSelect}
                />
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
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addListing} disabled={uploading}>
                Post Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
