import { useEffect, useMemo, useState } from "react";

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationType>(() => {
    const windowScreenOrientation = window.screen.orientation;

    if (windowScreenOrientation) {
      return window.screen.orientation.type;
    }

    const isLandscape = window.innerWidth > window.innerHeight;
    const orientationType = isLandscape
      ? "landscape-primary"
      : "portrait-primary";

    return orientationType;
  });
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const windowScreenOrientation = window.screen.orientation;

    const updateOrientation = () => {
      if (windowScreenOrientation) {
        setOrientation(window.screen.orientation.type);
        setAngle(window.screen.orientation.angle);
      } else {
        // For old browsers
        const isLandscape = window.innerWidth > window.innerHeight;
        const orientationType = isLandscape
          ? "landscape-primary"
          : "portrait-primary";
        setOrientation(orientationType);
      }
    };

    updateOrientation();

    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    if (windowScreenOrientation) {
      windowScreenOrientation.addEventListener("change", updateOrientation);
    }

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);

      if (windowScreenOrientation) {
        windowScreenOrientation.removeEventListener(
          "change",
          updateOrientation
        );
      }
    };
  }, []);

  const result = useMemo(
    () => ({
      angle,
      orientation,
    }),
    [angle, orientation]
  );

  return result;
};
