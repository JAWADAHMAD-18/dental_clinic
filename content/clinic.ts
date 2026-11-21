export interface ClinicService {
  name: string;
  slug: string;
  shortDescription: string;
  whatItIs: string;
  whatToExpect: string;
  sampleFee: string;
}

export interface ClinicFeeItem {
  service: string;
  sampleFee: string;
  details?: string;
}

export interface ClinicTeamMember {
  name: string;
  initials: string;
  role: string;
  bio: string;
}

export interface ClinicFaq {
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface ClinicImage {
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  width: number;
  height: number;
}

export interface ClinicData {
  name: string;
  tagline: string;
  subhead: string;
  phone: string;
  email: string;
  address: {
    line1: string;
    suburb: string;
    state: string;
    postcode: string;
    full: string;
  };
  hours: {
    summary: string;
    monFri: string;
    sat: string;
    sun: string;
  };
  sampleLabels: {
    topStrip: string;
    topStripLink: string;
    footerNotice: string;
    formNotice: string;
    chatNotice: string;
    feesLabel: string;
    feesDisclaimer: string;
    teamNotice: string;
  };
  navLinks: NavLink[];
  footerLinks: NavLink[];
  primaryCta: NavLink;
  services: ClinicService[];
  feeItems: ClinicFeeItem[];
  feeNotes: string[];
  team: ClinicTeamMember[];
  about: {
    heading: string;
    subhead: string;
    approachParagraph: string;
    values: { title: string; description: string }[];
  };
  faqs: ClinicFaq[];
  images: {
    hero: ClinicImage;
  };
}

export const clinic: ClinicData = {
  name: "Alder & Finch Dental",
  tagline: "Calm, careful dentistry for the whole family.",
  subhead:
    "Check-ups, children's care and urgent appointments, in a quiet space designed to put you at ease.",
  phone: "(02) 5550 0142",
  email: "hello@example.com",
  address: {
    line1: "Level 1, 12 Example Street",
    suburb: "Sydney",
    state: "NSW",
    postcode: "2000",
    full: "Level 1, 12 Example Street, Sydney NSW 2000",
  },
  hours: {
    summary: "Mon-Fri 8-6, Sat 8:30-1",
    monFri: "Monday – Friday: 8:00 am – 6:00 pm",
    sat: "Saturday: 8:30 am – 1:00 pm",
    sun: "Sunday: Closed",
  },
  sampleLabels: {
    topStrip: "Sample website designed by Zalvro. Placeholder content.",
    topStripLink: "https://zalvrohq.com",
    footerNotice: "Sample website designed by Zalvro. Placeholder content.",
    formNotice:
      "Sample assistant and enquiry form. Please don't enter real personal or medical information.",
    chatNotice:
      "Sample assistant. Please don't enter real personal or medical information.",
    feesLabel: "Sample fees",
    feesDisclaimer:
      "Fees are samples. Your dentist will confirm costs in a written treatment plan before treatment.",
    teamNotice: "Placeholder profiles",
  },
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Fees", href: "/fees" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footerLinks: [
    { label: "Services", href: "/services" },
    { label: "Fees", href: "/fees" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
  ],
  primaryCta: {
    label: "Make an enquiry",
    href: "/contact",
  },
  services: [
    {
      name: "Check-up and clean",
      slug: "check-up-and-clean",
      shortDescription:
        "Comprehensive examination, gentle scaling and polish, and preventive care plan.",
      whatItIs:
        "A routine check-up and professional clean is the cornerstone of preventive dental health. It includes a thorough examination of your teeth, gums, and oral tissue, followed by a gentle scale and polish to remove plaque and calculus deposits.",
      whatToExpect:
        "Your appointment lasts approximately 45 to 60 minutes. Your dentist will check for early signs of decay, measure gum health, take diagnostic digital X-rays if clinically necessary, and provide tailored oral hygiene advice. You will receive a written overview of any recommended care before anything proceeds.",
      sampleFee: "From AUD 195",
    },
    {
      name: "Fillings",
      slug: "fillings",
      shortDescription:
        "Tooth-coloured composite restorations to repair decay or damage seamlessly.",
      whatItIs:
        "Fillings repair teeth damaged by decay, fractures, or wear. We use tooth-coloured composite resin materials that bond directly to your tooth structure and closely match your natural enamel colour.",
      whatToExpect:
        "We prioritize comfort with gentle numbing techniques and continuous checking. After gently removing compromised tooth material, the composite resin is layered and cured with a specialized light, then carefully shaped and polished to match your natural bite.",
      sampleFee: "From AUD 220 per tooth",
    },
    {
      name: "Children's care",
      slug: "childrens-care",
      shortDescription:
        "Gentle, stress-free check-ups and habit coaching for growing smiles.",
      whatItIs:
        "A dedicated, child-friendly approach to paediatric oral health. Early visits help children build confidence in the dental chair and develop positive lifelong habits.",
      whatToExpect:
        "We introduce equipment gently, counting teeth and demonstrating tools in a relaxed, playful way. Appointments include a gentle polish, fluoride application if appropriate, fissure sealants where indicated, and practical brushing advice for parents.",
      sampleFee: "From AUD 120",
    },
    {
      name: "Teeth whitening",
      slug: "teeth-whitening",
      shortDescription:
        "Safe, dentist-supervised custom take-home whitening kits.",
      whatItIs:
        "Dentist-supervised whitening designed to safely brighten discoloured or stained teeth. Our take-home kits use custom laboratory-fabricated trays that fit your teeth precisely.",
      whatToExpect:
        "We first perform a clinical exam to ensure your teeth and gums are healthy and suitable for whitening. We then take digital impressions to create your custom trays and provide clinical-grade whitening gel with clear daily instructions to minimise sensitivity.",
      sampleFee: "From AUD 450",
    },
    {
      name: "Clear aligners",
      slug: "clear-aligners",
      shortDescription:
        "Discreet orthodontic alignment for mild to moderate tooth straightening.",
      whatItIs:
        "A modern, transparent orthodontic option that straightens crowded, spaced, or misaligned teeth using a series of custom-moulded clear plastic aligners.",
      whatToExpect:
        "During your initial consultation, we examine your bite, take digital scans, and evaluate whether clear aligners suit your clinical needs. We discuss treatment timelines, expectations, and provide a full written treatment quote before ordering any aligners.",
      sampleFee: "AUD 95 (consultation)",
    },
    {
      name: "Emergency care",
      slug: "emergency-care",
      shortDescription:
        "Prompt assessment and pain relief for urgent dental issues.",
      whatItIs:
        "Priority appointments set aside daily for acute toothache, chipped or broken teeth, facial swelling, or dental trauma.",
      whatToExpect:
        "Our immediate focus is diagnosing the cause of pain, providing fast and effective relief, and stabilizing the tooth. If further treatment is required, your dentist will present clear options and costs for complete restorative treatment.",
      sampleFee: "Assessment from AUD 95",
    },
  ],
  feeItems: [
    {
      service: "Check-up and clean",
      sampleFee: "From AUD 195",
      details: "Comprehensive oral exam, plaque removal, gentle polish",
    },
    {
      service: "Children's check-up and clean",
      sampleFee: "From AUD 120",
      details: "Gentle clean, fluoride application, oral hygiene coaching",
    },
    {
      service: "Filling (tooth-coloured composite)",
      sampleFee: "From AUD 220 per tooth",
      details: "Price varies by surface size and tooth position",
    },
    {
      service: "Teeth whitening (take-home kit)",
      sampleFee: "From AUD 450",
      details: "Custom upper and lower trays plus clinical whitening gel",
    },
    {
      service: "Clear aligner consultation",
      sampleFee: "AUD 95",
      details: "Initial suitability assessment and digital simulation overview",
    },
    {
      service: "Emergency dental assessment",
      sampleFee: "From AUD 95",
      details: "Focused problem exam, diagnostic X-ray, and pain management plan",
    },
  ],
  feeNotes: [
    "Written estimate provided before any treatment begins.",
    "On-the-spot health fund claims available via HICAPS (placeholder).",
    "Please provide 24 hours notice for cancellations.",
  ],
  team: [
    {
      name: "Dr. A. Placeholder",
      initials: "AP",
      role: "Principal Dentist",
      bio: "Focuses on gentle preventive care, restorative treatments, and calm patient communication.",
    },
    {
      name: "Dr. B. Placeholder",
      initials: "BP",
      role: "Associate Dentist",
      bio: "Experienced in family dental care, paediatric visits, and clear aligner consultations.",
    },
    {
      name: "C. Placeholder",
      initials: "CP",
      role: "Dental Hygienist",
      bio: "Dedicated to thorough, gentle preventive cleans and practical oral hygiene advice.",
    },
    {
      name: "D. Placeholder",
      initials: "DP",
      role: "Practice Manager",
      bio: "Coordinates appointments, patient enquiries, and smooth daily practice operations.",
    },
  ],
  about: {
    heading: "About Alder & Finch",
    subhead:
      "A calm, general and family dental practice in central Sydney committed to clear explanations and unhurried care.",
    approachParagraph:
      "We believe that visiting the dentist should be calm, clear, and predictable. Our practice is designed to remove the tension often associated with dental visits: you will always be heard, procedures will be explained in plain language, and all costs are confirmed in writing before any work begins.",
    values: [
      {
        title: "Calm and unhurried",
        description:
          "Quiet treatment rooms with natural light, gentle pacing, and extra time allocated so you never feel rushed.",
      },
      {
        title: "Clear explanations",
        description:
          "We show you digital imaging, explain options in straightforward English, and answer every question before proceeding.",
      },
      {
        title: "No cost surprises",
        description:
          "Written itemised estimates are provided before any treatment starts. We discuss what is essential now and what can wait.",
      },
    ],
  },
  faqs: [
    {
      question: "How do I book an appointment?",
      answer:
        "You can submit an enquiry through our online form any time. Our team reviews enquiries during business hours and contacts you to confirm a suitable date and time.",
    },
    {
      question: "What should I expect during my first visit?",
      answer:
        "Your first visit includes a relaxed discussion about your dental history, a gentle examination of your teeth and gums, and any necessary digital imaging. We explain everything clearly and provide written costs before performing any treatment.",
    },
    {
      question: "Do you accept health insurance and HICAPS?",
      answer:
        "Yes, we support on-the-spot electronic claiming for all major Australian health funds via HICAPS. You only pay the gap on the day.",
    },
    {
      question: "What if I have dental anxiety or haven't visited in years?",
      answer:
        "Our clinic is intentionally calm and unhurried. Let us know when submitting your enquiry, and we will take extra time to explain each step, pause whenever you need, and ensure you remain fully in control.",
    },
    {
      question: "What should I do in a dental emergency?",
      answer:
        "If you have severe pain, bleeding, or dental trauma, call us on (02) 5550 0142 or send an urgent enquiry. If you experience difficulty breathing, uncontrolled bleeding, or severe facial swelling, call 000 or visit hospital emergency immediately.",
    },
  ],
  images: {
    hero: {
      url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09",
      alt: "Bright and calm dental treatment room with natural light, clean clinic equipment, and a potted plant",
      photographer: "Ozkan Guner",
      photographerUrl: "https://unsplash.com/@ozkanguner",
      width: 1200,
      height: 800,
    },
  },
};
