import { useSearch } from "@tanstack/react-router";
import { useTranslation } from "~/shared/hooks";
import {
  ActionButton,
  ArrowRightIcon,
  Link,
  OrbitDecoration,
  StatusBadge,
} from "~/shared/ui";
import styles from "../LandingPage.module.css";

export const FinalCtaSection = () => {
  const { t } = useTranslation();
  const { redirect } = useSearch({ from: "/(public)/_public/landing/" });
  const authSearch = { redirect: redirect?.trim() || "/" };

  return (
    <section className={styles.finalCta} aria-labelledby="final-title">
      <OrbitDecoration animated className={styles.orbit}>
        <img src="/icons/logo.svg" alt="" width="68" height="68" />
      </OrbitDecoration>
      <div className={styles.finalCopy}>
        <StatusBadge dot={false}>
          {t("pages.landing.design.closingLabel")}
        </StatusBadge>
        <h2 id="final-title">{t("pages.landing.design.closingTitle")}</h2>
        <p>{t("pages.landing.design.closingBody")}</p>
        <ActionButton asChild pill className={styles.primaryLink}>
          <Link to="/signup" search={authSearch}>
            {t("pages.landing.design.primaryAction")}
            <ArrowRightIcon size={17} aria-hidden="true" />
          </Link>
        </ActionButton>
      </div>
    </section>
  );
};
