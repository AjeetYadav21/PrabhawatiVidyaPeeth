import enMessages from "../../messages/en.json";
import hiMessages from "../../messages/hi.json";
import type {
  AboutContent,
  AcademicsContent,
  AdmissionsContent,
  Announcement,
  ContactContent,
  EventItem,
  FooterContent,
  GalleryItem,
  HallOfFameContent,
  HeroContent,
  LocalizedText,
  WhyUsContent
} from "../types/content";

const en = enMessages as unknown as Record<string, string>;
const hi = hiMessages as unknown as Record<string, string>;

type MessageKey = keyof typeof enMessages;

const text = (key: MessageKey): LocalizedText => ({
  en: en[key],
  hi: hi[key]
});

const localized = (english: string, hindi: string): LocalizedText => ({
  en: english,
  hi: hindi
});

export const heroSeed: HeroContent = {
  title: text("hero_title"),
  subtitle1: text("hero_subtitle1"),
  subtitle2: text("hero_subtitle2"),
  ctaButtons: [
    { text: text("hero_btn_admission"), link: "#admissions" },
    { text: text("hero_btn_learn"), link: "#about" }
  ],
  backgroundImage: "/images/banners/PV-banner-1.jpg"
};

export const aboutSeed: AboutContent = {
  campusImage: "/images/gallery/school_campus.jpg",
  paragraphs: [
    { text: text("about_p1") },
    { text: text("about_p2") },
    { text: text("about_p3") }
  ],
  upBoardLink: "https://upmsp.edu.in/",
  principalMessage: {
    name: localized("Principal", "प्रधानाचार्य"),
    image: "/images/principal-removebg-preview.png",
    message: text("principal_msg")
  }
};

export const academicsSeed: AcademicsContent = {
  levels: [
    {
      name: text("nursery_title"),
      icon: "/images/icons/nursery.png",
      grades: localized("Nursery - KG", "नर्सरी - केजी"),
      description: text("nursery_desc")
    },
    {
      name: text("primary_title"),
      icon: "/images/icons/primary.png",
      grades: localized("Class 1 - 5", "कक्षा 1 - 5"),
      description: text("primary_desc")
    },
    {
      name: text("middle_title"),
      icon: "/images/icons/middle.png",
      grades: localized("Class 6 - 8", "कक्षा 6 - 8"),
      description: text("middle_desc")
    },
    {
      name: text("high_title"),
      icon: "/images/icons/highschool.png",
      grades: localized("Class 9 - 10", "कक्षा 9 - 10"),
      description: text("high_desc")
    },
    {
      name: text("senior_title"),
      icon: "/images/icons/highschool.png",
      grades: localized("Class 11 - 12", "कक्षा 11 - 12"),
      description: text("senior_desc")
    }
  ],
  subjects: [
    { name: text("core_math"), icon: "fa-solid fa-calculator" },
    { name: text("core_science"), icon: "fa-solid fa-flask" },
    { name: text("core_social"), icon: "fa-solid fa-globe" },
    { name: text("core_cs"), icon: "fa-solid fa-computer" },
    { name: text("core_pe"), icon: "fa-solid fa-dumbbell" }
  ],
  languages: [
    { name: text("lang_hindi") },
    { name: text("lang_english") },
    { name: text("lang_sanskrit") },
    { name: text("lang_urdu") }
  ]
};

export const whyUsSeed: WhyUsContent = {
  features: [
    { title: text("feature_faculty"), description: text("feature_faculty_desc"), icon: "fa-solid fa-person-chalkboard" },
    { title: text("feature_multilingual"), description: text("feature_multilingual_desc"), icon: "fa-solid fa-language" },
    { title: text("feature_infrastructure"), description: text("feature_infrastructure_desc"), icon: "fa-solid fa-school" },
    { title: text("feature_sports"), description: text("feature_sports_desc"), icon: "fa-solid fa-basketball" },
    { title: text("feature_curriculum"), description: text("feature_curriculum_desc"), icon: "fa-solid fa-book" },
    { title: text("feature_attention"), description: text("feature_attention_desc"), icon: "fa-solid fa-user-check" },
    { title: text("feature_values"), description: text("feature_values_desc"), icon: "fa-solid fa-heart" },
    { title: text("feature_results"), description: text("feature_results_desc"), icon: "fa-solid fa-chart-line" }
  ]
};

