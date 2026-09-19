"use client";

import { cloneElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/format";
import { useEscape } from "@/lib/hooks";

/**
 * Floating surface portaled to `document.body` so RTL / viewport edges never
 * create a horizontal scrollbar on the page.
 */
export default function Popover({ trigger, children, align = "end", className, width = "w-72" }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerWrapRef = useRef(null);
  const panelRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  useEscape(close, open);

  const place = useCallback(() => {
    const wrap = triggerWrapRef.current;
    const panel = panelRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const panelW = panel?.offsetWidth || 380;
    const panelH = panel?.offsetHeight || 320;
    const gap = 6;
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < Math.min(panelH + 12, 280) && r.top > spaceBelow;

    let left;
    if (align === "start") left = r.left;
    else if (align === "center") left = r.left + r.width / 2 - panelW / 2;
    else left = r.right - panelW;

    const pad = 8;
    left = Math.max(pad, Math.min(left, window.innerWidth - panelW - pad));
    const top = openUp ? r.top - panelH - gap : r.bottom + gap;
    setCoords({ top: Math.max(pad, Math.min(top, window.innerHeight - 8)), left });
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (triggerWrapRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      close();
    };
    const onReposition = () => place();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, close, place]);

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div ref={panelRef} role="dialog" style={{ position: "fixed", top: coords.top, left: coords.left }} className={cn("z-80 max-h-[min(420px,calc(100vh-16px))] max-w-[calc(100vw-1.5rem)] overflow-x-hidden overflow-y-auto rounded-card-lg border border-line bg-surface shadow-lg animate-pop-in", width, className)}>
            {typeof children === "function" ? children({ close }) : children}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={triggerWrapRef} className="relative inline-flex">
      {cloneElement(trigger, {
        onClick: (e) => {
          trigger.props.onClick?.(e);
          setOpen((v) => !v);
        },
        "aria-haspopup": "dialog",
        "aria-expanded": open,
      })}
      {panel}
    </div>
  );
}
