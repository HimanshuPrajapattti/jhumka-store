import { AppearanceForm } from "@/components/admin/appearance-form";
import { getSiteAppearance } from "@/lib/appearance";

export default async function AdminAppearancePage() {
  const appearance = await getSiteAppearance();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="label-caps text-gold-deep">Storefront</p>
        <h1 className="mt-1.5 font-display text-4xl font-semibold text-maroon-deep">
          Website appearance
        </h1>
        <p className="mt-2 text-sm text-ash">
          Update the homepage images and storefront background.
        </p>
      </div>

      <AppearanceForm appearance={appearance} />

      <p className="rounded-xl border border-gold/30 bg-cream/60 px-5 py-4 text-sm leading-relaxed text-ash">
        For Render, add a persistent disk and set{" "}
        <code className="text-maroon-deep">AVRANI_DB_PATH</code> and{" "}
        <code className="text-maroon-deep">AVRANI_UPLOADS_DIR</code> to
        directories on that disk. Otherwise, uploaded images and settings may
        be lost when the service restarts or redeploys.
      </p>
    </div>
  );
}
