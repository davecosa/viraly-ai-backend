const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

console.log("🟢 Starting server...");

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in environment variables.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    console.log("⚠️ No message provided in request.");
    return res.status(400).json({ error: "Missing message in body" });
  }

  try {
    console.log("📨 Received message:", message);

    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-3.5-turbo"
    });

    const reply = response.choices[0]?.message?.content || "No response.";
    console.log("💬 Sending reply:", reply);

    res.json({ message: reply });
  } catch (error) {
    console.error("🔥 Error from OpenAI:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