export const hallOfFameSeed: HallOfFameContent = {
  toppers: [
    {
      name: "Rahul Kumar",
      class: "Class 10",
      year: "2024",
      image: "/images/pv-logo.png",
      score: "95.6%"
    },
    {
      name: "Priya Singh",
      class: "Class 10",
      year: "2024",
      image: "/images/pv-logo.png",
      score: "94.8%"
    },
    {
      name: "Amit Sharma",
      class: "Class 12",
      year: "2023",
      image: "/images/pv-logo.png",
      score: "93.2%"
    },
    {
      name: "Neha Gupta",
      class: "Class 12",
      year: "2023",
      image: "/images/pv-logo.png",
      score: "92.4%"
    }
  ],
  achievements: [
    { title: text("achievement_1"), description: localized("Outstanding board examination performance across batches.", "विभिन्न बैचों में बोर्ड परीक्षा में उत्कृष्ट प्रदर्शन।"), icon: "fa-solid fa-trophy" },
    { title: text("achievement_2"), description: localized("Students represented the school with distinction in science competitions.", "विज्ञान प्रतियोगिताओं में छात्रों ने विद्यालय का गौरव बढ़ाया।"), icon: "fa-solid fa-flask" },
    { title: text("achievement_3"), description: localized("Strong performance in district and state level sports competitions.", "जिला और राज्य स्तरीय खेल प्रतियोगिताओं में शानदार प्रदर्शन।"), icon: "fa-solid fa-medal" },
    { title: text("achievement_4"), description: localized("Recognition for consistent academic and co-curricular excellence.", "निरंतर शैक्षणिक और सह-पाठ्यक्रम उत्कृष्टता के लिए सम्मान।"), icon: "fa-solid fa-award" }
  ]
};

export const gallerySeed: GalleryItem[] = [
  { image: "/images/gallery/school_campus.jpg", caption: localized("School Campus", "विद्यालय परिसर"), category: "campus" },
  { image: "/images/gallery/ground.jpg", caption: localized("Sports Ground", "खेल मैदान"), category: "campus" },
  { image: "/images/gallery/independent_day.jpg", caption: localized("Independence Day", "स्वतंत्रता दिवस"), category: "events" },
  { image: "/images/gallery/republic_day.jpg", caption: localized("Republic Day", "गणतंत्र दिवस"), category: "events" },
  { image: "/images/gallery/sports_day.jpg", caption: localized("Sports Day", "खेल दिवस"), category: "sports" },
  { image: "/images/annual function.jpg", caption: localized("Annual Function", "वार्षिक समारोह"), category: "events" },
  { image: "/images/events/art_work.jpg", caption: localized("Art & Creativity", "कला और रचनात्मकता"), category: "activities" },
  { image: "/images/gallery/1.jpg", caption: localized("School Facilities", "विद्यालय सुविधाएँ"), category: "campus" },
  { image: "/images/gallery/4-1.jpg", caption: localized("Learning Spaces", "अध्ययन कक्ष"), category: "campus" }
];

export const eventsSeed: EventItem[] = [
  {
    title: localized("Independence Day Celebration", "स्वतंत्रता दिवस समारोह"),
    description: localized(
      "Students and staff came together to celebrate India's Independence Day with patriotic fervor, flag hoisting, and cultural performances.",
      "छात्रों और शिक्षकों ने ध्वजारोहण और सांस्कृतिक कार्यक्रमों के साथ स्वतंत्रता दिवस मनाया।"
    ),
    date: "2025-08-15",
    image: "/images/independence.jpg"
  },
  {
    title: localized("Health & Wellness Initiative", "स्वास्थ्य और कल्याण पहल"),
    description: localized(
      "Special health awareness and vaccination camp organized for students ensuring their wellbeing and safety.",
      "छात्रों के स्वास्थ्य और सुरक्षा के लिए विशेष जागरूकता एवं टीकाकरण शिविर आयोजित किया गया।"
    ),
    date: "2025-07-12",
    image: "/images/vaccination.jpg"
  },
  {
    title: localized("Cultural Festival", "सांस्कृतिक उत्सव"),
    description: localized(
      "Annual cultural festival showcasing student talents in dance, music, drama, and other performing arts.",
      "वार्षिक सांस्कृतिक उत्सव में विद्यार्थियों की नृत्य, संगीत, नाटक और अन्य कला प्रतिभाओं का प्रदर्शन हुआ।"
    ),
    date: "2025-02-10",
    image: "/images/events/1.jpg"
  }
];

