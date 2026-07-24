export const SCHEMA_VERSION = "1.0.0";
export const DRAFT_TTL_DAYS = 7;

export const RECRUITMENT_SOURCES = [
  "personal_network",
  "professional_network",
  "open_public",
  "practitioner_organisation",
  "partner_referral",
  "unknown",
];

export const ASSIGNMENT_ARMS = ["neutral", "frame_a", "frame_b"];

export const ROLE_OPTIONS = [
  {
    value: "user",
    label: "I may use counselling or psychotherapy",
    note: "Questions about a possible support service.",
  },
  {
    value: "practitioner",
    label: "I am a mental-health practitioner",
    note: "Questions about possible paid professional opportunities.",
  },
];

const LIKELIHOOD_OPTIONS = [
  { value: "very_likely", label: "Very likely" },
  { value: "somewhat_likely", label: "Somewhat likely" },
  { value: "neither", label: "Neither likely nor unlikely" },
  { value: "somewhat_unlikely", label: "Somewhat unlikely" },
  { value: "very_unlikely", label: "Very unlikely" },
  {
    value: "insufficient_information",
    label: "Not enough information to judge",
  },
];

const RELEVANCE_OPTIONS = [
  { value: "very_relevant", label: "Very relevant" },
  { value: "somewhat_relevant", label: "Somewhat relevant" },
  {
    value: "neither",
    label: "Neither relevant nor not relevant",
  },
  { value: "somewhat_not_relevant", label: "Somewhat not relevant" },
  { value: "not_relevant", label: "Not relevant" },
  {
    value: "insufficient_information",
    label: "Not enough information to judge",
  },
];

const CLARITY_OPTIONS = [
  { value: "very_clear", label: "Very clear" },
  { value: "somewhat_clear", label: "Somewhat clear" },
  { value: "neither", label: "Neither clear nor unclear" },
  { value: "somewhat_unclear", label: "Somewhat unclear" },
  { value: "very_unclear", label: "Very unclear" },
];

const FAMILIARITY_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const USER_MESSAGES = {
  neutral: {
    eyebrow: "About the possible service",
    title: "One possible way the service could work",
    body:
      "A counselling or psychotherapy service is being explored in two formats: individual sessions and online small-group sessions lasting 75 minutes with about 4–6 adults. Both formats would begin with six weekly sessions, followed by a brief progress review to discuss what happens next. The service would not require every practitioner or client to use one school of therapy. It would aim to help progress become visible during the journey.",
  },
  frame_a: {
    eyebrow: "About the possible service",
    title: "A manageable first step",
    body:
      "The possible service is designed around a manageable first step: six weekly counselling or psychotherapy sessions, followed by a brief progress review to discuss what happens next. It is being explored through individual sessions and online small groups lasting 75 minutes with about 4–6 adults. The service would not require every practitioner or client to use one school of therapy, and would aim to help progress become visible during the journey.",
  },
  frame_b: {
    eyebrow: "About the possible service",
    title: "Progress made easier to discuss",
    body:
      "The possible service would aim to make progress visible during counselling or psychotherapy, with a brief progress review after an initial six weekly sessions to discuss what happens next. It is being explored through individual sessions and online small groups lasting 75 minutes with about 4–6 adults. The service would not require every practitioner or client to use one school of therapy. Both formats would use the same six-session starting cycle.",
  },
};

export const PRACTITIONER_MESSAGES = {
  neutral: {
    eyebrow: "About the possible platform",
    title: "One possible way the platform could work",
    body:
      "A possible platform is being explored as one source of paid counselling or psychotherapy opportunities for practitioners. The work could include individual sessions and online small groups of about 4–6 adults lasting 75 minutes. Each format would begin with six weekly sessions, followed by a brief progress review. The platform would not require every practitioner or client to use one school of therapy. It would aim to help progress become visible and support a discussion about what happens next.",
  },
  frame_a: {
    eyebrow: "About the possible platform",
    title: "A defined starting cycle",
    body:
      "The possible platform is being explored around a defined starting cycle: six weekly counselling or psychotherapy sessions followed by a brief progress review. It could be one source of paid opportunities for practitioners, including individual sessions and online small groups of about 4–6 adults lasting 75 minutes. The platform would not require every practitioner or client to use one school of therapy. It would aim to help progress become visible and support a discussion about what happens next.",
  },
  frame_b: {
    eyebrow: "About the possible platform",
    title: "A shared review point",
    body:
      "The possible platform is being explored with a brief progress review as a shared point intended to help progress become visible and support a discussion about what happens next. It could be one source of paid counselling or psychotherapy opportunities for practitioners. The work could include individual sessions and online small groups of about 4–6 adults lasting 75 minutes. Each format would begin with six weekly sessions. The platform would not require every practitioner or client to use one school of therapy.",
  },
};

