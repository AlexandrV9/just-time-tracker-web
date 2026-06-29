import { useMemo } from "react";

interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop" | "unknown";
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
}

const detectDeviceInfo = (): DeviceInfo => {
  if (typeof navigator === "undefined") {
    return {
      type: "unknown",
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      userAgent: "",
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();

  const isMobile = /iphone|ipod|android|blackberry|windows phone/g.test(
    userAgent,
  );

  const isTablet =
    /ipad|android|tablet|playbook|silk/g.test(userAgent) && !isMobile;

  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    userAgent,
    type: isDesktop
      ? "desktop"
      : isTablet
        ? "tablet"
        : isMobile
          ? "mobile"
          : "unknown",
  };
};

export const useDeviceDetect = (): DeviceInfo => {
  return useMemo(() => detectDeviceInfo(), []);
};

export default useDeviceDetect;
