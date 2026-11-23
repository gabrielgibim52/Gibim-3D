import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/inter";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Gibim 3D · Objetos impressos em 3D",
  description: "Vasos, luminárias e peças personalizadas impressas em 3D. Gire, personalize e veja no seu ambiente antes de comprar.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