export const QUESTIONS = {
  u_intro: {
    id: "u_intro",
    pathway: "user",
    part: 1,
    type: "information",
    eyebrow: "Before you begin",
    title: "Research, not care",
    body: [
      "This survey is research into a possible counselling or psychotherapy service. It is not therapy, diagnosis, clinical screening, an emergency service, or an offer of care.",
      "Taking part is voluntary. You can leave at any time. Positive, negative and uncertain answers are equally useful. We do not ask for your name or contact details.",
    ],
    notice:
      "Privacy: unfinished answers are saved only in this browser for up to 7 days. When you complete the survey, your anonymous response is securely submitted. We do not ask for your name or contact details.",
    actionLabel: "Continue",
  },
  u_age: {
    id: "u_age",
    pathway: "user",
    part: 1,
    type: "radio",
    title: "Are you 18 years old or older?",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "user_adult_eligibility" },
  },
  u_consent: {
    id: "u_consent",
    pathway: "user",
    part: 1,
    type: "consent",
    eyebrow: "Your choice",
    title: "Do you choose to take part?",
    helper:
      "You can stop at any time. Leaving the survey will not submit a response.",
    label: "I have read the information and choose to take part.",
    required: true,
    analysis: { value: "user_consent" },
  },
  u_ineligible: {
    id: "u_ineligible",
    pathway: "user",
    part: 1,
    type: "eligibility-exit",
    eyebrow: "About this survey",
    title: "This survey is for adults aged 18 or older.",
    body:
      "You have not entered the main survey, and no response has been sent. You can go back if you selected the wrong answer.",
  },
  u1: {
    id: "u1",
    pathway: "user",
    part: 2,
    type: "radio",
    title: "Which of these best describes your position at the moment?",
    helper: "There is no preferred answer.",
    required: true,
    options: [
      {
        value: "current_support",
        label: "I am currently receiving counselling or psychotherapy",
      },
      {
        value: "past_support",
        label: "I have received it before, but not now",
      },
      {
        value: "considering",
        label: "I have considered it but have not received it",
      },
      {
        value: "not_considered",
        label: "I have not considered it for myself",
      },
      { value: "not_sure", label: "I am not sure" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "user_support_position" },
  },
  u3: {
    id: "u3",
    pathway: "user",
    part: 2,
    type: "checkbox",
    title: "In the past 12 months, which, if any, of these have you done?",
    helper: "Select all that apply.",
    required: true,
    randomize: true,
    options: [
      {
        value: "looked_for_information",
        label: "Looked for information about counselling or psychotherapy",
      },
      {
        value: "asked_someone",
        label: "Asked someone I trust about finding support",
      },
      {
        value: "contacted_practitioner",
        label: "Contacted a practitioner or service",
      },
      {
        value: "attended_session",
        label: "Attended at least one counselling or psychotherapy session",
      },
      {
        value: "continued_or_returned",
        label:
          "Continued with, or returned to, counselling or psychotherapy",
      },
      {
        value: "none",
        label: "I have not taken any of these steps",
        fixed: true,
        exclusive: true,
      },
      {
        value: "prefer_not_to_say",
        label: "Prefer not to say",
        fixed: true,
        exclusive: true,
      },
    ],
    analysis: { values: "user_recent_behaviour" },
  },
  user_message: {
    id: "user_message",
    pathway: "user",
    part: 3,
    type: "concept",
    messages: USER_MESSAGES,
    facts: [
      "Individual and online small-group formats",
      "Small groups: 75 minutes with about 4–6 adults",
      "Six weekly sessions, then a brief progress review",
      "No single school of therapy imposed across everyone",
    ],
    footer:
      "This is a description for research, not a service currently being offered through this survey.",
  },
  u5: {
    id: "u5",
    pathway: "user",
    part: 3,
    type: "radio",
    title:
      "How likely or unlikely would you be to consider a service like this if you were looking for support?",
    required: true,
    options: LIKELIHOOD_OPTIONS,
    analysis: { value: "user_stated_consideration" },
  },
  u7: {
    id: "u7",
    pathway: "user",
    part: 3,
    type: "open-comprehension",
    title: "In your own words, what do you understand this service to offer?",
    helper:
      "A short answer is enough. This is optional, and it is fine to say you are not sure.",
    required: false,
    maxLength: 500,
    notSureLabel: "I am not sure",
    analysis: {
      text: "user_comprehension_text",
      notSure: "user_comprehension_not_sure",
    },
  },
  u6: {
    id: "u6",
    pathway: "user",
    part: 3,
    type: "radio",
    title:
      "How relevant or not relevant does this service feel to your situation now?",
    required: true,
    options: RELEVANCE_OPTIONS,
    analysis: { value: "user_present_relevance" },
  },
  u8: {
    id: "u8",
    pathway: "user",
    part: 3,
    type: "radio",
    title: "How clear or unclear was the description?",
    required: true,
    options: CLARITY_OPTIONS,
    analysis: { value: "user_perceived_clarity" },
  },
  u9: {
    id: "u9",
    pathway: "user",
    part: 3,
    type: "radio",
    title:
      "How plausible or implausible does it seem that a service could operate as described?",
    required: true,
    options: [
      { value: "very_plausible", label: "Very plausible" },
      { value: "somewhat_plausible", label: "Somewhat plausible" },
      { value: "neither", label: "Neither plausible nor implausible" },
      { value: "somewhat_implausible", label: "Somewhat implausible" },
      { value: "very_implausible", label: "Very implausible" },
      {
        value: "insufficient_information",
        label: "Not enough information to judge",
      },
    ],
    analysis: { value: "user_perceived_plausibility" },
  },
  u10: {
    id: "u10",
    pathway: "user",
    part: 3,
    type: "radio",
    title: "Which one most influences your answer at this stage?",
    helper: "This question is about your main reason, not every possible reason.",
    required: true,
    randomize: true,
    showIf: {
      questionId: "u5",
      values: [
        "neither",
        "somewhat_unlikely",
        "very_unlikely",
        "insufficient_information",
      ],
    },
    options: [
      {
        value: "not_relevant_now",
        label: "Support like this does not feel relevant to me now",
      },
      {
        value: "unclear_fit",
        label: "I am unsure whether the service would fit my situation",
      },
      {
        value: "individual_details",
        label: "I need more detail about the individual format",
      },
      {
        value: "group_privacy",
        label: "I would have concerns about privacy in a small group",
      },
      {
        value: "six_session_start",
        label: "I am unsure about beginning with six weekly sessions",
      },
      {
        value: "progress_review",
        label: "I am unsure how progress would be made visible or reviewed",
      },
      {
        value: "approach_fit",
        label: "I am unsure how a practitioner’s approach would fit me",
      },
      {
        value: "prefer_other_support",
        label: "I would prefer another kind of support",
      },
      {
        value: "no_particular_concern",
        label: "No particular concern",
        fixed: true,
      },
      {
        value: "need_more_information",
        label: "I need more information",
        fixed: true,
      },
      {
        value: "other",
        label: "Other",
        fixed: true,
        textInput: {
          label: "Briefly describe the other reason",
          maxLength: 180,
        },
      },
    ],
    analysis: {
      value: "user_main_hesitation",
      text: "user_main_hesitation_other",
    },
  },
  u2: {
    id: "u2",
    pathway: "user",
    part: 4,
    type: "checkbox",
    title:
      "If you were ever considering counselling or psychotherapy, which changes, if any, might matter to you?",
    helper: "Select all that apply.",
    required: true,
    randomize: true,
    options: [
      {
        value: "understand_patterns",
        label: "Better understand feelings or patterns",
      },
      {
        value: "manage_difficulty",
        label: "Find ways to manage a specific difficulty",
      },
      {
        value: "relationships",
        label: "Improve how I handle relationships",
      },
      {
        value: "decisions_change",
        label: "Work through decisions or change",
      },
      {
        value: "day_to_day",
        label: "Feel better able to manage day-to-day life",
      },
      {
        value: "space_to_talk",
        label: "Have a private space to talk things through",
      },
      {
        value: "none_or_not_applicable",
        label: "None of these or not applicable",
        fixed: true,
        exclusive: true,
      },
      {
        value: "prefer_not_to_say",
        label: "Prefer not to say",
        fixed: true,
        exclusive: true,
      },
    ],
    analysis: { values: "user_desired_change" },
  },
  u4: {
    id: "u4",
    pathway: "user",
    part: 4,
    type: "checkbox",
    title:
      "Which, if any, of these have made it difficult to seek or continue counselling or psychotherapy?",
    helper: "Select all that apply.",
    required: true,
    randomize: true,
    options: [
      {
        value: "not_sure_where_to_start",
        label: "Not knowing where to start",
      },
      {
        value: "finding_practitioner",
        label: "Finding a practitioner who feels suitable",
      },
      {
        value: "time_or_schedule",
        label: "Finding workable time or scheduling",
      },
      { value: "privacy", label: "Having enough privacy" },
      {
        value: "talking_personal",
        label: "Feeling able to talk about personal things",
      },
      {
        value: "past_experience",
        label: "A past experience with support",
      },
      {
        value: "private_space_or_tech",
        label: "Access to a private space or reliable technology",
      },
      {
        value: "language_or_cultural_fit",
        label: "Finding a suitable language or cultural fit",
      },
      {
        value: "others_reaction",
        label: "Concern about how other people might react",
      },
      {
        value: "no_difficulty",
        label: "I have not faced any of these difficulties",
        fixed: true,
        exclusive: true,
      },
      {
        value: "not_applicable",
        label: "Not applicable to me",
        fixed: true,
        exclusive: true,
      },
      {
        value: "prefer_not_to_say",
        label: "Prefer not to say",
        fixed: true,
        exclusive: true,
      },
    ],
    analysis: { values: "user_access_difficulties" },
  },
  uf1: {
    id: "uf1",
    pathway: "user",
    part: 4,
    type: "radio",
    title: "Which, if any, of these would you consider exploring?",
    required: true,
    options: [
      { value: "individual", label: "Individual sessions" },
      { value: "small_group", label: "Online small-group sessions" },
      { value: "either", label: "Either format" },
      { value: "neither", label: "Neither format" },
      {
        value: "insufficient_information",
        label: "Not enough information to judge",
      },
    ],
    analysis: { value: "user_format_consideration" },
  },
  u_age_group: {
    id: "u_age_group",
    pathway: "user",
    part: 5,
    type: "radio",
    title: "What is your age group?",
    required: true,
    options: [
      { value: "18_24", label: "18–24" },
      { value: "25_34", label: "25–34" },
      { value: "35_44", label: "35–44" },
      { value: "45_54", label: "45–54" },
      { value: "55_64", label: "55–64" },
      { value: "65_plus", label: "65 or older" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "user_age_group" },
  },
  u_gender: {
    id: "u_gender",
    pathway: "user",
    part: 5,
    type: "radio",
    title: "How do you describe your gender?",
    required: true,
    options: [
      { value: "woman", label: "Woman" },
      { value: "man", label: "Man" },
      {
        value: "non_binary_or_gender_diverse",
        label: "Non-binary or gender-diverse",
      },
      {
        value: "self_describe",
        label: "Prefer to self-describe",
        textInput: {
          label: "How would you like to describe your gender?",
          maxLength: 80,
        },
      },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: {
      value: "user_gender",
      text: "user_gender_self_description",
    },
  },
  u_place: {
    id: "u_place",
    pathway: "user",
    part: 5,
    type: "optional-text",
    title: "What is your current city, town, or village?",
    helper:
      "Optional. Please do not enter a street address or another precise location.",
    required: false,
    maxLength: 100,
    preferNotLabel: "Prefer not to say",
    analysis: {
      text: "user_current_place",
      preferNot: "user_current_place_prefer_not",
    },
  },
  u_state: {
    id: "u_state",
    pathway: "user",
    part: 5,
    type: "select",
    title: "What is your current State or Union Territory?",
    helper: "Choose one option. You can type the first letters to move through the list.",
    required: true,
    placeholder: "Select a State or Union Territory",
    options: [
      { value: "andaman_nicobar", label: "Andaman and Nicobar Islands" },
      { value: "andhra_pradesh", label: "Andhra Pradesh" },
      { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
      { value: "assam", label: "Assam" },
      { value: "bihar", label: "Bihar" },
      { value: "chandigarh", label: "Chandigarh" },
      { value: "chhattisgarh", label: "Chhattisgarh" },
      {
        value: "dadra_nagar_haveli_daman_diu",
        label: "Dadra and Nagar Haveli and Daman and Diu",
      },
      { value: "delhi", label: "Delhi (NCT)" },
      { value: "goa", label: "Goa" },
      { value: "gujarat", label: "Gujarat" },
      { value: "haryana", label: "Haryana" },
      { value: "himachal_pradesh", label: "Himachal Pradesh" },
      { value: "jammu_kashmir", label: "Jammu and Kashmir" },
      { value: "jharkhand", label: "Jharkhand" },
      { value: "karnataka", label: "Karnataka" },
      { value: "kerala", label: "Kerala" },
      { value: "ladakh", label: "Ladakh" },
      { value: "lakshadweep", label: "Lakshadweep" },
      { value: "madhya_pradesh", label: "Madhya Pradesh" },
      { value: "maharashtra", label: "Maharashtra" },
      { value: "manipur", label: "Manipur" },
      { value: "meghalaya", label: "Meghalaya" },
      { value: "mizoram", label: "Mizoram" },
      { value: "nagaland", label: "Nagaland" },
      { value: "odisha", label: "Odisha" },
      { value: "puducherry", label: "Puducherry" },
      { value: "punjab", label: "Punjab" },
      { value: "rajasthan", label: "Rajasthan" },
      { value: "sikkim", label: "Sikkim" },
      { value: "tamil_nadu", label: "Tamil Nadu" },
      { value: "telangana", label: "Telangana" },
      { value: "tripura", label: "Tripura" },
      { value: "uttar_pradesh", label: "Uttar Pradesh" },
      { value: "uttarakhand", label: "Uttarakhand" },
      { value: "west_bengal", label: "West Bengal" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "user_state_or_ut" },
  },
  u_familiarity: {
    id: "u_familiarity",
    pathway: "user",
    part: 5,
    type: "radio",
    title:
      "Before receiving this survey, did you personally know anyone involved in developing this service or survey?",
    required: true,
    options: FAMILIARITY_OPTIONS,
    analysis: { value: "researcher_familiarity" },
  },

  t_intro: {
    id: "t_intro",
    pathway: "practitioner",
    part: 1,
    type: "information",
    eyebrow: "Before you begin",
    title: "Research, not recruitment",
    body: [
      "This survey is research into a possible source of paid counselling or psychotherapy opportunities. It is not recruitment, onboarding, credential verification, or an employment assessment. Answers will not affect future work opportunities.",
      "No compensation terms are being tested. Positive, negative and uncertain answers are equally useful. We do not ask for your name, employer, clinic, or contact details.",
    ],
    notice:
      "Privacy: unfinished answers are saved only in this browser for up to 7 days. When you complete the survey, your anonymous response is securely submitted. We do not ask for your name, employer, clinic, or contact details.",
    actionLabel: "Continue",
  },
  t_consent: {
    id: "t_consent",
    pathway: "practitioner",
    part: 1,
    type: "consent",
    eyebrow: "Your choice",
    title: "Do you choose to take part?",
    helper:
      "You can stop at any time. Leaving the survey will not submit a response.",
    label: "I have read the information and choose to take part.",
    required: true,
    analysis: { value: "practitioner_consent" },
  },
  t_status: {
    id: "t_status",
    pathway: "practitioner",
    part: 1,
    type: "radio",
    title: "Which option best describes your current professional position?",
    helper:
      "The categories are factual. They are not intended as a ranking of professional standing.",
    required: true,
    options: [
      {
        value: "current_independent",
        label:
          "I currently provide counselling or psychotherapy independently",
      },
      {
        value: "current_supervised",
        label:
          "I currently provide counselling or psychotherapy under formal supervision",
      },
      {
        value: "trained_not_practising",
        label:
          "I have completed relevant training but do not currently practise",
      },
      {
        value: "in_training",
        label: "I am currently in training",
      },
      {
        value: "other_mental_health_role",
        label: "I work in another mental-health role",
      },
      {
        value: "not_practitioner",
        label: "None of these describes me",
      },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "practitioner_status" },
  },
  t_ineligible: {
    id: "t_ineligible",
    pathway: "practitioner",
    part: 1,
    type: "eligibility-exit",
    eyebrow: "About this prototype",
    title: "This version has a narrower practitioner journey.",
    body:
      "The main experiment currently includes people who provide counselling or psychotherapy now, independently or under formal supervision. You have not been assigned an experimental message, and no response has been sent. This eligibility rule is provisional and must be approved before fielding.",
  },
  t_experience: {
    id: "t_experience",
    pathway: "practitioner",
    part: 2,
    type: "radio",
    title: "For how long have you provided counselling or psychotherapy?",
    required: true,
    options: [
      { value: "under_1", label: "Less than 1 year" },
      { value: "1_2", label: "1–2 years" },
      { value: "3_5", label: "3–5 years" },
      { value: "6_10", label: "6–10 years" },
      { value: "11_15", label: "11–15 years" },
      { value: "16_plus", label: "16 years or more" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "practitioner_experience_band" },
  },
  t_setting: {
    id: "t_setting",
    pathway: "practitioner",
    part: 2,
    type: "radio",
    title: "What is your primary practice setting at present?",
    required: true,
    options: [
      {
        value: "independent_private",
        label: "Independent or private practice",
      },
      { value: "clinic_hospital", label: "Clinic or hospital" },
      { value: "ngo_community", label: "NGO or community setting" },
      { value: "education", label: "School, college, or university" },
      {
        value: "workplace_eap",
        label: "Workplace or employee-assistance setting",
      },
      {
        value: "public_service",
        label: "Government or public service",
      },
      {
        value: "multiple_no_primary",
        label: "Multiple settings with no primary setting",
      },
      {
        value: "other",
        label: "Other",
        textInput: {
          label: "Briefly describe the other setting",
          maxLength: 100,
        },
      },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: {
      value: "practitioner_primary_setting",
      text: "practitioner_primary_setting_other",
    },
  },
  practitioner_message: {
    id: "practitioner_message",
    pathway: "practitioner",
    part: 3,
    type: "concept",
    messages: PRACTITIONER_MESSAGES,
    facts: [
      "One possible source of paid counselling or psychotherapy work",
      "Individual and online small-group formats",
      "Small groups: 75 minutes with about 4–6 adults",
      "Six weekly sessions, then a brief progress review",
      "No single school of therapy imposed across everyone",
    ],
    footer:
      "This is a description for research, not a current job advertisement or offer of work. Compensation terms are not part of this survey.",
  },
  t8: {
    id: "t8",
    pathway: "practitioner",
    part: 3,
    type: "radio",
    title:
      "How likely or unlikely would you be to consider this platform as one possible way of receiving paid counselling or psychotherapy work?",
    required: true,
    options: LIKELIHOOD_OPTIONS,
    analysis: { value: "practitioner_stated_consideration" },
  },
  t10: {
    id: "t10",
    pathway: "practitioner",
    part: 3,
    type: "open-comprehension",
    title:
      "In your own words, what do you understand this platform to offer practitioners?",
    helper:
      "A short answer is enough. This is optional, and it is fine to say you are not sure.",
    required: false,
    maxLength: 500,
    notSureLabel: "I am not sure",
    analysis: {
      text: "practitioner_comprehension_text",
      notSure: "practitioner_comprehension_not_sure",
    },
  },
  t9: {
    id: "t9",
    pathway: "practitioner",
    part: 3,
    type: "radio",
    title:
      "How relevant or not relevant does this platform feel to your professional situation now?",
    required: true,
    options: RELEVANCE_OPTIONS,
    analysis: { value: "practitioner_present_relevance" },
  },
  t11: {
    id: "t11",
    pathway: "practitioner",
    part: 3,
    type: "radio",
    title: "How clear or unclear was the description?",
    required: true,
    options: CLARITY_OPTIONS,
    analysis: { value: "practitioner_perceived_clarity" },
  },
  t12: {
    id: "t12",
    pathway: "practitioner",
    part: 3,
    type: "radio",
    title:
      "How realistic or unrealistic does this coordination model seem as something that could operate as described?",
    required: true,
    options: [
      { value: "very_realistic", label: "Very realistic" },
      { value: "somewhat_realistic", label: "Somewhat realistic" },
      { value: "neither", label: "Neither realistic nor unrealistic" },
      { value: "somewhat_unrealistic", label: "Somewhat unrealistic" },
      { value: "very_unrealistic", label: "Very unrealistic" },
      {
        value: "insufficient_information",
        label: "Not enough information to judge",
      },
    ],
    analysis: { value: "practitioner_perceived_credibility" },
  },
  t13: {
    id: "t13",
    pathway: "practitioner",
    part: 3,
    type: "radio",
    title:
      "Which one element, if any, seems most valuable from a professional point of view?",
    required: true,
    randomize: true,
    options: [
      {
        value: "source_of_work",
        label:
          "Another possible source of counselling or psychotherapy work",
      },
      {
        value: "individual_and_group",
        label: "The possibility of individual and small-group formats",
      },
      {
        value: "defined_start",
        label: "A defined six-session starting cycle",
      },
      { value: "review_point", label: "A brief progress review" },
      {
        value: "visible_progress",
        label: "An intention to make progress visible",
      },
      {
        value: "approach_flexibility",
        label: "Not imposing one school of therapy",
      },
      {
        value: "none",
        label: "None of these stands out",
        fixed: true,
      },
    ],
    analysis: { value: "practitioner_most_valuable_element" },
  },
  t14: {
    id: "t14",
    pathway: "practitioner",
    part: 3,
    type: "radio",
    title:
      "Which one concern, if any, would matter most to you at this stage?",
    required: true,
    randomize: true,
    options: [
      {
        value: "roles_responsibility",
        label: "Clarity about roles and professional responsibility",
      },
      {
        value: "approach_fit",
        label: "Fit with my professional approach",
      },
      {
        value: "group_composition",
        label: "How small groups would be composed and supported",
      },
      {
        value: "coordination_schedule",
        label: "Coordination and scheduling",
      },
      {
        value: "continuity",
        label: "What happens after the progress review",
      },
      {
        value: "autonomy",
        label: "Practitioner autonomy within the platform",
      },
      {
        value: "privacy_data",
        label: "Privacy and handling of client information",
      },
      {
        value: "clinical_governance",
        label: "Clinical governance and escalation arrangements",
      },
      {
        value: "no_major_concern",
        label: "No major concern at this stage",
        fixed: true,
      },
      {
        value: "need_more_information",
        label: "I need more information",
        fixed: true,
      },
      {
        value: "other",
        label: "Other",
        fixed: true,
        textInput: {
          label: "Briefly describe the other concern",
          maxLength: 180,
        },
      },
    ],
    analysis: {
      value: "practitioner_main_concern",
      text: "practitioner_main_concern_other",
    },
  },
  t_work: {
    id: "t_work",
    pathway: "practitioner",
    part: 4,
    type: "radio",
    title:
      "Which option best describes your current interest in additional counselling or psychotherapy work?",
    required: true,
    options: [
      {
        value: "actively_seeking",
        label: "I am actively seeking additional work",
      },
      {
        value: "open_not_looking",
        label: "I may be open to it, but I am not actively looking",
      },
      {
        value: "not_seeking",
        label: "I am not seeking additional work now",
      },
      { value: "not_sure", label: "I am not sure" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "practitioner_work_seeking_status" },
  },
  t_capacity: {
    id: "t_capacity",
    pathway: "practitioner",
    part: 4,
    type: "radio",
    title:
      "Without compensation or full operating terms, what weekly capacity could you imagine discussing?",
    helper:
      "This is directional only. It is not a commitment or a measure of viable practitioner supply.",
    required: true,
    options: [
      { value: "none", label: "None at present" },
      { value: "under_2", label: "Less than 2 hours" },
      { value: "2_4", label: "2–4 hours" },
      { value: "5_8", label: "5–8 hours" },
      { value: "9_plus", label: "9 hours or more" },
      {
        value: "cannot_judge",
        label: "I cannot judge without more information",
      },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "practitioner_nominal_weekly_capacity" },
  },
  t_group_exp: {
    id: "t_group_exp",
    pathway: "practitioner",
    part: 4,
    type: "radio",
    title:
      "Which best describes your experience facilitating counselling or psychotherapy in small groups?",
    required: true,
    options: [
      {
        value: "current_regular",
        label: "I currently do this regularly",
      },
      {
        value: "current_occasional",
        label: "I currently do this occasionally",
      },
      { value: "past", label: "I have done this in the past" },
      {
        value: "not_yet_relevant",
        label: "I have not done this, but it is relevant to my practice",
      },
      {
        value: "outside_practice",
        label: "This is outside my current practice",
      },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "practitioner_group_experience" },
  },
  t_review_exp: {
    id: "t_review_exp",
    pathway: "practitioner",
    part: 4,
    type: "radio",
    title:
      "How often do you currently use a planned progress review or another structured way to discuss progress with clients?",
    required: true,
    options: [
      { value: "usually", label: "Usually" },
      { value: "sometimes", label: "Sometimes" },
      { value: "rarely", label: "Rarely" },
      { value: "not_currently", label: "Not currently" },
      {
        value: "varies_or_not_applicable",
        label: "It varies or is not applicable to my practice",
      },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    analysis: { value: "practitioner_progress_review_experience" },
  },
  t_constraints: {
    id: "t_constraints",
    pathway: "practitioner",
    part: 4,
    type: "checkbox",
    title:
      "Which, if any, could make this kind of platform difficult for you to use?",
    helper: "Select all that apply.",
    required: true,
    randomize: true,
    options: [
      {
        value: "schedule_consistency",
        label: "Maintaining a consistent weekly schedule",
      },
      {
        value: "private_space_or_tech",
        label: "Private space or reliable technology",
      },
      {
        value: "group_support",
        label: "Support for small-group facilitation",
      },
      {
        value: "clinical_coordination",
        label: "Clinical coordination with the platform",
      },
      {
        value: "documentation",
        label: "Documentation or administrative load",
      },
      {
        value: "approach_compatibility",
        label: "Compatibility with my professional approach",
      },
      {
        value: "client_mix",
        label: "Fit with the clients or groups offered",
      },
      {
        value: "safeguarding",
        label: "Clarity about safeguarding or escalation",
      },
      {
        value: "none",
        label: "None of these",
        fixed: true,
        exclusive: true,
      },
      {
        value: "need_more_information",
        label: "I need more information",
        fixed: true,
        exclusive: true,
      },
      {
        value: "other",
        label: "Other",
        fixed: true,
        textInput: {
          label: "Briefly describe the other constraint",
          maxLength: 180,
        },
      },
    ],
    analysis: {
      values: "practitioner_constraints",
      text: "practitioner_constraints_other",
    },
  },
  tf1: {
    id: "tf1",
    pathway: "practitioner",
    part: 4,
    type: "radio",
    title: "Which formats, if any, would you consider discussing further?",
    required: true,
    options: [
      { value: "individual", label: "Individual sessions" },
      { value: "small_group", label: "Online small-group sessions" },
      { value: "either", label: "Either format" },
      { value: "neither", label: "Neither format" },
      {
        value: "insufficient_information",
        label: "Not enough information to judge",
      },
    ],
    analysis: { value: "practitioner_format_consideration" },
  },
  t_familiarity: {
    id: "t_familiarity",
    pathway: "practitioner",
    part: 5,
    type: "radio",
    title:
      "Before receiving this survey, did you personally know anyone involved in developing this service or survey?",
    required: true,
    options: FAMILIARITY_OPTIONS,
    analysis: { value: "researcher_familiarity" },
  },
};

export const USER_FLOW = [
  "u_age",
  "u1",
  "u3",
  "user_message",
  "u5",
  "u7",
  "u6",
  "u8",
  "u9",
  "u10",
  "u2",
  "u4",
  "uf1",
  "u_age_group",
  "u_gender",
  "u_place",
  "u_state",
  "u_familiarity",
];

export const PRACTITIONER_FLOW = [
  "t_status",
  "t_experience",
  "t_setting",
  "practitioner_message",
  "t8",
  "t10",
  "t9",
  "t11",
  "t12",
  "t13",
  "t14",
  "t_work",
  "t_capacity",
  "t_group_exp",
  "t_review_exp",
  "t_constraints",
  "tf1",
  "t_familiarity",
];

export const PART_LABELS = {
  user: {
    1: "About the survey",
    2: "Before the description",
    3: "The possible service",
    4: "Your perspective",
    5: "About you",
  },
  practitioner: {
    1: "About the survey",
    2: "Professional context",
    3: "The possible platform",
    4: "Your practice",
    5: "Final context",
  },
};

export const COPY_STATUS = {
  status: "prototype_not_field_ready",
  practitionerFrames: "provisional",
  professionalEligibility: "provisional",
  completionTime: "not_shown_until_pilot",
};
