import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AVRANI — Handcrafted Jhumka Jewellery",
    template: "%s · AVRANI",
  },
  description:
    "AVRANI crafts small-batch jhumka, chandbali and temple jewellery by hand. Browse the collection and order in a tap on WhatsApp.",
  keywords: [
    "jhumka",
    "jhumka earrings",
    "indian jewellery",
    "handcrafted earrings",
    "chandbali",
    "avrani",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
