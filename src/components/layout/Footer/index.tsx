import Link from "next/link";
import { Gift, Mail, Phone, MapPin } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import {
  SITE_NAME,
  SITE_TAGLINE,
  FOOTER_SHOP_LINKS,
  FOOTER_COMPANY_LINKS,
  FOOTER_SUPPORT_LINKS,
  SOCIAL_LINKS,
  CONTACT_INFO,
} from "@/constants/ui";

function BrandSocialIcon({
  href,
  label,
  children,
  hoverColorClass = "hover:border-gold hover:text-gold hover:bg-gold/20",
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  hoverColorClass?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center text-white/80 transition-all duration-300 transform hover:scale-105 ${hoverColorClass}`}
    >
      {children}
    </a>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-gold text-[11px] font-semibold tracking-[0.2em] uppercase mb-5">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/60 hover:text-gold transition-colors"
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
    <footer className="bg-dark text-white">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                <Gift className="h-4 w-4 text-gold" />
              </span>
              <span className="font-display font-bold text-2xl text-white">{SITE_NAME}</span>
            </Link>
            
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              {SITE_TAGLINE} — crafting personalized, hand-finished gifts for the moments that matter.
            </p>

            {/* Direct Contact Details */}
            <div className="space-y-2.5 pt-1 text-sm text-white/80">
              <a
                href={SOCIAL_LINKS.email}
                className="flex items-center gap-2.5 hover:text-gold transition-colors group"
              >
                <span className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">{CONTACT_INFO.email}</span>
              </a>

              <a
                href={SOCIAL_LINKS.phone}
                className="flex items-center gap-2.5 hover:text-gold transition-colors group"
              >
                <span className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <span>{CONTACT_INFO.phoneFormatted}</span>
              </a>

              <div className="flex items-start gap-2.5 text-white/60 pt-0.5">
                <span className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs leading-relaxed max-w-xs">{CONTACT_INFO.address}</span>
              </div>
            </div>

            {/* Social Media Icons Harmonized with Theme */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold tracking-wider text-gold uppercase mb-3">
                Follow Us
              </p>
              <div className="flex items-center gap-3">
                <BrandSocialIcon
                  href={SOCIAL_LINKS.instagram}
                  label="Instagram"
                  hoverColorClass="hover:border-[#E4405F] hover:text-[#E4405F] hover:bg-[#E4405F]/15"
                >
                  <InstagramIcon className="h-4.5 w-4.5" />
                </BrandSocialIcon>

                <BrandSocialIcon
                  href={SOCIAL_LINKS.youtube}
                  label="YouTube"
                  hoverColorClass="hover:border-[#FF0000] hover:text-[#FF0000] hover:bg-[#FF0000]/15"
                >
                  <YoutubeIcon className="h-4.5 w-4.5" />
                </BrandSocialIcon>

                <BrandSocialIcon
                  href={SOCIAL_LINKS.email}
                  label="Email Us"
                  hoverColorClass="hover:border-gold hover:text-gold hover:bg-gold/20"
                >
                  <Mail className="h-4.5 w-4.5" />
                </BrandSocialIcon>

                <BrandSocialIcon
                  href={SOCIAL_LINKS.phone}
                  label="Call Us"
                  hoverColorClass="hover:border-gold hover:text-gold hover:bg-gold/20"
                >
                  <Phone className="h-4.5 w-4.5" />
                </BrandSocialIcon>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <FooterColumn title="Shop" links={FOOTER_SHOP_LINKS} />
          <FooterColumn title="Company" links={FOOTER_COMPANY_LINKS} />
          <FooterColumn title="Support" links={FOOTER_SUPPORT_LINKS} />
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {SITE_NAME}. Crafted with care in India.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="uppercase tracking-wider mr-1">We accept</span>
            {["UPI", "Visa", "MC", "Amex", "COD"].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded-full border border-white/15 font-medium text-white/60"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

