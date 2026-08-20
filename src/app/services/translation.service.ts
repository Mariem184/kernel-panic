import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'ar';

export interface Translations {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<Language>('en');

  private translations: Record<Language, Translations> = {
    en: {
      nav: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        process: 'Process',
        whyUs: 'Why Us',
        contact: 'Contact',
        whatsappBtn: 'WhatsApp (01091610085)',
        ctaBtn: 'Get Free Consultation',
        switchLang: 'العربية'
      },
      hero: {
        titleDark: 'ZERO PANIC.',
        titleBlue: 'FULL CONTROL.',
        desc: 'We deliver cybersecurity, networking / IT infrastructure, software development, and professional training solutions designed to help businesses operate smarter, safer, and more efficiently.',
        btnConsultation: 'Get a Free Consultation',
        btnServices: 'Explore Our Services',
        crumbs: {
          security: 'Security',
          networking: 'Networking',
          software: 'Software',
          infrastructure: 'Infrastructure'
        }
      },
      soundFamiliar: {
        tag: 'COMMON CHALLENGES',
        title: 'Sound Familiar?',
        desc: 'Modern businesses face constant technological challenges. We solve the issues that hold your business back.',
        card1: {
          title: 'Frequent Network Outages',
          desc: 'Slow internet, unreliable connections, and sudden server downtime disrupting daily business operations.'
        },
        card2: {
          title: 'Cybersecurity Risks',
          desc: 'Unprotected data, ransomware vulnerabilities, and rising digital threats putting company assets at risk.'
        },
        card3: {
          title: 'Legacy Inflexible Systems',
          desc: 'Outdated software and tools that cannot scale with business growth or integrate with modern platforms.'
        },
        card4: {
          title: 'Lack of IT Expertise',
          desc: 'Difficulty finding trained specialists to secure, maintain, and upgrade technical infrastructure.'
        }
      },
      whoWeAre: {
        tag: 'WHO WE ARE',
        title: 'Your Dedicated Technology & Security Team',
        desc1: 'Kernel Panic is a specialized IT and Cybersecurity powerhouse established in Egypt. We help organizations build ironclad digital defense, high-speed network infrastructure, and scalable custom software.',
        desc2: 'Our philosophy is simple: Eliminate technical chaos so you can focus entirely on growing your business with complete peace of mind.',
        stat1Number: '100%',
        stat1Label: 'System Control',
        stat2Number: '24/7',
        stat2Label: 'Rapid Support',
        stat3Number: 'Zero',
        stat3Label: 'Security Panic',
        badgeText: 'EST. EGYPT'
      },
      services: {
        tag: 'OUR CAPABILITIES',
        title: 'Comprehensive IT & Cybersecurity Solutions',
        desc: 'End-to-end technology services tailored to protect, streamline, and accelerate your business operations.',
        item1: {
          title: 'Cybersecurity & Ethical Hacking',
          desc: 'Vulnerability assessment, penetration testing, threat detection, and comprehensive data protection to shield your systems against cyber attacks.',
          feature1: 'Penetration Testing & Audits',
          feature2: 'Firewall & Server Hardening',
          feature3: 'Incident Response & Recovery'
        },
        item2: {
          title: 'Networking & IT Infrastructure',
          desc: 'Enterprise-grade structured cabling, routing, switching, Wi-Fi optimization, and server room design built for maximum uptime and speed.',
          feature1: 'LAN / WAN Architecture',
          feature2: 'Server Room Configuration',
          feature3: 'Hardware & Hardware Maintenance'
        },
        item3: {
          title: 'Custom Software Development',
          desc: 'High-performance web applications, mobile apps, ERP systems, and custom automated tools crafted for your specific business workflow.',
          feature1: 'Web & Mobile Applications',
          feature2: 'Custom ERP & Dashboards',
          feature3: 'API Integration & Cloud Sync'
        },
        item4: {
          title: 'IT Infrastructure Management',
          desc: 'Proactive system monitoring, cloud migrations, virtualization, and automated backup disaster recovery solutions.',
          feature1: 'Cloud & Hybrid Solutions',
          feature2: 'Automated Daily Backups',
          feature3: '24/7 Server Health Monitoring'
        },
        item5: {
          title: 'Courses & Professional Training',
          desc: 'Hands-on practical training programs in ethical hacking, networking, and software engineering to upskill corporate teams and individuals.',
          feature1: 'Hands-on Labs & Projects',
          feature2: 'Cybersecurity Certifications',
          feature3: 'Custom Corporate Training'
        }
      },
      process: {
        tag: 'OUR METHODOLOGY',
        title: 'How We Ensure Flawless Delivery',
        desc: 'A structured 4-step engineering process designed to eliminate downtime and guarantee success.',
        step1Num: '01',
        step1Title: 'Discovery & Audit',
        step1Desc: 'We deeply analyze your current infrastructure, workflows, and vulnerabilities to pinpoint exact requirements.',
        step2Num: '02',
        step2Title: 'Strategic Architecture',
        step2Desc: 'We design custom, scalable blueprints optimized for robust security, high performance, and cost efficiency.',
        step3Num: '03',
        step3Title: 'Seamless Implementation',
        step3Desc: 'Our engineers deploy systems with zero operational downtime, following industry-standard best practices.',
        step4Num: '04',
        step4Title: 'Continuous Monitoring & Support',
        step4Desc: 'We maintain, monitor, and optimize your systems 24/7 to ensure long-term stability and zero surprises.'
      },
      whyUs: {
        tag: 'WHY KERNEL PANIC',
        title: 'Built for Reliability. Engineered for Growth.',
        desc: 'Why leading companies trust Kernel Panic as their dedicated technology partner.',
        feat1Title: 'Expert Specialized Engineers',
        feat1Desc: 'Certified specialists across cybersecurity, networks, software, and systems architecture.',
        feat2Title: 'Proactive Zero-Panic Security',
        feat2Desc: 'We resolve vulnerabilities before they become emergencies, guaranteeing uninterrupted operations.',
        feat3Title: 'Tailored Scalable Solutions',
        feat3Desc: 'Every solution is custom-engineered to fit your exact budget, business size, and future scaling goals.',
        feat4Title: 'Direct Rapid Support',
        feat4Desc: 'Fast response times through dedicated communication channels and direct engineer access.'
      },
      missionValues: {
        tag: 'CORE PRINCIPLES',
        title: 'Mission & Values',
        missionTitle: 'Our Mission',
        missionDesc: 'To empower organizations across Egypt and the region with resilient, cutting-edge technology and impenetrable cybersecurity—turning IT from a source of stress into a competitive advantage.',
        val1Title: 'Precision & Excellence',
        val1Desc: 'Rigorous engineering standards in every line of code, network wire, and security protocol.',
        val2Title: 'Uncompromising Integrity',
        val2Desc: 'Complete transparency, data confidentiality, and honest technical guidance at all times.',
        val3Title: 'Client Empowerment',
        val3Desc: 'We don’t just build systems; we educate and equip your team for sustainable independence.'
      },
      finalCta: {
        title: 'Ready to Take Full Control of Your IT?',
        desc: 'Stop worrying about crashes, security breaches, or slow networks. Partner with Kernel Panic today.',
        btnWa: 'Chat with an Engineer on WhatsApp',
        btnEmail: 'Email Us: kernelpanic177@gmail.com'
      },
      stayConnected: {
        tag: 'STAY CONNECTED',
        title: 'Connect with Kernel Panic IT Team',
        desc: 'Reach out through any of our official channels for immediate assistance, consultations, or project inquiries.'
      },
      footer: {
        motto: 'ZERO PANIC. FULL CONTROL.',
        subtext: 'Secure Technology. Reliable Infrastructure. Smarter Solutions.',
        colCompany: 'Company',
        colServices: 'Services',
        colConnect: 'Connect',
        linkAbout: 'About',
        linkServices: 'Services',
        linkWhyUs: 'Why Us',
        linkContact: 'Contact',
        copyright: '© 2026 Kernel Panic IT Team. All Rights Reserved.',
        backToTop: 'BACK TO TOP'
      },
      chatbot: {
        assistantName: 'Kernel Panic Assistant',
        onlineStatus: 'Online | AI Assistant',
        placeholder: 'Ask anything about our services...',
        welcome: 'Welcome to Kernel Panic IT Team! 👋 How can we help you today with cybersecurity, software development, networking, or training?',
        quickTitle: 'Select a quick inquiry:'
      }
    },
    ar: {
      nav: {
        home: 'الرئيسية',
        about: 'من نحن',
        services: 'خدماتنا',
        process: 'منهجية العمل',
        whyUs: 'لماذا تختارنا',
        contact: 'تواصل معنا',
        whatsappBtn: 'واتساب (01091610085)',
        ctaBtn: 'احجز استشارة مجانية',
        switchLang: 'English'
      },
      hero: {
        titleDark: 'لا ذعر بعد اليوم.',
        titleBlue: 'تحكم كامل.',
        desc: 'نقدم حلول الأمن السيبراني، الشبكات والبنية التحتية، تطوير البرمجيات، والتدريب الاحترافي لمساعدة الشركات على العمل بذكاء وأمان وكفاءة أعلى.',
        btnConsultation: 'احصل على استشارة مجانية',
        btnServices: 'استكشف خدماتنا',
        crumbs: {
          security: 'الأمن السيبراني',
          networking: 'الشبكات',
          software: 'البرمجيات',
          infrastructure: 'البنية التحتية'
        }
      },
      soundFamiliar: {
        tag: 'التحديات الشائعة',
        title: 'هل تبدو هذه المشاكل مألوفة؟',
        desc: 'تواجه الشركات الحديثة تحديات تقنية مستمرة. نحن نقدم الحلول الجذرية لإزالة العقبات التي تعيق نموك.',
        card1: {
          title: 'انقطاع وبطء الشبكات',
          desc: 'بطء الإنترنت، وعدم استقرار الاتصال، وسقوط الخوادم المفاجئ الذي يعطل سير العمل اليومي.'
        },
        card2: {
          title: 'مخاطر الأمن السيبراني',
          desc: 'بيانات غير محمية، ثغرات الفدية والاختراق، والتهديدات الرقمية المتزايدة التي تعرض أصول شركتك للخطر.'
        },
        card3: {
          title: 'برمجيات قديمة وغير مرنة',
          desc: 'أنظمة وأدوات قديمة عاجزة عن مواكبة توسع أعمالك أو التكامل مع المنصات والتقنيات الحديثة.'
        },
        card4: {
          title: 'نقص الكوادر التقنية المؤهلة',
          desc: 'صعوبة العثور على متخصصين مدربين لإدارة وتأمين وصيانة البنية التحتية الرقمية لشركتك.'
        }
      },
      whoWeAre: {
        tag: 'من نحن',
        title: 'فريقك المتخصص في التكنولوجيا والأمن السيبراني',
        desc1: 'Kernel Panic هو فريق رائد في مجال تكنولوجيا المعلومات والأمن السيبراني تأسس في مصر. نساعد المؤسسات والشركات على بناء دفاعات رقمية حصينة، وشبكات فائقة السرعة، وبرمجيات مخصصة قابلة للتوسع.',
        desc2: 'فلسفتنا واضحة وبسيطة: القضاء التام على الفوضى التقنية حتى تتفرغ لتنمية وتطوير أعمالك براحة بال وثقة تامة.',
        stat1Number: '100%',
        stat1Label: 'تحكم كامل بالأنظمة',
        stat2Number: '24/7',
        stat2Label: 'دعم فني سريع ومستمر',
        stat3Number: 'Zero',
        stat3Label: 'لا قلق أمني',
        badgeText: 'تأسس في مصر'
      },
      services: {
        tag: 'مجالات خبرتنا',
        title: 'حلول تقنية وأمنية شاملة ومتكاملة',
        desc: 'خدمات تكنولوجية متكاملة مصممة لحماية وتطوير وتسريع أعمالك بأحدث المعايير العالمية.',
        item1: {
          title: 'الأمن السيبراني واختبار الاختراق',
          desc: 'تقييم الثغرات، اختبارات الاختراق الشاملة، واكتشاف التهديدات، وحماية البيانات لتأمين أنظمتك ضد أي هجمات إلكترونية.',
          feature1: 'اختبار الاختراق والتدقيق الأمني',
          feature2: 'تأمين السيرفرات والجدران النارية',
          feature3: 'الاستجابة للحوادث واستعادة البيانات'
        },
        item2: {
          title: 'الشبكات وتجهيز السيرفرات',
          desc: 'تصميم وتركيب الشبكات السلكية واللاسلكية، توجيه البيانات، تحسين كفاءة الـ Wi-Fi، وتجهيز غرف الخوادم بأعلى درجات الاستقرار.',
          feature1: 'تصميم شبكات LAN و WAN',
          feature2: 'تجهيز وضبط غرف السيرفرات',
          feature3: 'صيانة وتوريد عتاد الشبكات'
        },
        item3: {
          title: 'تطوير البرمجيات المخصصة',
          desc: 'برمجة مواقع وتطبيقات ويب وموبايل فائقة السرعة، أنظمة إدارة ومحاسبة ERP، وأدوات رقمية مخصصة تناسب دورة عملك.',
          feature1: 'تطبيقات الويب والموبايل',
          feature2: 'أنظمة ERP ولوحات تحكم مخصصة',
          feature3: 'الربط البرمجي السحابي APIs'
        },
        item4: {
          title: 'إدارة البنية التحتية والأنظمة',
          desc: 'مراقبة استباقية للأنظمة، الانتقال السحابي، الأنظمة الافتراضية، وحلول النسخ الاحتياطي التلقائي واسترجاع الكوارث.',
          feature1: 'حلول سحابية وهجينة متطورة',
          feature2: 'نسخ احتياطي يومي تلقائي',
          feature3: 'مراقبة صحة السيرفرات 24/7'
        },
        item5: {
          title: 'الدورات والتدريب الاحترافي',
          desc: 'برامج تدريب عملية ومكثفة على أيدي خبراء لتأهيل الكوادر وفرق العمل في مجالات الهاكينج الأخلاقي، الشبكات، والبرمجة.',
          feature1: 'مشاريع ومعامل تطبيقية عملية',
          feature2: 'تأهيل لشهادات الأمن والشبكات',
          feature3: 'تدريب مخصص للشركات والأفراد'
        }
      },
      process: {
        tag: 'منهجية عملنا',
        title: 'كيف نضمن لك أعلى مستويات الجودة',
        desc: 'منهجية هندسية واضحة من 4 خطوات مصممة لمنع الأعطال وضمان استقرار مشروعك.',
        step1Num: '01',
        step1Title: 'الاستكشاف والتقييم',
        step1Desc: 'ندرس بنيتك التقنية الحالية ونحلل الثغرات ومتطلبات العمل لتحديد الحل الدقيق.',
        step2Num: '02',
        step2Title: 'التخطيط والهندسة',
        step2Desc: 'نصمم مخططات مخصصة وقابلة للتوسع بأعلى معايير الأمان والأداء والكفاءة المالية.',
        step3Num: '03',
        step3Title: 'التنفيذ والتشغيل',
        step3Desc: 'يقوم مهندسونا بتنفيذ وتركيب الأنظمة دون أي توقف لسير عملك اليومي.',
        step4Num: '04',
        step4Title: 'المراقبة والدعم المستمر',
        step4Desc: 'نراقب أنظمتك ونقدم دعماً فنياً مستمراً لضمان الاستقرار التام وتفادي أي مفاجآت.'
      },
      whyUs: {
        tag: 'لماذا كيرنل بانيك',
        title: 'صُممت للأمان المطلق. وهُندست لنمو أعمالك.',
        desc: 'لماذا تختار كبرى الشركات Kernel Panic كشريكها التقني المعتمد.',
        feat1Title: 'مهندسون خبراء ومعتمدون',
        feat1Desc: 'فريق متخصص وحاصل على أعلى الشهادات في الأمن السيبراني والشبكات وهندسة البرمجيات.',
        feat2Title: 'أمان استباقي بدون قلق',
        feat2Desc: 'نعالج المشاكل والثغرات قبل أن تتحول إلى طوارئ، لنضمن تشغيل أعمالك باستمرار.',
        feat3Title: 'حلول مفصلة لاحتياجاتك',
        feat3Desc: 'كل حل نصممه مخصص لميزانيتك، وحجم شركتك، وأهدافك المستقبلية بدقة.',
        feat4Title: 'دعم مباشر وسريع',
        feat4Desc: 'استجابة سريعة عبر قنوات تواصل مخصصة وتواصل مباشر مع المهندسين بدون وسيط.'
      },
      missionValues: {
        tag: 'مبادئنا الأساسية',
        title: 'رسالتنا وقيمنا',
        missionTitle: 'رسالتنا',
        missionDesc: 'تمكين المؤسسات والشركات في مصر والمنطقة بحلول تكنولوجية متقدمة وأمن سيبراني منيع—لتحويل تكنولوجيا المعلومات من مصدر قلق إلى نقطة قوة وميزة تنافسية كبرى.',
        val1Title: 'الدقة والتميز الهندسي',
        val1Desc: 'معايير هندسية صارمة في كل سطر كود، كابل شبكة، وبروتوكول أمان نطبقه.',
        val2Title: 'النزاهة والسرية التامة',
        val2Desc: 'شفافية كاملة، سرية مطلقة للبيانات، واستشارات تقنية صادقة دائماً.',
        val3Title: 'تمكين العملاء',
        val3Desc: 'لا نكتفي ببناء الأنظمة؛ بل ندرب ونمكن فريقك للتعامل معها باحترافية وسلاسة.'
      },
      finalCta: {
        title: 'جاهز للتحكم الكامل في بنيتك التقنية؟',
        desc: 'توقف عن القلق بشأن الأعطال، الاختراقات، أو بطء الشبكات. تواصل مع Kernel Panic اليوم.',
        btnWa: 'تحدث مع مهندس متخصص عبر واتساب',
        btnEmail: 'راسلنا عبر البريد: kernelpanic177@gmail.com'
      },
      stayConnected: {
        tag: 'ابقَ على تواصل',
        title: 'تواصل مع فريق Kernel Panic IT Team',
        desc: 'تواصل معنا عبر أي من قنواتنا الرسمية للحصول على استشارة فورية أو طلب خدماتنا.'
      },
      footer: {
        motto: 'ZERO PANIC. FULL CONTROL.',
        subtext: 'تكنولوجيا آمنة. بنية تحتية موثوقة. حلول أذكى.',
        colCompany: 'الشركة',
        colServices: 'الخدمات',
        colConnect: 'تواصل معنا',
        linkAbout: 'من نحن',
        linkServices: 'الخدمات',
        linkWhyUs: 'لماذا تختارنا',
        linkContact: 'تواصل معنا',
        copyright: '© 2026 Kernel Panic IT Team. جميع الحقوق محفوظة.',
        backToTop: 'العودة للأعلى'
      },
      chatbot: {
        assistantName: 'Kernel Panic Assistant',
        onlineStatus: 'متصل | المساعد الذكي',
        placeholder: 'اكتب استفسارك هنا عن خدماتنا...',
        welcome: 'مرحبًا بك في Kernel Panic IT Team! 👋 كيف يمكننا مساعدتك اليوم في حلول الأمن السيبراني، تطوير البرمجيات، الشبكات، أو التدريب؟',
        quickTitle: 'اختر استفسارًا سريعًا:'
      }
    }
  };

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('kp_lang') as Language | null;
      if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
        this.setLanguage(savedLang);
      } else {
        this.setLanguage('en');
      }
    }
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kp_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      
      if (lang === 'ar') {
        document.body.classList.add('rtl-mode');
      } else {
        document.body.classList.remove('rtl-mode');
      }
    }
  }

  toggleLanguage(): void {
    const nextLang: Language = this.currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(nextLang);
  }

  t(path: string): any {
    const lang = this.currentLang();
    const keys = path.split('.');
    let current: any = this.translations[lang];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return path;
      }
    }

    return current;
  }
}
