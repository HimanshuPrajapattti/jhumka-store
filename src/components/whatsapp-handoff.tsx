"use client";

import { useEffect, useRef } from "react";

/**
 * Hands the customer off to WhatsApp with their formatted order.
 * Auto-opens once per order (guarded in sessionStorage so coming back
 * from WhatsApp never loops), with a big manual button as fallback.
 */
export function WhatsAppHandoff({
  url,
  reference,
}: {
  url: string;
  reference: string;
}) {
  const openedRef = useRef(false);

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;

    const key = `avrani-wa-${reference}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable — still try once */
    }

    const timer = window.setTimeout(() => {
      window.location.href = url;
    }, 800);
    return () => window.clearTimeout(timer);
  }, [url, reference]);

  return (
    <div className="mt-8">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="label-caps flex w-full items-center justify-center gap-3 rounded-full bg-[#0f7a52] px-8 py-4.5 text-white shadow-[0_14px_34px_-14px_rgba(15,122,82,0.9)] transition hover:bg-[#0c6544]"
        onClick={() => {
          try {
            sessionStorage.setItem(`avrani-wa-${reference}`, "1");
          } catch {
            /* ignore */
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.44 9.44 0 01-4.81-1.32l-.35-.2-3.57.93.96-3.47-.22-.36a9.4 9.4 0 01-1.44-5.02c0-5.2 4.24-9.43 9.45-9.43 2.52 0 4.9.98 6.68 2.75a9.36 9.36 0 012.75 6.69c0 5.2-4.24 9.43-9.44 9.43z" />
        </svg>
        Open WhatsApp &amp; send my order
      </a>
      <p className="mt-3 text-center text-xs text-ash">
        Taking you to WhatsApp in a moment — your message is ready and waiting.
      </p>
    </div>
  );
}
