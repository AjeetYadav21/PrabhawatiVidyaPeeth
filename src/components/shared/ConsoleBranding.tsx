"use client";

import { useEffect } from "react";

export default function ConsoleBranding() {
  useEffect(() => {
    console.log(
      "%c 🏫 Prabhawati Vidyapeeth ",
      "background: #1e40af; color: #fff; font-size: 1.5rem; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: bold;"
    );
    console.log(
      "%c Sahatwar, Ballia, Uttar Pradesh | prabhawatividyapeeth.in ",
      "color: #64748b; font-size: 0.85rem;"
    );
  }, []);

  return null;
}
