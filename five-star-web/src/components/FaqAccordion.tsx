"use client";

import { useState } from "react";
import { TEXT_HEADING, TEXT_MUTED, RADIUS, SHADOW } from "@/lib/theme";
import { ChevronDownIcon } from "./icons";

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm, overflow: "hidden" }}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                background: "none",
                border: "none",
                textAlign: "left",
                padding: "20px 24px",
                fontSize: 16.5,
                fontWeight: 700,
                color: TEXT_HEADING,
              }}
            >
              {item.q}
              <span
                style={{
                  flexShrink: 0,
                  display: "flex",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <ChevronDownIcon size={20} color={TEXT_MUTED} />
              </span>
            </button>
            {open && (
              <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 640, margin: 0, padding: "0 24px 22px" }}>
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
