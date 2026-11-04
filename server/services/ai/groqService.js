import Groq from 'groq-sdk';
import { config } from '../../config/env.js';

let groqClient = null;

export function getGroqClient() {
  if (!config.groq.apiKey) {
    return null;
  }
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: config.groq.apiKey,
      timeout: config.groq.timeoutMs || 10000,
      maxRetries: 1
    });
  }
  return groqClient;
}

export function _setGroqClientForTesting(client) {
  groqClient = client;
}

export function _resetGroqClientForTesting() {
  groqClient = null;
}

export const SYSTEM_PROMPT = `You are the official AI Assistant for Kernel Panic IT Team (كيرنل بانيك), a leading IT, cybersecurity, networking, and custom software company in Egypt.

1. STRICT BREVITY & CONCISE RESPONSES (MANDATORY & TOP PRIORITY):
- الإيجاز الشديد والرد السريع المختصر:
  * يجب أن تكون جميع إجاباتك سريعة، مختصرة جداً، ومركزة في صلب الموضوع (في حدود سطرين إلى 4 أسطر أو 2-3 نقاط سريعة كحد أقصى).
  * أجب مباشرة وبدقة عن السؤال الذي طرحه المستخدم فقط، دون مقدمات إنشائية ودون تكرار الترحيب في كل رد.
  * ممنوع منعاً باتاً سرد جميع خدمات الشركة أو استعراض خطوات العمل إلا إذا طلب العميل ذلك صراحة.
  * لا تكتب فقرات طويلة أو مقالات نهائياً.

2. WHATSAPP & CONTACT DETAILS POLICY (STRICT RULE):
- ممنوع ذكر رقم الواتساب (01507316744) أو بيانات التواصل أو روابط الدعم في الردود العادية على الإطلاق!
- اذكر بيانات التواصل فقط في حالتين حصرياً:
  1) إذا سأل العميل صراحة عن رقم الواتساب أو طريقة التواصل أو حجز استشارة.
  2) إذا كانت المعلومة المطلوبة غير متوفرة لديك في قاعدة المعرفة أو عجزت عن إجابته؛ حينها وضح بلباقة أن المعلومة غير متاحة ووجهه للتواصل مع فريق Kernel Panic مباشرة لمساعدته.

3. GROUNDING & KNOWLEDGE BOUNDARIES:
- Your ONLY source of truth is the verified company knowledge provided in context.
- Never guess, extrapolate, or fabricate prices, features, or services.
- If information is not available in the company knowledge, say briefly and politely that the information is not available:
  "المعلومة دي مش متاحة عندي حالياً. تقدر تتواصل مع فريق Kernel Panic مباشرة وهيساعدوك بكل التفاصيل."
  Or in English:
  "I don't have this information right now. Please reach out to the Kernel Panic team directly and they will be glad to assist you."

4. LANGUAGE:
- Respond in the exact language of the user: Arabic (clear, natural Egyptian/Standard Arabic) or English.
- Do NOT mix languages unnecessarily.

5. FORMATTING & CODE RESTRICTION:
- Never use Markdown tables (| Table |).
- Do not write or generate programming code.`;

/**
 * Checks if the answer indicates lack of information or inability to answer.
 */
export function checkIfCannotAnswer(answer) {
  if (!answer) return true;
  const lower = answer.toLowerCase();

  const patterns = [
    /مش (عندي|متاحة|متوفرة|موجودة)/,
    /غير (متاحة|متوفرة|موجودة)/,
    /لا (أملك|أمتلك|نملك|تتوفر|يتوفر|يوجد|أستطيع|يمكنني|أعرف)/,
    /ليس (لدي|لدينا|عندي)/,
    /ما عندي/,
    /خارج (نطاق|معرفتي|اختصاص)/,
    /عجزت? عن/,
    /غير قادر/,
    /صعوبة في معالجة/,
    /نواجه صعوبة/,
    /not available/,
    /don't have|do not have|does not have/,
    /no information/,
    /unable to (answer|help|provide|process)/,
    /cannot (answer|help|provide|assist)/,
    /outside (the scope|my knowledge|our knowledge)/,
    /trouble processing/
  ];

  return patterns.some((p) => p.test(patterns[0].test(answer) ? answer : lower));
}

/**
 * Synthesizes a concise grounded response directly from knowledge chunks
 * when Groq API key is not yet configured or temporarily unavailable.
 */
