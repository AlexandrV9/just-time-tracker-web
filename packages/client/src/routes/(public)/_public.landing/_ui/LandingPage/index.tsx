import { useCallback, useRef, type MouseEvent } from "react";
import clsx from "clsx";
import { useTranslation } from "~/shared/hooks";
import { useSeo } from "~/shared/seo";
import scrollStyles from "~/shared/styles/scrollArea.module.css";
import { Box, PageLayout } from "~/shared/ui";
import styles from "./LandingPage.module.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { Capabilities } from "./Capabilities";
import { FeaturesSection } from "./FeaturesSection";
import { WorkDescriptionSection } from "./WorkDescriptionSection";
import { FinalCtaSection } from "./FinalCtaSection";
import { useScrollRestoration } from "./useScrollRestoration";

export const LandingPage = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useSeo({ description: t("pages.landing.subtitle"), path: "/landing" });
  useScrollRestoration(scrollRef);

  const handleAnchorClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) return;

    const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
    const id = anchor?.getAttribute("href")?.slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();

    if (id === "landing-top") {
      scrollRef.current?.scrollTo({ top: 0 });
      return;
    }

    target.scrollIntoView({ block: "start" });
  }, []);

  return (
    <PageLayout className={styles.page} bg="landingPage.bg" color="landingPage.fg">
      <Header />
      <Box
        as="main"
        ref={scrollRef}
        id="landing-top"
        className={clsx(styles.main, scrollStyles.scrollArea)}
        flex="1"
        minH={0}
        minW={0}
        onClick={handleAnchorClick}
      >
        <HeroSection />
        <Capabilities />
        <FeaturesSection />
        <WorkDescriptionSection />
        <FinalCtaSection />
        <Footer />
      </Box>
    </PageLayout>
  );
};
