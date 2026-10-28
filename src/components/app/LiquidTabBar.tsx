import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

type Tab = { to: string; label: string; icon: LucideIcon };

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function LiquidTabBar({ tabs }: { tabs: readonly Tab[] }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.to === pathname));
  const [width, setWidth] = useState(0);
  const [drag, setDrag] = useState<number | null>(null); // bubble left px while dragging
  const [dir, setDir] = useState<1 | -1>(1);
  const prevIndex = useRef(activeIndex);
  const start = useRef<{ x: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useIso(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (activeIndex !== prevIndex.current) setDir(activeIndex > prevIndex.current ? 1 : -1);
    prevIndex.current = activeIndex;
  }, [activeIndex]);

  const tabW = width / tabs.length;
  const baseLeft = activeIndex * tabW;
  const left = drag ?? baseLeft;
  const hoverIndex = drag != null && tabW ? Math.round(drag / tabW) : activeIndex;

  const onDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const s = start.current;
    const el = trackRef.current;
    if (!s || !el) return;
    if (!s.moved && Math.abs(e.clientX - s.x) < 6) return;
    if (!s.moved) {
      s.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - tabW / 2;
    setDrag(Math.min(Math.max(x, 0), width - tabW));
  };
  const onUp = () => {
    const s = start.current;
    start.current = null;
    if (s?.moved && drag != null) {
      suppressClick.current = true;
      const idx = Math.round(drag / tabW);
      setDir(idx >= activeIndex ? 1 : -1);
      setDrag(null);
      const target = tabs[idx];
      if (target && idx !== activeIndex) navigate({ to: target.to });
      setTimeout(() => (suppressClick.current = false), 50);
    }
  };

  // Liquid: leading edge moves fast, trailing edge lags -> stretch & settle
  const fast = "380ms cubic-bezier(0.34, 1.4, 0.64, 1)";
  const slow = "560ms cubic-bezier(0.5, 1.25, 0.5, 1)";
  const transition =
    drag != null
      ? "none"
      : dir === 1
        ? `left ${slow}, right ${fast}`
        : `left ${fast}, right ${slow}`;

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:px-4">
      <div className="glass-bar pointer-events-auto rounded-[2rem] p-1.5">
        <div
          ref={trackRef}
          className="relative grid touch-pan-y select-none"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {width > 0 && (
            <span
              aria-hidden
              className={`glass-bubble absolute inset-y-0 rounded-[1.6rem] ${drag != null ? "scale-[1.06]" : ""}`}
              style={{ left, right: width - left - tabW, transition: `${transition}, transform 250ms ease` }}
            />
          )}
          {tabs.map(({ to, label, icon: Icon }, i) => {
            const active = i === hoverIndex;
            return (
              <Link
                key={to}
                to={to}
                draggable={false}
                onClick={(e) => {
                  if (suppressClick.current) e.preventDefault();
                }}
                className={`relative z-10 flex flex-col items-center gap-0.5 rounded-[1.6rem] py-2 text-[11px] transition-[color,transform] duration-300 ${
                  active ? "font-semibold text-primary" : "text-muted-foreground active:scale-95"
                }`}
              >
                <Icon className={`h-[22px] w-[22px] transition-transform duration-300 ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
