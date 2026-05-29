export const canvasPaletteLight = {
  foreground: "#071830F0",
  foregroundSecondary: "#416176BD",
  foregroundTertiary: "#4161768A",
  foregroundQuaternary: "#4161765C",
  editor: "#FFFFFF",
  chrome: "#F1F4F9",
  sidebar: "#E8EDF4",
  elevated: "#FFFFFF",
  fillPrimary: "#07183033",
  fillSecondary: "#07183024",
  fillTertiary: "#07183014",
  fillQuaternary: "#0718300F",
  strokePrimary: "#07183033",
  strokeSecondary: "#0718301F",
  strokeTertiary: "#07183014",
  accent: "#002B47",
  buttonBackground: "#002B47",
  buttonForeground: "#FFFFFF",
  buttonHoverBackground: "#071830",
  link: "#002B47",
  qaAccent: "#87BAAB",
  diffInsertedLine: "#87BAAB1F",
  diffRemovedLine: "#3A183414",
  diffStripAdded: "#87BAABCC",
  diffStripRemoved: "#3A1834CC",
} as const;

export type CanvasPalette = typeof canvasPaletteLight;

export type CanvasHostTheme = {
  kind: "light";
  palette: CanvasPalette;
  bg: {
    editor: string;
    chrome: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    link: string;
    onAccent: string;
  };
  stroke: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  fill: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
  accent: {
    primary: string;
    control: string;
    controlHover: string;
  };
  qa: {
    primary: string;
  };
  diff: {
    insertedLine: string;
    removedLine: string;
    stripAdded: string;
    stripRemoved: string;
  };
};

export function useHostTheme(): CanvasHostTheme {
  const p = canvasPaletteLight;
  return {
    kind: "light",
    palette: p,
    bg: {
      editor: p.editor,
      chrome: p.chrome,
      elevated: p.elevated,
    },
    text: {
      primary: p.foreground,
      secondary: p.foregroundSecondary,
      tertiary: p.foregroundTertiary,
      quaternary: p.foregroundQuaternary,
      link: p.link,
      onAccent: p.buttonForeground,
    },
    stroke: {
      primary: p.strokePrimary,
      secondary: p.strokeSecondary,
      tertiary: p.strokeTertiary,
    },
    fill: {
      primary: p.fillPrimary,
      secondary: p.fillSecondary,
      tertiary: p.fillTertiary,
      quaternary: p.fillQuaternary,
    },
    accent: {
      primary: p.accent,
      control: p.buttonBackground,
      controlHover: p.buttonHoverBackground,
    },
    qa: {
      primary: p.qaAccent,
    },
    diff: {
      insertedLine: p.diffInsertedLine,
      removedLine: p.diffRemovedLine,
      stripAdded: p.diffStripAdded,
      stripRemoved: p.diffStripRemoved,
    },
  };
}
