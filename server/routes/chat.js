import express from 'express';
import { retrieveContext } from '../services/rag/ragService.js';
import { generateAnswer } from '../services/ai/groqService.js';

export const chatRouter = express.Router();

/**
 * Helper to detect Arabic text.
 */
function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * POST /api/chat
 * Free-form Q&A endpoint grounded in company knowledge.
 */
chatRouter.post('/', async (req, res) => {
  try {
    const { message, history, lang } = req.body;

    // 1. Validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string.'
      });
    }

    const cleanMessage = message.trim();
    if (cleanMessage.length > 1000) {
      return res.status(400).json({
        error: 'Message is too long. Please keep messages under 1000 characters.'
      });
    }

    // 2. Retrieve relevant company context via RAG
    const { contextText, chunks } = await retrieveContext(cleanMessage);

    // 3. Generate grounded answer via Groq LLM with language mandate
    const { answer } = await generateAnswer(cleanMessage, contextText, history, lang);

    // Extract unique source titles
    const sources = Array.from(new Set(chunks.map((c) => c.title || c.source))).filter(Boolean);

    return res.json({
      answer,
      sources
    });
  } catch (err) {
    console.error('[ChatAPI] Error processing chat request:', err);

    const userMessage = req.body?.message || '';
    const userIsArabic = isArabic(userMessage);

    const fallbackErrorMessage = userIsArabic
      ? 'عذرًا، نواجه صعوبة في معالجة طلبك حاليًا. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة عبر واتساب: 01091610085'
      : "Sorry, I'm having trouble processing your request right now. Please try again or reach out to our team directly on WhatsApp: 01091610085";

    return res.status(500).json({
      error: 'Internal server error',
      answer: fallbackErrorMessage
    });
  }
});
