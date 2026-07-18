"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("You're on the list!", {
      description: "Watch for your welcome offer in your inbox.",
    });
    setEmail("");
    setLoading(false);
  };

  return (
    <section className="py-16 bg-gold">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-dark mb-3">
          First to know. First to gift.
        </h2>
        <p className="text-dark/70 text-lg mb-8 max-w-lg mx-auto">
          New drops, festive edits and a private welcome offer — straight to your inbox.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white border-white/50 placeholder:text-warm-gray focus-visible:ring-dark"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-dark text-white hover:bg-secondary-dark font-semibold whitespace-nowrap"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
