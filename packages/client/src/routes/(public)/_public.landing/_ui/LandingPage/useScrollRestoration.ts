import { useLayoutEffect, type RefObject } from "react";

const STORAGE_KEY = "landing:scrollTop";

export const useScrollRestoration = (
  scrollerRef: RefObject<HTMLElement | null>,
) => {
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const saved = Number(sessionStorage.getItem(STORAGE_KEY));
    sessionStorage.removeItem(STORAGE_KEY);
    if (saved > 0) {
      scroller.scrollTo({ top: saved, behavior: "instant" });
    }

    const saveScroll = () => {
      sessionStorage.setItem(STORAGE_KEY, String(scroller.scrollTop));
    };

    window.addEventListener("pagehide", saveScroll);
    return () => window.removeEventListener("pagehide", saveScroll);
  }, [scrollerRef]);
};
