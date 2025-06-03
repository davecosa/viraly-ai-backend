const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/analyze_link", async (req, res) => {
  const videoUrl = req.body.url;
  console.log("Received URL:", videoUrl);

  try {
    let downloadLink = videoUrl;

    // TikTok fallback to MusicallyDown
    if (videoUrl.includes("tiktok.com")) {
      console.log("Using MusicallyDown fallback...");

      downloadLink = await getTikTokDownloadMusicallyDown(videoUrl);

      if (!downloadLink) {
        return res.json({
          feedback: "TikTok video couldn't be downloaded (blocked or private). Try another link.",
          score: 0
        });
      }

      console.log("Download link:", downloadLink);
    }

    // Download audio
    await execPromise(`yt-dlp -f bestaudio -o audio.m4a "${downloadLink}"`);
    console.log("Audio downloaded.");

    // MOCK FEEDBACK (replace with Whisper + GPT later)
    const feedback = "Nice pacing! Improve your lighting and add captions for better retention.";
    const score = 78;

    res.json({ feedback, score });
  } catch (err) {
    console.error("Analyzer failed:", err.message);
    res.status(500).send("Analyzer failed.");
  }
});

async function getTikTokDownloadMusicallyDown(tiktokUrl) {
  try {
    const form = new URLSearchParams();
    form.append("url", tiktokUrl);

    const response = await axios.post(
      "https://musicallydown.com/download",
      form,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://musicallydown.com/",
        },
      }
    );

    const html = response.data;

    const match = html.match(/href="(https:\/\/[^"]+\.tiktokcdn\.com[^"]+)"/);
    return match ? match[1] : null;
  } catch (err) {
    console.error("MusicallyDown failed:", err.message);
    return null;
  }
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});