"use client";

import { useEffect, useState } from "react";
import { OFFER_COUNTDOWN_TICK_MS } from "@/constants/offers";
import {
  getOfferCountdownParts,
  type OfferCountdownParts,
} from "@/lib/products/offer-countdown";

export function useOfferCountdown(endsAt: string | null | undefined): OfferCountdownParts | null {
  const [parts, setParts] = useState<OfferCountdownParts | null>(() =>
    endsAt ? getOfferCountdownParts(endsAt) : null
  );

  useEffect(() => {
    if (!endsAt) {
      setParts(null);
      return;
    }

    const tick = () => setParts(getOfferCountdownParts(endsAt));
    tick();
    const id = window.setInterval(tick, OFFER_COUNTDOWN_TICK_MS);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return parts;
}
