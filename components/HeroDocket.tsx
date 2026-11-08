"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Category } from "@/lib/constants";
import { formatCredits } from "@/lib/format";

const SAMPLES: Record<string, { title: string; plaintiff: string; plaintiffStory: string; defendant: string; defendantStory: string }> = {
  Dishes: {
    title: "The dishes standoff",
    plaintiff: "Tunde",
    plaintiffStory:
      "The dishes sat in the sink for four days. I washed them twice last week and nobody said thank you. I am not the house maid.",
    defendant: "Amaka",
    defendantStory:
      "I was on night shift all week and ate out. Those were his pots from Sunday. I will wash mine today and I am sorry it dragged.",
  },
  "Rent split": {
    title: "The rent split",
    plaintiff: "Zainab",
    plaintiffStory:
      "I pay two thirds of the rent because I took the bigger room, and we agreed that in writing. Now she says it should be half and half.",
    defendant: "Dayo",
    defendantStory:
      "The bigger room has no window and the heater never worked. I never agreed to pay more than half. I always paid on time.",
  },
  "Late to the trip": {
    title: "Late to the trip",
    plaintiff: "Efe",
    plaintiffStory:
      "We left at eight sharp as planned. He showed up at ten, we lost our booking, and he never apologised. He is always late.",
    defendant: "Kunle",
    defendantStory:
      "My bus broke down and I called twice. I paid for my own ride and I will cover the booking fee. I tried my best to get there.",
  },
};

const PICKER: { key: string; category: Category }[] = [
  { key: "Dishes", category: "roommates" },
  { key: "Rent split", category: "roommates" },
  { key: "Late to the trip", category: "friends" },
];

export function HeroDocket() {
  const router = useRouter();
  const [pick, setPick] = useState("Dishes");
  const sample = SAMPLES[pick];
  const [plaintiff, setPlaintiff] = useState(sample.plaintiff);
  const [plaintiffStory, setPlaintiffStory] = useState(sample.plaintiffStory);
  const [defendant, setDefendant] = useState(sample.defendant);
  const [defendantStory, setDefendantStory] = useState(sample.defendantStory);
  const [stake, setStake] = useState(50);

  const choose = (key: string) => {
    setPick(key);
    const next = SAMPLES[key];
    setPlaintiff(next.plaintiff);
    setPlaintiffStory(next.plaintiffStory);
    setDefendant(next.defendant);
    setDefendantStory(next.defendantStory);
  };

  const file = () => {
    const category = PICKER.find((p) => p.key === pick)?.category ?? "other";
    const params = new URLSearchParams({
      title: sample.title,
      category,
      plaintiff,
      statement: plaintiffStory,
      stake: String(stake),
      preview: "1",
    });
    router.push(`/file?${params.toString()}`);
  };

  return (
    <div className="docket" id="docket">
      <div className="dhead">
        <strong>Case preview</strong>
        <span className="live">
          <i />
          Open for filing
        </span>
      </div>
      <div className="pick">
        <span>Bring a case:</span>
        {PICKER.map((item) => (
          <button
            key={item.key}
            className={`chip ${pick === item.key ? "on" : ""}`}
            onClick={() => choose(item.key)}
            type="button"
          >
            {item.key}
          </button>
        ))}
        <button className="chip" onClick={() => router.push("/file")} type="button">
          Your own
        </button>
      </div>
      <div className="sides">
        <div className="side a">
          <span className="tag">Plaintiff</span>
          <input
            value={plaintiff}
            onChange={(event) => setPlaintiff(event.target.value)}
            aria-label="Plaintiff name"
            maxLength={24}
          />
          <textarea
            value={plaintiffStory}
            onChange={(event) => setPlaintiffStory(event.target.value)}
            aria-label="Plaintiff statement"
            maxLength={1200}
          />
        </div>
        <div className="side b">
          <span className="tag">Defendant</span>
          <input
            value={defendant}
            onChange={(event) => setDefendant(event.target.value)}
            aria-label="Defendant name"
            maxLength={24}
          />
          <textarea
            value={defendantStory}
            onChange={(event) => setDefendantStory(event.target.value)}
            aria-label="Defendant statement preview"
            maxLength={1200}
          />
        </div>
      </div>
      <div className="stake">
        <span>Stake</span>
        <input
          type="range"
          min={10}
          max={200}
          step={10}
          value={stake}
          onChange={(event) => setStake(Number(event.target.value))}
          aria-label="Stake amount"
        />
        <output>{formatCredits(stake)} credits</output>
      </div>
      <div className="bench">
        <h3>The bench is empty — no case filed yet</h3>
        <div className="panel">
          {["A", "K", "M", "R", "S"].map((initial) => (
            <div className="j" key={initial}>
              {initial}
            </div>
          ))}
        </div>
      </div>
      <div className="runrow">
        <button className="btn" onClick={file} type="button">
          File this case
        </button>
      </div>
      <div className="preview-note">
        <b>Preview</b>
        Nothing is on-chain yet. The defendant gets to answer after you file.
      </div>
    </div>
  );
}
