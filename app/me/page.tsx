import type { Metadata } from "next";
import { MyCourt } from "@/components/MyCourt";

export const metadata: Metadata = {
  title: "My court",
  description: "Your Beef Court credits, record, and cases on GenLayer StudioNet.",
  alternates: { canonical: "/me" },
  robots: { index: false, follow: false },
};

export default function MePage() {
  return (
    <div className="wrap">
      <div className="page-head">
        <span className="eyebrow">The record</span>
        <h1>My court</h1>
        <p>Your credits, your cases, and how the bench has treated you so far.</p>
      </div>
      <MyCourt />
    </div>
  );
}
