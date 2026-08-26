"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { decodeProtectedEmail } from "@/lib/contact";

const neverChanges = () => () => {};

/** False while rendering the static export, true once the client has hydrated. */
function useHydrated() {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}

/**
 * Click-to-reveal contact button. The address never ships in the exported
 * HTML, so basic scrapers see a call to action instead of a mailbox.
 */
export function ProtectedEmailButton({
  label = "Email Stephen",
  variant = "primary",
}: {
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [email, setEmail] = useState<string>();
  const emailLinkRef = useRef<HTMLAnchorElement>(null);
  const buttonClass =
    variant === "secondary" ? "button button-secondary" : "button button-primary";

  useEffect(() => {
    if (email) emailLinkRef.current?.focus();
  }, [email]);

  if (email) {
    return (
      <a
        className={`${buttonClass} protected-email-link`}
        href={`mailto:${email}`}
        ref={emailLinkRef}
      >
        {email} <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <button
      className={`${buttonClass} protected-email-trigger`}
      type="button"
      onClick={() => setEmail(decodeProtectedEmail())}
    >
      {label}
    </button>
  );
}

/**
 * Inline address that resolves once the client has hydrated, so the résumé
 * prints with real contact details while the static export stays clean.
 */
export function ProtectedEmailAddress({
  className = "protected-email-address",
}: {
  className?: string;
}) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return <span className={className}>Email available on request</span>;
  }

  const email = decodeProtectedEmail();

  return (
    <a className={className} href={`mailto:${email}`}>
      {email}
    </a>
  );
}
