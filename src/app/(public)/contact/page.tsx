"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactFormSchema } from "@/lib/utils/validators";
import { API_ENDPOINTS } from "@/constants/api";
import { CONTACT_INFO, SOCIAL_LINKS } from "@/constants/ui";
import { toast } from "sonner";
import { Mail, Phone, MapPin, ExternalLink, Navigation, Send } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import { z } from "zod";

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error);
      toast.success("Message sent successfully!", { description: "We'll get back to you within 24 hours." });
      reset();
    } catch {
      toast.error("Failed to send. Please email us directly at " + CONTACT_INFO.email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header Banner */}
      <div className="bg-secondary-dark py-14 border-b border-white/10">
        <div className="page-container max-w-5xl animate-fade-up">
          <p className="text-gold text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            We'd Love To Hear From You
          </p>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">Contact Us</h1>
          <p className="text-white/70 mt-2 text-sm md:text-base max-w-xl">
            Have a question about an order, custom engraving, or corporate gifts? Our team is here to assist you 7 days a week.
          </p>
        </div>
      </div>

      <div className="page-container py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Cards & Map (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Details Card */}
            <div className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-xs space-y-6">
              <h2 className="font-display font-bold text-xl text-dark">Get In Touch Directly</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Card */}
                <a
                  href={SOCIAL_LINKS.email}
                  className="p-4 rounded-2xl bg-cream/50 border border-border hover:border-gold/60 hover:bg-gold/10 transition-all group block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 text-gold-dark flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="h-4 w-4 text-dark" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gold-dark uppercase tracking-wider">Email Us</p>
                      <p className="text-xs text-warm-gray">Quick responses</p>
                    </div>
                  </div>
                  <p className="text-dark font-semibold text-sm truncate group-hover:text-gold-dark transition-colors">
                    {CONTACT_INFO.email}
                  </p>
                </a>

                {/* Phone Card */}
                <a
                  href={SOCIAL_LINKS.phone}
                  className="p-4 rounded-2xl bg-cream/50 border border-border hover:border-gold/60 hover:bg-gold/10 transition-all group block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 text-gold-dark flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Phone className="h-4 w-4 text-dark" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gold-dark uppercase tracking-wider">Call / Phone</p>
                      <p className="text-xs text-warm-gray">Mon-Sat: 9am - 8pm</p>
                    </div>
                  </div>
                  <p className="text-dark font-semibold text-sm group-hover:text-gold-dark transition-colors">
                    {CONTACT_INFO.phoneFormatted}
                  </p>
                </a>
              </div>

              {/* Address Box */}
              <div className="p-4 rounded-2xl bg-cream/70 border border-border flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 text-dark flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-dark" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-dark uppercase tracking-wider mb-1">
                    Manufacturing Atelier & Office
                  </p>
                  <p className="text-xs text-warm-gray leading-relaxed">
                    {CONTACT_INFO.address}
                  </p>
                </div>
              </div>

              {/* Social Media Links Section Harmonized with Theme */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray mb-3">
                  Follow Us On Social Media
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Instagram */}
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-cream/50 border border-border hover:border-gold/60 hover:bg-gold/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 text-dark flex items-center justify-center shrink-0 group-hover:text-[#E4405F] transition-colors">
                        <InstagramIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-dark group-hover:text-gold-dark transition-colors">Instagram</p>
                        <p className="text-[11px] text-warm-gray">@gifwoods_</p>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-warm-gray group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  {/* YouTube */}
                  <a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-cream/50 border border-border hover:border-gold/60 hover:bg-gold/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 text-dark flex items-center justify-center shrink-0 group-hover:text-[#FF0000] transition-colors">
                        <YoutubeIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-dark group-hover:text-gold-dark transition-colors">YouTube</p>
                        <p className="text-[11px] text-warm-gray">Official Channel</p>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-warm-gray group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Corporate Enquiry Box */}
            <div className="bg-gold/10 rounded-3xl border border-gold/20 p-6 space-y-2">
              <h3 className="font-semibold text-dark text-base">Bulk & Corporate Gifting Orders</h3>
              <p className="text-warm-gray text-xs leading-relaxed">
                Planning bulk wedding favors, customized corporate merchandise, or executive hampers (25+ units)? Contact us at{" "}
                <a href={`mailto:${CONTACT_INFO.email}`} className="font-bold text-dark hover:text-gold transition-colors underline">
                  {CONTACT_INFO.email}
                </a>{" "}
                or call{" "}
                <a href={`tel:${CONTACT_INFO.phone}`} className="font-bold text-dark hover:text-gold transition-colors underline">
                  {CONTACT_INFO.phoneFormatted}
                </a>.
              </p>
            </div>

            {/* Map Embed Card */}
            <div className="bg-white rounded-3xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-gold" />
                  <h3 className="font-display font-bold text-base text-dark">Find Our Location</h3>
                </div>
                <a
                  href={CONTACT_INFO.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-gold-dark hover:underline flex items-center gap-1"
                >
                  Open in Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden border border-border h-64 w-full relative bg-muted">
                <iframe
                  title="Gifwoods Google Map Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={CONTACT_INFO.mapEmbedUrl}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form (5 cols on lg) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-xs sticky top-24">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-8 h-8 rounded-full bg-gold/15 text-dark flex items-center justify-center">
                  <Send className="h-4 w-4 text-gold-dark" />
                </span>
                <h2 className="font-display font-bold text-xl text-dark">Send A Message</h2>
              </div>
              <p className="text-xs text-warm-gray mb-6">
                Fill out the form below and our customer care team will respond within 24 hours.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-xs font-semibold text-dark">Your Name *</Label>
                  <Input id="name" {...register("name")} className="mt-1 rounded-xl" placeholder="e.g. Priya Sharma" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs font-semibold text-dark">Email Address *</Label>
                  <Input id="email" type="email" {...register("email")} className="mt-1 rounded-xl" placeholder="priya@example.com" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-xs font-semibold text-dark">Phone Number</Label>
                  <Input id="phone" {...register("phone")} className="mt-1 rounded-xl" placeholder="7010969348" />
                </div>

                <div>
                  <Label htmlFor="message" className="text-xs font-semibold text-dark">Message / Requirement *</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    className="mt-1 rounded-xl resize-none"
                    rows={4}
                    placeholder="Tell us how we can help with your order or customization..."
                  />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-dark hover:bg-gold-dark font-semibold h-11 rounded-xl shadow-xs"
                >
                  {loading ? "Sending Message..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

