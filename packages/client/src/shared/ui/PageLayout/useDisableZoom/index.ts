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

    // Блокируем двойной тап (zoom)
    let lastTouchEnd = 0;

    const handleTouchEnd = (event: TouchEvent) => {
      const now = Date.now();

      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    };

    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
      document.removeEventListener("gestureend", preventDefault);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
}
