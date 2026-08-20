import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  time: string;
  actionLink?: string;
  actionText?: string;
}

interface QuickSuggestion {
  label: string;
  query: string;
  response: string;
  link?: string;
  linkText?: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  public ts = inject(TranslationService);
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  unreadCount = 1;
  userInput = '';
  isTyping = false;

  messages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'مرحبًا بك في Kernel Panic IT Team! 👋 كيف يمكننا مساعدتك اليوم؟ يمكنك الاستفسار عن خدماتنا في الأمن السيبراني، تطوير البرمجيات، الشبكات والتدريب، أو حجز استشارة مجانية.',
      time: this.getCurrentTime()
    }
  ];

  get quickSuggestions(): QuickSuggestion[] {
    const isAr = this.ts.currentLang() === 'ar';
    return isAr ? [
      {
        label: 'طلب استشارة مجانية 🚀',
        query: 'أريد طلب استشارة مجانية',
        response: 'يسعدنا خدمتك! يمكنك التواصل مباشرة مع مهندسينا لحجز استشارتك المجانية:',
        link: 'https://wa.me/201091610085?text=مرحبا%20أريد%20طلب%20استشارة%20مجانية',
        linkText: 'تواصل الآن عبر واتساب (01091610085) 💬'
      },
      {
        label: 'الأمن السيبراني 🛡️',
        query: 'ما هي خدمات الأمن السيبراني؟',
        response: 'نوفر حلول حماية متكاملة للأنظمة، فحص الثغرات (Penetration Testing)، وتأمين البنية الرقمية لحماية بيانات شركتك من أي اختراق.',
        link: '#services',
        linkText: 'استكشف خدمات الأمان'
      },
      {
        label: 'تطوير البرمجيات 💻',
        query: 'ما هي حلول تطوير البرمجيات؟',
        response: 'نقوم بتصميم وتطوير مواقع وتطبيقات ويب وموبايل مخصصة، وأنظمة ERP وإدارة متكاملة تلبي أهداف عملك بدقة واحترافية.',
        link: '#services',
        linkText: 'ابدأ مشروعك البرمجي'
      },
      {
        label: 'الدورات والتدريب 🎓',
        query: 'هل تقدمون برامج تدريبية؟',
        response: 'نعم! نقدم دورات تدريب تقنية عملية ومكثفة لتأهيل الكوادر لسوق العمل في الشبكات والبرمجة والأمن السيبراني.',
        link: 'https://wa.me/201091610085?text=مرحبا%20استفسر%20عن%20الدورات%20والتدريب',
        linkText: 'استفسر عن الدورات المتاحة'
      }
    ] : [
      {
        label: 'Free Consultation 🚀',
        query: 'I would like a free consultation',
        response: 'We are delighted to assist you! Connect directly with our engineers:',
        link: 'https://wa.me/201091610085?text=Hello%20I%20want%20a%20free%20consultation',
        linkText: 'Chat on WhatsApp (01091610085) 💬'
      },
      {
        label: 'Cybersecurity 🛡️',
        query: 'What cybersecurity services do you offer?',
        response: 'We deliver penetration testing, vulnerability assessments, firewall hardening, and comprehensive infrastructure security.',
        link: '#services',
        linkText: 'Explore Security Services'
      },
      {
        label: 'Software Development 💻',
        query: 'Tell me about software development',
        response: 'We build custom web platforms, mobile apps, and scalable business software tailored to your workflows.',
        link: '#services',
        linkText: 'Start Your Software Project'
      },
      {
        label: 'Professional Training 🎓',
        query: 'Do you offer technical courses?',
        response: 'Yes! Practical, hands-on training in ethical hacking, networking, and software engineering.',
        link: 'https://wa.me/201091610085?text=Hello%20inquiry%20about%20training',
        linkText: 'Explore Courses'
      }
    ];
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const text = this.userInput.trim();
    if (!text) return;

    this.addMessage('user', text);
    this.userInput = '';
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;
      this.generateBotResponse(text);
    }, 300);
  }

  handleSuggestion(chip: QuickSuggestion): void {
    this.addMessage('user', chip.query);
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;
      this.addMessage('bot', chip.response, chip.link, chip.linkText);
    }, 250);
  }

  private generateBotResponse(text: string): void {
    const raw = text.toLowerCase();
    const isEnglish = /^[a-zA-Z0-9\s.,!?'"-_]+$/.test(text);

    // Normalize Arabic letters
    const norm = raw
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي');

    // 1. Greetings
    if (norm.match(/^(سلام|مرحبا|اهلا|ازيك|صباح|مساء|هاي|الو|hello|hi|hey|welcome)/i) || norm.includes('السلام عليكم')) {
      if (isEnglish) {
        this.addMessage(
          'bot',
          'Hello! 👋 Welcome to Kernel Panic IT Team. How can we help you today with cybersecurity, custom software, networking, or corporate training?',
          'https://wa.me/201091610085',
          'Chat on WhatsApp'
        );
      } else {
        this.addMessage(
          'bot',
          'أهلاً بك! 👋 يسعدنا تواصلك مع فريق Kernel Panic IT Team. كيف نقدر نساعدك اليوم؟ سواء كنت مهتمًا بالأمن السيبراني، تطوير البرمجيات، الشبكات، أو التدريب، نحن في خدمتك!',
          'https://wa.me/201091610085',
          'محادثة مباشرة عبر واتساب'
        );
      }
    }
    // 2. Phone, WhatsApp, Contact
    else if (norm.includes('واتس') || norm.includes('رقم') || norm.includes('تليفون') || norm.includes('فون') || norm.includes('موبايل') || norm.includes('تواصل') || norm.includes('اتصال') || norm.includes('phone') || norm.includes('whatsapp') || norm.includes('call') || norm.includes('contact')) {
      this.addMessage(
        'bot',
        isEnglish ? 'You can connect directly with our engineering team on WhatsApp or phone: 01091610085' : 'يسعدنا تواصلك المباشر مع فريقنا عبر الواتساب أو الاتصال على الرقم: 01091610085',
        'https://wa.me/201091610085',
        isEnglish ? 'Open WhatsApp Chat (01091610085)' : 'فتح المحادثة على واتساب (01091610085)'
      );
    }
    // 3. Email & Messages
    else if (norm.includes('ايميل') || norm.includes('بريد') || norm.includes('ميل') || norm.includes('email') || norm.includes('mail')) {
      this.addMessage(
        'bot',
        isEnglish ? 'You can email us directly at: kernelpanic177@gmail.com' : 'يمكنك مراسلتنا مباشرة على بريدنا الإلكتروني الرسمي: kernelpanic177@gmail.com أو إرسال استفسارك وسنرد عليك فورًا.',
        'mailto:kernelpanic177@gmail.com',
        isEnglish ? 'Send Email Now' : 'إرسال بريد إلكتروني الآن'
      );
    }
    // 4. Cybersecurity & Ethical Hacking
    else if (norm.includes('امن') || norm.includes('سيبران') || norm.includes('حماي') || norm.includes('اختراق') || norm.includes('ثغر') || norm.includes('تهكير') || norm.includes('سكيورتي') || norm.includes('security') || norm.includes('cyber') || norm.includes('pentest') || norm.includes('firewall')) {
      this.addMessage(
        'bot',
        isEnglish ? 'We provide end-to-end cybersecurity: penetration testing, vulnerability assessment, firewall & server hardening, and 24/7 threat protection.' : 'نوفر خدمات الأمن السيبراني الاحترافية: اختبار الاختراق (Penetration Testing)، فحص وتأمين الثغرات، حماية الخوادم والبيانات، ومراقبة التهديدات الرقمية لضمان أمان شركتك بنسبة 100%.',
        'https://wa.me/201091610085?text=Hello%20I%20want%20cybersecurity%20services',
        isEnglish ? 'Book Free Security Consultation' : 'حجز استشارة أمنية مجانية'
      );
    }
    // 5. Software Development, Websites & Mobile Apps
    else if (norm.includes('برمج') || norm.includes('تطبيق') || norm.includes('موقع') || norm.includes('ويب') || norm.includes('سوفت') || norm.includes('سيستم') || norm.includes('برنامج') || norm.includes('متجر') || norm.includes('app') || norm.includes('web') || norm.includes('software') || norm.includes('code')) {
      this.addMessage(
        'bot',
        isEnglish ? 'We engineer scalable web applications, mobile apps, custom ERP systems, and cloud portals tailored to your business needs.' : 'نصمم ونطور مواقع وتطبيقات ويب وموبايل مخصصة، أنظمة ERP، ومتاجر إلكترونية عالية السرعة والأمان بأحدث التقنيات الحديثة.',
        'https://wa.me/201091610085?text=Hello%20I%20want%20software%20development',
        isEnglish ? 'Start Your Software Project' : 'ابدأ مشروعك البرمجي معنا'
      );
    }
    // 6. Networks & IT Infrastructure
    else if (norm.includes('شبك') || norm.includes('سيرفر') || norm.includes('انترنت') || norm.includes('بني') || norm.includes('راوتر') || norm.includes('سويتش') || norm.includes('infrastructure') || norm.includes('network') || norm.includes('server')) {
      this.addMessage(
        'bot',
        isEnglish ? 'We design, install, and manage enterprise network infrastructures, high-speed Wi-Fi, servers, and cloud architectures with 24/7 reliability.' : 'نقوم بتصميم وتركيب وإدارة شبكات الشركات (LAN/WAN)، الخوادم (Servers)، وغرف السيرفرات السحابية والفيزيائية مع دعم فني مستمر على مدار الساعة.',
        'https://wa.me/201091610085?text=Hello%20I%20want%20network%20infrastructure%20solutions',
        isEnglish ? 'Consult Network Engineers' : 'استشر مهندسي الشبكات'
      );
    }
    // 7. Training & Courses
    else if (norm.includes('كورس') || norm.includes('تدريب') || norm.includes('دور') || norm.includes('تعليم') || norm.includes('شهاده') || norm.includes('course') || norm.includes('training') || norm.includes('learn')) {
      this.addMessage(
        'bot',
        isEnglish ? 'We provide hands-on, career-focused training in cybersecurity, network engineering, and software development with certified instructors.' : 'نقدم دورات عملية ومكثفة مع مدربين خبراء في مجالات: الأمن السيبراني، إدارة الشبكات، وتطوير البرمجيات مع شهادات معتمدة وتطبيق عملي.',
        'https://wa.me/201091610085?text=Hello%20I%20inquire%20about%20training%20courses',
        isEnglish ? 'Course Details & Registration' : 'التفاصيل والتسجيل في الدورات'
      );
    }
    // 8. Pricing & Quotation
    else if (norm.includes('سعر') || norm.includes('اسعار') || norm.includes('تكلف') || norm.includes('بكام') || norm.includes('كام') || norm.includes('عرض') || norm.includes('استشار') || norm.includes('price') || norm.includes('cost') || norm.includes('quote') || norm.includes('consultation')) {
      this.addMessage(
        'bot',
        isEnglish ? 'We offer tailored, competitive pricing based on your exact requirements, along with a free initial consultation.' : 'نقدم استشارات مجانية أولية وعروض أسعار مخصصة تناسب حجم مشروعك وميزانيتك بدقة. تواصل معنا للحصول على عرض سعر فوري:',
        'https://wa.me/201091610085?text=Hello%20I%20want%20a%20price%20quote',
        isEnglish ? 'Request Fast Quote 🚀' : 'طلب عرض سعر فوري 🚀'
      );
    }
    // 9. About Team / Location
    else if (norm.includes('مين') || norm.includes('فريق') || norm.includes('شرك') || norm.includes('مكان') || norm.includes('عنوان') || norm.includes('مصر') || norm.includes('egypt') || norm.includes('about') || norm.includes('who') || norm.includes('kernel') || norm.includes('panic')) {
      this.addMessage(
        'bot',
        isEnglish ? 'Kernel Panic IT Team is a leading technology & cybersecurity team established in Egypt under the motto: ZERO PANIC. FULL CONTROL.' : 'Kernel Panic IT Team هو فريق تقني مصري رائد يقدم حلول التكنولوجيا المتكاملة بشعار ZERO PANIC. FULL CONTROL. لضمان تشغيل أعمالك بأعلى أمان واستقرار.',
        '#about',
        isEnglish ? 'Learn More About Us' : 'تعرف أكثر على الفريق'
      );
    }
    // 10. Thanks & Closure
    else if (norm.includes('شكر') || norm.includes('تسلم') || norm.includes('تمام') || norm.includes('اوك') || norm.includes('حبيب') || norm.includes('عاش') || norm.includes('thanks') || norm.includes('thx') || norm.includes('ok')) {
      this.addMessage(
        'bot',
        isEnglish ? 'You are most welcome! 🌟 Kernel Panic is always here for you.' : 'العفو، سعداء جدًا بخدمتك! 🌟 فريق Kernel Panic معك دائمًا. إذا احتجت أي مساعدة أو استفسار في أي وقت، لا تتردد في مراسلتنا.',
        'https://wa.me/201091610085',
        isEnglish ? 'Chat on WhatsApp' : 'تواصل معنا عبر واتساب'
      );
    }
    // 11. Smart Instant Fallback for ANY other input
    else {
      const encodedQuery = encodeURIComponent(text);
      this.addMessage(
        'bot',
        isEnglish 
          ? `Thank you for reaching out! We received your inquiry: "${text}". Our engineering team is ready to assist you right away:`
          : `أهلاً بك! لقد استلمنا رسالتك: "${text}". فريق Kernel Panic جاهز لمساعدتك وتقديم الحل التقني الأنسب لاحتياجاتك فورًا. تفضل بمتابعة التفاصيل معنا:`,
        `https://wa.me/201091610085?text=${encodedQuery}`,
        isEnglish ? 'Chat Directly with Engineer on WhatsApp 💬' : 'تواصل مباشرة مع المهندس عبر واتساب 💬'
      );
    }
  }

  private addMessage(sender: 'bot' | 'user', text: string, actionLink?: string, actionText?: string): void {
    this.messages.push({
      sender,
      text,
      time: this.getCurrentTime(),
      actionLink,
      actionText
    });
    setTimeout(() => this.scrollToBottom(), 50);
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
