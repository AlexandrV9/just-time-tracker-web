import { useEffect } from "react";

export const SEO_SITE_NAME = "Just Time Tracker";

export const SEO_DEFAULT_DESCRIPTION =
  "Just Time Tracker is a focused time-tracking app with a central timer, activities, analytics, calendar, and history — know where your day went.";

type UseSeoOptions = {
  description?: string;
  path?: string;
  noIndex?: boolean;
};

function upsertMeta(
  name: string,
  content: string,
  attr: "name" | "property" = "name",
) {
  let element = document.querySelector(`meta[${attr}="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

export function useSeo({
  description = SEO_DEFAULT_DESCRIPTION,
  path = "/landing",
  noIndex = false,
}: UseSeoOptions = {}) {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_APP_URL?.replace(/\/$/, "") ?? "";
    const canonical = siteUrl ? `${siteUrl}${path}` : path;

    document.title = SEO_SITE_NAME;
    upsertMeta("description", description);
    upsertMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", canonical);
    upsertMeta("og:title", SEO_SITE_NAME, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:url", canonical, "property");
    upsertMeta("twitter:title", SEO_SITE_NAME);
    upsertMeta("twitter:description", description);

    if (siteUrl) {
      upsertMeta("og:image", `${siteUrl}/icons/logo-512x512.png`, "property");
      upsertMeta("twitter:image", `${siteUrl}/icons/logo-512x512.png`);
    }
  }, [description, path, noIndex]);
}