export const admissionsSeed: AdmissionsContent = {
  steps: [
    {
      number: 1,
      title: text("admission_step1"),
      description: localized(
        "Contact the school office or fill out the online inquiry form to get detailed information about admissions.",
        "प्रवेश की विस्तृत जानकारी के लिए विद्यालय कार्यालय से संपर्क करें या पूछताछ प्रपत्र भरें।"
      )
    },
    {
      number: 2,
      title: text("admission_step2"),
      description: localized(
        "Obtain and complete the admission form with all required information and documents.",
        "आवश्यक जानकारी और दस्तावेजों के साथ प्रवेश प्रपत्र प्राप्त कर उसे पूरा करें।"
      )
    },
    {
      number: 3,
      title: text("admission_step3"),
      description: localized(
        "Attend the scheduled assessment or interview as per grade requirements.",
        "कक्षा की आवश्यकता के अनुसार निर्धारित मूल्यांकन या साक्षात्कार में सम्मिलित हों।"
      )
    },
    {
      number: 4,
      title: text("admission_step4"),
      description: localized(
        "Upon selection, complete the admission formalities and fee payment to secure your seat.",
        "चयन के बाद प्रवेश औपचारिकताएँ और शुल्क जमा कर अपनी सीट सुनिश्चित करें।"
      )
    }
  ],
  documents: [
    { text: text("doc_birth") },
    { text: text("doc_tc") },
    { text: text("doc_marks") },
    { text: text("doc_address") },
    { text: text("doc_id") },
    { text: text("doc_photos") },
    { text: text("doc_caste") }
  ],
  inquiryInfo: {
    phone: "+91 945274 6680",
    email: "prabhawati9452@gmail.com",
    text: localized(
      "Contact the school office during working hours or use the contact form below.",
      "कार्य समय में विद्यालय कार्यालय से संपर्क करें या नीचे दिया गया संपर्क प्रपत्र भरें।"
    )
  }
};

export const contactSeed: ContactContent = {
  info: {
    address: localized(
      "Prabhawati Vidyapeeth, Sahatwar, Ballia, Uttar Pradesh, India",
      "प्रभवती विद्यापीठ, सहतवार, बलिया, उत्तर प्रदेश, भारत"
    ),
    phone: "+91 945274 6680, +91 838288 5839",
    email: "prabhawati9452@gmail.com",
    hours: text("hours_time")
  },
  tourImage: "/images/gallery/campus-tour.png"
};

export const announcementsSeed: Announcement[] = [
  {
    title: localized("Admissions Open for the New Session", "नए सत्र के लिए प्रवेश खुले हैं"),
    content: localized(
      "Applications are now open from Nursery to Grade 12. Parents may visit the school office during working hours.",
      "नर्सरी से कक्षा 12 तक के लिए आवेदन खुले हैं। अभिभावक कार्य समय में विद्यालय कार्यालय आ सकते हैं।"
    ),
    date: "2026-03-20",
    isActive: true
  },
  {
    title: localized("School Office Timings", "विद्यालय कार्यालय समय"),
    content: localized(
      "The school office is open Monday to Saturday from 8:00 AM to 4:00 PM for admissions and general inquiries.",
      "प्रवेश और सामान्य जानकारी के लिए विद्यालय कार्यालय सोमवार से शनिवार सुबह 8:00 बजे से शाम 4:00 बजे तक खुला रहता है।"
    ),
    date: "2026-03-10",
    isActive: true
  }
];

export const footerSeed: FooterContent = {
  aboutText: text("footer_about"),
  quickLinks: [
    { text: localized("About Us", "हमारे बारे में"), href: "#about" },
    { text: localized("Academics", "शैक्षणिक"), href: "#academics" },
    { text: localized("Admissions", "प्रवेश"), href: "#admissions" },
    { text: localized("Gallery", "गैलरी"), href: "#gallery" },
    { text: localized("Events", "कार्यक्रम"), href: "#events" },
    { text: localized("Contact", "संपर्क"), href: "#contact" }
  ],
  academicLinks: [
    { text: text("nursery_title"), href: "#academics" },
    { text: text("primary_title"), href: "#academics" },
    { text: text("middle_title"), href: "#academics" },
    { text: text("high_title"), href: "#academics" },
    { text: text("senior_title"), href: "#academics" },
    { text: localized("Languages Offered", "प्रस्तावित भाषाएँ"), href: "#academics" }
  ]
};
