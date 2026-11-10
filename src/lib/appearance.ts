import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "./db";
import {
  DEFAULT_SITE_APPEARANCE,
  type SiteAppearance,
} from "./appearance-defaults";

export { DEFAULT_SITE_APPEARANCE };
export type { SiteAppearance };

const SETTING_KEYS = {
  heroImage: "appearance.heroImage",
  homeBackgroundImage: "appearance.homeBackgroundImage",
  siteBackgroundImage: "appearance.siteBackgroundImage",
  siteBackgroundColor: "appearance.siteBackgroundColor",
} as const;

export function readSiteAppearance(): SiteAppearance {
  const rows = getDb()
    .prepare("SELECT key, value FROM site_settings WHERE key LIKE 'appearance.%'")
    .all() as { key: string; value: string }[];
  const values = new Map(rows.map((row) => [row.key, row.value]));
  const imagePath = (value: string | undefined, fallback: string) =>
    value && /^\/media\/[a-z0-9-]+\.(?:jpg|png|webp|avif)$/i.test(value)
      ? value
      : fallback;
  const color = values.get(SETTING_KEYS.siteBackgroundColor);

  return {
    heroImage: imagePath(
      values.get(SETTING_KEYS.heroImage),
      DEFAULT_SITE_APPEARANCE.heroImage,
    ),
    homeBackgroundImage: imagePath(
      values.get(SETTING_KEYS.homeBackgroundImage),
      "",
    ),
    siteBackgroundImage: imagePath(
      values.get(SETTING_KEYS.siteBackgroundImage),
      "",
    ),
    siteBackgroundColor:
      color && /^#[\da-f]{6}$/i.test(color)
        ? color
        : DEFAULT_SITE_APPEARANCE.siteBackgroundColor,
  };
}

export async function getSiteAppearance(): Promise<SiteAppearance> {
  "use cache";
  cacheLife("hours");
  cacheTag("appearance");

  return readSiteAppearance();
}
