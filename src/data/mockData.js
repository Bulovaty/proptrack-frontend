// Mock data — replace with real API calls to your backend

export const mockTenants = [
  { id: 1, name: "James Mwangi", unit: "A01", phone: "0712345678", rent: 12000, status: "paid", moveIn: "2023-03-01", arrears: 0 },
  { id: 2, name: "Grace Achieng", unit: "A02", phone: "0723456789", rent: 10000, status: "arrears", moveIn: "2023-05-15", arrears: 10000 },
  { id: 3, name: "Peter Kamau", unit: "B01", phone: "0734567890", rent: 15000, status: "paid", moveIn: "2022-11-01", arrears: 0 },
  { id: 4, name: "Faith Njeri", unit: "B02", phone: "0745678901", rent: 10000, status: "pending", moveIn: "2024-01-10", arrears: 0 },
  { id: 5, name: "David Omondi", unit: "C01", phone: "0756789012", rent: 8000, status: "arrears", moveIn: "2023-08-20", arrears: 16000 },
  { id: 6, name: "Mercy Wanjiku", unit: "C02", phone: "0767890123", rent: 8000, status: "paid", moveIn: "2024-02-01", arrears: 0 },
];

export const mockPayments = [
  { id: 1, tenant: "James Mwangi", unit: "A01", amount: 12000, mpesaCode: "QGH7823KLM", date: "2024-06-01", status: "verified", method: "M-Pesa" },
  { id: 2, tenant: "Peter Kamau", unit: "B01", amount: 15000, mpesaCode: "RFT9034NOP", date: "2024-06-02", status: "verified", method: "M-Pesa" },
  { id: 3, tenant: "Mercy Wanjiku", unit: "C02", amount: 8000, mpesaCode: "KJH4521QRS", date: "2024-06-03", status: "verified", method: "M-Pesa" },
  { id: 4, tenant: "Faith Njeri", unit: "B02", amount: 10000, mpesaCode: "LMN8823TUV", date: "2024-06-05", status: "pending", method: "M-Pesa" },
  { id: 5, tenant: "Grace Achieng", unit: "A02", amount: 10000, mpesaCode: "FAKE1234XYZ", date: "2024-05-01", status: "failed", method: "M-Pesa" },
];

export const mockListings = [
  { id: 1, title: "2 Bedroom Apartment", location: "Kasarani, Nairobi", rent: 18000, type: "Apartment", beds: 2, baths: 1, status: "available", description: "Spacious 2BR with parking. Water included.", contact: "0712345678" },
  { id: 2, title: "Bedsitter Unit", location: "Roysambu, Nairobi", rent: 7000, type: "Bedsitter", beds: 1, baths: 1, status: "available", description: "Self-contained bedsitter near TRM.", contact: "0723456789" },
  { id: 3, title: "1 Bedroom Apartment", location: "Embakasi, Nairobi", rent: 12000, type: "Apartment", beds: 1, baths: 1, status: "taken", description: "Modern 1BR near SGR station.", contact: "0712345678" },
];

export const mockReminders = [
  { id: 1, tenant: "Grace Achieng", unit: "A02", phone: "0723456789", type: "Arrears", message: "Dear Grace, your rent of Ksh 10,000 is overdue. Please pay immediately to avoid penalties.", status: "sent", date: "2024-06-05" },
  { id: 2, tenant: "David Omondi", unit: "C01", phone: "0756789012", type: "Arrears", message: "Dear David, you have outstanding arrears of Ksh 16,000. Please contact us urgently.", status: "sent", date: "2024-06-05" },
  { id: 3, tenant: "Faith Njeri", unit: "B02", phone: "0745678901", type: "Due Soon", message: "Dear Faith, your rent of Ksh 10,000 is due on 10th June. Kindly pay via Paybill 123456.", status: "pending", date: "2024-06-08" },
];
