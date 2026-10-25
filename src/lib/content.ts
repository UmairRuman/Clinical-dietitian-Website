// Site copy. DRAFT – wording is written to be safe and general; client to review/approve.
// Moves to the database (admin-editable) in Milestone 2.

export type IconKey = "weight" | "diabetes" | "uric" | "pressure" | "sports" | "pcos";

export type ServiceDetail = {
  slug: string;
  icon: IconKey;
  title: string;
  short: string;
  intro: string;
  whoFor: string[];
  approach: string[];
  youGet: string[];
  faqs: { q: string; a: string }[];
};

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "weight-management",
    icon: "weight",
    title: "Weight management",
    short: "Sustainable fat loss and healthy weight gain plans built around your routine.",
    intro:
      "Whether you want to lose weight, gain it healthily or simply stop yo-yoing, a plan only works if it fits your real life. We build one around your schedule, your family's food and your budget.",
    whoFor: [
      "You have tried crash diets and the weight keeps coming back",
      "You want to gain weight in a healthy, steady way",
      "You eat home-cooked food and want a plan that respects that",
      "You feel tired, bloated or confused about what to eat",
    ],
    approach: [
      "A relaxed first consultation covering your history, routine, sleep, activity and goals",
      "A realistic target and timeline, not a quick fix",
      "Regular follow-ups so the plan adapts as your body and life change",
    ],
    youGet: ["A personalised meal plan with local, familiar foods", "Portion and swap guidance for eating out and family meals", "Follow-up reviews and adjustments", "Support between sessions for quick questions"],
    faqs: [
      { q: "Will I have to stop eating roti or rice?", a: "No. Plans are built around the food you already eat. We adjust portions and combinations rather than banning foods." },
      { q: "How fast will I lose weight?", a: "Healthy progress is steady and varies from person to person. Your dietitian will set a realistic pace with you. Results are not guaranteed." },
    ],
  },
  {
    slug: "diabetic-diet-plans",
    icon: "diabetes",
    title: "Diabetic diet plans",
    short: "Blood-sugar friendly meal plans that still feel like real food.",
    intro:
      "Living with diabetes or pre-diabetes does not mean a plate of boiled vegetables. A good plan balances carbohydrates, protein and fibre across the day so you feel satisfied and steady.",
    whoFor: [
      "You have type 1, type 2 or gestational diabetes, or pre-diabetes",
      "Your sugar readings swing and you want to understand why",
      "You want to eat with family without feeling left out",
      "You have been told to 'watch your diet' but not how",
    ],
    approach: [
      "Review of your reports, medication timing and daily routine",
      "Carbohydrate awareness taught in simple, practical terms",
      "A plan designed to work alongside your doctor's treatment, never replace it",
    ],
    youGet: ["Meal plan matched to your routine and medication schedule", "Simple guide to portions, swaps and snacks", "Tips for fasting days, travel and festivals", "Follow-up to review your readings and adjust"],
    faqs: [
      { q: "Can I still eat sweets?", a: "Occasionally and with planning, many people can. Your plan will show how to fit them in safely." },
      { q: "Do I need to stop my medicines?", a: "Never. Diet advice works alongside your doctor's treatment. Always follow your doctor's guidance on medication." },
    ],
  },
  {
    slug: "uric-acid",
    icon: "uric",
    title: "Uric acid",
    short: "Food guidance to help keep uric acid levels in a healthy range.",
    intro:
      "High uric acid can be uncomfortable and confusing, with long lists of foods to avoid. We simplify it: what to limit, what to enjoy and how to build meals that support healthy levels.",
    whoFor: [
      "Your uric acid has been flagged high in a recent test",
      "You get joint discomfort and want to understand food triggers",
      "You are unsure which foods are really a problem",
    ],
    approach: [
      "Look at your usual diet, hydration and lifestyle",
      "Clear guidance on foods to limit versus foods that are fine",
      "A balanced plan that does not leave you hungry or restricted",
    ],
    youGet: ["Easy food list: limit, moderate, enjoy", "Weekly meal plan using everyday foods", "Hydration and lifestyle tips", "Follow-up after your next test"],
    faqs: [
      { q: "Do I have to give up all dal and meat?", a: "Not necessarily. Portions and frequency matter more than blanket bans, and your plan will be specific to you." },
    ],
  },
  {
    slug: "blood-pressure",
    icon: "pressure",
    title: "Hypo / hypertension",
    short: "Practical nutrition for low and high blood pressure.",
    intro:
      "Food, salt, hydration and meal timing all play a part in blood pressure. We focus on small, practical changes that fit your daily routine and work alongside medical care.",
    whoFor: [
      "You have high blood pressure and want to support it through food",
      "You experience low blood pressure, dizziness or fatigue",
      "You want to cut salt without losing flavour",
    ],
    approach: [
      "Review of your readings, routine, medication and eating pattern",
      "Gradual, realistic changes rather than a total overhaul",
      "Meal structure and hydration tailored to high or low pressure",
    ],
    youGet: ["Tailored meal plan", "Low-salt cooking and flavour tips", "Hydration and meal-timing guidance", "Follow-up to review progress"],
    faqs: [
      { q: "Is this a replacement for my doctor's advice?", a: "No. Nutrition support complements your medical care. Continue to follow your doctor's treatment." },
    ],
  },
  {
    slug: "sports-nutrition",
    icon: "sports",
    title: "Sports nutrition",
    short: "Fuel, recovery and body-composition planning for active people.",
    intro:
      "Training hard needs the right fuel. We plan what and when to eat so you have energy for sessions, recover well and move towards your body-composition goals.",
    whoFor: [
      "You train at the gym, play a sport or run regularly",
      "You want to build muscle or cut body fat",
      "You are not sure how to eat around your workouts",
    ],
    approach: [
      "Understand your training schedule, goals and current diet",
      "Plan calories, protein and meal timing around your sessions",
      "Review progress and fine-tune every few weeks",
    ],
    youGet: ["Training-day and rest-day plans", "Pre- and post-workout meal ideas", "Protein and hydration guidance", "Regular check-ins as your training changes"],
    faqs: [
      { q: "Do I need supplements?", a: "Often food covers most needs. If supplements make sense for you, your dietitian will explain why and how." },
    ],
  },
  {
    slug: "pcos-diet-plans",
    icon: "pcos",
    title: "PCOS diet plans",
    short: "Hormone-aware eating that supports cycles, energy and weight.",
    intro:
      "PCOS affects every woman differently. Nutrition can support insulin balance, energy and weight, and make daily life feel more manageable. We build a plan around your symptoms and goals.",
    whoFor: [
      "You have been diagnosed with PCOS or suspect it",
      "You have irregular cycles, fatigue or difficulty managing weight",
      "You want guidance that is not just 'lose weight'",
    ],
    approach: [
      "Listen to your symptoms, cycle pattern, routine and reports",
      "Focus on blood-sugar balance, protein, fibre and consistent meals",
      "Gentle, sustainable steps that you can keep up",
    ],
    youGet: ["Personalised, PCOS-aware meal plan", "Guidance on cravings, snacks and meal timing", "Lifestyle tips for sleep, stress and movement", "Follow-up to adjust as your body responds"],
    faqs: [
      { q: "Is there a special PCOS diet?", a: "There is no single diet that suits everyone. Your plan is built around your symptoms, preferences and lifestyle." },
    ],
  },
];

