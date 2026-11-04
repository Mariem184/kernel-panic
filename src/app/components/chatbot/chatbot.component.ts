import { Component, ElementRef, ViewChild, inject, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';
import { ChatService, ChatMessagePayload } from '../../services/chat.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  time: string;
  actionLink?: string;
  actionText?: string;
  isError?: boolean;
}

interface QuickSuggestion {
  label: string;
  query: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  public ts = inject(TranslationService);
  private chatService = inject(ChatService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  unreadCount = 1;
  userInput = '';
  isTyping = false;

  messages: ChatMessage[] = [];

  constructor() {
    effect(() => {
      const currentLang = this.ts.currentLang();
      if (this.messages.length <= 1) {
        this.messages = [
          {
            sender: 'bot',
            text: this.ts.t('chatbot.welcome'),
            time: this.getCurrentTime()
          }
        ];
        this.cdr.markForCheck();
      }
    });
  }

  get quickSuggestions(): QuickSuggestion[] {
    const isAr = this.ts.currentLang() === 'ar';
    return isAr
      ? [
          {
            label: 'طلب استشارة مجانية 🚀',
            query: 'كيف يمكنني حجز استشارة مجانية لمشروعي؟'
          },
          {
            label: 'الأمن السيبراني 🛡️',
            query: 'ما هي خدمات الأمن السيبراني واختبار الاختراق التي تقدمونها؟'
          },
          {
            label: 'تطوير البرمجيات 💻',
            query: 'ما هي حلولكم في تطوير وتصميم البرمجيات وتطبيقات الويب والموبايل؟'
          },
          {
            label: 'الدورات والتدريب 🎓',
            query: 'هل تقدمون دورات تدريبية تقنية وما هي المجالات المتاحة؟'
          }
        ]
      : [
          {
            label: 'Free Consultation 🚀',
            query: 'How can I request a free consultation for my business?'
          },
          {
            label: 'Cybersecurity 🛡️',
            query: 'What cybersecurity and penetration testing services do you offer?'
          },
          {
            label: 'Software Development 💻',
            query: 'What custom software and web/mobile development solutions do you build?'
          },
          {
            label: 'Professional Training 🎓',
            query: 'Do you offer technical courses and training certifications?'
          }
        ];
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => {
        this.scrollToBottom();
        this.cdr.markForCheck();
      }, 100);
    }
    this.cdr.markForCheck();
  }

  sendMessage(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const text = this.userInput.trim();
    if (!text || this.isTyping) return;

    // 1. Prepare conversation history for backend context (prior messages)
    const history: ChatMessagePayload[] = this.messages
      .slice(-6)
      .map((m) => ({ sender: m.sender, text: m.text }));

    // 2. Add user message to UI
    this.addMessage('user', text);
    this.userInput = '';
    this.isTyping = true;
    this.cdr.markForCheck();

    const currentLang = this.ts.currentLang();

    // 3. Send to AI backend
    this.chatService.sendMessage(text, history, currentLang).subscribe({
      next: (res) => {
        this.isTyping = false;
        const answer = res.answer || '';

        // البوكس الخاص بالواتساب يظهر فقط إذا لم تتوفر معلومة أو عجز المساعد عن الرد
        let actionLink: string | undefined;
        let actionText: string | undefined;

        const isUnanswered = res.cannotAnswer || this.isUnableToAnswer(answer);

        if (isUnanswered) {
          actionLink = 'https://wa.me/201507316744';
          actionText =
            this.ts.currentLang() === 'ar'
              ? 'تواصل مع الفريق عبر واتساب (01507316744) 💬'
              : 'Chat on WhatsApp (01507316744) 💬';
        }

        this.addMessage('bot', answer, actionLink, actionText);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isTyping = false;
        console.error('[Chatbot] AI request failed:', err);

        const isAr = this.ts.currentLang() === 'ar' || /[\u0600-\u06FF]/.test(text);
        const errorText = isAr
          ? 'عذرًا، نواجه صعوبة في معالجة طلبك حاليًا. يرجى التواصل مع فريق العمل مباشرة لمساعدتك.'
          : "Sorry, I'm having trouble processing your request right now. Please reach out to our team directly.";

        // في حالة الخطأ أو العجز عن الرد يظهر بوكس الواتساب
        this.addMessage(
          'bot',
          errorText,
          'https://wa.me/201507316744',
          isAr ? 'تواصل مع الفريق عبر واتساب (01507316744) 💬' : 'Chat on WhatsApp (01507316744) 💬',
          true
        );
        this.cdr.markForCheck();
      }
    });
  }

  handleSuggestion(chip: QuickSuggestion): void {
    if (this.isTyping) return;
    this.userInput = chip.query;
    this.sendMessage();
  }

  /**
   * يفحص ما إذا كان رد المساعد يعبر عن عدم توفر المعلومة أو العجز عن الإجابة
   */
  private isUnableToAnswer(answer: string): boolean {
    if (!answer) return true;
    const lower = answer.toLowerCase();

    const arabicPatterns = [
      /مش (عندي|متاحة|متوفرة|موجودة)/,
      /غير (متاحة|متوفرة|موجودة)/,
      /لا (أملك|أمتلك|نملك|تتوفر|يتوفر|يوجد|أستطيع|يمكنني|أعرف)/,
      /ليس (لدي|لدينا|عندي)/,
      /ما عندي/,
      /خارج (نطاق|معرفتي|اختصاص)/,
      /عجزت? عن/,
      /غير قادر/,
      /صعوبة في معالجة/,
      /نواجه صعوبة/
    ];

    const englishPatterns = [
      /not available/,
      /don't have|do not have|does not have/,
      /no information/,
      /unable to (answer|help|provide|process)/,
      /cannot (answer|help|provide|assist)/,
      /outside (the scope|my knowledge|our knowledge)/,
      /trouble processing/
    ];

    return (
      arabicPatterns.some((pattern) => pattern.test(answer)) ||
      englishPatterns.some((pattern) => pattern.test(lower))
    );
  }

  private addMessage(
    sender: 'bot' | 'user',
    text: string,
    actionLink?: string,
    actionText?: string,
    isError?: boolean
  ): void {
    this.messages = [
      ...this.messages,
      {
        sender,
        text,
        time: this.getCurrentTime(),
        actionLink,
        actionText,
        isError
      }
    ];
    this.cdr.markForCheck();
    setTimeout(() => {
      this.scrollToBottom();
      this.cdr.markForCheck();
    }, 50);
  }

  isArabicText(text: string | undefined | null): boolean {
    if (!text) return false;
    return /[\u0600-\u06FF]/.test(text);
  }

  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }
}
