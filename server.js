const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();

const app = express();
const port = process.env.PORT;

if (!port) {
  console.error("❌ No PORT defined in env!");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

console.log("🚀 Starting server...");
console.log("🔑 OpenAI key present?", process.env.OPENAI_API_KEY ? "✅" : "❌");
console.log("🌐 Binding to port:", port);

app.get("/", (req, res) => {
  res.send("✅ Server is live!");
});

let openai;
try {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} catch (e) {
  console.error("❌ OpenAI init failed:", e.message);
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  console.log("📩 Incoming:", message);

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-3.5-turbo",
    });

    const reply = completion.choices[0].message.content;
    res.json({ message: reply });
  } catch (err) {
    console.error("❌ OpenAI error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

