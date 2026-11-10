export type AppearanceImage = {
  url: string;
  key: string | null;
};

export type SiteAppearance = {
  heroImage: AppearanceImage;
  homeBackgroundImage: AppearanceImage | null;
  siteBackgroundImage: AppearanceImage | null;
  siteBackgroundColor: string;
};

export const DEFAULT_SITE_APPEARANCE: SiteAppearance = {
  heroImage: { url: "/products/jhumka-gold.svg", key: null },
  homeBackgroundImage: null,
  siteBackgroundImage: null,
  siteBackgroundColor: "#fbf7f1",
};
