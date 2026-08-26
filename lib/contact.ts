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
 * Public intake line. The stevo.ai voice assistant answers as the practice,
 * never as Stephen. It fields consulting requests, interviews, and
 * partnerships, then books a follow-up.
 */
export const voiceLine = {
  label: "stevo.ai line",
  display: "+1 (623) 887-8905",
  href: "tel:+16238878905",
  e164: "+16238878905",
  note: "The stevo.ai voice assistant answers as the practice, never as Stephen. It fields consulting requests, interviews, and partnerships, then books a follow-up.",
} as const;

/**
 * Meeting scheduling is not published yet. When a calendar booking URL is
 * ready, set `href` and the homepage, résumé, and JSON-LD will pick it up
 * from this one object.
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
