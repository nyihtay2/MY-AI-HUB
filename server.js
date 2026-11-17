require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

async function readError(res) {
  const body = await res.text();
  let message = body;
  try { message = JSON.parse(body).error?.message || body; } catch {}
  throw new Error(message || `Provider error (${res.status})`);
}

app.post("/api/chat/:provider", async (req, res) => {
  const { provider } = req.params;
  const { message, history = [] } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "မေးခွန်းတစ်ခု ရေးပေးပါ။" });
  }

  try {
    let answer = "";

    if (provider === "openai") {
      if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY မထည့်ရသေးပါ။");
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          messages: [...history.slice(-12), { role: "user", content: message }]
        })
      });
      if (!r.ok) await readError(r);
      const data = await r.json();
      answer = data.choices?.[0]?.message?.content || "အဖြေမရရှိပါ။";
    } else if (provider === "gemini") {
      if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY မထည့်ရသေးပါ။");
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const contents = [
        ...history.slice(-12).map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        })),
        { role: "user", parts: [{ text: message }] }
      ];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      });
      if (!r.ok) await readError(r);
      const data = await r.json();
      answer = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "အဖြေမရရှိပါ။";
    } else if (provider === "llama") {
      if (!process.env.LLAMA_API_KEY) throw new Error("LLAMA_API_KEY မထည့်ရသေးပါ။");
      const base = (process.env.LLAMA_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
      const r = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.LLAMA_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.LLAMA_MODEL || "llama-3.3-70b-versatile",
          messages: [...history.slice(-12), { role: "user", content: message }]
        })
      });
      if (!r.ok) await readError(r);
      const data = await r.json();
      answer = data.choices?.[0]?.message?.content || "အဖြေမရရှိပါ။";
    } else {
      return res.status(404).json({ error: "မသိသော AI provider ဖြစ်သည်။" });
    }

    res.json({ provider, answer });
  } catch (err) {
    res.status(500).json({ error: err.message || "တစ်ခုခု မှားယွင်းနေပါသည်။" });
  }
});

app.get("/api/status", (_req, res) => {
  res.json({
    openai: Boolean(process.env.OPENAI_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    llama: Boolean(process.env.LLAMA_API_KEY)
  });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`MY AI HUB running at http://localhost:${PORT}`));
