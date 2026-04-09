"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useActiveNavSection } from "@/hooks/useActiveNavSection";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import LanguageToggle from "./LanguageToggle";

const navItems = [
  { href: "#home", key: "nav_home", sectionId: "home" },
  { href: "#about", key: "nav_about", sectionId: "about" },
  { href: "#academics", key: "nav_academics", sectionId: "academics" },
  { href: "#why-us", key: "nav_why_us", sectionId: "why-us" },
  { href: "#hall-of-fame", key: "nav_hall_of_fame", sectionId: "hall-of-fame" },
  { href: "#gallery", key: "nav_gallery", sectionId: "gallery" },
  { href: "#events", key: "nav_events", sectionId: "events" },
  { href: "#admissions", key: "nav_admissions", sectionId: "admissions" }
] as const;

export default function Header() {
  const t = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isSticky = useStickyHeader();
  const activeSection = useActiveNavSection();
  const smoothScroll = useSmoothScroll();
  const menuRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node;

      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        toggleRef.current &&
        !toggleRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", onClickOutside as EventListener);
    return () => document.removeEventListener("click", onClickOutside as EventListener);
  }, [isMenuOpen]);

  const handleNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      event.preventDefault();
      smoothScroll(href);
    }

    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${isSticky ? "scrolled" : ""}`.trim()} id="header">
      <div className="container">
        <a href="#home" className="logo" onClick={handleNavClick("#home")}>
          <Image
            src="/images/logo.png"
            alt="Prabhawati Vidyapeeth Logo"
            className="logo-img"
            width={56}
            height={56}
          />
          <span className="logo-text">Prabhawati Vidyapeeth</span>
        </a>

        <LanguageToggle />

        <button
          ref={toggleRef}
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`.trim()}
          id="menuToggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <nav ref={menuRef} className={`nav-menu ${isMenuOpen ? "active" : ""}`.trim()} id="navMenu">
          {navItems.map((item) => (
            <a
              key={item.sectionId}
              href={item.href}
              className={`nav-link ${activeSection === item.sectionId ? "active" : ""}`.trim()}
              onClick={handleNavClick(item.href)}
            >
              {t(item.key)}
            </a>
          ))}
          <a href="#contact" className="btn btn-primary" onClick={handleNavClick("#contact")}>
            {t("nav_contact")}
          </a>
        </nav>
      </div>
    </header>
  );
}
