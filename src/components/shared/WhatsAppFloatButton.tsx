import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { WHATSAPP_FLOAT, getWhatsAppChatUrl } from "@/constants/ui";

/** Fixed bottom-right WhatsApp chat button with a prefilled greeting. */
export function WhatsAppFloatButton() {
  return (
    <a
      href={getWhatsAppChatUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={WHATSAPP_FLOAT.ARIA_LABEL}
      title={WHATSAPP_FLOAT.ARIA_LABEL}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-whatsapp-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
