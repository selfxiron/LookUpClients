export const BUSINESS_CATEGORIES = [
  { value: "cafe", label: "Cafes" },
  { value: "restaurant", label: "Restaurants" },
  { value: "clinic", label: "Clinics" },
  { value: "school", label: "Schools" },
  { value: "coaching", label: "Coaching Centers" },
  { value: "salon", label: "Salons & Spas" },
  { value: "gym", label: "Gyms & Fitness" },
  { value: "hotel", label: "Hotels" },
  { value: "media_studio", label: "Photography & Media Studios" },
] as const;

export const TEAM_MEMBERS = [
  { value: "ANAMIKA", label: "Anamika" },
  { value: "JEET", label: "Jeet" },
] as const;

export const PIPELINE_STATUSES = [
  { value: "NEW", label: "New", color: "bg-slate-100 text-slate-700" },
  { value: "CONTACTED", label: "Contacted", color: "bg-blue-100 text-blue-700" },
  { value: "INTERESTED", label: "Interested", color: "bg-amber-100 text-amber-700" },
  { value: "PROPOSAL", label: "Proposal", color: "bg-purple-100 text-purple-700" },
  { value: "WON", label: "Won", color: "bg-emerald-100 text-emerald-700" },
  { value: "LOST", label: "Lost", color: "bg-red-100 text-red-700" },
] as const;

export const WEBSITE_STATUSES = [
  { value: "NO_WEBSITE", label: "No Website", color: "bg-emerald-100 text-emerald-800" },
  { value: "SOCIAL_ONLY", label: "Social Only", color: "bg-amber-100 text-amber-800" },
  { value: "HAS_WEBSITE", label: "Has Website", color: "bg-slate-100 text-slate-600" },
  { value: "UNREACHABLE", label: "Unreachable", color: "bg-orange-100 text-orange-800" },
  { value: "UNKNOWN", label: "Unknown", color: "bg-zinc-100 text-zinc-600" },
] as const;

export const SOCIAL_DOMAINS = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "tiktok.com",
  "wa.me",
  "whatsapp.com",
  "google.com/maps",
  "goo.gl",
  "bit.ly",
];
