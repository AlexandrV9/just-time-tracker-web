import { useTranslation } from "~/shared/hooks";
import {
  BellIcon,
  BookIcon,
  Calendar2Icon,
  ChartLineIcon,
  CheckIcon,
  ClockIcon,
  IconTile,
  LightningIcon,
  MoonIcon,
  PlusIcon,
  StatusBadge,
} from "~/shared/ui";
import styles from "../LandingPage.module.css";

type Feature = { title: string; body: string };

const featureIcons = [
  ClockIcon,
  Calendar2Icon,
  BookIcon,
  ChartLineIcon,
  BellIcon,
];

export const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = t("pages.landing.features", {
    returnObjects: true,
  }) as Feature[];

  return (
    <section
      id="features"
      className={styles.features}
      aria-labelledby="features-title"
    >
      <div className={styles.sectionIntro}>
        <StatusBadge dot={false}>
          <PlusIcon size={12} aria-hidden="true" />
          {t("pages.landing.design.featuresNav")}
        </StatusBadge>
        <h2 id="features-title">
          {t("pages.landing.design.featuresHeading")}
          <br />
          <span>{t("pages.landing.design.featuresAccent")}</span>
        </h2>
        <p>{t("pages.landing.design.featuresSubtitle")}</p>
      </div>
      <div className={styles.featureGrid}>
        {(Array.isArray(features) ? features : []).map((feature, index) => {
          const Icon = featureIcons[index] ?? LightningIcon;
          return (
            <article key={feature.title} className={styles.featureCard}>
              <IconTile
                tone={index === 1 ? "mint" : index === 3 ? "blue" : "purple"}
              >
                <Icon size={21} aria-hidden="true" />
              </IconTile>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
              <div className={styles.featureArt} aria-hidden="true">
                {index === 0 && (
                  <>
                    <span className={styles.largeTime}>
                      00<span>:</span>42<span>:</span>18
                    </span>
                    <div className={styles.sessionLine}>
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className={styles.sessionTicks}>
                      <span>09:00</span>
                      <span>10:00</span>
                      <span>11:00</span>
                    </div>
                  </>
                )}
                {index === 1 && (
                  <div className={styles.miniPlan}>
                    {["work", "reading", "learning"].map((name, i) => (
                      <span key={name}>
                        <i>{i === 0 ? <CheckIcon size={12} /> : null}</i>
                        {t(`pages.landing.design.activities.${name}`)}
                        <small>{["01:30", "00:25", "00:45"][i]}</small>
                      </span>
                    ))}
                  </div>
                )}
                {index === 2 && (
                  <div className={styles.libraryArt}>
                    <span>
                      <BookIcon size={20} />
                      {t("pages.landing.design.activities.reading")}
                    </span>
                    <span>
                      <ClockIcon size={20} />
                      {t("pages.landing.design.activities.work")}
                    </span>
                    <span>
                      <PlusIcon size={20} />
                    </span>
                  </div>
                )}
                {index === 3 && (
                  <div className={styles.featureChart}>
                    {[35, 58, 44, 79, 65, 95, 55].map((height, i) => (
                      <i key={i} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                )}
                {index === 4 && (
                  <div className={styles.settingsArt}>
                    <span>
                      <MoonIcon size={25} />
                    </span>
                    <span>
                      <BellIcon size={29} />
                    </span>
                    <span className={styles.languageOrb}>Aa</span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
