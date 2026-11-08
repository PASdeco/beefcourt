import type { Metadata } from "next";
import { LeaderboardTables } from "@/components/LeaderboardTables";

export const metadata: Metadata = {
  title: "The record book",
  description: "The winningest and most overruled wallets in Beef Court on GenLayer StudioNet.",
  alternates: { canonical: "/leaderboard" },
};

export default function LeaderboardPage() {
  return (
    <div className="wrap">
      <div className="page-head">
        <span className="eyebrow">Public record</span>
        <h1>The record book</h1>
        <p>
          Net credits earned, and the wallets the bench has ruled against most. No hiding from the
          docket.
        </p>
      </div>
      <LeaderboardTables />
    </div>
  );
}
