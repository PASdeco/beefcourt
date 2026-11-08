import type { Metadata } from "next";
import { VerdictsBrowser } from "@/components/VerdictsBrowser";

export const metadata: Metadata = {
  title: "The docket",
  description: "Every Beef Court case: live beef, recent rulings, and settled disputes on GenLayer.",
  alternates: { canonical: "/verdicts" },
};

export default function VerdictsPage() {
  return (
    <div className="wrap">
      <div className="page-head">
        <span className="eyebrow">Public record</span>
        <h1>The docket</h1>
        <p>
          Every case, every answer, every ruling. The bench does not sit in private — it just does not
          take sides.
        </p>
      </div>
      <VerdictsBrowser />
    </div>
  );
}
