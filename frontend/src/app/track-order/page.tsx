import { Suspense } from "react";
import TrackOrderPageContent from "@/components/pages/TrackOrderPageContent";

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-bb-muted">Loading...</div>}>
      <TrackOrderPageContent />
    </Suspense>
  );
}
