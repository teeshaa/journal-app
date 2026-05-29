"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useHostTheme } from "@/lib/slides-theme";
import { ZoomPan } from "@/components/slides/zoom-pan";
import { slideMotion } from "@/components/slides/proposal/slide-shell";

type SlideDeckProps = {
  slides: Array<{
    id: string;
    label: string;
    zoomable?: boolean;
    intro?: ReactNode;
    content: (theme: ReturnType<typeof useHostTheme>) => ReactNode;
  }>;
};

export function SlideDeck({ slides }: SlideDeckProps) {
  const theme = useHostTheme();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const lastSlideIndex = Math.max(slides.length - 1, 0);
  const safeIndex = Math.min(index, lastSlideIndex);
  const slide = slides[safeIndex];

  useEffect(() => {
    if (index > lastSlideIndex) {
      setIndex(lastSlideIndex);
    }
  }, [index, lastSlideIndex]);

  const goTo = useCallback(
    (next: number) => {
      if (next === safeIndex || next < 0 || next >= slides.length) return;
      setDirection(next > safeIndex ? 1 : -1);
      setIndex(next);
    },
    [safeIndex, slides.length],
  );

  const goPrev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);
  const goNext = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "Home") goTo(0);
      if (event.key === "End") goTo(slides.length - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext, goTo, slides.length]);

  if (!slide) {
    return null;
  }

  const content = slide.content(theme);
  const enterAnimation = direction === 1 ? slideMotion.enter : slideMotion.enterBack;

  return (
    <div className="deck-root">
      <header className="deck-header">
        <p className="deck-brand-name">DataScan</p>
      </header>

      <main className={`deck-stage${slide.zoomable ? " deck-stage-zoom" : ""}`}>
        <div key={slide.id} className="deck-slide-frame" style={{ animation: enterAnimation }}>
          {slide.zoomable ? (
            <div className="deck-zoom-layout">
              {slide.intro && <div className="deck-zoom-intro">{slide.intro}</div>}
              <ZoomPan resetKey={slide.id}>{content}</ZoomPan>
            </div>
          ) : (
            <div className="deck-slide-scroll deck-slide-ppt">{content}</div>
          )}
        </div>
      </main>

      <footer className="deck-footer">
        <div className="deck-footer-minimal">
          <div className="deck-progress" role="tablist" aria-label="Slides">
            {slides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-label={`${item.label}, slide ${i + 1} of ${slides.length}`}
                aria-selected={i === safeIndex}
                title={item.label}
                className={`deck-progress-dot${i === safeIndex ? " is-active" : ""}${i < safeIndex ? " is-done" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <p className="deck-counter">
            {safeIndex + 1} / {slides.length}
          </p>
        </div>
      </footer>
    </div>
  );
}