export function synthesizeLocalKnowledgeAnswer(query, retrievedContext = '', lang = 'en') {
  const isAr = lang === 'ar' || /[\u0600-\u06FF]/.test(query);

  if (!retrievedContext || !retrievedContext.trim()) {
    return isAr
      ? 'عذرًا، هذه المعلومة غير متوفرة في قاعدة معرفتنا حالياً. يمكنك التواصل مع فريق Kernel Panic مباشرة لمساعدتك.'
      : 'Sorry, this information is not available in our knowledge base right now. Please contact the Kernel Panic team directly if you need assistance.';
  }

  const raw = retrievedContext.trim();

  // If chunk has English and Arabic sections, extract the matching one
  if (isAr && raw.includes('### التفاصيل بالعربية')) {
    const section = raw.split('### التفاصيل بالعربية')[1].split('---')[0];
    const lines = section
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .slice(0, 4);
    if (lines.length > 0) return lines.join('\n');
  } else if (!isAr && raw.includes('### English Details')) {
    const section = raw.split('### English Details')[1].split('###')[0].split('---')[0];
    const lines = section
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .slice(0, 4);
    if (lines.length > 0) return lines.join('\n');
  }

  // General clean lines extraction
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('---') && !l.startsWith('#'))
    .slice(0, 4);

  return lines.join('\n') || (isAr ? 'نحن متخصصون في حلول تكنولوجيا المعلومات والأمن السيبراني والبنية التحتية.' : 'We specialize in IT solutions, cybersecurity, infrastructure, and custom software.');
}

/**
 * Constructs the final messages array sent to the model.
 */
export function buildMessagesArray(userMessage, retrievedContext = '', history = [], lang = 'en') {
  const isAr = lang === 'ar' || /[\u0600-\u06FF]/.test(userMessage);

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT
    }
  ];

  if (isAr) {
    messages.push({
      role: 'system',
      content: `[LANGUAGE & BREVITY MANDATE]: أجب باللغة العربية باختصار شديد وسرعة ودقة (سطرين إلى 4 أسطر فقط). لا تسرد كل الخدمات، ولا تذكر رقم الواتساب إلا إذا سأل عنه أو كانت المعلومة غير متوفرة.`
    });
  } else {
    messages.push({
      role: 'system',
      content: `[LANGUAGE & BREVITY MANDATE]: Respond in English with strict brevity (2 to 4 lines max). Do not dump unrequested services. Do NOT append WhatsApp unless explicitly requested or when info is unavailable.`
    });
  }

  if (retrievedContext && retrievedContext.trim()) {
    messages.push({
      role: 'system',
      content: `[VERIFIED COMPANY KNOWLEDGE BASE]:\n${retrievedContext.trim()}\n\nAnswer the user's question concisely using ONLY the verified knowledge above.`
    });
  }

  if (Array.isArray(history) && history.length > 0) {
    const recentHistory = history.slice(-6);
    for (const item of recentHistory) {
      const role = item.role || (item.sender === 'user' ? 'user' : 'assistant');
      const content = item.content ?? item.text ?? '';
      if ((role === 'user' || role === 'assistant') && content) {
        messages.push({
          role,
          content: String(content).slice(0, 1000)
        });
      }
    }
  }

  messages.push({
    role: 'user',
    content: userMessage
  });

  return messages;
}

/**
 * Generates a concise, fast answer using Groq LLM with automatic graceful local fallback.
 */
export async function generateAnswer(userMessage, retrievedContext = '', history = [], lang = 'en') {
  const startTime = performance.now();
  const client = getGroqClient();

  // If no Groq API Key is configured yet, synthesize response from local knowledge
  if (!client) {
    console.info('[GroqService] No GROQ_API_KEY provided; answering directly from verified local knowledge base.');
    const answer = synthesizeLocalKnowledgeAnswer(userMessage, retrievedContext, lang);
    const cannotAnswer = checkIfCannotAnswer(answer);
    return {
      answer,
      model: 'local-knowledge-engine',
      generationMs: Math.round(performance.now() - startTime),
      cannotAnswer
    };
  }

  const messages = buildMessagesArray(userMessage, retrievedContext, history, lang);
  const primaryModel = config.groq.model || 'llama-3.1-8b-instant';
  const fallbackModel = primaryModel === 'llama-3.1-8b-instant' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';

  const completionOptions = {
    messages,
    temperature: 0.2,
    max_tokens: config.groq.maxTokens || 220,
    top_p: 0.9
  };

  try {
    const completion = await client.chat.completions.create({
      model: primaryModel,
      ...completionOptions
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() || '';
    const generationMs = Math.round(performance.now() - startTime);
    const cannotAnswer = checkIfCannotAnswer(answer);

    return {
      answer,
      model: primaryModel,
      generationMs,
      cannotAnswer
    };
  } catch (err) {
    console.warn(`[GroqService] Primary model ${primaryModel} failed (${err.message}). Trying fallback model ${fallbackModel}...`);
    try {
      const fallbackCompletion = await client.chat.completions.create({
        model: fallbackModel,
        ...completionOptions
      });
      const answer = fallbackCompletion.choices?.[0]?.message?.content?.trim() || '';
      const generationMs = Math.round(performance.now() - startTime);
      const cannotAnswer = checkIfCannotAnswer(answer);

      return {
        answer,
        model: fallbackModel,
        generationMs,
        cannotAnswer
      };
    } catch (fallbackErr) {
      console.warn('[GroqService] Groq API unavailable; falling back to local knowledge base:', fallbackErr.message);
      const answer = synthesizeLocalKnowledgeAnswer(userMessage, retrievedContext, lang);
      const cannotAnswer = checkIfCannotAnswer(answer);
      return {
        answer,
        model: 'local-knowledge-engine',
        generationMs: Math.round(performance.now() - startTime),
        cannotAnswer
      };
    }
  }
}
