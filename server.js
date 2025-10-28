import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const PORT = process.env.PORT || 3000;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
if (!OPENROUTER_KEY) {
  console.error("Missing OPENROUTER_KEY in .env");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: OPENROUTER_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend from /public

// POST /api/chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, model = "deepseek/deepseek-chat" } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });

    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: message }],
    });

    // Some gateways return multiple shapes — try common ones
    const content =
      completion?.choices?.[0]?.message?.content ??
      completion?.output_text ??
      JSON.stringify(completion);

    res.json({ result: content });
  } catch (err) {
    console.error("OpenAI error:", err);
    // forward useful info without leaking secrets
    const status = err?.status || 500;
    const message =
      err?.error?.message ??
      err?.message ??
      "Unknown error from upstream provider";
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});