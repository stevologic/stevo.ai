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
