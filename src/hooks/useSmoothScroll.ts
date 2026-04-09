"use client";

export function useSmoothScroll() {
  return (href: string) => {
    if (typeof window === "undefined" || !href.startsWith("#")) {
      return;
    }

    const targetId = href.replace("#", "");
    const target = document.getElementById(targetId);
    const header = document.getElementById("header");

    if (!target) {
      return;
    }

    const headerHeight = header?.offsetHeight ?? 0;
    const targetPosition = target.offsetTop - headerHeight;

    window.history.replaceState({}, "", href);
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });
  };
}
