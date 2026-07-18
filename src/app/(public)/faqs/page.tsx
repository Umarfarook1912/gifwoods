"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FAQS = [
  {
    q: "How does personalization work?",
    a: "When you add a personalizable product to your cart, you'll see a form to enter names, messages, or upload photos. Our artisans then engrave or print your customization in-house before shipping.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard orders ship in 5–7 business days. Personalized and engraved orders take 7–10 business days. Corporate bulk orders (25+) take 10–14 business days.",
  },
  {
    q: "Can I return a personalized gift?",
    a: "Personalized items are custom-made for you and cannot be returned unless they arrive damaged or defective. For defective items, contact us within 7 days of delivery.",
  },
  {
    q: "Do you offer corporate or bulk gifting?",
    a: "Yes! We specialize in corporate gifting for teams of 25 to 25,000. We offer bulk pricing, branded engraving, and a dedicated concierge. Request a quote from our Corporate page.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, Visa, Mastercard, Amex, netbanking, wallets, and Cash on Delivery — all powered by Cashfree, a secure PCI-DSS compliant gateway.",
  },
  {
    q: "Is gift wrapping included?",
    a: "All Gifwoods orders come in our signature gift box with a satin ribbon and a handwritten note — complimentary with every purchase.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Once your order ships, you'll receive a tracking link via email. You can also track it from the Orders section in your account.",
  },
  {
    q: "What if my gift arrives damaged?",
    a: "All our shipments are insured. If your gift arrives damaged, email us photos and your order ID at support@gifwoods.in within 7 days and we'll replace or refund it.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship across all of India. International shipping is coming soon — subscribe to our newsletter to be notified first.",
  },
  {
    q: "How do I write a review?",
    a: "Once your order is delivered, visit your Orders page and click 'Write a Review' on the relevant order. Your review will appear on the product page after admin approval.",
  },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("bg-white rounded-xl border transition-colors", open ? "border-gold/30" : "border-border")}>
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-dark pr-4">{q}</span>
        <ChevronDown className={cn("h-4 w-4 text-gold flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-warm-gray leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-secondary-dark py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-white/60 mt-2 max-w-xl">
            Everything you need to know about ordering, personalization, and delivery.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        <div className="mt-10 text-center bg-white rounded-2xl border border-border p-8">
          <p className="font-display font-bold text-xl text-dark mb-2">Still have questions?</p>
          <p className="text-warm-gray mb-4">Our team is here 7 days a week.</p>
          <a
            href="/contact"
            className="inline-block bg-gold text-dark font-semibold px-6 py-3 rounded-lg hover:bg-gold-dark transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
