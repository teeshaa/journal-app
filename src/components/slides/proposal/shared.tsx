import type { ReactNode } from "react";

type ListProps = {
  items: string[];
  accent?: string;
};

export function PptNumberedList({ items }: ListProps) {
  return (
    <ol className="ppt-numbered-list">
      {items.map((item, i) => (
        <li
          key={item}
          className="ppt-numbered-item"
          style={{ animationDelay: `${120 + i * 90}ms` }}
        >
          <span className="ppt-numbered-marker">{i + 1}</span>
          <span className="ppt-numbered-text">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function PptBulletList({ items, accent = "var(--accent)" }: ListProps) {
  return (
    <ul className="ppt-bullet-list" style={{ "--bullet-accent": accent } as React.CSSProperties}>
      {items.map((item, i) => (
        <li
          key={item}
          className="ppt-bullet-item"
          style={{ animationDelay: `${100 + i * 70}ms` }}
        >
          <span className="ppt-bullet-marker" />
          <span className="ppt-bullet-text">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PptCompactList({ items, accent = "var(--accent)" }: ListProps) {
  return (
    <ul className="ppt-compact-list" style={{ "--bullet-accent": accent } as React.CSSProperties}>
      {items.map((item, i) => (
        <li
          key={item}
          className="ppt-compact-item"
          style={{ animationDelay: `${80 + i * 50}ms` }}
        >
          <span className="ppt-compact-marker" />
          <span className="ppt-compact-text">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PptBlockTitle({ children }: { children: ReactNode }) {
  return <h3 className="ppt-block-title">{children}</h3>;
}
