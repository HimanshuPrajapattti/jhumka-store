import { CartDrawer, CartProvider } from "@/components/cart";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteAppearance } from "@/lib/appearance";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appearance = await getSiteAppearance();

  return (
    <CartProvider>
      <div
        className="flex min-h-screen flex-col"
        style={{
          backgroundColor: appearance.siteBackgroundColor,
          ...(appearance.siteBackgroundImage
            ? {
                backgroundImage: `url("${appearance.siteBackgroundImage}")`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
              }
            : {}),
        }}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
