"use client";

import { SDLCDiagram } from "@/components/slides/proposal/diagrams";
import { PptCompactList } from "@/components/slides/proposal/shared";
import { PptSlide, SlideIntro } from "@/components/slides/proposal/slide-shell";
import type { CanvasHostTheme } from "@/lib/slides-theme";
import type { ReactNode } from "react";

export type SlideDef = {
  id: string;
  label: string;
  zoomable?: boolean;
  intro?: ReactNode;
  content: (theme: CanvasHostTheme) => ReactNode;
};

const mergeCriteria = [
  "Interaction pattern",
  "Human-in-the-loop",
  "Faster Feedback",
  "Baby Steps",
  "Reduce cost of change",
  "Industry practices / habits",
  "Quality artefacts",
  "Reusability",
  "Consistency",
  "Accuracy",
  "Confidence",
  "Productivity",
];

const otherPriorities = [
  "Presentation skills session",
  "Cultivate a culture of communicating with the product team proactively",
  "Artefact storage and maintenance",
  "Release management",
  "Install notes",
  "Integrated ecosystem",
  "Security with AI",
  "Evolution of roles",
  "AI in SDLC (Double Diamond)",
  "VS Code GitHub Copilot settings",
];

const otherPrioritiesMid = Math.ceil(otherPriorities.length / 2);

export const slides: SlideDef[] = [
  {
    id: "title",
    label: "Title",
    content: () => (
      <PptSlide className="ppt-slide-title">
        <h1 className="slide-title-heading">DataScan - Expectations Alignment</h1>
      </PptSlide>
    ),
  },
  {
    id: "priorities",
    label: "Top three priorities",
    content: () => (
      <PptSlide accent="var(--domain)">
        <SlideIntro title="Top three priorities" />
        <div className="priority-grid">
          <PriorityCard
            title="Domain knowledge synthesis"
            accent="var(--domain)"
            delay={80}
            items={[
              "Build domain knowledge",
              "Present to product team with confidence.",
              "Incorporate domain building into the development process.",
            ]}
          />
          <PriorityCard
            title="Merge skills"
            accent="var(--merge)"
            delay={150}
            items={[
              "Incorporate best practices.",
              "Get alignment with ICON team.",
              "Build confidence in using it, not just speed.",
            ]}
          />
          <PriorityCard
            title="QA automation"
            accent="var(--qa)"
            delay={220}
            items={[
              "Streamlining QA process.",
              "Strengthen QA automation.",
              "Parallelising QA Automation right from the beginning.",
            ]}
          />
        </div>
      </PptSlide>
    ),
  },
  {
    id: "sdlc",
    label: "Redefined development process",
    zoomable: true,
    intro: (
      <SlideIntro title="Redefined Development Process for DataScan" />
    ),
    content: (theme) => (
      <div className="diagram-panel">
        <SDLCDiagram theme={theme} />
      </div>
    ),
  },
  {
    id: "criteria",
    label: "Criteria",
    content: () => (
      <PptSlide accent="var(--merge)" className="ppt-slide-criteria">
        <SlideIntro
          title="Skills Comparison: Analysis & Evaluation Criteria"
          subtitle="Compare skill output against these criteria before we merge."
        />
        <div className="criteria-layout">
          <CriteriaCard
            accent="var(--merge)"
            delay={40}
            items={mergeCriteria}
          />
          <MergeFocusPanel />
        </div>
      </PptSlide>
    ),
  },
  {
    id: "other",
    label: "What else is in the bucket",
    content: () => (
      <PptSlide accent="var(--text-tertiary)">
        <SlideIntro title="What else is in the bucket" />
        <div className="two-col-lists">
          <div className="ppt-list-block" style={{ animationDelay: "80ms" }}>
            <PptCompactList
              accent="var(--accent)"
              items={otherPriorities.slice(0, otherPrioritiesMid)}
            />
          </div>
          <div className="ppt-list-block" style={{ animationDelay: "140ms" }}>
            <PptCompactList
              accent="var(--accent)"
              items={otherPriorities.slice(otherPrioritiesMid)}
            />
          </div>
        </div>
      </PptSlide>
    ),
  },
];

function PriorityCard({
  title,
  accent,
  items,
  delay,
}: {
  title: string;
  accent: string;
  items?: string[];
  delay: number;
}) {
  return (
    <article
      className="priority-card"
      style={{ animationDelay: `${delay}ms`, borderTop: `4px solid ${accent}` }}
    >
      <div className={`priority-card-head${items?.length ? "" : " priority-card-head-only"}`}>
        <h3 className="priority-card-title">{title}</h3>
      </div>
      {items && items.length > 0 && (
        <div className="priority-card-body">
          <PptCompactList accent={accent} items={items} />
        </div>
      )}
    </article>
  );
}

function MergeFocusPanel() {
  return (
    <div className="criteria-focus-panel criteria-focus-panel-side">
      <p className="criteria-focus-heading">Goal is to Aim for</p>
      <div className="criteria-focus-stack">
        <div className="criteria-focus-item criteria-focus-item-primary">
          <span className="criteria-focus-star" aria-hidden>
            ★
          </span>
          <span className="criteria-focus-name">Quality</span>
        </div>
        <div className="criteria-focus-item criteria-focus-item-primary">
          <span className="criteria-focus-star" aria-hidden>
            ★
          </span>
          <span className="criteria-focus-name">Confidence</span>
        </div>
        <div className="criteria-focus-item criteria-focus-item-secondary">
          <span className="criteria-focus-name">Speed</span>
          <span className="criteria-focus-tag criteria-focus-tag-muted">By-product</span>
        </div>
      </div>
    </div>
  );
}

function CriteriaCard({
  title,
  note,
  items,
  accent,
  delay,
}: {
  title?: string;
  note?: string;
  items: string[];
  accent: string;
  delay: number;
}) {
  return (
    <article className="criteria-card" style={{ animationDelay: `${delay}ms` }}>
      {title && <div className="criteria-card-head">{title}</div>}
      <div className="criteria-card-body">
        {note && <p className="criteria-card-note">{note}</p>}
        <PptCompactList accent={accent} items={items} />
      </div>
    </article>
  );
}
