"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;
const ZOOM_STEP = 0.1;

type ZoomPanProps = {
  children: ReactNode;
  resetKey: string;
};

export function ZoomPan({ children, resetKey }: ZoomPanProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [fitScale, setFitScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const measureFit = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const padding = 20;
    const availableW = viewport.clientWidth - padding * 2;
    const availableH = viewport.clientHeight - padding * 2;
    const contentW = content.offsetWidth;
    const contentH = content.offsetHeight;

    if (contentW === 0 || contentH === 0 || availableW <= 0 || availableH <= 0) return;

    const nextFit = Math.min(1, availableW / contentW, availableH / contentH);
    setFitScale(nextFit);
    setScale(nextFit);
    setPan({ x: 0, y: 0 });
  }, []);

  useLayoutEffect(() => {
    measureFit();
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => measureFit());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [resetKey, measureFit]);

  const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

  const zoomBy = (delta: number) => setScale((current) => clampScale(current + delta));

  const resetView = () => {
    setScale(fitScale);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setScale((current) => clampScale(current + delta));
    };

    viewport.addEventListener("wheel", onWheel as unknown as EventListener, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel as unknown as EventListener);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    dragStart.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (event.clientX - dragStart.current.x),
      y: dragStart.current.panY + (event.clientY - dragStart.current.y),
    });
  };

  const onPointerUp = () => setDragging(false);

  const canPan = scale > fitScale + 0.02 || Math.abs(pan.x) > 2 || Math.abs(pan.y) > 2;

  return (
    <div className="zoom-pane">
      <div className="zoom-toolbar" aria-label="Diagram controls">
        <ZoomButton label="Zoom out" symbol="−" onClick={() => zoomBy(-ZOOM_STEP)} />
        <ZoomButton label="Zoom in" symbol="+" onClick={() => zoomBy(ZOOM_STEP)} />
        <ZoomButton label="Reset view" symbol="↺" onClick={resetView} reset />
      </div>

      <div
        ref={viewportRef}
        className="zoom-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ cursor: dragging ? "grabbing" : canPan ? "grab" : "default" }}
      >
        <div
          className="zoom-stage"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
            transition: dragging ? "none" : "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div ref={contentRef} className="zoom-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoomButton({
  label,
  symbol,
  onClick,
  reset,
}: {
  label: string;
  symbol: string;
  onClick: () => void;
  reset?: boolean;
}) {
  return (
    <button type="button" className={`zoom-btn${reset ? " zoom-btn-reset" : ""}`} onClick={onClick} title={label} aria-label={label}>
      {symbol}
    </button>
  );
}
