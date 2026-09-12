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

    // 1. Add user message
    this.addMessage('user', text);
    this.userInput = '';
    this.isTyping = true;
    this.cdr.markForCheck();

    // 2. Prepare conversation history for backend context
    const history: ChatMessagePayload[] = this.messages
      .slice(-6)
      .map((m) => ({ sender: m.sender, text: m.text }));

    const currentLang = this.ts.currentLang();

    // 3. Send to AI backend
    this.chatService.sendMessage(text, history, currentLang).subscribe({
      next: (res) => {
        this.isTyping = false;
        const answer = res.answer || '';

        // Check if contact info or WhatsApp is mentioned to provide a direct CTA button
        let actionLink: string | undefined;
        let actionText: string | undefined;

        if (answer.includes('01091610085') || answer.includes('واتساب') || answer.includes('WhatsApp')) {
          actionLink = 'https://wa.me/201091610085';
          actionText = this.ts.currentLang() === 'ar' ? 'تواصل عبر واتساب (01091610085) 💬' : 'Chat on WhatsApp (01091610085) 💬';
        } else if (answer.includes('kernelpanic177@gmail.com') || answer.includes('بريد') || answer.includes('email')) {
          actionLink = 'mailto:kernelpanic177@gmail.com';
          actionText = this.ts.currentLang() === 'ar' ? 'راسلنا عبر البريد الإلكتروني ✉️' : 'Send Email ✉️';
        }

        this.addMessage('bot', answer, actionLink, actionText);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isTyping = false;
        console.error('[Chatbot] AI request failed:', err);

        const isAr = this.ts.currentLang() === 'ar' || /[\u0600-\u06FF]/.test(text);
        const errorText = isAr
          ? 'عذرًا، نواجه صعوبة في معالجة طلبك حاليًا. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة عبر واتساب: 01091610085'
          : "Sorry, I'm having trouble processing your request right now. Please try again or reach out to our team directly on WhatsApp: 01091610085";

        this.addMessage(
          'bot',
          errorText,
          'https://wa.me/201091610085',
          isAr ? 'تواصل مباشرة عبر واتساب 💬' : 'Chat on WhatsApp 💬',
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
