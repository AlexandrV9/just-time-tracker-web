import { useSearch } from "@tanstack/react-router";
import { useTranslation } from "~/shared/hooks";
import {
  ActionButton,
  ArrowRightIcon,
  CheckIcon,
  LightningIcon,
  Link,
  StatusBadge,
} from "~/shared/ui";
import { AppPreview } from "../AppPreview";
import styles from "../LandingPage.module.css";

export const HeroSection = () => {
  const { t } = useTranslation();
  const { redirect } = useSearch({ from: "/(public)/_public/landing/" });
  const authSearch = { redirect: redirect?.trim() || "/" };

  return (
    <section className={styles.hero} aria-labelledby="landing-title">
      <div className={styles.heroAtmosphere} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.heroCopy}>
        <StatusBadge dot={false}>
          <LightningIcon size={13} aria-hidden="true" />
          {t("pages.landing.design.eyebrow")}
        </StatusBadge>
        <h1 id="landing-title" className={styles.title}>
          {t("pages.landing.design.titleLead")}
          <br />
          <span>{t("pages.landing.design.titleAccent")}</span>
        </h1>
        <p className={styles.subtitle}>{t("pages.landing.subtitle")}</p>
        <div className={styles.heroActions}>
          <ActionButton asChild pill className={styles.primaryLink}>
            <Link to="/signup" search={authSearch}>
              {t("pages.landing.design.primaryAction")}
              <ArrowRightIcon size={17} aria-hidden="true" />
            </Link>
          </ActionButton>
          <a href="#preview" className={styles.outlineLink}>
            <span className={styles.smallPlay} aria-hidden="true" />
            {t("pages.landing.design.previewAction")}
          </a>
        </div>
        <p className={styles.heroNote}>
          <CheckIcon size={13} aria-hidden="true" />
          {t("pages.landing.design.heroNote")}
        </p>
      </div>
      <div className={styles.previewStage} id="preview">
        <div className={styles.previewGlow} aria-hidden="true" />
        <AppPreview />
        <p className={styles.previewCaption}>
          {t("pages.landing.design.demoNote")}
        </p>
      </div>
    </section>
  );
};
