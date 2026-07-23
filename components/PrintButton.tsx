"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      className="resume-print-button"
      onClick={() => window.print()}
    >
      Print / save as PDF
    </button>
  );
}
