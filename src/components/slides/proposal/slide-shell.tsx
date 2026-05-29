import type { CSSProperties, ReactNode } from "react";

export const slideMotion = {
  enter: "slide-reveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
  enterBack: "slide-reveal-back 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
  fadeUp: "content-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
} as const;

export function PptSlide({
  children,
  accent,
  className,
}: {
  children: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={`ppt-slide${className ? ` ${className}` : ""}`}>
      {accent && <div className="ppt-slide-accent" style={{ background: accent }} aria-hidden />}
      <div className="ppt-slide-inner">{children}</div>
    </div>
  );
}

export function SlideIntro({
  section,
  title,
  subtitle,
}: {
  section?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="slide-intro">
      {section && <p className="slide-intro-section">{section}</p>}
      <h2 className="slide-intro-title">{title}</h2>
      {subtitle && <p className="slide-intro-subtitle">{subtitle}</p>}
    </div>
  );
}

/** @deprecated use PptSlide */
export function SlideShell({
  children,
  accent,
  style,
}: {
  children: ReactNode;
  accent?: string;
  style?: CSSProperties;
}) {
  return (
    <PptSlide accent={accent}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, ...style }}>{children}</div>
    </PptSlide>
  );
}