export const generalFaqs = [
  { q: "How do consultations work?", a: "After you book, we meet by WhatsApp call or video, Zoom, Microsoft Teams or in the clinic, whichever suits you. We go through your history, routine and goals, then you receive a personalised plan." },
  { q: "How do I book a session?", a: "Tap Book a Session and choose WhatsApp for the fastest reply, or send an enquiry with your preferred date and time. We will confirm an appointment and send you an appointment card." },
  { q: "Do I need medical reports?", a: "Not for your first conversation. If you have recent reports such as blood sugar, uric acid or thyroid tests, share them, as they help us tailor your plan." },
  { q: "Will I have to give up my favourite foods?", a: "No. Plans use everyday, home-cooked foods and focus on balance, portions and timing rather than strict bans." },
  { q: "How soon will I see results?", a: "It varies from person to person and depends on your goals and consistency. We set a realistic pace together. Results are not guaranteed." },
  { q: "Is my information kept private?", a: "Yes. Your details are used only to arrange and deliver your consultation, and are never shown publicly." },
];

export const processSteps = [
  { n: "01", title: "Reach out", text: "Message on WhatsApp or send an enquiry with your preferred time. No obligation, just a conversation." },
  { n: "02", title: "Consultation", text: "We talk through your health history, routine, food habits and goals, so nothing is guesswork." },
  { n: "03", title: "Your plan & follow-up", text: "You get a personalised plan with local foods, then regular check-ins to adjust as you progress." },
];

export const principles = [
  { title: "Personalised", text: "No copy-paste diet charts. Every plan starts with your body, routine and preferences." },
  { title: "Practical", text: "Plans use foods you already buy and cook, and fit the way your family eats." },
  { title: "Sustainable", text: "Small, steady changes you can keep up, so healthy living feels simple and achievable." },
];

export const serviceBySlug = (slug: string) => serviceDetails.find((s) => s.slug === slug);
