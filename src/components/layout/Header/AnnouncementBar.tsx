import { ANNOUNCEMENT_TEXT } from "@/constants/ui";

export function AnnouncementBar() {
  return (
    <div className="announcement-bar text-center py-2 px-4">
      <p className="text-xs font-medium tracking-wide text-gold">
        {ANNOUNCEMENT_TEXT}
      </p>
    </div>
  );
}
