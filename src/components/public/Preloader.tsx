"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hidePreloader = () => {
      setTimeout(() => setIsVisible(false), 250);
    };

    if (document.readyState === "complete") {
      hidePreloader();
      return;
    }

    window.addEventListener("load", hidePreloader);
    return () => window.removeEventListener("load", hidePreloader);
  }, []);

  return (
    <div className={`preloader ${isVisible ? "is-visible" : "is-hidden"}`} aria-hidden={!isVisible}>
      <img src="/images/preloader.gif" alt="Loading" className="preloader-image" />
    </div>
  );
}
