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

export const apiLogin = (email, password) =>
  apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const apiRegister = (name, email, password) =>
  apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

export const apiGetTenants = () => apiFetch("/tenants");
export const apiAddTenant = (data) =>
  apiFetch("/tenants", { method: "POST", body: JSON.stringify(data) });

export const apiGetPayments = () => apiFetch("/payments");
export const apiAddPayment = (data) =>
  apiFetch("/payments", { method: "POST", body: JSON.stringify(data) });
export const apiVerifyMpesa = (transactionCode) =>
  apiFetch("/mpesa/verify", { method: "POST", body: JSON.stringify({ transactionCode }) });

export const apiGetListings = () => apiFetch("/listings");
export const apiAddListing = (data) =>
  apiFetch("/listings", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateListing = (id, data) =>
  apiFetch(`/listings/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const apiGetReminders = () => apiFetch("/reminders");
export const apiSendReminder = (data) =>
  apiFetch("/reminders/send", { method: "POST", body: JSON.stringify(data) });