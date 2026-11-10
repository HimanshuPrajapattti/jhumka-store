"use client";

import { useState } from "react";

export function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="label-caps rounded-full border border-sand px-5 py-2.5 text-ash transition hover:border-maroon hover:text-maroon"
    >
      {copied ? "Copied ✓" : "Copy message"}
    </button>
  );
}
