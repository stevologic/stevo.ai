"use client";

import { useEffect, useRef, useState } from "react";
import { creativitySupport } from "@/lib/contact";

const dogecoinUri = `dogecoin:${creativitySupport.dogecoin.address}`;

export function SupportCreativity() {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number>(0);

  useEffect(() => {
    return () => window.clearTimeout(copiedTimer.current);
  }, []);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(creativitySupport.dogecoin.address);
    } catch {
      return;
    }

    window.clearTimeout(copiedTimer.current);
    setCopied(true);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="support-strip" aria-label="Support my creativity">
      <p>Like what I&apos;m making? Support my creativity.</p>
      <div className="support-actions">
        <a
          className="support-x-money"
          href={creativitySupport.xMoney.href}
          target="_blank"
          rel="me noreferrer"
        >
          {creativitySupport.xMoney.label} <span aria-hidden="true">↗</span>
        </a>
        <span className="support-doge">
          <span className="support-doge-label">Dogecoin</span>
          <a
            href={dogecoinUri}
            className="support-doge-address"
            aria-label="Send Dogecoin"
          >
            {creativitySupport.dogecoin.address}
          </a>
          <button
            type="button"
            className="support-copy"
            onClick={() => {
              void copyAddress();
            }}
            aria-label={
              copied ? "Dogecoin address copied" : "Copy Dogecoin address"
            }
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </span>
      </div>
    </section>
  );
}
