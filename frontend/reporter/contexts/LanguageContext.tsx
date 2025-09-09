"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Splash Screen
    splashTitle: "Anonymous Crime Reporting",
    splashSubtitle: "Safe & Secure",

    // Emergency Banner
    emergencyBannerLine1: "In case of emergency, call immediately:",
    emergencyBannerLine2: "Police: 122 | Fire: 998 | Ambulance: 997",

    // Hero Section
    heroTitle: "Report Crime Anonymously",
    heroSubtitle:
      "Your safety is our priority. Report crimes safely and anonymously to help make your community safer.",
    startNewReport: "Start New Report",
    followUpOnReport: "Follow Up on Report",
    legalDisclaimer: "By using this service, you agree to our",
    legalLink: "Terms & Privacy Policy",

    // Report Page
    reportPageTitle: "Select Crime Category",
    reportPageSubtitle: "Choose the category that best describes the crime you want to report.",
    searchCategoryPlaceholder: "Search categories...",
    noCategoriesFound: "No categories found for",
    backButton: "Back",

    // Categories
    categoryChildrenTitle: "Crimes Against Children",
    categoryChildrenSubtitle: "Child abuse, neglect, exploitation, or endangerment",
    categoryDomesticAbuseTitle: "Domestic Violence",
    categoryDomesticAbuseSubtitle: "Physical, emotional, or psychological abuse in relationships",
    categoryInternetCrimeTitle: "Internet Crimes",
    categoryInternetCrimeSubtitle: "Cybercrime, online fraud, identity theft, hacking",
    categoryHumanTraffickingTitle: "Human Trafficking",
    categoryHumanTraffickingSubtitle: "Forced labor, sex trafficking, modern slavery",
    categorySexualAssaultTitle: "Sexual Assault",
    categorySexualAssaultSubtitle: "Sexual violence, harassment, or misconduct",
    categoryRestrainingOrdersTitle: "Restraining Order Violations",
    categoryRestrainingOrdersSubtitle: "Violations of protective or restraining orders",
    categoryStalkingTitle: "Stalking & Harassment",
    categoryStalkingSubtitle: "Persistent unwanted contact or surveillance",
    categoryHateCrimesTitle: "Hate Crimes",
    categoryHateCrimesSubtitle: "Crimes motivated by bias or prejudice",
    categoryBombThreatTitle: "Bomb Threats",
    categoryBombThreatSubtitle: "Explosive devices or terrorist threats",
    categoryOrganizedCrimeTitle: "Organized Crime",
    categoryOrganizedCrimeSubtitle: "Gang activity, racketeering, organized criminal enterprises",
    categoryWhistleblowerTitle: "Whistleblower Reports",
    categoryWhistleblowerSubtitle: "Government corruption, corporate misconduct",
    categoryInternationalCrimesTitle: "International Crimes",
    categoryInternationalCrimesSubtitle: "Cross-border crimes, international terrorism",
    categoryTheftTitle: "Theft & Property Crimes",
    categoryTheftSubtitle: "Burglary, robbery, vandalism, property damage",

    // Footer
    footerAccessibility: "Accessibility",
    footerTermsPrivacy: "Terms & Privacy",
    faqLink: "FAQ",

    // Info Pages
    accessibilityTitle: "Accessibility Statement",
    accessibilityContent: [
      "We are committed to ensuring that our anonymous crime reporting platform is accessible to all users, including those with disabilities.",
      "Our platform follows **Web Content Accessibility Guidelines (WCAG) 2.1** at Level AA to ensure compatibility with assistive technologies.",
      "**Accessibility Features:**",
      "• Screen reader compatibility with proper ARIA labels and semantic HTML",
      "• Keyboard navigation support for all interactive elements",
      "• High contrast color schemes for better visibility",
      "• Scalable text that can be enlarged up to 200% without loss of functionality",
      "• Alternative text for all images and visual content",
      "• Clear and simple language throughout the interface",
      "If you encounter any accessibility barriers while using our service, please contact our support team. We are continuously working to improve accessibility and welcome your feedback.",
    ],
    termsTitle: "Terms of Service & Privacy Policy",
    termsContent: [
      "**Anonymous Reporting Service**",
      "This platform provides a secure, anonymous way to report crimes to law enforcement agencies. Your privacy and safety are our top priorities.",
      "**Privacy Protection:**",
      "• No personal information is collected or stored",
      "• All reports are encrypted and transmitted securely",
      "• IP addresses are not logged or tracked",
      "• No cookies or tracking technologies are used",
      "**Important Legal Information:**",
      "• This service is for reporting crimes only",
      "• False reports may be subject to legal consequences",
      "• In emergency situations, call emergency services directly",
      "• Reports are forwarded to appropriate law enforcement agencies",
      "**Disclaimer:**",
      "This service does not guarantee investigation or response to reports. For immediate assistance or life-threatening situations, contact emergency services directly at 122.",
    ],

    // Follow Up Modal
    followUpTitle: "Follow Up on Your Report",
    followUpDescription: "Enter your report reference number to check the status of your submission.",
    followUpPlaceholder: "Enter report reference number",
    followUpSubmit: "Check Status",
    followUpCancel: "Cancel",

    // FAQ Modal
    faqTitle: "Frequently Asked Questions",
    faqClose: "Close",
    faq1Question: "Is my report really anonymous?",
    faq1Answer:
      "Yes, absolutely. We do not collect any personal information, IP addresses, or use tracking technologies. Your identity remains completely anonymous.",
    faq2Question: "What happens after I submit a report?",
    faq2Answer:
      "Your report is encrypted and securely transmitted to the appropriate law enforcement agency. You will receive a reference number to track your report status.",
    faq3Question: "Can I follow up on my report?",
    faq3Answer:
      "Yes, you can use the reference number provided after submission to check the status of your report through our follow-up system.",
    faq4Question: "What if I have an emergency?",
    faq4Answer:
      "This service is not for emergencies. If you are in immediate danger, call emergency services directly: Police 122, Fire 998, Ambulance 997.",
    faq5Question: "What information should I include?",
    faq5Answer:
      "Provide as much detail as possible including dates, times, locations, descriptions of people involved, and any evidence you may have.",
    faq6Question: "Is this service available 24/7?",
    faq6Answer:
      "Yes, you can submit reports at any time. However, processing times may vary depending on the law enforcement agency and case complexity.",
  },
  ar: {
    // Splash Screen
    splashTitle: "الإبلاغ المجهول عن الجرائم",
    splashSubtitle: "آمن ومضمون",

    // Emergency Banner
    emergencyBannerLine1: "في حالة الطوارئ، اتصل فوراً:",
    emergencyBannerLine2: "الشرطة: 122 | الإطفاء: 998 | الإسعاف: 997",

    // Hero Section
    heroTitle: "أبلغ عن الجرائم بشكل مجهول",
    heroSubtitle: "سلامتك أولويتنا. أبلغ عن الجرائم بأمان وبشكل مجهول للمساعدة في جعل مجتمعك أكثر أماناً.",
    startNewReport: "بدء بلاغ جديد",
    followUpOnReport: "متابعة البلاغ",
    legalDisclaimer: "باستخدام هذه الخدمة، فإنك توافق على",
    legalLink: "الشروط وسياسة الخصوصية",

    // Report Page
    reportPageTitle: "اختر فئة الجريمة",
    reportPageSubtitle: "اختر الفئة التي تصف بشكل أفضل الجريمة التي تريد الإبلاغ عنها.",
    searchCategoryPlaceholder: "البحث في الفئات...",
    noCategoriesFound: "لم يتم العثور على فئات لـ",
    backButton: "رجوع",

    // Categories
    categoryChildrenTitle: "الجرائم ضد الأطفال",
    categoryChildrenSubtitle: "إساءة معاملة الأطفال، الإهمال، الاستغلال، أو التعريض للخطر",
    categoryDomesticAbuseTitle: "العنف المنزلي",
    categoryDomesticAbuseSubtitle: "الإساءة الجسدية أو العاطفية أو النفسية في العلاقات",
    categoryInternetCrimeTitle: "جرائم الإنترنت",
    categoryInternetCrimeSubtitle: "الجرائم الإلكترونية، الاحتيال عبر الإنترنت، سرقة الهوية، القرصنة",
    categoryHumanTraffickingTitle: "الاتجار بالبشر",
    categoryHumanTraffickingSubtitle: "العمل القسري، الاتجار بالجنس، العبودية الحديثة",
    categorySexualAssaultTitle: "الاعتداء الجنسي",
    categorySexualAssaultSubtitle: "العنف الجنسي، التحرش، أو سوء السلوك",
    categoryRestrainingOrdersTitle: "انتهاك أوامر المنع",
    categoryRestrainingOrdersSubtitle: "انتهاكات أوامر الحماية أو المنع",
    categoryStalkingTitle: "المطاردة والمضايقة",
    categoryStalkingSubtitle: "الاتصال المستمر غير المرغوب فيه أو المراقبة",
    categoryHateCrimesTitle: "جرائم الكراهية",
    categoryHateCrimesSubtitle: "الجرائم المدفوعة بالتحيز أو التعصب",
    categoryBombThreatTitle: "تهديدات القنابل",
    categoryBombThreatSubtitle: "الأجهزة المتفجرة أو التهديدات الإرهابية",
    categoryOrganizedCrimeTitle: "الجريمة المنظمة",
    categoryOrganizedCrimeSubtitle: "نشاط العصابات، الابتزاز، المؤسسات الإجرامية المنظمة",
    categoryWhistleblowerTitle: "تقارير المبلغين",
    categoryWhistleblowerSubtitle: "فساد الحكومة، سوء السلوك المؤسسي",
    categoryInternationalCrimesTitle: "الجرائم الدولية",
    categoryInternationalCrimesSubtitle: "الجرائم عبر الحدود، الإرهاب الدولي",
    categoryTheftTitle: "السرقة وجرائم الممتلكات",
    categoryTheftSubtitle: "السطو، السرقة، التخريب، إتلاف الممتلكات",

    // Footer
    footerAccessibility: "إمكانية الوصول",
    footerTermsPrivacy: "الشروط والخصوصية",
    faqLink: "الأسئلة الشائعة",

    // Info Pages
    accessibilityTitle: "بيان إمكانية الوصول",
    accessibilityContent: [
      "نحن ملتزمون بضمان أن منصة الإبلاغ المجهول عن الجرائم متاحة لجميع المستخدمين، بما في ذلك ذوي الإعاقة.",
      "تتبع منصتنا **إرشادات إمكانية الوصول لمحتوى الويب (WCAG) 2.1** في المستوى AA لضمان التوافق مع التقنيات المساعدة.",
      "**ميزات إمكانية الوصول:**",
      "• التوافق مع قارئ الشاشة مع تسميات ARIA المناسبة و HTML الدلالي",
      "• دعم التنقل بلوحة المفاتيح لجميع العناصر التفاعلية",
      "• أنظمة ألوان عالية التباين لرؤية أفضل",
      "• نص قابل للتكبير يمكن تكبيره حتى 200% دون فقدان الوظائف",
      "• نص بديل لجميع الصور والمحتوى المرئي",
      "• لغة واضحة وبسيطة في جميع أنحاء الواجهة",
      "إذا واجهت أي حواجز في إمكانية الوصول أثناء استخدام خدمتنا، يرجى الاتصال بفريق الدعم لدينا. نحن نعمل باستمرار على تحسين إمكانية الوصول ونرحب بملاحظاتك.",
    ],
    termsTitle: "شروط الخدمة وسياسة الخصوصية",
    termsContent: [
      "**خدمة الإبلاغ المجهول**",
      "توفر هذه المنصة طريقة آمنة ومجهولة للإبلاغ عن الجرائم لوكالات إنفاذ القانون. خصوصيتك وسلامتك هما أولويتنا القصوى.",
      "**حماية الخصوصية:**",
      "• لا يتم جمع أو تخزين أي معلومات شخصية",
      "• جميع التقارير مشفرة ومرسلة بشكل آمن",
      "• عناوين IP غير مسجلة أو متتبعة",
      "• لا يتم استخدام ملفات تعريف الارتباط أو تقنيات التتبع",
      "**معلومات قانونية مهمة:**",
      "• هذه الخدمة مخصصة للإبلاغ عن الجرائم فقط",
      "• التقارير الكاذبة قد تخضع لعواقب قانونية",
      "• في حالات الطوارئ، اتصل بخدمات الطوارئ مباشرة",
      "• يتم إرسال التقارير إلى وكالات إنفاذ القانون المناسبة",
      "**إخلاء المسؤولية:**",
      "هذه الخدمة لا تضمن التحقيق أو الاستجابة للتقارير. للحصول على مساعدة فورية أو في المواقف المهددة للحياة، اتصل بخدمات الطوارئ مباشرة على 122.",
    ],

    // Follow Up Modal
    followUpTitle: "متابعة بلاغك",
    followUpDescription: "أدخل رقم مرجع البلاغ للتحقق من حالة تقديمك.",
    followUpPlaceholder: "أدخل رقم مرجع البلاغ",
    followUpSubmit: "تحقق من الحالة",
    followUpCancel: "إلغاء",

    // FAQ Modal
    faqTitle: "الأسئلة الشائعة",
    faqClose: "إغلاق",
    faq1Question: "هل بلاغي مجهول حقاً؟",
    faq1Answer:
      "نعم، بالتأكيد. نحن لا نجمع أي معلومات شخصية أو عناوين IP أو نستخدم تقنيات التتبع. هويتك تبقى مجهولة تماماً.",
    faq2Question: "ماذا يحدث بعد تقديم البلاغ؟",
    faq2Answer:
      "يتم تشفير بلاغك وإرساله بشكل آمن إلى وكالة إنفاذ القانون المناسبة. ستحصل على رقم مرجعي لتتبع حالة بلاغك.",
    faq3Question: "هل يمكنني متابعة بلاغي؟",
    faq3Answer: "نعم، يمكنك استخدام الرقم المرجعي المقدم بعد التقديم للتحقق من حالة بلاغك من خلال نظام المتابعة لدينا.",
    faq4Question: "ماذا لو كان لدي حالة طوارئ؟",
    faq4Answer:
      "هذه الخدمة ليست لحالات الطوارئ. إذا كنت في خطر مباشر، اتصل بخدمات الطوارئ مباشرة: الشرطة 122، الإطفاء 998، الإسعاف 997.",
    faq5Question: "ما المعلومات التي يجب أن أتضمنها؟",
    faq5Answer:
      "قدم أكبر قدر ممكن من التفاصيل بما في ذلك التواريخ والأوقات والمواقع ووصف الأشخاص المعنيين وأي أدلة قد تكون لديك.",
    faq6Question: "هل هذه الخدمة متاحة على مدار الساعة؟",
    faq6Answer:
      "نعم، يمكنك تقديم التقارير في أي وقت. ومع ذلك، قد تختلف أوقات المعالجة حسب وكالة إنفاذ القانون وتعقيد القضية.",
  },
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["en"]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

