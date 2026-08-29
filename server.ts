import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 8050;

  app.use(express.json());

  // Shared Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  // API Routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Architecture Mentor Endpoint
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { prompt, currentNodeTitle, currentScores } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (ai) {
        const systemInstruction = `You are Trellis AI, an expert software systems architect and personalized growth tutor.
The user is currently studying "${currentNodeTitle || 'Systems Architecture'}".
Their current assessed skills (0-100 scale) are:
- Logic: ${currentScores?.logic || 65}
- Data: ${currentScores?.data || 48}
- Systems: ${currentScores?.systems || 58}
- UX: ${currentScores?.ux || 42}
- Agile: ${currentScores?.agile || 60}

Give concise, highly practical, technically deep architecture answers. Use Markdown formatting, bullet points, and brief code/ASCII architecture snippets when helpful. Focus on trade-offs, idempotency, event-driven design, scalability, and resilience.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction
          }
        });

        return res.json({ reply: response.text || '' });
      }

      // Fallback if no API key
      return res.json({
        reply: `**Trellis Architecture Guidance:**\n\nWhen designing for **${currentNodeTitle || 'distributed systems'}**, always decouple services via asynchronous message queues, enforce idempotency tokens on all mutations, and configure circuit breakers with health check heartbeats.\n\n*Target Competency Focus:* Strengthen your **Data** and **Systems** layers to unlock advanced resilience modules.`
      });
    } catch (err: any) {
      console.error('Error in /api/ai-chat:', err);
      return res.status(500).json({
        error: 'Failed to generate response',
        reply: 'I encountered an issue connecting to the AI model. Please check your network or try asking again.'
      });
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trellis Server running on http://localhost:${PORT}`);
  });
}

startServer();


