/**
 * The public contact mailbox for the homepage and service pages
 * (stevo@stevo.ai). Masked the same way as lib/contact.ts so the address never
 * sits in the source as plain text. lib/contact.ts now decodes to this same
 * mailbox so the résumé page matches the rest of the public site.
 */
const siteMailbox = [100, 99, 114, 97, 120];
const siteHost = [87, 100, 99, 114, 97, 120, 57, 118, 126];
const emailMask = 23;

export function decodeSiteEmail() {
  return [...siteMailbox, ...siteHost]
    .map((value) => String.fromCharCode(value ^ emailMask))
    .join("");
}
