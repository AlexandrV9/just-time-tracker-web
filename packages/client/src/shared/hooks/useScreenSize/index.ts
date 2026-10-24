import { useEffect, useState } from "react";

export type ScreenSize = {
  /** Viewport width (`window.innerWidth`). */
  width: number;
  /** Viewport height (`window.innerHeight`). */
  height: number;
  /** Physical screen width (`window.screen.width`). */
  screenWidth: number;
  /** Physical screen height (`window.screen.height`). */
  screenHeight: number;
};

function getScreenSize(): ScreenSize {
  if (typeof window === "undefined") {
    return {
      width: 0,
      height: 0,
      screenWidth: 0,
      screenHeight: 0,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  };
}

export function useScreenSize(): ScreenSize {
  const [size, setSize] = useState(getScreenSize);

  useEffect(() => {
    const handleResize = () => {
      setSize(getScreenSize());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return size;
}
