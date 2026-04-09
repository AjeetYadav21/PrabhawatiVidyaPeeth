"use client";

import type { AppLocale } from "@/lib/constants";
import type { GalleryItem } from "@/types/content";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { getLocalizedText } from "@/lib/content-utils";

type GalleryLightboxProps = {
  images: GalleryItem[];
  locale: AppLocale;
};

export default function GalleryLightbox({ images, locale }: GalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goToPrevious = useCallback(() => {
    setSelectedIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((current) =>
      current === null ? null : (current + 1) % images.length
    );
  }, [images.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "Escape": closeLightbox(); break;
        case "ArrowLeft": goToPrevious(); break;
        case "ArrowRight": goToNext(); break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, closeLightbox, goToPrevious, goToNext]);

  useEffect(() => {
    if (selectedIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = originalOverflow; };
    }
  }, [selectedIndex]);

  function handleOverlayClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) closeLightbox();
  }

  const currentImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div className="gallery-grid">
        {images.map((item, index) => (
          <ScrollReveal key={`gallery-${index}`}>
            <div className="gallery-item" onClick={() => openLightbox(index)}>
              <Image src={item.image || "/images/gallery/default.jpg"} alt={getLocalizedText(item.caption, locale)} width={480} height={360} />
              <div className="gallery-overlay">
                <span className="gallery-title">{getLocalizedText(item.caption, locale)}</span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className={`gallery-lightbox-overlay${selectedIndex !== null ? " active" : ""}`} onClick={handleOverlayClick}>
        {currentImage && (
          <div className="gallery-lightbox-content">
            <button className="gallery-lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
              <i className="fa-solid fa-xmark" />
            </button>
            {images.length > 1 && (
              <button className="gallery-lightbox-nav prev" onClick={goToPrevious} aria-label="Previous image">
                <i className="fa-solid fa-chevron-left" />
              </button>
            )}
            <div className="gallery-lightbox-image">
              <Image src={currentImage.image} alt={getLocalizedText(currentImage.caption, locale)} fill style={{ objectFit: "contain" }} />
            </div>
            <p className="gallery-lightbox-caption">{getLocalizedText(currentImage.caption, locale)}</p>
            {images.length > 1 && (
              <button className="gallery-lightbox-nav next" onClick={goToNext} aria-label="Next image">
                <i className="fa-solid fa-chevron-right" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
