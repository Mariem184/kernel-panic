import express from 'express';
import { retrieveContext } from '../services/rag/ragService.js';
import { generateAnswer } from '../services/ai/groqService.js';

export const chatRouter = express.Router();

export const MAX_HISTORY_MESSAGES_INPUT = 20;
export const MAX_HISTORY_MESSAGES_KEPT = 6;
export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_TOTAL_HISTORY_LENGTH = 3000;

/**
 * Helper to detect Arabic text.
 */
export function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text || '');
}

/**
 * Helper to detect common greetings and introductory inquiries.
 */
export function isGreeting(text) {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  const greetingPatterns = [
    /^(hi|hello|hey|welcome|good morning|good evening|how are you|how can you help|how can we help you|who are you|what can you do)[\s!?.]*$/i,
    /^(أهلا|اهلا|مرحبا|سلام|السلام عليكم|صباح الخير|مساء الخير|مين انت|ازيك|عامل ايه|تقدر تساعدني بايه|بتعمل ايه)[\s!?.]*$/
  ];
  return greetingPatterns.some((pattern) => pattern.test(t));
}

/**
 * Validates, bounds, and sanitizes conversation history.
 */
export function validateHistory(history) {
  if (history === undefined || history === null) {
    return { valid: true, sanitized: [] };
  }

  if (!Array.isArray(history)) {
    return { valid: false, error: 'History must be an array of messages.' };
  }

  if (history.length > MAX_HISTORY_MESSAGES_INPUT) {
    return { valid: false, error: 'History exceeds maximum message limit.' };
  }

  const sanitized = [];
  let totalChars = 0;

  for (const item of history) {
    if (!item || typeof item !== 'object') {
      return { valid: false, error: 'Each history item must be an object.' };
    }

    const rawRole = item.role || item.sender;
    if (typeof rawRole !== 'string') {
      return { valid: false, error: 'Invalid message role in history.' };
    }

    const role = rawRole.trim().toLowerCase();
    const privilegedRoles = ['system', 'developer', 'admin', 'root', 'function', 'tool'];
    if (privilegedRoles.includes(role)) {
      return { valid: false, error: 'Invalid message role in history.' };
    }

    if (role !== 'user' && role !== 'assistant' && role !== 'bot') {
      return { valid: false, error: 'Invalid message role in history.' };
    }

    const normalizedRole = role === 'bot' ? 'assistant' : role;
    const rawContent = item.content ?? item.text;
    if (typeof rawContent !== 'string') {
      return { valid: false, error: 'History message content must be a string.' };
    }

    const content = rawContent.trim();
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: 'History message content exceeds maximum length.' };
    }

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_HISTORY_LENGTH) {
      return { valid: false, error: 'Total history length exceeds maximum limit.' };
    }

    sanitized.push({
      role: normalizedRole,
      content
    });
  }

  const bounded = sanitized.slice(-MAX_HISTORY_MESSAGES_KEPT);
  return { valid: true, sanitized: bounded };
}

/**
 * POST /api/chat
 * Free-form Q&A endpoint grounded in company knowledge.
 */
chatRouter.post('/', async (req, res) => {
  const requestStartTime = performance.now();

  try {
    const { message, history, lang } = req.body || {};

    // 1. Validate Current Message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string.'
      });
    }

    const cleanMessage = message.trim();
    if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message is too long. Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`
      });
    }

    // 2. Fast check for friendly greetings
    if (isGreeting(cleanMessage)) {
      const userIsArabic = lang === 'ar' || isArabic(cleanMessage);
      const greetingAnswer = userIsArabic
        ? 'أهلاً بك! أنا المساعد الذكي لشركة Kernel Panic. يسعدني مساعدتك في الإجابة عن خدماتنا في الأمن السيبراني، الشبكات وتجهيز السيرفرات، تطوير البرمجيات المخصصة، والدورات والتدريب التقني. كيف يمكنني مساعدتك؟'
        : 'Hello! I am the Kernel Panic AI Assistant. I can help answer your questions about our services in Cybersecurity, Networking & Server Infrastructure, Custom Software Development, and Professional Training. How can I assist you today?';

      const totalMs = Math.round(performance.now() - requestStartTime);
      return res.json({
        answer: greetingAnswer,
        sources: [],
        cannotAnswer: false,
        timing: {
          retrievalMs: 0,
          generationMs: 1,
          totalMs
        }
      });
    }

    // 3. Validate and Bound History
    const historyValidation = validateHistory(history);
    if (!historyValidation.valid) {
      return res.status(400).json({
        error: historyValidation.error
      });
    }

    const sanitizedHistory = historyValidation.sanitized || [];

    if (sanitizedHistory.length > 0) {
      const lastItem = sanitizedHistory[sanitizedHistory.length - 1];
      if (lastItem.role === 'user' && lastItem.content === cleanMessage) {
        sanitizedHistory.pop();
      }
    }

    // 4. Retrieve relevant company context via RAG
    const retrieval = await retrieveContext(cleanMessage);
    const retrievalMs = retrieval.retrievalMs || 0;

    // 5. If no relevant knowledge found, respond with concise inability message
    if (!retrieval.hasRelevantKnowledge || !retrieval.chunks || retrieval.chunks.length === 0) {
      const userIsArabic = lang === 'ar' || isArabic(cleanMessage);
      const refusalMessage = userIsArabic
        ? 'عذرًا، هذه المعلومة غير متوفرة في قاعدة معرفتنا حالياً. يمكنك التواصل مع فريق Kernel Panic مباشرة لمساعدتك.'
        : 'Sorry, this information is not available in our knowledge base right now. Please contact the Kernel Panic team directly if you need assistance.';

      const totalMs = Math.round(performance.now() - requestStartTime);
      res.setHeader('Server-Timing', `retrieval;dur=${retrievalMs}, generation;dur=0, total;dur=${totalMs}`);

      return res.json({
        answer: refusalMessage,
        sources: [],
        cannotAnswer: true,
        timing: {
          retrievalMs,
          generationMs: 0,
          totalMs
        }
      });
    }

    // 6. Generate grounded answer via Groq LLM (or automatic local knowledge fallback)
    const { answer, generationMs, cannotAnswer } = await generateAnswer(
      cleanMessage,
      retrieval.contextText,
      sanitizedHistory,
      lang
    );

    const sources = Array.from(new Set(retrieval.chunks.map((c) => c.title || c.source))).filter(Boolean);
    const totalMs = Math.round(performance.now() - requestStartTime);
    res.setHeader('Server-Timing', `retrieval;dur=${retrievalMs}, generation;dur=${generationMs || 0}, total;dur=${totalMs}`);

    return res.json({
      answer,
      sources,
      cannotAnswer: Boolean(cannotAnswer),
      timing: {
        retrievalMs,
        generationMs: generationMs || 0,
        totalMs
      }
    });
  } catch (err) {
    console.error('[ChatAPI] Error processing chat request:', err);

    const totalMs = Math.round(performance.now() - requestStartTime);
    const userMessage = req.body?.message || '';
    const userIsArabic = req.body?.lang === 'ar' || isArabic(userMessage);

    const fallbackErrorMessage = userIsArabic
      ? 'عذرًا، نواجه صعوبة في معالجة طلبك حاليًا. يرجى التواصل مع فريق العمل مباشرة لمساعدتك.'
      : "Sorry, I'm having trouble processing your request right now. Please reach out to our team directly.";

    return res.json({
      answer: fallbackErrorMessage,
      cannotAnswer: true,
      sources: [],
      timing: {
        retrievalMs: 0,
        generationMs: 0,
        totalMs
      }
    });
  }
});
