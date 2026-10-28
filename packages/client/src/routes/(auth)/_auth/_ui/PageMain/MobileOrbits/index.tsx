import styles from "./MobileOrbits.module.css";

const circlePath = "M 120 8 A 112 112 0 1 1 120 232 A 112 112 0 1 1 120 8";

const infinityPath =
  "M 240 90 C 170 10 40 10 40 90 C 40 170 170 170 240 90 C 310 10 440 10 440 90 C 440 170 310 170 240 90 Z";

export function AuthMobileOrbits() {
  return (
    <div className={styles.decoration} data-auth-orbits aria-hidden="true">
      <div className={styles.glow} />
      <svg className={styles.smallOrbit} viewBox="0 0 240 240" fill="none">
        <path className={styles.track} d={circlePath} />
        <circle
          className={styles.satellite}
          r="4"
          style={{ offsetPath: `path("${circlePath}")` }}
        />
      </svg>
      <svg className={styles.largeOrbit} viewBox="0 0 240 240" fill="none">
        <path className={styles.track} d={circlePath} />
        <circle
          className={styles.satellite}
          r="2.5"
          style={{ offsetPath: `path("${circlePath}")` }}
        />
        <g
          className={styles.innerOrbit}
          transform="translate(30 30) scale(0.75)"
        >
          <path className={styles.track} d={circlePath} />
          <circle
            className={styles.satellite}
            r="3.5"
            style={{ offsetPath: `path("${circlePath}")` }}
          />
        </g>
      </svg>
      <svg className={styles.infinityOrbit} viewBox="0 0 480 180" fill="none">
        <path className={styles.track} d={infinityPath} />
        <circle
          className={styles.satellite}
          r="3"
          style={{ offsetPath: `path("${infinityPath}")` }}
        />
      </svg>
    </div>
  );
}
