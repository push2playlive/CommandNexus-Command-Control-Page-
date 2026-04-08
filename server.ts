import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock data for trends/stats
  app.get("/api/stats", (req, res) => {
    res.json({
      visitors: 12450,
      securityThreats: 3,
      sales: 45200,
      activeApps: 24,
      uptime: "99.99%",
      latency: "12ms",
      cpuLoad: 26,
      memoryUsage: 33,
      diskIO: 39,
      networkTraffic: 34
    });
  });

  app.get("/api/logs", (req, res) => {
    res.json([
      { time: "12:45:01", msg: "Visitor from Tokyo (IP: 192.168.1.1)", type: "info" },
      { time: "12:44:55", msg: "AI Scan: Vulnerability patched in App #4", type: "success" },
      { time: "12:44:30", msg: "Security: Blocked XSS attempt from 45.12.3.4", type: "warning" },
      { time: "12:43:12", msg: "Sales: New Enterprise subscription ($499)", type: "success" },
      { time: "12:42:05", msg: "System: Database backup completed", type: "info" },
    ]);
  });

  app.get("/api/uplinks", async (req, res) => {
    try {
      // In a real app, we would fetch from Supabase here using a service key
      // For this demo, we'll return mock data that matches the Python script's structure
      // but also allow it to be dynamic if the user has Supabase configured.
      res.json([
        { server_name: "CCX23", cpu_usage: 42, ram_usage: 68, disk_usage: 15, status: "online", updated_at: new Date().toISOString() },
        { server_name: "EDGE-01", cpu_usage: 12, ram_usage: 34, disk_usage: 82, status: "online", updated_at: new Date().toISOString() },
        { server_name: "STORAGE-B", cpu_usage: 5, ram_usage: 12, disk_usage: 94, status: "warning", updated_at: new Date(Date.now() - 60000).toISOString() },
      ]);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch uplinks" });
    }
  });

  // Chat Agents Proxy
  app.post("/api/chat-agents/gemini", async (req, res) => {
    try {
      const { messages, prompt, temperature, maxTokens } = req.body;
      
      let contents = [];
      let systemInstruction = undefined;

      if (messages && Array.isArray(messages)) {
        const systemMsg = messages.find((m: any) => m.role === "system");
        if (systemMsg) {
          systemInstruction = { parts: [{ text: systemMsg.content }] };
        }
        contents = messages
          .filter((m: any) => m.role !== "system")
          .map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));
      } else if (prompt?.trim()) {
        contents = [{ role: "user", parts: [{ text: prompt }] }];
      } else {
        return res.status(400).json({ error: "Missing messages or prompt in body" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY secret" });

      const model = "gemini-1.5-flash";
      const geminiUrl =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const body: any = { contents };
      if (systemInstruction) body.system_instruction = systemInstruction;
      
      body.generationConfig = {};
      if (temperature !== undefined) body.generationConfig.temperature = temperature;
      if (maxTokens !== undefined) body.generationConfig.maxOutputTokens = maxTokens;

      const resp = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(resp.status).json({ error: `Gemini API Error: ${errText}` });
      }

      const data: any = await resp.json();
      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const usage = data?.usageMetadata ? {
        totalTokens: data.usageMetadata.totalTokenCount,
        promptTokens: data.usageMetadata.promptTokenCount,
        completionTokens: data.usageMetadata.candidatesTokenCount
      } : undefined;
      res.json({ output, model, usage });
    } catch (e) {
      res.status(500).json({ error: "Unhandled error", details: String(e) });
    }
  });

  app.post("/api/chat-agents/openai", async (req, res) => {
    try {
      const { messages, prompt, model, temperature, maxTokens } = req.body;
      
      let openAIMessages = [];
      if (messages && Array.isArray(messages)) {
        openAIMessages = messages;
      } else if (prompt?.trim()) {
        openAIMessages = [{ role: "user", content: prompt }];
      } else {
        return res.status(400).json({ error: "Missing messages or prompt in body" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY secret" });

      const useModel = model || "gpt-4o-mini";

      const body: any = {
        model: useModel,
        messages: openAIMessages,
        temperature: temperature ?? 0.7,
      };

      if (maxTokens !== undefined) {
        body.max_tokens = maxTokens;
      }

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(resp.status).json({ error: `OpenAI API Error: ${errText}` });
      }

      const data: any = await resp.json();
      const output = data?.choices?.[0]?.message?.content ?? "";
      const usage = data?.usage ? {
        totalTokens: data.usage.total_tokens,
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens
      } : undefined;
      res.json({ output, model: useModel, usage });
    } catch (e) {
      res.status(500).json({ error: "Unhandled error", details: String(e) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
