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
        whatsappBtn: 'WhatsApp',
        ctaBtn: 'Get Free Consultation',
        switchLang: 'العربية',
        projects: 'Projects',
        news: 'News',
        login: 'Admin login',
        logout: 'Log out',
        adminMode: 'Admin mode'
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
        desc: 'Modern businesses face a wide range of technology challenges that can affect productivity, security, and growth. We help organizations address the technical issues that impact their operations and digital performance.',
        card1: {
          title: 'Frequent Network Outages',
          desc: 'Slow connections, unstable networks, and unexpected service interruptions that can disrupt day-to-day business operations.'
        },
        card2: {
          title: 'Cybersecurity Risks',
          desc: 'Unprotected systems, ransomware exposure, and other cyber threats that can put sensitive data and critical business assets at risk.'
        },
        card3: {
          title: 'Legacy & Inflexible Systems',
          desc: 'Outdated software and technologies that limit scalability, integration, and the ability to adapt to evolving business needs.'
        },
        card4: {
          title: 'Lack of IT Expertise',
          desc: 'Difficulty accessing qualified technical professionals to secure, maintain, troubleshoot, and modernize IT infrastructure.'
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
          desc: 'Vulnerability assessment, penetration testing, threat detection, and data protection solutions designed to identify security risks, strengthen your systems, and protect critical assets against cyber threats.',
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
          desc: 'Hands-on training programs in ethical hacking, networking, and software engineering, designed to enhance the technical skills and capabilities of corporate teams and individual professionals.',
          feature1: 'Hands-on Labs & Projects',
          feature2: 'Cybersecurity Certifications',
          feature3: 'Custom Corporate Training'
        }
      },
      process: {
        tag: 'OUR METHODOLOGY',
        title: 'How We Deliver with Confidence',
        desc: 'A structured four-step engineering process designed to minimize risks, ensure quality, and deliver reliable technology solutions aligned with your business requirements.',
        step1Num: '01',
        step1Title: 'Discovery & Assessment',
        step1Desc: 'We analyze your existing infrastructure, workflows, and security posture to understand your requirements, identify potential risks, and define clear objectives.',
        step2Num: '02',
        step2Title: 'Strategic Architecture',
        step2Desc: 'We design tailored, scalable solutions optimized for security, performance, reliability, and cost efficiency.',
        step3Num: '03',
        step3Title: 'Seamless Implementation',
        step3Desc: 'Our engineers deploy and integrate solutions with minimal operational disruption, following industry standards and established engineering best practices.',
        step4Num: '04',
        step4Title: 'Continuous Monitoring & Support',
        step4Desc: 'We provide ongoing monitoring, maintenance, and technical support to help maintain system reliability, security, and performance over time.'
      },
      whyUs: {
        tag: 'WHY KERNEL PANIC',
        title: 'Built for Reliability. Engineered for Growth.',
        desc: 'We combine technical expertise, practical experience, and tailored technology solutions to help organizations build reliable systems, strengthen their digital infrastructure, and support sustainable growth.',
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
      news: {
        tag: 'Latest News',
        title: 'News & Updates',
        desc: 'Stay up to date with our latest announcements, insights, and cybersecurity updates.',
        empty: 'No news yet. Please check back soon.',
        emptyAdmin: 'No news yet. Add your first article to get started.',
        loadError: 'We could not load the news right now.',
        retry: 'Try again',
        featured: 'Featured',
        minRead: 'min read',
        readMore: 'Read more',
        readOriginal: 'Read the original',
        by: 'By',
        showMore: 'See More',
        showLess: 'See Less'
      },
      projects: {
        tag: 'Our Work',
        title: 'Projects We Are Proud Of',
        desc: 'A selection of the solutions we have designed, built, and delivered for our clients.',
        empty: 'No projects to show yet. Please check back soon.',
        emptyAdmin: 'No projects yet. Add your first project to get started.',
        loadError: 'We could not load the projects right now.',
        retry: 'Try again',
        viewDetails: 'View details',
        showMore: 'See More',
        showLess: 'See Less',
        gallery: 'Project gallery',
        video: 'Watch a demo',
        role: 'Our role',
        client: 'Client',
        duration: 'Duration',
        technologies: 'Technologies',
        frontend: 'Front-end',
        backend: 'Back-end',
        painPoints: 'The challenge',
        keyFeatures: 'Key features',
        steps: 'How we delivered it',
        results: 'Results',
        team: 'Team',
        sourceCode: 'View source code'
      },
      admin: {
        addNews: 'Add news',
        addProject: 'Add project',
        edit: 'Edit',
        delete: 'Delete',
        deleting: 'Deleting…',
        draft: 'Draft',
        published: 'Published',
        cancel: 'Cancel',
        close: 'Close',
        remove: 'Remove',
        create: 'Create',
        saveChanges: 'Save changes',
        saving: 'Saving…',
        translating: 'Translating…',
        confirmTitle: 'Delete this item?',
        confirmYes: 'Yes, delete',
        confirmNews: 'This news article will be permanently deleted. This cannot be undone.',
        confirmProject: 'This project will be permanently deleted. This cannot be undone.',
        newNewsTitle: 'Add news article',
        editNewsTitle: 'Edit news article',
        newProjectTitle: 'Add project',
        editProjectTitle: 'Edit project',
        newsCreated: 'News article created.',
        newsUpdated: 'News article updated.',
        newsDeleted: 'News article deleted.',
        projectCreated: 'Project created.',
        memberAdded: 'Team member added.',
        memberDeleted: 'Team member removed.',
        projectUpdated: 'Project updated.',
        projectDeleted: 'Project deleted.',
        sessionExpired: 'Your session has expired. Please log in again.',
        errFix: 'Please fix the highlighted fields and try again.',
        errGeneric: 'Something went wrong. Please try again.',
        errNetwork: 'Could not reach the server. Check your connection and try again.',
        errForbidden: 'You do not have permission to do that.',
        errNotFound: 'This item no longer exists. It may have been deleted.',
        errSlug: 'This slug is already used by another item. Please choose a different one.',
        errLoadItem: 'Could not load the item for editing.',
        f: {
          titleEn: 'Title (English)',
          titleAr: 'Title (Arabic)',
          nameEn: 'Name (English)',
          nameAr: 'Name (Arabic)',
          slug: 'Slug (URL name)',
          slugHint: 'Lowercase letters, numbers and dashes only. Filled in automatically from the English title.',
          excerptEn: 'Short excerpt (English)',
          excerptAr: 'Short excerpt (Arabic)',
          shortEn: 'Short description (English)',
          shortAr: 'Short description (Arabic)',
          contentEn: 'Article content (English)',
          contentAr: 'Article content (Arabic)',
          contentHint: 'Plain text only. Leave a blank line between paragraphs — no tags needed.',
          needOneTitle: 'Enter the title in at least one language — it will be shown for both until you translate it.',
          needOneName: 'Enter the name in at least one language — it will be shown for both until you translate it.',
          oneLanguageOk: 'Filling in just one language is fine — it will be auto-translated into the other on save.',
          imageUrl: 'Main image URL',
          imageHint: 'Paste a direct link to an image (https://…), or upload one from your device.',
          uploadImage: 'Upload from device',
          uploadImages: 'Add photos from device',
          uploading: 'Uploading…',
          imageTooLarge: 'That image is too large — the maximum size is 5 MB.',
          imageInvalidType: 'Unsupported file type — please use JPEG, PNG, WEBP or GIF.',
          someUploadsFailed: 'Some images could not be uploaded. Please try them again.',
          additionalImages: 'Additional image URLs',
          oneLinkPerLine: 'One link per line.',
          categoryEn: 'Category (English)',
          categoryAr: 'Category (Arabic)',
          authorEn: 'Author (English)',
          authorAr: 'Author (Arabic)',
          readingTime: 'Reading time (minutes)',
          publishedDate: 'Publish date',
          externalUrl: 'External link (optional)',
          status: 'Status',
          featured: 'Mark as featured',
          required: 'This field is required.',
          invalidSlug: 'Use lowercase letters, numbers and single dashes only.',
          invalidUrl: 'Enter a valid link starting with http:// or https://',
          tooLong: 'This text is too long.',
          tabBasic: 'Basic',
          tabDetails: 'Details',
          tabTech: 'Technology',
          tabExtras: 'Extras',
          detailedEn: 'Detailed description (English)',
          detailedAr: 'Detailed description (Arabic)',
          typeEn: 'Project type (English)',
          typeAr: 'Project type (Arabic)',
          roleEn: 'Our role (English)',
          roleAr: 'Our role (Arabic)',
          clientEn: 'Client (English)',
          clientAr: 'Client (Arabic)',
          durationEn: 'Duration (English)',
          videoUrl: 'Project video (optional)',
          videoUrlHint: 'A YouTube, Vimeo, or Google Drive link — shown as an embedded player on the project page.',
          durationAr: 'Duration (Arabic)',
          sourceCodeUrl: 'Source code link (optional)',
          categories: 'Categories',
          technologies: 'Technologies',
          frontendTech: 'Front-end technologies',
          backendTech: 'Back-end technologies',
          tagsHint: 'Type a value and press Enter.',
          team: 'Team members',
          teamHint: 'Specific to this project — not a shared directory. Add whoever worked on it.',
          teamEmpty: 'No team members found.',
          addMember: 'Add team member',
          jobTitleEn: 'Job title (English)',
          jobTitleAr: 'Job title (Arabic)',
          memberPhoto: 'Photo',
          memberPhotoHint: 'Optional — shows their initial if left empty.',
          removeMember: 'Remove this person',
          removeMemberConfirm: 'Remove this team member entirely (from every project, not just this one)?',
          painPointsEn: 'The challenge (English)',
          painPointsAr: 'The challenge (Arabic)',
          onePerLine: 'One point per line.',
          keyFeatures: 'Key features',
          addFeature: 'Add feature',
          featureIcon: 'Icon name',
          steps: 'Execution steps',
          addStep: 'Add step',
          results: 'Results',
          addResult: 'Add result',
          descEn: 'Description (English)',
          descAr: 'Description (Arabic)'
        }
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
        whatsappBtn: 'واتساب',
        ctaBtn: 'احجز استشارة مجانية',
        switchLang: 'English',
        projects: 'أعمالنا',
        news: 'الأخبار',
        login: 'دخول المشرف',
        logout: 'تسجيل الخروج',
        adminMode: 'وضع المشرف'
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
        desc: 'تواجه الشركات الحديثة مجموعة واسعة من التحديات التقنية التي قد تؤثر على الإنتاجية والأمان والنمو. نساعد المؤسسات على معالجة المشكلات التقنية التي تؤثر على عملياتها وأدائها الرقمي.',
        card1: {
          title: 'انقطاع وبطء الشبكات',
          desc: 'اتصالات بطيئة، شبكات غير مستقرة، وانقطاعات غير متوقعة في الخدمة قد تعطّل سير العمل اليومي.'
        },
        card2: {
          title: 'مخاطر الأمن السيبراني',
          desc: 'أنظمة غير محمية، والتعرّض لهجمات الفدية، وتهديدات إلكترونية أخرى قد تعرّض البيانات الحساسة وأصول الشركة الحيوية للخطر.'
        },
        card3: {
          title: 'أنظمة قديمة وغير مرنة',
          desc: 'برمجيات وتقنيات قديمة تحدّ من القدرة على التوسع والتكامل والتكيّف مع احتياجات العمل المتطوّرة.'
        },
        card4: {
          title: 'نقص الكوادر التقنية المؤهلة',
          desc: 'صعوبة الوصول لمتخصصين تقنيين مؤهلين لتأمين البنية التحتية وصيانتها واستكشاف أعطالها وتحديثها.'
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
          desc: 'تقييم الثغرات، واختبارات الاختراق، واكتشاف التهديدات، وحلول حماية البيانات المصممة لتحديد المخاطر الأمنية وتعزيز أنظمتك وحماية أصولك الحيوية من التهديدات الإلكترونية.',
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
          desc: 'برامج تدريب عملية في الهاكينج الأخلاقي والشبكات وهندسة البرمجيات، مصممة لتطوير المهارات التقنية لفرق العمل والمتخصصين الأفراد.',
          feature1: 'مشاريع ومعامل تطبيقية عملية',
          feature2: 'تأهيل لشهادات الأمن والشبكات',
          feature3: 'تدريب مخصص للشركات والأفراد'
        }
      },
      process: {
        tag: 'منهجية عملنا',
        title: 'كيف نُنجز مشروعك بثقة تامة',
        desc: 'منهجية هندسية واضحة من أربع خطوات مصممة لتقليل المخاطر وضمان الجودة وتقديم حلول تقنية موثوقة تتماشى مع احتياجات عملك.',
        step1Num: '01',
        step1Title: 'الاستكشاف والتقييم',
        step1Desc: 'نحلل بنيتك التحتية الحالية وسير عملك ووضعك الأمني لفهم احتياجاتك، وتحديد المخاطر المحتملة، ووضع أهداف واضحة.',
        step2Num: '02',
        step2Title: 'التخطيط والهندسة',
        step2Desc: 'نصمم حلولاً مخصصة وقابلة للتوسع، محسّنة من حيث الأمان والأداء والموثوقية والكفاءة المالية.',
        step3Num: '03',
        step3Title: 'التنفيذ والتشغيل',
        step3Desc: 'يقوم مهندسونا بتنفيذ الحلول ودمجها بأقل قدر ممكن من تعطيل سير عملك، وفق أفضل المعايير الهندسية المعتمدة.',
        step4Num: '04',
        step4Title: 'المراقبة والدعم المستمر',
        step4Desc: 'نقدم مراقبة وصيانة ودعمًا فنيًا مستمرًا للمساعدة في الحفاظ على موثوقية أنظمتك وأمانها وأدائها مع مرور الوقت.'
      },
      whyUs: {
        tag: 'لماذا كيرنل بانيك',
        title: 'صُممت للأمان المطلق. وهُندست لنمو أعمالك.',
        desc: 'نجمع بين الخبرة التقنية والتجربة العملية وحلول تقنية مخصصة لمساعدة المؤسسات على بناء أنظمة موثوقة، وتعزيز بنيتها التحتية الرقمية، ودعم نموها المستدام.',
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
      news: {
        tag: 'آخر الأخبار',
        title: 'الأخبار والمستجدات',
        desc: 'تابع أحدث إعلاناتنا ومقالاتنا وآخر مستجدات الأمن السيبراني.',
        empty: 'لا توجد أخبار حتى الآن. تفضّل بزيارتنا قريبًا.',
        emptyAdmin: 'لا توجد أخبار حتى الآن. أضف أول خبر لتبدأ.',
        loadError: 'تعذّر تحميل الأخبار حاليًا.',
        retry: 'إعادة المحاولة',
        featured: 'مميز',
        minRead: 'دقائق قراءة',
        readMore: 'اقرأ المزيد',
        readOriginal: 'قراءة المصدر الأصلي',
        by: 'بواسطة',
        showMore: 'عرض المزيد',
        showLess: 'عرض أقل'
      },
      projects: {
        tag: 'أعمالنا',
        title: 'مشاريع نفخر بها',
        desc: 'مجموعة مختارة من الحلول التي صمّمناها وبنيناها وسلّمناها لعملائنا.',
        empty: 'لا توجد مشاريع لعرضها حتى الآن. تفضّل بزيارتنا قريبًا.',
        emptyAdmin: 'لا توجد مشاريع حتى الآن. أضف أول مشروع لتبدأ.',
        loadError: 'تعذّر تحميل المشاريع حاليًا.',
        retry: 'إعادة المحاولة',
        viewDetails: 'عرض التفاصيل',
        showMore: 'عرض المزيد',
        showLess: 'عرض أقل',
        gallery: 'معرض صور المشروع',
        video: 'شاهدي العرض التوضيحي',
        role: 'دورنا',
        client: 'العميل',
        duration: 'المدة',
        technologies: 'التقنيات',
        frontend: 'الواجهة الأمامية',
        backend: 'الخلفية',
        painPoints: 'التحدي',
        keyFeatures: 'أهم المميزات',
        steps: 'كيف نفّذناه',
        results: 'النتائج',
        team: 'فريق العمل',
        sourceCode: 'عرض الكود المصدري'
      },
      admin: {
        addNews: 'إضافة خبر',
        addProject: 'إضافة مشروع',
        edit: 'تعديل',
        delete: 'حذف',
        deleting: 'جارٍ الحذف…',
        draft: 'مسودة',
        published: 'منشور',
        cancel: 'إلغاء',
        close: 'إغلاق',
        remove: 'إزالة',
        create: 'إنشاء',
        saveChanges: 'حفظ التعديلات',
        saving: 'جارٍ الحفظ…',
        translating: 'جارٍ الترجمة…',
        confirmTitle: 'حذف هذا العنصر؟',
        confirmYes: 'نعم، احذف',
        confirmNews: 'سيتم حذف هذا الخبر نهائيًا ولا يمكن التراجع عن ذلك.',
        confirmProject: 'سيتم حذف هذا المشروع نهائيًا ولا يمكن التراجع عن ذلك.',
        newNewsTitle: 'إضافة خبر جديد',
        editNewsTitle: 'تعديل الخبر',
        newProjectTitle: 'إضافة مشروع جديد',
        editProjectTitle: 'تعديل المشروع',
        newsCreated: 'تمت إضافة الخبر بنجاح.',
        newsUpdated: 'تم تحديث الخبر بنجاح.',
        newsDeleted: 'تم حذف الخبر.',
        projectCreated: 'تمت إضافة المشروع بنجاح.',
        memberAdded: 'تمت إضافة عضو الفريق.',
        memberDeleted: 'تم حذف عضو الفريق.',
        projectUpdated: 'تم تحديث المشروع بنجاح.',
        projectDeleted: 'تم حذف المشروع.',
        sessionExpired: 'انتهت الجلسة. من فضلك سجّل الدخول مرة أخرى.',
        errFix: 'من فضلك صحّح الحقول المميّزة ثم حاول مرة أخرى.',
        errGeneric: 'حدث خطأ ما. حاول مرة أخرى.',
        errNetwork: 'تعذّر الاتصال بالسيرفر. تحقّق من الإنترنت وحاول مرة أخرى.',
        errForbidden: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
        errNotFound: 'هذا العنصر لم يعد موجودًا، ربما تم حذفه.',
        errSlug: 'هذا الرابط المختصر مستخدم بالفعل في عنصر آخر. اختر رابطًا مختلفًا.',
        errLoadItem: 'تعذّر تحميل العنصر للتعديل.',
        f: {
          titleEn: 'العنوان (إنجليزي)',
          titleAr: 'العنوان (عربي)',
          nameEn: 'الاسم (إنجليزي)',
          nameAr: 'الاسم (عربي)',
          slug: 'الرابط المختصر (Slug)',
          slugHint: 'حروف إنجليزية صغيرة وأرقام وشرطات فقط. يُملأ تلقائيًا من العنوان الإنجليزي.',
          excerptEn: 'مقتطف قصير (إنجليزي)',
          excerptAr: 'مقتطف قصير (عربي)',
          shortEn: 'وصف مختصر (إنجليزي)',
          shortAr: 'وصف مختصر (عربي)',
          contentEn: 'محتوى الخبر (إنجليزي)',
          contentAr: 'محتوى الخبر (عربي)',
          contentHint: 'نص عادي فقط. اسيبي سطر فاضي بين كل فقرة والتانية — مفيش داعي لأي وسوم.',
          needOneTitle: 'اكتبي العنوان بلغة واحدة على الأقل — وهيظهر باللغتين لحد ما تترجميه.',
          needOneName: 'اكتبي الاسم بلغة واحدة على الأقل — وهيظهر باللغتين لحد ما تترجميه.',
          oneLanguageOk: 'تمام تملي لغة واحدة بس — هتتترجم تلقائيًا للغة التانية وقت الحفظ.',
          imageUrl: 'رابط الصورة الرئيسية',
          imageHint: 'الصق رابطًا مباشرًا للصورة (https://…)، أو ارفعي صورة من جهازك.',
          uploadImage: 'رفع من الجهاز',
          uploadImages: 'إضافة صور من الجهاز',
          uploading: 'جارٍ الرفع…',
          imageTooLarge: 'الصورة كبيرة جدًا — الحد الأقصى ٥ ميجابايت.',
          imageInvalidType: 'نوع الملف غير مدعوم — استخدمي JPEG أو PNG أو WEBP أو GIF.',
          someUploadsFailed: 'بعض الصور لم يتم رفعها. من فضلك أعيدي المحاولة.',
          additionalImages: 'روابط صور إضافية',
          oneLinkPerLine: 'رابط واحد في كل سطر.',
          categoryEn: 'التصنيف (إنجليزي)',
          categoryAr: 'التصنيف (عربي)',
          authorEn: 'الكاتب (إنجليزي)',
          authorAr: 'الكاتب (عربي)',
          readingTime: 'مدة القراءة (بالدقائق)',
          publishedDate: 'تاريخ النشر',
          externalUrl: 'رابط خارجي (اختياري)',
          status: 'الحالة',
          featured: 'تمييز كخبر مميز',
          required: 'هذا الحقل مطلوب.',
          invalidSlug: 'استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطة واحدة بين الكلمات فقط.',
          invalidUrl: 'أدخل رابطًا صحيحًا يبدأ بـ http:// أو https://',
          tooLong: 'النص أطول من المسموح.',
          tabBasic: 'الأساسيات',
          tabDetails: 'التفاصيل',
          tabTech: 'التقنيات',
          tabExtras: 'إضافات',
          detailedEn: 'الوصف التفصيلي (إنجليزي)',
          detailedAr: 'الوصف التفصيلي (عربي)',
          typeEn: 'نوع المشروع (إنجليزي)',
          typeAr: 'نوع المشروع (عربي)',
          roleEn: 'دورنا (إنجليزي)',
          roleAr: 'دورنا (عربي)',
          clientEn: 'العميل (إنجليزي)',
          clientAr: 'العميل (عربي)',
          durationEn: 'المدة (إنجليزي)',
          videoUrl: 'فيديو المشروع (اختياري)',
          videoUrlHint: 'رابط يوتيوب أو Vimeo أو Google Drive — هيظهر كفيديو مباشر في صفحة المشروع.',
          durationAr: 'المدة (عربي)',
          sourceCodeUrl: 'رابط الكود المصدري (اختياري)',
          categories: 'التصنيفات',
          technologies: 'التقنيات',
          frontendTech: 'تقنيات الواجهة الأمامية',
          backendTech: 'تقنيات الخلفية',
          tagsHint: 'اكتب القيمة ثم اضغط Enter.',
          team: 'أعضاء الفريق',
          teamHint: 'خاص بالمشروع ده بس — مش قايمة مشتركة. ضيفي اللي شاركوا فيه فعليًا.',
          teamEmpty: 'لا يوجد أعضاء فريق.',
          addMember: 'إضافة عضو فريق',
          jobTitleEn: 'المسمى الوظيفي (إنجليزي)',
          jobTitleAr: 'المسمى الوظيفي (عربي)',
          memberPhoto: 'الصورة',
          memberPhotoHint: 'اختياري — لو سبتيها فاضية هيظهر أول حرف من الاسم بدلها.',
          removeMember: 'حذف هذا الشخص',
          removeMemberConfirm: 'حذف عضو الفريق ده نهائيًا (من كل المشاريع، مش بس ده)؟',
          painPointsEn: 'التحدي (إنجليزي)',
          painPointsAr: 'التحدي (عربي)',
          onePerLine: 'نقطة واحدة في كل سطر.',
          keyFeatures: 'أهم المميزات',
          addFeature: 'إضافة ميزة',
          featureIcon: 'اسم الأيقونة',
          steps: 'خطوات التنفيذ',
          addStep: 'إضافة خطوة',
          results: 'النتائج',
          addResult: 'إضافة نتيجة',
          descEn: 'الوصف (إنجليزي)',
          descAr: 'الوصف (عربي)'
        }
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
