import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

const DURATION = 0.48;
const TIME_DURATION = 0.28;
const EASE = "power3.inOut";
const TIME_EASE = "power2.out";

const ITEM_SELECTOR =
  "[data-flip='time'], [data-flip='title'], [data-flip='stop'], [data-flip='play']";

export function useFlipLayout() {
  const scopeRef = useRef<HTMLElement>(null);

  const run = useCallback((update: () => void) => {
    const scope = scopeRef.current;

    if (
      !scope ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      update();
      return;
    }

    const frame = scope.querySelector<HTMLElement>("[data-flip='frame']");
    const items = Array.from(scope.querySelectorAll<HTMLElement>(ITEM_SELECTOR));

    if (!frame || items.length === 0) {
      update();
      return;
    }

    const timeItems = items.filter((item) => item.dataset.flip === "time");
    const otherItems = items.filter((item) => item.dataset.flip !== "time");

    Flip.killFlipsOf(items);
    gsap.killTweensOf(frame);
    gsap.set(frame, { clearProps: "height" });

    const fromHeight = frame.offsetHeight;
    const state = Flip.getState(items, { simple: true });

    flushSync(update);

    const toHeight = frame.offsetHeight;

    if (otherItems.length > 0) {
      Flip.from(state, {
        targets: otherItems,
        duration: DURATION,
        ease: EASE,
        nested: true,
        prune: true,
        scale: false,
      });
    }

    if (timeItems.length > 0) {
      Flip.from(state, {
        targets: timeItems,
        duration: TIME_DURATION,
        ease: TIME_EASE,
        nested: true,
        prune: true,
        scale: false,
      });
      gsap.killTweensOf(timeItems, "width,height");
      gsap.set(timeItems, { clearProps: "width,height" });
    }
    gsap.set(frame, { height: fromHeight });
    gsap.to(frame, {
      height: toHeight,
      duration: DURATION,
      ease: EASE,
      overwrite: true,
      onComplete: () => {
        gsap.set(frame, { clearProps: "height" });
      },
    });
  }, []);

  return { scopeRef, run };
}
