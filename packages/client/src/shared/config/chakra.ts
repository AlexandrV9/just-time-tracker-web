import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from "@chakra-ui/react";

const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      accent: {
        color: "appAccent.buttonFg",
        bg: "appAccent.buttonBg",
        borderWidth: "1px",
        borderColor: "appAccent.buttonBorder",
        boxShadow: "appAccent.buttonShadow",
        fontWeight: "500",
        _hover: {
          color: "appAccent.buttonFg",
          filter: "brightness(1.13)",
          boxShadow: "appAccent.buttonHoverShadow",
        },
        _disabled: {
          opacity: 0.4,
        },
      },
    },
  },
});

const config = defineConfig({
  cssVarsRoot: ":where(html)",
  theme: {
    recipes: {
      button: buttonRecipe,
    },
    tokens: {
      colors: {
        appPage: {
          bg: { value: "var(--app-page-bg)" },
          fg: { value: "var(--app-page-fg)" },
          headerBorder: { value: "var(--app-page-header-border)" },
          stars: { value: "var(--app-page-stars)" },
        },
        appPrimary: {
          solid: { value: "var(--app-primary)" },
        },
        appSecondary: {
          bg: { value: "var(--app-secondary-bg)" },
          hover: { value: "var(--app-secondary-hover-bg)" },
          hoverSoft: { value: "var(--app-secondary-hover-soft)" },
          cardGradient: { value: "var(--app-secondary-card-gradient)" },
          chipGradient: { value: "var(--app-secondary-chip-gradient)" },
          formGradient: { value: "var(--app-secondary-form-gradient)" },
          formShadow: { value: "var(--app-secondary-form-shadow)" },
          cardShadow: { value: "var(--app-secondary-card-shadow)" },
          chipShadow: { value: "var(--app-secondary-chip-shadow)" },
        },
        appAccent: {
          text: { value: "var(--app-accent-text)" },
          softBg: { value: "var(--app-accent-soft-bg)" },
          softBorder: { value: "var(--app-accent-soft-border)" },
          border: { value: "var(--app-accent-border)" },
          borderStrong: { value: "var(--app-accent-border-strong)" },
          borderSoft: { value: "var(--app-accent-border-soft)" },
          titleGradient: { value: "var(--app-accent-title-gradient)" },
          chipGradient: { value: "var(--app-accent-chip-gradient)" },
          spotlight: { value: "var(--app-accent-spotlight)" },
          textShadow: { value: "var(--app-accent-text-shadow)" },
          buttonFg: { value: "var(--app-accent-button-fg)" },
          buttonBg: { value: "var(--app-accent-button-bg)" },
          buttonBorder: { value: "var(--app-accent-button-border)" },
          buttonShadow: { value: "var(--app-accent-button-shadow)" },
          buttonHoverShadow: { value: "var(--app-accent-button-hover-shadow)" },
        },
        appMuted: {
          text: { value: "var(--app-muted-text)" },
          subtle: { value: "var(--app-muted-subtle)" },
          border: { value: "var(--app-muted-border)" },
          borderSoft: { value: "var(--app-muted-border-soft)" },
          hoverBg: { value: "var(--app-muted-hover-bg)" },
        },
        appSuccess: {
          solid: { value: "var(--app-success)" },
          dotShadow: { value: "var(--app-success-dot-shadow)" },
        },
        appInfo: {
          solid: { value: "var(--app-info)" },
          border: { value: "var(--app-info-border)" },
        },
        appInputAccent: {
          bg: { value: "var(--app-input-accent-bg)" },
          text: { value: "var(--app-input-accent-text)" },
          placeholder: { value: "var(--app-input-accent-placeholder)" },
          border: { value: "var(--app-input-accent-border)" },
          focusBorder: { value: "var(--app-input-accent-focus-border)" },
          invalid: { value: "var(--app-input-accent-invalid)" },
          autofillBg: { value: "var(--app-input-accent-autofill-bg)" },
        },
        landingPage: {
          bg: { value: "var(--landing-page-bg)" },
          fg: { value: "var(--landing-page-fg)" },
          border: { value: "var(--landing-page-border)" },
          shadow: { value: "var(--landing-page-shadow)" },
          bright: { value: "var(--landing-bright)" },
          contrastFg: { value: "var(--landing-contrast-fg)" },
        },
        landingPrimary: {
          solid: { value: "var(--landing-primary)" },
          bright: { value: "var(--landing-primary-bright)" },
          deep: { value: "var(--landing-primary-deep)" },
        },
        landingSecondary: {
          bg: { value: "var(--landing-secondary-bg)" },
          elevated: { value: "var(--landing-secondary-elevated-bg)" },
          deep: { value: "var(--landing-secondary-deep-bg)" },
          hover: { value: "var(--landing-secondary-hover-bg)" },
          mutedBg: { value: "var(--landing-secondary-muted-bg)" },
        },
        landingAccent: {
          text: { value: "var(--landing-accent-text)" },
          strong: { value: "var(--landing-accent-strong)" },
        },
        landingMuted: {
          text: { value: "var(--landing-muted-text)" },
          subtle: { value: "var(--landing-muted-subtle)" },
          soft: { value: "var(--landing-muted-soft)" },
        },
        landingSuccess: {
          solid: { value: "var(--landing-success)" },
        },
        landingInfo: {
          solid: { value: "var(--landing-info)" },
        },
      },
    },
  },
});

export const chakraConfig = createSystem(defaultConfig, config);

export default chakraConfig;
