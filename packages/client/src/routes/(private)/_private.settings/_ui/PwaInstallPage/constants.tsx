import type { ComponentType } from "react";

import iosSafariStep1 from "~/shared/assets/images/pwa-instructions/ios/1_1.png";
import iosSafariStep2 from "~/shared/assets/images/pwa-instructions/ios/1_2.png";
import iosSafariStep3 from "~/shared/assets/images/pwa-instructions/ios/1_3.png";
import iosChromeStep1 from "~/shared/assets/images/pwa-instructions/ios/2_1.png";
import iosChromeStep2 from "~/shared/assets/images/pwa-instructions/ios/2_2.png";
import iosChromeStep3 from "~/shared/assets/images/pwa-instructions/ios/2_3.png";

import macosStep1 from "~/shared/assets/images/pwa-instructions/macos/1.png";
import macosStep2 from "~/shared/assets/images/pwa-instructions/macos/2.png";
import macosStep3 from "~/shared/assets/images/pwa-instructions/macos/3.png";

import {
  AndroidLogo,
  AppleLogo,
  WindowsLogoIcon,
  type IconProps,
} from "~/shared/ui";

export type PwaInstallStepImage = {
  image: string;
  captionKey: string;
};

export type PwaInstallStep = {
  image?: string;
  images?: PwaInstallStepImage[];
  translationKey: string;
};

export type PwaInstallSection = {
  value: string;
  titleKey: string;
  icon: ComponentType<IconProps>;
  steps: PwaInstallStep[];
};

export const pwaInstallSections: PwaInstallSection[] = [
  {
    value: "ios",
    titleKey: "pages.settings.pwaInstall.sections.ios.title",
    icon: AppleLogo,
    steps: [
      {
        translationKey:
          "pages.settings.pwaInstall.sections.ios.steps.1.description",
        images: [
          {
            image: iosSafariStep1,
            captionKey: "pages.settings.pwaInstall.sections.ios.browserSafari",
          },
          {
            image: iosChromeStep1,
            captionKey: "pages.settings.pwaInstall.sections.ios.browserChrome",
          },
        ],
      },
      {
        translationKey:
          "pages.settings.pwaInstall.sections.ios.steps.2.description",
        images: [
          {
            image: iosSafariStep2,
            captionKey: "pages.settings.pwaInstall.sections.ios.browserSafari",
          },
          {
            image: iosChromeStep2,
            captionKey: "pages.settings.pwaInstall.sections.ios.browserChrome",
          },
        ],
      },
      {
        translationKey:
          "pages.settings.pwaInstall.sections.ios.steps.3.description",
        images: [
          {
            image: iosSafariStep3,
            captionKey: "pages.settings.pwaInstall.sections.ios.browserSafari",
          },
          {
            image: iosChromeStep3,
            captionKey: "pages.settings.pwaInstall.sections.ios.browserChrome",
          },
        ],
      },
    ],
  },
  {
    value: "macos",
    titleKey: "pages.settings.pwaInstall.sections.macos.title",
    icon: AppleLogo,
    steps: [
      {
        image: macosStep1,
        translationKey:
          "pages.settings.pwaInstall.sections.macos.steps.1.description",
      },
      {
        image: macosStep2,
        translationKey:
          "pages.settings.pwaInstall.sections.macos.steps.2.description",
      },
      {
        image: macosStep3,
        translationKey:
          "pages.settings.pwaInstall.sections.macos.steps.3.description",
      },
    ],
  },
  {
    value: "android",
    titleKey: "pages.settings.pwaInstall.sections.android.title",
    icon: AndroidLogo,
    steps: [
      {
        translationKey:
          "pages.settings.pwaInstall.sections.android.steps.1.description",
      },
      {
        translationKey:
          "pages.settings.pwaInstall.sections.android.steps.2.description",
      },
      {
        translationKey:
          "pages.settings.pwaInstall.sections.android.steps.3.description",
      },
    ],
  },
  {
    value: "windows",
    titleKey: "pages.settings.pwaInstall.sections.windows.title",
    icon: WindowsLogoIcon,
    steps: [
      {
        translationKey:
          "pages.settings.pwaInstall.sections.windows.steps.1.description",
      },
      {
        translationKey:
          "pages.settings.pwaInstall.sections.windows.steps.2.description",
      },
      {
        translationKey:
          "pages.settings.pwaInstall.sections.windows.steps.3.description",
      },
    ],
  },
];
