import Groq from 'groq-sdk';
import { config } from '../../config/env.js';

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    if (!config.groq.apiKey) {
      throw new Error('GROQ_API_KEY is not configured in backend environment variables.');
    }
    groqClient = new Groq({
      apiKey: config.groq.apiKey,
      timeout: 25000,
      maxRetries: 2
    });
  }
  return groqClient;
}

const SYSTEM_PROMPT = `You are the official AI assistant for Kernel Panic IT Team website.

Your job is to answer questions about the company, its services, products, processes, contact information, and other information contained in the provided company knowledge.

Use the provided knowledge as the primary source of truth.

Do not invent company information.

Do not fabricate prices, services, addresses, employees, policies, capabilities, or other facts.

If the requested information is not present in the available company knowledge, clearly explain that you do not have enough information and recommend contacting the company when appropriate (WhatsApp: 01091610085 / Email: kernelpanic177@gmail.com).

You can communicate in Arabic or English.

Respond in the same language used by the user whenever possible.

Keep answers clear, professional, and directly relevant to the question.`;

/**
 * Generates an answer using Groq's LLM with RAG context and session history.
 *
 * @param {string} userMessage
 * @param {string} retrievedContext
 * @param {Array<{ sender: 'user' | 'bot', text: string }>} history
 * @returns {Promise<{ answer: string, model: string }>}
 */
export async function generateAnswer(userMessage, retrievedContext = '', history = [], lang = 'en') {
  const client = getGroqClient();

  const isAr = lang === 'ar' || /[\u0600-\u06FF]/.test(userMessage);

  // Construct message array
  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT
    }
  ];

  if (isAr) {
    messages.push({
      role: 'system',
      content: `[LANGUAGE MANDATE]: The user is interacting in ARABIC (اللغة العربية). You MUST write your entire response in clear, professional Arabic. Format technical terms cleanly in Arabic with English terms in parentheses if necessary. Do NOT answer in English.`
    });
  }

  // If we have retrieved company context, inject it
  if (retrievedContext && retrievedContext.trim()) {
    messages.push({
      role: 'system',
      content: `[VERIFIED COMPANY KNOWLEDGE BASE]:\n${retrievedContext}\n\nUse the above knowledge base to answer the user's question.`
    });
  } else {
    messages.push({
      role: 'system',
      content: `[NOTICE]: No specific knowledge chunks directly matched this query with high confidence. Answer strictly using verified Kernel Panic general information, or if unsure, politely clarify that the specific detail is not available and advise contacting WhatsApp: 01091610085 or Email: kernelpanic177@gmail.com.`
    });
  }

  // Include recent conversation history (up to last 6 messages) for multi-turn coherence
  if (Array.isArray(history) && history.length > 0) {
    const recentHistory = history.slice(-6);
    for (const item of recentHistory) {
      if (item.text && item.sender) {
        messages.push({
          role: item.sender === 'user' ? 'user' : 'assistant',
          content: String(item.text).slice(0, 1000)
        });
      }
    }
  }

  // Append current user message
  messages.push({
    role: 'user',
    content: userMessage
  });

  const primaryModel = config.groq.model;
  const fallbackModel = primaryModel === 'openai/gpt-oss-120b' ? 'openai/gpt-oss-20b' : 'openai/gpt-oss-120b';

  try {
    const completion = await client.chat.completions.create({
      model: primaryModel,
      messages,
      temperature: 0.3,
      max_tokens: 800,
      top_p: 0.9
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() || '';
    return {
      answer,
      model: primaryModel
    };
  } catch (err) {
    console.warn(`[GroqService] Primary model ${primaryModel} failed (${err.message}). Attempting fallback to ${fallbackModel}...`);
    try {
      const fallbackCompletion = await client.chat.completions.create({
        model: fallbackModel,
        messages,
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.9
      });
      const answer = fallbackCompletion.choices?.[0]?.message?.content?.trim() || '';
      return {
        answer,
        model: fallbackModel
      };
    } catch (fallbackErr) {
      console.error('[GroqService] Both primary and fallback models failed:', fallbackErr);
      throw fallbackErr;
    }
  }
}
