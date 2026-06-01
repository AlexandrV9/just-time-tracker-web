import { useEffect } from "react";

export function useDisableZoom() {
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // Блокируем жесты масштабирования
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);
    document.addEventListener("gestureend", preventDefault);

    let lastTouchEnd = 0;
    let isScrolling = false;

    const handleTouchStart = () => {
      isScrolling = false;
    };

    const handleTouchMove = () => {
      isScrolling = true;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const now = Date.now();

      if (!isScrolling && now - lastTouchEnd <= 300) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
      document.removeEventListener("gestureend", preventDefault);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
}
