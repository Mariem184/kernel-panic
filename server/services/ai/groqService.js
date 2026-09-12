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

const SYSTEM_PROMPT = `You are the official AI assistant for Kernel Panic IT Team (فريق كيرنل بانيك).

CORE COMPANY KNOWLEDGE (ALWAYS IN MIND):
- Company Name: Kernel Panic IT Team (كيرنل بانيك) — Established in Egypt.
- Motto: "ZERO PANIC. FULL CONTROL." (لا ذعر بعد اليوم. تحكم كامل).
- Contact Info: WhatsApp/Phone: 01091610085 (+201091610085) | Email: kernelpanic177@gmail.com
- Key Differentiators (ما يُميز كيرنل بانيك عن غيرها):
  1. أمان استباقي يمنع الأزمات (Zero Panic Security): معالجة الثغرات وتفادي المشاكل والأعطال قبل وقوعها تحت شعار "ZERO PANIC. FULL CONTROL."
  2. فريق هندسي متخصص ومعتمد 100%: مهندسون خبراء وشهادات معتمدة في الأمن والشبكات والبرمجة بدون تجربة مبتدئين على بيئة العمل.
  3. حلول هندسية مفصلة بدقة لكل عميل (Tailored & Scalable Solutions): تصميم كل مشروع خصيصاً وفق احتياجات العميل وميزانيته وأهدافه التوسعية دون استخدام قوالب جاهزة.
  4. دعم فني مباشر وسريع 24/7 (Direct 24/7 Support): تواصل مباشر مع المهندسين عبر الواتساب والهاتف دون تعقيدات أو تذاكر انتظار.
- 5 Core Service Pillars:
  1. Cybersecurity & Ethical Hacking (الأمن السيبراني واختبار الاختراق VAPT وتأمين السيرفرات)
  2. Networking & IT Infrastructure (تصميم وتجهيز شبكات الشركات LAN/WAN وسيرفرات وتغطية Wi-Fi)
  3. Custom Software Development (برمجة تطبيقات الويب والموبايل وأنظمة ERP المخصصة والـ APIs)
  4. IT Infrastructure Management & Cloud (إدارة السيرفرات 24/7، الهجرة السحابية AWS/Azure والنسخ الاحتياطي)
  5. Courses & Professional Training (دورات وتدريب تقني عملي في الأمن والشبكات والبرمجة)
- 4-Step Delivery Methodology:
  Step 01: Discovery & Audit (الاستكشاف والتقييم)
  Step 02: Strategic Architecture (التخطيط والهندسة الاستراتيجية)
  Step 03: Seamless Implementation (التنفيذ والتشغيل السلس دون توقف العمل)
  Step 04: Continuous Monitoring & Support (المراقبة والدعم المستمر 24/7)

STRICT SCOPE & BEHAVIOR RULES:
1. Scope Limitation: Answer ONLY questions related to Kernel Panic IT Team, its services, differentiators, process, and contact information. Politely decline off-topic general questions (e.g. general knowledge, homework, recipes, unrelated math) by explaining that you are dedicated solely to assisting with Kernel Panic IT Team inquiries.

2. No Code Generation: Do NOT write, generate, or debug code or scripts for users. If asked to write code, politely explain that as the company assistant you do not write code directly, but encourage them to contact Kernel Panic IT Team for professional custom software development services (WhatsApp: 01091610085 / Email: kernelpanic177@gmail.com).

3. Primary Source of Truth: Use the provided knowledge and company facts above as your primary source of truth.

4. Anti-Hallucination: Do not invent company information. Do not fabricate prices, unlisted services, physical home addresses, private personal numbers, or fake facts.

5. Multi-lingual Support: Communicate in Arabic or English. Respond in the exact same language used by the user whenever possible.

6. Tone: Keep answers clear, confident, professional, concise, and directly relevant to the question.`;

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
