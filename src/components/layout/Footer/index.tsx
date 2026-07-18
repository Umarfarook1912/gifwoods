import Link from "next/link";
import { Share2, Globe, Rss } from "lucide-react";
import {
  SITE_NAME,
  SITE_TAGLINE,
  FOOTER_SHOP_LINKS,
  FOOTER_COMPANY_LINKS,
  FOOTER_SUPPORT_LINKS,
  SOCIAL_LINKS,
} from "@/constants/ui";

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-warm-gray hover:border-gold hover:text-gold transition-colors"
    >
      {children}
    </a>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="font-semibold text-sm text-dark mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-warm-gray hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-cream border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-3">
              <span className="font-display font-bold text-2xl text-dark">{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-warm-gray mb-6 max-w-xs">
              {SITE_TAGLINE} — crafting personalized, hand-finished gifts for the moments that matter.
            </p>
            <div className="flex gap-3">
              <SocialIcon href={SOCIAL_LINKS.instagram} label="Instagram">
                <Share2 className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={SOCIAL_LINKS.facebook} label="Facebook">
                <Globe className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={SOCIAL_LINKS.pinterest} label="Pinterest">
                <Rss className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>

          {/* Links */}
          <FooterColumn title="Shop" links={FOOTER_SHOP_LINKS} />
          <FooterColumn title="Company" links={FOOTER_COMPANY_LINKS} />
          <FooterColumn title="Support" links={FOOTER_SUPPORT_LINKS} />
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-warm-gray">
            © {new Date().getFullYear()} {SITE_NAME}. Crafted with care in India.
          </p>
          <div className="flex items-center gap-2 text-xs text-warm-gray">
            <span className="px-2 py-1 rounded border border-border font-medium">UPI</span>
            <span className="px-2 py-1 rounded border border-border font-medium">Visa</span>
            <span className="px-2 py-1 rounded border border-border font-medium">MC</span>
            <span className="px-2 py-1 rounded border border-border font-medium">Amex</span>
            <span className="px-2 py-1 rounded border border-border font-medium">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
