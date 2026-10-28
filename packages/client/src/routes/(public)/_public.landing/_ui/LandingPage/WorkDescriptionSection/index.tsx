import { useTranslation } from "~/shared/hooks";
import { LightningIcon, StatusBadge } from "~/shared/ui";
import styles from "../LandingPage.module.css";

const steps = ["choose", "track", "reflect"] as const;

export const WorkDescriptionSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="how-it-works"
      className={styles.steps}
      aria-labelledby="steps-title"
    >
      <div className={styles.sectionIntro}>
        <StatusBadge dot={false}>
          <LightningIcon size={12} aria-hidden="true" />
          {t("pages.landing.design.stepsNav")}
        </StatusBadge>
        <h2 id="steps-title">{t("pages.landing.design.stepsHeading")}</h2>
        <p>{t("pages.landing.design.stepsSubtitle")}</p>
      </div>
      <div className={styles.stepGrid}>
        {steps.map((step, index) => (
          <article className={styles.step} key={step}>
            <span className={styles.stepNumber}>0{index + 1}</span>
            <h3>{t(`pages.landing.design.steps.${step}.title`)}</h3>
            <p>{t(`pages.landing.design.steps.${step}.body`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
