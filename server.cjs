const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();
const app = express();
const port = process.env.PORT || 8080; // Railway sometimes prefers 8080

app.use(cors());
app.use(express.json());

console.log("🚀 Booting server...");
console.log("🔑 Loaded API key:", process.env.OPENAI_API_KEY ? "YES ✅" : "NO ❌");

let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (e) {
  console.error("❌ OpenAI init failed:", e.message);
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  console.log("📩 Incoming message:", message);

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-3.5-turbo",
    });

    const response = completion.choices[0].message.content;
    console.log("✅ AI Response:", response);
    res.json({ message: response });
  } catch (err) {
    console.error("❌ Error handling /chat:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

