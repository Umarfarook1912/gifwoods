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
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";
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
      toast.success("Message sent!", { description: "We'll get back to you within 24 hours." });
      reset();
    } catch {
      toast.error("Failed to send. Please email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-secondary-dark py-12">
        <div className="page-container animate-fade-up">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Contact Us</h1>
          <p className="text-white/60 mt-2">Real people, real fast — 7 days a week.</p>
        </div>
      </div>

      <div className="page-container py-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-display font-bold text-xl text-dark mb-6">Get in touch</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "hello@gifwoods.in" },
                  { icon: Phone, label: "WhatsApp", value: "+91-99999-99999" },
                  { icon: MapPin, label: "Studio", value: "Bengaluru, Karnataka, India" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-warm-gray">{label}</p>
                      <p className="text-dark font-medium text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gold/10 rounded-2xl border border-gold/20 p-6">
              <h3 className="font-semibold text-dark mb-2">Corporate enquiries</h3>
              <p className="text-warm-gray text-sm leading-relaxed">
                For bulk and corporate orders (25+), email us at <strong>corporate@gifwoods.in</strong> or request a quote from our Corporate page for dedicated concierge support.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-display font-bold text-xl text-dark mb-6">Send a message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input id="name" {...register("name")} className="mt-1" placeholder="Priya Sharma" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" {...register("email")} className="mt-1" placeholder="priya@example.com" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...register("phone")} className="mt-1" placeholder="9876543210" />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" {...register("message")} className="mt-1 resize-none" rows={4} placeholder="Tell us how we can help..." />
                {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-dark hover:bg-gold-dark font-semibold h-11"
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
