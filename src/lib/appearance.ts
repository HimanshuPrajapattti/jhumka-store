import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { getInsforgeAdmin, throwInsforgeError } from "./insforge-admin";
import {
  DEFAULT_SITE_APPEARANCE,
  type AppearanceImage,
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

export async function readSiteAppearance(): Promise<SiteAppearance> {
  const { data, error } = await getInsforgeAdmin()
    .database.from("site_settings")
    .select("key, value, asset_key")
    .in("key", Object.values(SETTING_KEYS));
  throwInsforgeError(error);
  const values = new Map(
    (data ?? []).map((row) => [row.key as string, row]),
  );
  const image = (key: string, fallback: AppearanceImage | null) => {
    const row = values.get(key);
    if (!row || typeof row.value !== "string") return fallback;
    if (
      !row.value.startsWith("/") &&
      (!process.env.INSFORGE_URL ||
        !row.value.startsWith(`${process.env.INSFORGE_URL}/`))
    ) {
      return fallback;
    }
    return {
      url: row.value,
      key: typeof row.asset_key === "string" ? row.asset_key : null,
    };
  };
  const color = values.get(SETTING_KEYS.siteBackgroundColor)?.value;

  return {
    heroImage: image(
      SETTING_KEYS.heroImage,
      DEFAULT_SITE_APPEARANCE.heroImage,
    ) ?? DEFAULT_SITE_APPEARANCE.heroImage,
    homeBackgroundImage: image(
      SETTING_KEYS.homeBackgroundImage,
      null,
    ),
    siteBackgroundImage: image(
      SETTING_KEYS.siteBackgroundImage,
      null,
    ),
    siteBackgroundColor:
      typeof color === "string" && /^#[\da-f]{6}$/i.test(color)
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
