import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/features/cart/CartDrawer";
import { WhatsAppFloatButton } from "@/components/shared/WhatsAppFloatButton";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloatButton />
    </div>
  );
}
