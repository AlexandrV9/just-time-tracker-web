import { useState, useEffect, useMemo } from "react";

interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop" | "unknown";
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
}

export const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: "unknown",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    userAgent: "",
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    const isMobile = /iphone|ipod|android|blackberry|windows phone/g.test(
      userAgent
    );
    const isTablet =
      /ipad|android|tablet|playbook|silk/g.test(userAgent) && !isMobile;
    const isDesktop = !isMobile && !isTablet;

    setDeviceInfo({
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
    });
  }, []);

  const result = useMemo(() => {
    return {
      isMobile: deviceInfo.isMobile,
      isTablet: deviceInfo.isTablet,
      isDesktop: deviceInfo.isDesktop,
      userAgent: deviceInfo.userAgent,
      type: deviceInfo.type,
    };
  }, [
    deviceInfo.isDesktop,
    deviceInfo.isMobile,
    deviceInfo.isTablet,
    deviceInfo.userAgent,
    deviceInfo.type,
  ]);

  return result;
};

export default useDeviceDetect;
