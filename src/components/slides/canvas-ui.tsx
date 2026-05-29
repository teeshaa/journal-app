import type { CSSProperties, ReactNode } from "react";
import { useHostTheme } from "@/lib/slides-theme";

type StackProps = { children?: ReactNode; gap?: number; style?: CSSProperties };
type RowProps = StackProps & {
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "space-between";
  wrap?: boolean;
};
type GridProps = { children?: ReactNode; columns: number | string; gap?: number; style?: CSSProperties };
type TextProps = {
  children?: ReactNode;
  size?: "body" | "small";
  tone?: "primary" | "secondary" | "tertiary";
  weight?: "regular" | "medium";
  style?: CSSProperties;
};

export function Stack({ children, gap = 0, style }: StackProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      {children}
    </div>
  );
}

export function Row({ children, gap = 0, align = "stretch", justify = "start", wrap = false, style }: RowProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Grid({ children, columns, gap = 0, style }: GridProps) {
  const gridTemplateColumns =
    typeof columns === "number" ? `repeat(${columns}, minmax(0, 1fr))` : columns;
  return (
    <div style={{ display: "grid", gridTemplateColumns, gap, ...style }}>{children}</div>
  );
}

export function Text({ children, size = "body", tone = "primary", weight = "regular", style }: TextProps) {
  const theme = useHostTheme();
  const toneColor =
    tone === "secondary" ? theme.text.secondary : tone === "tertiary" ? theme.text.tertiary : theme.text.primary;
  const fontSize = size === "small" ? 12 : 14;
  const lineHeight = size === "small" ? "16px" : "20px";
  const fontWeight = weight === "medium" ? 590 : 400;

  return (
    <span style={{ fontSize, lineHeight, fontWeight, color: toneColor, ...style }}>{children}</span>
  );
}

export function H2({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  const theme = useHostTheme();
  return (
    <h2 style={{ margin: 0, fontSize: 18, lineHeight: "24px", fontWeight: 590, color: theme.text.primary, ...style }}>
      {children}
    </h2>
  );
}

export function H3({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  const theme = useHostTheme();
  return (
    <h3 style={{ margin: 0, fontSize: 16, lineHeight: "22px", fontWeight: 590, color: theme.text.primary, ...style }}>
      {children}
    </h3>
  );
}

export function Pill({
  children,
  tone = "neutral",
  size = "md",
}: {
  children?: ReactNode;
  tone?: "neutral" | "info";
  size?: "sm" | "md";
}) {
  const theme = useHostTheme();
  const isSm = size === "sm";
  const color = tone === "info" ? theme.accent.primary : theme.text.secondary;
  const background = tone === "info" ? `${theme.accent.primary}18` : theme.fill.tertiary;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: isSm ? 11 : 12,
        lineHeight: isSm ? "14px" : "16px",
        fontWeight: 500,
        padding: isSm ? "2px 6px" : "4px 10px",
        borderRadius: 9999,
        color,
        background,
        border: isSm ? "none" : `1px solid ${theme.stroke.secondary}`,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

export function Card({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  const theme = useHostTheme();
  return (
    <div
      style={{
        borderRadius: 8,
        border: `1px solid ${theme.stroke.secondary}`,
        background: theme.bg.elevated,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, trailing }: { children?: ReactNode; trailing?: ReactNode }) {
  const theme = useHostTheme();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "10px 14px",
        borderBottom: `1px solid ${theme.stroke.tertiary}`,
        fontSize: 12,
        fontWeight: 590,
        color: theme.text.primary,
      }}
    >
      <span>{children}</span>
      {trailing}
    </div>
  );
}

export function CardBody({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <div style={{ padding: 14, ...style }}>{children}</div>;
}

export function Callout({
  children,
  title,
  tone = "neutral",
}: {
  children?: ReactNode;
  title?: ReactNode;
  tone?: "neutral" | "info";
}) {
  const theme = useHostTheme();
  const accent = tone === "info" ? theme.accent.primary : theme.text.secondary;

  return (
    <div
      style={{
        borderRadius: 8,
        border: `1px solid ${theme.stroke.secondary}`,
        borderLeft: `3px solid ${accent}`,
        background: theme.fill.quaternary,
        padding: "12px 14px",
      }}
    >
      {title && (
        <div style={{ fontSize: 13, fontWeight: 590, color: accent, marginBottom: 8 }}>{title}</div>
      )}
      {children}
    </div>
  );
}
