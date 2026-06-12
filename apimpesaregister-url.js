// Install: npm install axios
const axios = require("axios");

// 1. Get access token
async function getAccessToken() {
  const auth = Buffer.from("kxkmyOIbUak6KO79xdwfMAG7yRNUvUlXGt6JdPXS9pIatxXM:5Apm8idZ7nI9JGX6hCU4coUBonRBXwHDNjFBUec5EqKA9YXL8ESfqGZViAZkCsLQ").toString("base64");
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return res.data.access_token;
}

// 2. Register your callback URL with Safaricom
async function registerURL() {
  const token = await getAccessToken();
  await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
    {
      ShortCode: "YOUR_PAYBILL_NUMBER",
      ResponseType: "Completed",
      ConfirmationURL: "https://your-ngrok-url.ngrok.io/api/mpesa/confirm",
      ValidationURL: "https://your-ngrok-url.ngrok.io/api/mpesa/validate",
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// 3. Receive payment confirmation from Safaricom
app.post("/api/mpesa/confirm", (req, res) => {
  const { TransID, TransAmount, BillRefNumber, MSISDN } = req.body;
  // TransID       = M-Pesa transaction code (what tenant sends you)
  // TransAmount   = Amount paid
  // BillRefNumber = What tenant typed as account number (put their unit number here)
  // MSISDN        = Tenant's phone number

  // Save to your database, mark tenant as paid
  console.log(`Payment received: ${TransID} — Ksh ${TransAmount} from ${MSISDN}`);

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});