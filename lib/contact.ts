export interface SocialHandle {
  id: string;
  network: string;
  handle: string;
  href: string;
}

export const socialHandles: SocialHandle[] = [
  {
    id: "github",
    network: "GitHub",
    handle: "stevologic",
    href: "https://github.com/stevologic",
  },
  {
    id: "youtube",
    network: "YouTube",
    handle: "@MadeItHappenDaily",
    href: "https://www.youtube.com/@MadeItHappenDaily",
  },
  {
    id: "x",
    network: "X",
    handle: "@MadeItHappenX",
    href: "https://x.com/MadeItHappenX",
  },
  {
    id: "twitch",
    network: "Twitch",
    handle: "Madeithappen",
    href: "https://www.twitch.tv/madeithappen",
  },
  {
    id: "discord",
    network: "Discord",
    handle: "madeithappen3",
    href: "https://discord.com/users/317149305452363776",
  },
];

export const socialProfileUrls = socialHandles.map((profile) => profile.href);

/**
 * Public intake and scheduling line. The stevo.ai voice assistant answers as
 * stevo.ai, never as Stephen. It fields consulting requests, interviews, and
 * partnerships, then books a follow-up with Stephen and the calling company.
 */
export const voiceLine = {
  label: "stevo.ai scheduling line",
  display: "+1 (623) 887-8905",
  href: "tel:+16238878905",
  e164: "+16238878905",
  note: "The stevo.ai voice assistant answers as stevo.ai, never as Stephen. It fields consulting requests, interviews, and partnerships, takes name, company, intent, and a callback or email, and books a follow-up with Stephen and the calling company.",
} as const;

/**
 * How the live Grok Voice Think Fast 2.0 line already behaves. The site does
 * not implement this — the voice agent does. Keep this as the hook for later
 * marketing and meeting-scheduling work. Do not publish a personal cell, a
 * paid scheduler, or a calendar booking URL until one exists.
 */
export const voiceIntake = {
  answersAs: "stevo.ai",
  timezone: "America/Phoenix",
  calendar: "MadeItHappen",
  fields: ["name", "company", "intent", "callback", "email"],
} as const;

/**
 * A public calendar booking URL is not published yet. When one exists, set
 * `href` here so the homepage, résumé, and JSON-LD pick it up from one place.
 */
export const scheduling = {
  label: "Schedule a meeting",
  href: "" as string,
  status: "planned" as const,
};

const protectedMailbox = [
  100, 99, 114, 103, 127, 114, 121, 118, 117, 117, 120, 99, 99, 37, 39,
];
const protectedHost = [87, 112, 122, 118, 126, 123, 57, 116, 120, 122];
const emailMask = 23;

export function decodeProtectedEmail() {
  return [...protectedMailbox, ...protectedHost]
    .map((value) => String.fromCharCode(value ^ emailMask))
    .join("");
}
