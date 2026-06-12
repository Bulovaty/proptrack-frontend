const API = "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem("proptrack_token");

// Reusable fetch with auth header
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

// Auth
export const apiLogin = (email, password) =>
  apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const apiRegister = (name, email, password) =>
  apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

// Tenants
export const apiGetTenants = () => apiFetch("/tenants");
export const apiAddTenant = (data) =>
  apiFetch("/tenants", { method: "POST", body: JSON.stringify(data) });

// Payments
export const apiGetPayments = () => apiFetch("/payments");
export const apiAddPayment = (data) =>
  apiFetch("/payments", { method: "POST", body: JSON.stringify(data) });
export const apiVerifyMpesa = (transactionCode) =>
  apiFetch("/mpesa/verify", { method: "POST", body: JSON.stringify({ transactionCode }) });

// Listings
export const apiGetListings = () => apiFetch("/listings");
export const apiAddListing = (data) =>
  apiFetch("/listings", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateListing = (id, data) =>
  apiFetch(`/listings/${id}`, { method: "PUT", body: JSON.stringify(data) });

// Reminders
export const apiGetReminders = () => apiFetch("/reminders");
export const apiSendReminder = (data) =>
  apiFetch("/reminders/send", { method: "POST", body: JSON.stringify(data) });