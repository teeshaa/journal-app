import type { ReactNode } from "react";
import { Row, Stack, Text } from "@/components/slides/canvas-ui";
import type { CanvasHostTheme } from "@/lib/slides-theme";

type FlowStep = {
  id: string;
  title: string;
  noteAbove?: string;
  description?: string;
  domain?: boolean;
  qa?: boolean;
  validation?: boolean;
  width?: number;
};

const FLOW_NODE_MIN_H = 108;
const FLOW_NODE_DEFAULT_W = 124;
const MERGE_BOX_H = 56;
const MERGE_BOX_COMPACT_H = 38;

const FLOW_NODE_NOTE_GAP = 2;
const FLOW_LABEL_BAND = 42;
const QA_PANEL_PAD_X = 20;
const QA_PANEL_PAD_Y = 18;

function arrowTopForHeight(boxHeight: number) {
  return boxHeight / 2 - 7;
}

function flowArrowMarginTop(boxHeight: number = FLOW_NODE_MIN_H) {
  return FLOW_LABEL_BAND + FLOW_NODE_NOTE_GAP + arrowTopForHeight(boxHeight);
}

function DomainContextShell({
  theme,
  children,
  gap = 2,
}: {
  theme: CanvasHostTheme;
  children: ReactNode;
  gap?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap,
        padding: `${FLOW_NODE_NOTE_GAP}px 10px 10px`,
        borderRadius: 10,
        border: `2px dashed ${theme.palette.diffStripRemoved}`,
        background: theme.palette.diffRemovedLine,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

function QaAutomationShell({ theme, children }: { theme: CanvasHostTheme; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: `${FLOW_NODE_NOTE_GAP}px 10px 10px`,
        borderRadius: 10,
        border: `2px dashed ${theme.qa.primary}`,
        background: theme.diff.insertedLine,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

function FlowNode({
  step,
  theme,
  width = step.width ?? FLOW_NODE_DEFAULT_W,
  domain,
  reserveLabelSpace = false,
  labelSpacerHeight,
}: {
  step: FlowStep;
  theme: CanvasHostTheme;
  width?: number;
  domain?: boolean;
  reserveLabelSpace?: boolean;
  labelSpacerHeight?: number;
}) {
  const isDomain = domain ?? step.domain;
  const border = isDomain
    ? `2px dashed ${theme.palette.diffStripRemoved}`
    : `1px solid ${theme.stroke.secondary}`;
  const background = isDomain ? theme.palette.diffRemovedLine : theme.fill.tertiary;
  const noteHeight = step.noteAbove ? FLOW_LABEL_BAND : 0;
  const spacerHeight =
    labelSpacerHeight ?? (reserveLabelSpace && !step.noteAbove ? FLOW_LABEL_BAND : 0);

  return (
    <div
      style={{
        width,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: FLOW_NODE_NOTE_GAP,
      }}
    >
      {step.noteAbove ? (
        <div
          style={{
            minHeight: noteHeight,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <Text size="small" tone="tertiary" style={{ lineHeight: "14px", fontSize: 11, margin: 0 }}>
            {step.noteAbove}
          </Text>
        </div>
      ) : (
        spacerHeight > 0 && <div aria-hidden style={{ height: spacerHeight, flexShrink: 0 }} />
      )}
      <div
        style={{
          width: "100%",
          minHeight: FLOW_NODE_MIN_H,
          padding: "10px 10px 8px",
          borderRadius: 8,
          border,
          background,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          boxSizing: "border-box",
        }}
      >
        <Text size="small" weight="medium" style={{ lineHeight: "16px" }}>
          {step.title}
        </Text>
        {step.description && (
          <Text size="small" tone="secondary" style={{ lineHeight: "14px", marginTop: "auto" }}>
            {step.description}
          </Text>
        )}
      </div>
    </div>
  );
}

function HArrow({
  theme,
  length = 20,
  marginTop,
  boxHeight = FLOW_NODE_MIN_H,
}: {
  theme: CanvasHostTheme;
  length?: number;
  marginTop?: number;
  boxHeight?: number;
}) {
  const resolvedMarginTop = marginTop ?? flowArrowMarginTop(boxHeight);
  return (
    <svg
      width={length}
      height={14}
      style={{ flexShrink: 0, marginTop: resolvedMarginTop, display: "block" }}
    >
      <line x1={0} y1={7} x2={length - 5} y2={7} stroke={theme.stroke.primary} strokeWidth={1.5} />
      <polygon points={`${length - 5},3 ${length},7 ${length - 5},11`} fill={theme.stroke.primary} />
    </svg>
  );
}

function VArrow({
  theme,
  height = 20,
  flush = false,
}: {
  theme: CanvasHostTheme;
  height?: number;
  flush?: boolean;
}) {
  return (
    <svg
      width={14}
      height={height}
      style={{
        flexShrink: 0,
        display: "block",
        marginTop: flush ? -1 : 0,
        marginBottom: flush ? -1 : 0,
      }}
    >
      <line x1={7} y1={0} x2={7} y2={height - 6} stroke={theme.stroke.primary} strokeWidth={1.5} />
      <polygon points={`3,${height - 6} 7,${height} 11,${height - 6}`} fill={theme.stroke.primary} />
    </svg>
  );
}

function QaKickoffConnector({
  kickoffCenterX,
  qaPanelLeft,
  connectorWidth,
  connectorHeight,
}: {
  kickoffCenterX: number;
  qaPanelLeft: number;
  connectorWidth: number;
  connectorHeight: number;
}) {
  const targetX = qaPanelLeft + 32;
  const bendY = connectorHeight * 0.42;
  const path = `M ${kickoffCenterX} 0 L ${kickoffCenterX} ${bendY} L ${targetX} ${bendY} L ${targetX} ${connectorHeight}`;
  const stroke = "#3F7668";
  const strokeWidth = 3;

  return (
    <svg
      width={connectorWidth}
      height={connectorHeight}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`${targetX - 6},${connectorHeight - 8} ${targetX},${connectorHeight} ${targetX + 6},${connectorHeight - 8}`}
        fill={stroke}
      />
    </svg>
  );
}

function LegendChip({
  swatch,
  dashed,
  dashedFill,
  label,
}: {
  swatch?: string;
  dashed?: string;
  dashedFill?: string;
  label: string;
}) {
  return (
    <span className="legend-chip">
      {dashed ? (
        <span
          className="legend-swatch"
          style={{
            width: 16,
            height: 8,
            borderRadius: 2,
            border: `2px dashed ${dashed}`,
            background: dashedFill,
          }}
        />
      ) : (
        <span className="legend-swatch" style={{ background: swatch }} />
      )}
      {label}
    </span>
  );
}

export function SDLCDiagram({ theme }: { theme: CanvasHostTheme }) {
  const preRefinedSteps: FlowStep[] = [
    { id: "epics", title: "Epics" },
    {
      id: "decomp",
      title: "Dev decomposition",
      description: "Slicing stories using INVEST principle.",
      width: 136,
    },
  ];

  const refinedStep: FlowStep = {
    id: "refined",
    title: "Refined user story",
    width: 132,
  };

  const domainSteps: FlowStep[] = [
    {
      id: "sval",
      title: "Story validation",
      noteAbove: "Upload to Jira and assign to developer",
      description: "Validate the story with product team.",
    },
    {
      id: "kickoff",
      title: "Story kickoff",
      description: "Developer asking questions to product representative within team during story kickoff.",
      width: 136,
    },
  ];

  const afterDomain: FlowStep[] = [
    {
      id: "tip",
      title: "Tech implementation plan",
      description: "Generate plan pairing with team lead or senior developer.",
      width: 136,
    },
    {
      id: "vplan",
      title: "Validate plan",
      noteAbove: "Optional",
      description: "Validate plan with product team.",
      validation: true,
    },
    {
      id: "implement",
      title: "Implement code and local testing",
      description: "Implement and test the plan.",
      width: 148,
    },
    {
      id: "icr",
      title: "Review refactor and local testing",
      width: 168,
    },
    { id: "mr", title: "Raise merge request" },
    { id: "qa", title: "QA", qa: true },
  ];

  const qaSteps: FlowStep[] = [
    {
      id: "qplan",
      title: "Planning",
      description: "Test pyramid + test strategy + scenarios.",
      width: 128,
    },
    {
      id: "qid",
      title: "Identify scenarios",
    },
    { id: "qauto", title: "Automate scenarios" },
    { id: "qrun", title: "Run and refactor" },
    { id: "qman", title: "Final sanity check", width: 128 },
  ];

  const stepWidth = FLOW_NODE_DEFAULT_W;
  const refinedWidth = refinedStep.width ?? stepWidth;
  const qaNodeWidth = 118;
  const arrowLength = 18;
  const rowGap = 2;

  const nodeWidth = (step: FlowStep, fallback = stepWidth) => step.width ?? fallback;

  const mainGap = rowGap;
  const domainPaddingX = 10;
  const flowSegment = (width: number) => width + rowGap + arrowLength;

  let kickoffCenterX = 0;
  for (const step of preRefinedSteps) {
    kickoffCenterX += flowSegment(nodeWidth(step)) + mainGap;
  }
  kickoffCenterX += refinedWidth + mainGap + arrowLength + mainGap;
  kickoffCenterX +=
    domainPaddingX +
    nodeWidth(domainSteps[0]) +
    mainGap +
    arrowLength +
    mainGap +
    nodeWidth(domainSteps[1]) / 2;

  const domainNoteBand = FLOW_LABEL_BAND;

  let tipLeft = 0;
  for (const step of preRefinedSteps) {
    tipLeft += flowSegment(nodeWidth(step)) + mainGap;
  }
  tipLeft += refinedWidth + mainGap + arrowLength + mainGap;
  const domainWidth =
    domainPaddingX * 2 +
    nodeWidth(domainSteps[0]) +
    mainGap +
    arrowLength +
    mainGap +
    nodeWidth(domainSteps[1]);
  tipLeft += domainWidth + mainGap + arrowLength + mainGap;

  const qaPanelWidth = qaSteps.reduce((sum, step, index) => {
    const nodeW = nodeWidth(step, qaNodeWidth);
    return sum + nodeW + (index < qaSteps.length - 1 ? rowGap + 16 : 0);
  }, QA_PANEL_PAD_X * 2);
  const qaBranchGap = 28;
  const qaBranchLeft = tipLeft;
  const domainBottomPad = 10;
  const connectorHeight = qaBranchGap + domainBottomPad;
  const connectorWidth = qaBranchLeft + qaPanelWidth;

  return (
    <Stack gap={14}>
      <div className="diagram-legend">
        <LegendChip
          dashed={theme.palette.diffStripRemoved}
          dashedFill={theme.palette.diffRemovedLine}
          label="Domain context"
        />
        <LegendChip
          dashed={theme.qa.primary}
          dashedFill={theme.diff.insertedLine}
          label="QA automation"
        />
      </div>

      <div
        style={{
          position: "relative",
          display: "inline-block",
          minWidth: "max-content",
          paddingTop: FLOW_LABEL_BAND + FLOW_NODE_NOTE_GAP,
          overflow: "visible",
        }}
      >
        <Row gap={rowGap} align="start" wrap={false}>
          {preRefinedSteps.map((step) => (
            <Row key={step.id} gap={rowGap} align="start" wrap={false}>
              <FlowNode step={step} theme={theme} width={nodeWidth(step)} reserveLabelSpace />
              <HArrow theme={theme} length={arrowLength} />
            </Row>
          ))}

          <FlowNode step={refinedStep} theme={theme} width={refinedWidth} reserveLabelSpace />
          <HArrow theme={theme} length={arrowLength} />

          <DomainContextShell theme={theme} gap={rowGap}>
            <FlowNode step={domainSteps[0]} theme={theme} width={nodeWidth(domainSteps[0])} />
            <HArrow theme={theme} length={arrowLength} />
            <FlowNode
              step={domainSteps[1]}
              theme={theme}
              width={nodeWidth(domainSteps[1])}
              labelSpacerHeight={domainNoteBand}
            />
          </DomainContextShell>
          <HArrow theme={theme} length={arrowLength} />

          {afterDomain.map((step, index) => (
            <Row key={step.id} gap={rowGap} align="start" wrap={false}>
              {step.validation ? (
                <DomainContextShell theme={theme}>
                  <FlowNode
                    step={step}
                    theme={theme}
                    width={nodeWidth(step)}
                    reserveLabelSpace={!step.noteAbove}
                  />
                </DomainContextShell>
              ) : step.qa ? (
                <QaAutomationShell theme={theme}>
                  <FlowNode
                    step={step}
                    theme={theme}
                    width={nodeWidth(step)}
                    reserveLabelSpace={!step.noteAbove}
                  />
                </QaAutomationShell>
              ) : (
                <FlowNode
                  step={step}
                  theme={theme}
                  width={nodeWidth(step)}
                  reserveLabelSpace={!step.noteAbove}
                />
              )}
              {index < afterDomain.length - 1 && <HArrow theme={theme} length={arrowLength} />}
            </Row>
          ))}
        </Row>

        <div
          style={{
            position: "relative",
            zIndex: 5,
            marginTop: -domainBottomPad,
            width: connectorWidth,
            height: connectorHeight,
            overflow: "visible",
            flexShrink: 0,
          }}
        >
          <QaKickoffConnector
            kickoffCenterX={kickoffCenterX}
            qaPanelLeft={qaBranchLeft}
            connectorWidth={connectorWidth}
            connectorHeight={connectorHeight}
          />
        </div>

        <div
          style={{
            marginLeft: qaBranchLeft,
            width: qaPanelWidth,
            flexShrink: 0,
            lineHeight: "normal",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: `${QA_PANEL_PAD_Y}px ${QA_PANEL_PAD_X}px`,
              borderRadius: 10,
              border: `2px dashed ${theme.qa.primary}`,
              background: theme.diff.insertedLine,
              boxSizing: "border-box",
            }}
          >
            <Text
              size="small"
              weight="medium"
              style={{
                color: theme.text.secondary,
                marginBottom: 12,
                display: "block",
                textAlign: "center",
              }}
            >
              QA automation · parallel from story kickoff
            </Text>
            <Row gap={rowGap} align="start" wrap={false}>
              {qaSteps.map((step, index) => (
                <Row key={step.id} gap={rowGap} align="start" wrap={false}>
                  <FlowNode step={step} theme={theme} width={nodeWidth(step, qaNodeWidth)} />
                  {index < qaSteps.length - 1 && (
                    <HArrow theme={theme} length={16} marginTop={arrowTopForHeight(FLOW_NODE_MIN_H)} />
                  )}
                </Row>
              ))}
            </Row>
          </div>
        </div>
      </div>
    </Stack>
  );
}

function MergeBox({
  label,
  theme,
  width = 140,
  highlight = false,
  note,
  compact,
}: {
  label: string;
  theme: CanvasHostTheme;
  width?: number | string;
  highlight?: boolean;
  note?: string;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        width: width as number | string,
        minHeight: compact ? 38 : 56,
        padding: compact ? "6px 10px" : "8px 10px",
        borderRadius: 8,
        border: `1px solid ${highlight ? theme.accent.primary : theme.stroke.secondary}`,
        background: highlight ? theme.fill.secondary : theme.fill.tertiary,
        flexShrink: 0,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <Text size="small" weight={highlight ? "medium" : "regular"} style={{ lineHeight: "15px" }}>
        {label}
      </Text>
      {note && (
        <Text size="small" tone="tertiary" style={{ lineHeight: "13px" }}>
          {note}
        </Text>
      )}
    </div>
  );
}

function ConvergeArrows({
  theme,
  topY,
  bottomY,
  height,
}: {
  theme: CanvasHostTheme;
  topY: number;
  bottomY: number;
  height?: number;
}) {
  const svgHeight = height ?? bottomY + 16;
  const mid = (topY + bottomY) / 2;
  return (
    <svg width={36} height={svgHeight} style={{ flexShrink: 0, display: "block" }}>
      <line x1={0} y1={topY} x2={28} y2={mid} stroke={theme.stroke.primary} strokeWidth={1.5} />
      <line x1={0} y1={bottomY} x2={28} y2={mid} stroke={theme.stroke.primary} strokeWidth={1.5} />
      <polygon points={`28,${mid - 4} 34,${mid} 28,${mid + 4}`} fill={theme.stroke.primary} />
    </svg>
  );
}

function TestFanArrows({
  theme,
  centerYs,
  height,
}: {
  theme: CanvasHostTheme;
  centerYs: number[];
  height?: number;
}) {
  const svgHeight = height ?? Math.max(...centerYs) + MERGE_BOX_COMPACT_H / 2;
  const mid = centerYs.reduce((sum, y) => sum + y, 0) / centerYs.length;
  return (
    <svg width={28} height={svgHeight} style={{ flexShrink: 0, display: "block" }}>
      {centerYs.map((y, i) => (
        <line key={i} x1={0} y1={mid} x2={22} y2={y} stroke={theme.stroke.primary} strokeWidth={1.5} />
      ))}
      <polygon points={`22,${mid - 4} 28,${mid} 22,${mid + 4}`} fill={theme.stroke.primary} />
    </svg>
  );
}

export function MergeSkillsDiagram({ theme }: { theme: CanvasHostTheme }) {
  const tests = [
    "test for compatibility",
    "test for usability",
    "test for consistency",
    "test for XP (list)",
    "test with orchestrator & modify",
  ];

  const laneGap = 14;
  const lane1Center = MERGE_BOX_H / 2;
  const lane2Center = MERGE_BOX_H + laneGap + MERGE_BOX_H / 2;
  const laneStackHeight = MERGE_BOX_H * 2 + laneGap;
  const userStoryBlockHeight = 72;
  const branchTopOffset = userStoryBlockHeight + 14 - 1;
  const testGap = 6;
  const testStackHeight = tests.length * MERGE_BOX_COMPACT_H + (tests.length - 1) * testGap;
  const testCenters = tests.map((_, i) => MERGE_BOX_COMPACT_H / 2 + i * (MERGE_BOX_COMPACT_H + testGap));

  const lane = (skillLabel: string, observeLabel: string) => (
    <Row gap={4} align="center" wrap={false}>
      <MergeBox label={skillLabel} theme={theme} width={132} />
      <HArrow theme={theme} length={18} boxHeight={MERGE_BOX_H} />
      <MergeBox label="Output artifact" note="S1 · same user story" theme={theme} width={122} />
      <HArrow theme={theme} length={18} boxHeight={MERGE_BOX_H} />
      <MergeBox label={observeLabel} theme={theme} width={132} />
    </Row>
  );

  return (
    <Stack gap={12} style={{ minWidth: 1080 }}>
      <Text size="small" tone="secondary">
        Both skills generate a user story from the same input. Compare the output artifacts, not the skills themselves.
      </Text>

      <Row gap={6} align="start" wrap={false}>
        <Stack gap={0} style={{ flexShrink: 0, lineHeight: 0, alignItems: "center" }}>
          <div style={{ lineHeight: "normal" }}>
            <MergeBox label="User story" note="Same input for both skills" theme={theme} width={180} highlight />
          </div>
          <VArrow theme={theme} height={14} flush />
          <Stack gap={laneGap} style={{ lineHeight: "normal", marginTop: -1 }}>
            {lane("DS story-writer skill", "observe patterns")}
            {lane("NI story-writer", "observe")}
          </Stack>
        </Stack>

        <Row gap={6} align="center" wrap={false} style={{ paddingTop: branchTopOffset, flexShrink: 0 }}>
          <ConvergeArrows theme={theme} topY={lane1Center} bottomY={lane2Center} height={laneStackHeight} />

        <MergeBox
          label="Compare both artifacts"
          note="What to take from theirs · what to keep from ours"
          theme={theme}
          width={152}
        />
        <HArrow theme={theme} length={20} boxHeight={MERGE_BOX_H} />
        <MergeBox
          label="Apply principles & understand diff"
          note="Quality & confidence yes · not speed"
          theme={theme}
          width={160}
          highlight
        />
        <HArrow theme={theme} length={20} boxHeight={MERGE_BOX_H} />
        <MergeBox
          label="Enhance DS skill & merge"
          note="Go ahead if principles check passes"
          theme={theme}
          width={152}
          highlight
        />

        <TestFanArrows theme={theme} centerYs={testCenters} height={testStackHeight} />

        <Stack gap={testGap} style={{ flexShrink: 0 }}>
          {tests.map((test) => (
            <MergeBox key={test} label={test} theme={theme} width={200} compact />
          ))}
        </Stack>

        <HArrow theme={theme} length={20} boxHeight={MERGE_BOX_H} />

        <MergeBox
          label="Raise PR / set-up call with ICON Team"
          note="Pitch in once tests pass"
          theme={theme}
          width={172}
          highlight
        />
        </Row>
      </Row>
    </Stack>
  );
}

type DayPlan = {
  date: string;
  day: string;
  theme: string;
};

const NEXT_WEEK_PLAN: DayPlan[] = [
  { date: "1 Jun", day: "Mon", theme: "One session + QA pairing + skills pairing · Copilot settings" },
  { date: "2 Jun", day: "Tue", theme: "Full-day QA · presentation skills session" },
  { date: "3 Jun", day: "Wed", theme: "Full-stop merge · raise PR · Double Diamond" },
  { date: "4 Jun", day: "Thu", theme: "Artefact storage and maintenance · architect session · pairing" },
  { date: "5 Jun", day: "Fri", theme: "Security with AI · pairing (refactoring)" },
  { date: "8 Jun", day: "Mon", theme: "Evolution of roles · re-look at the boards" },
  { date: "9 Jun", day: "Tue", theme: "Wrap up · showcase" },
];

export function NextWeekCalendar({ theme }: { theme: CanvasHostTheme }) {
  const planMap = new Map(NEXT_WEEK_PLAN.map((d) => [parseInt(d.date, 10), d]));
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daysInMonth = 30;

  const cells: Array<{ day: number | null; key: string }> = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, key: `d-${day}` });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, key: `e-end-${cells.length}` });
  }

  return (
    <Stack gap={12} style={{ minWidth: 680, maxWidth: 920 }}>
      <H3 style={{ fontSize: 16 }}>June 2026</H3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(88px, 1fr))",
          gap: 8,
          border: `1px solid ${theme.stroke.tertiary}`,
          borderRadius: 12,
          padding: 12,
          background: theme.fill.quaternary,
        }}
      >
        {weekdays.map((w) => (
          <Text key={w} size="small" tone="tertiary" weight="medium" style={{ textAlign: "center", padding: "4px 0" }}>
            {w}
          </Text>
        ))}
        {cells.map((cell) => {
          if (cell.day === null) {
            return <div key={cell.key} style={{ minHeight: 72 }} />;
          }
          const plan = planMap.get(cell.day);
          const isPlanDay = Boolean(plan);
          const isBlank = cell.day >= 10;

          return (
            <div
              key={cell.key}
              style={{
                minHeight: isPlanDay ? 92 : 72,
                padding: 8,
                borderRadius: 8,
                border: isPlanDay ? `2px solid ${theme.accent.primary}` : `1px solid ${theme.stroke.tertiary}`,
                background: isPlanDay ? theme.fill.secondary : theme.bg.editor,
                opacity: isBlank ? 0.35 : 1,
              }}
            >
              <Text size="small" weight={isPlanDay ? "medium" : "regular"}>
                {cell.day}
              </Text>
              {plan && (
                <Stack gap={4} style={{ marginTop: 6 }}>
                  <Text size="small" tone="tertiary">
                    {plan.day}
                  </Text>
                  <Text size="small" tone="secondary" style={{ lineHeight: "14px" }}>
                    {plan.theme}
                  </Text>
                </Stack>
              )}
            </div>
          );
        })}
      </div>
    </Stack>
  );
}

function H3({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h3 style={{ margin: 0, fontSize: 16, lineHeight: "22px", fontWeight: 590, color: "var(--text-primary)", ...style }}>
      {children}
    </h3>
  );
}
