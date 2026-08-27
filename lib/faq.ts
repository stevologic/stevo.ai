/**
 * Questions a prospect actually asks before the first call. The homepage FAQ
 * section and the FAQPage structured data both read from here, so the visible
 * answers and the machine-readable ones cannot drift apart. Every answer must
 * stay grounded in facts already published elsewhere on the site.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "How does an engagement start?",
    answer:
      "With a call or an email about the problem. The first working step is a baseline of what is actually true today, and scope is agreed before any work begins.",
  },
  {
    question: "Why are there no prices on the site?",
    answer:
      "Because scope drives price. No two programs start from the same place, so each package is scoped and quoted after a first conversation.",
  },
  {
    question: "Who does the work?",
    answer:
      "Stephen M Abbott. One seat, not a bench — the person on the first call is the person who runs the engagement.",
  },
  {
    question: "Do you work remotely?",
    answer:
      "Yes. The practice runs on Arizona time and works with clients anywhere. On-site time can be scoped into an engagement when it earns its place.",
  },
  {
    question: "What standards is the work measured against?",
    answer:
      "Security work maps to NIST CSF 2.0, ISO/IEC 27001, SOC 2, and CIS Controls v8. AI work maps to NIST AI RMF 1.0, ISO/IEC 42001, and the EU AI Act. Frameworks are the measuring stick, not the deliverable.",
  },
  {
    question: "What happens when the engagement ends?",
    answer:
      "Every engagement closes with a transfer: documented decisions, working systems, and an internal owner who can run the program without the consultant.",
  },
];
